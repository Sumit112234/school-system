import connectDB from "@/lib/mongodb";
import Teacher from "@/lib/models/Teacher";
import Assignment from "@/lib/models/Assignment";
import { requireTeacher } from "@/lib/auth";
import { successResponse, errorResponse, handleMongoError } from "@/lib/api-utils";

// POST grade a submission
export async function POST(request, { params }) {
  try {
    const { user, error, status } = await requireTeacher();
    if (error) return errorResponse(error, status);

    const { id } = await params;
    const body = await request.json();
    const { studentId, grade, feedback } = body;

    if (!studentId || grade === undefined) {
      return errorResponse("Student ID and grade are required", 400);
    }

    await connectDB();

    const teacher = await Teacher.findOne({ user: user._id });
    if (!teacher) {
      return errorResponse("Teacher profile not found", 404);
    }

    const assignment = await Assignment.findOne({ _id: id, teacher: teacher._id });
    if (!assignment) {
      return errorResponse("Assignment not found", 404);
    }

    // Find and update the submission
    const submissionIndex = assignment.submissions.findIndex(
      s => s.student.toString() === studentId
    );

    if (submissionIndex === -1) {
      return errorResponse("Submission not found", 404);
    }

    // Validate grade
    if (grade < 0 || grade > assignment.totalMarks) {
      return errorResponse(`Grade must be between 0 and ${assignment.totalMarks}`, 400);
    }

    assignment.submissions[submissionIndex].grade = grade;
    assignment.submissions[submissionIndex].feedback = feedback || null;
    assignment.submissions[submissionIndex].gradedAt = new Date();
    assignment.submissions[submissionIndex].gradedBy = teacher._id;
    assignment.submissions[submissionIndex].status = "graded";

    await assignment.save();

    return successResponse(
      assignment.submissions[submissionIndex],
      "Submission graded successfully"
    );

  } catch (error) {
    return handleMongoError(error);
  }
}
