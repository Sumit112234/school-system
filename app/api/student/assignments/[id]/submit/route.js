import connectDB from "@/lib/mongodb";
import Student from "@/lib/models/Student";
import Assignment from "@/lib/models/Assignment";
import { requireStudent } from "@/lib/auth";
import { successResponse, errorResponse, handleMongoError } from "@/lib/api-utils";

export async function POST(request, { params }) {
  try {
    const { user, error, status } = await requireStudent();
    if (error) return errorResponse(error, status);

    const { id } = await params;
    const body = await request.json();
    const { content, attachments } = body;

    if (!content && (!attachments || attachments.length === 0)) {
      return errorResponse("Content or attachments are required", 400);
    }

    await connectDB();

    const student = await Student.findOne({ user: user._id });
    if (!student) {
      return errorResponse("Student profile not found", 404);
    }

    const assignment = await Assignment.findOne({
      _id: id,
      class: student.class,
      status: "published",
    });

    if (!assignment) {
      return errorResponse("Assignment not found", 404);
    }

    // Check if already submitted
    const existingSubmission = assignment.submissions.find(
      s => s.student.toString() === student._id.toString()
    );

    if (existingSubmission && existingSubmission.status !== "resubmit") {
      return errorResponse("You have already submitted this assignment", 400);
    }

    // Check if past due date
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);
    
    if (now > dueDate && !assignment.allowLateSubmission) {
      return errorResponse("Assignment deadline has passed", 400);
    }

    if (existingSubmission) {
      // Update existing submission
      existingSubmission.content = content;
      existingSubmission.attachments = attachments || [];
      existingSubmission.submittedAt = new Date();
      existingSubmission.status = "submitted";
      existingSubmission.grade = null;
      existingSubmission.feedback = null;
    } else {
      // Add new submission
      assignment.submissions.push({
        student: student._id,
        content,
        attachments: attachments || [],
        submittedAt: new Date(),
        status: "submitted",
      });
    }

    await assignment.save();

    const mySubmission = assignment.submissions.find(
      s => s.student.toString() === student._id.toString()
    );

    return successResponse(mySubmission, "Assignment submitted successfully");

  } catch (error) {
    return handleMongoError(error);
  }
}
