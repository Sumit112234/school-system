import connectDB from "@/lib/mongodb";
import Assignment from "@/lib/models/Assignment";
import Student from "@/lib/models/Student";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse, handleMongoError } from "@/lib/api-utils";

// GET assignments for student
export async function GET(request) {
  try {
    const { user, error, status } = await requireAuth();
    if (error) return errorResponse(error, status);

    if (user.role !== "student") {
      return errorResponse("Access denied. Students only.", 403);
    }

    await connectDB();

    const student = await Student.findOne({ user: user._id });
    if (!student || !student.class) {
      return errorResponse("Student profile or class not found", 404);
    }

    const assignments = await Assignment.find({
      class: student.class,
      status: "published",
    })
      .populate("subject", "name code")
      .populate("class", "name section")
      .sort({ dueDate: -1 });

    // Add student's submission info
    const assignmentsWithSubmission = assignments.map(a => {
      const obj = a.toObject();
      const studentSubmission = a.submissions.find(
        s => s.student.toString() === student._id.toString()
      );

      obj.mySubmission = studentSubmission || null;
      obj.isOverdue = new Date() > new Date(a.dueDate);
      obj.canSubmit = !studentSubmission || studentSubmission.status === "resubmit";
      
      if (!a.allowLateSubmission && obj.isOverdue && !studentSubmission) {
        obj.canSubmit = false;
      }

      return obj;
    });

    return successResponse({ assignments: assignmentsWithSubmission });

  } catch (error) {
    console.error("Get student assignments error:", error);
    return handleMongoError(error);
  }
}

// GET single assignment for student
export async function POST(request) {
  try {
    const { user, error, status } = await requireAuth();
    if (error) return errorResponse(error, status);

    if (user.role !== "student") {
      return errorResponse("Access denied. Students only.", 403);
    }

    const body = await request.json();
    const { assignmentId, content, attachments } = body;

    if (!assignmentId) {
      return errorResponse("Assignment ID is required", 400);
    }

    await connectDB();

    const student = await Student.findOne({ user: user._id });
    if (!student) {
      return errorResponse("Student profile not found", 404);
    }

    const assignment = await Assignment.findOne({
      _id: assignmentId,
      class: student.class,
      status: "published",
    });

    if (!assignment) {
      return errorResponse("Assignment not found", 404);
    }

    // Check if overdue and late submissions not allowed
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);
    if (now > dueDate && !assignment.allowLateSubmission) {
      return errorResponse("Assignment is overdue and late submissions are not allowed", 403);
    }

    // Check if already submitted
    const existingSubmission = assignment.submissions.find(
      s => s.student.toString() === student._id.toString()
    );

    if (existingSubmission && existingSubmission.status !== "resubmit") {
      return errorResponse("You have already submitted this assignment", 400);
    }

    // Add or update submission
    if (existingSubmission && existingSubmission.status === "resubmit") {
      // Update existing submission
      existingSubmission.content = content || null;
      existingSubmission.attachments = attachments || [];
      existingSubmission.submittedAt = new Date();
      existingSubmission.status = "submitted";
      existingSubmission.grade = null;
      existingSubmission.feedback = null;
      existingSubmission.gradedAt = null;
    } else {
      // Create new submission
      assignment.submissions.push({
        student: student._id,
        content: content || null,
        attachments: attachments || [],
        submittedAt: new Date(),
        status: "submitted",
      });
    }

    await assignment.save();

    return successResponse(
      { assignmentId: assignment._id },
      "Assignment submitted successfully"
    );

  } catch (error) {
    console.error("Submit assignment error:", error);
    return handleMongoError(error);
  }
}