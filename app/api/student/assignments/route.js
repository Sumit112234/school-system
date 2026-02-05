import connectDB from "@/lib/mongodb";
import Student from "@/lib/models/Student";
import Assignment from "@/lib/models/Assignment";
import { requireStudent } from "@/lib/auth";
import { 
  successResponse, 
  errorResponse,
  getPaginationParams,
  createPaginationResponse,
  handleMongoError 
} from "@/lib/api-utils";

export async function GET(request) {
  try {
    const { user, error, status } = await requireStudent();
    if (error) return errorResponse(error, status);

    await connectDB();

    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(searchParams);
    const subjectId = searchParams.get("subjectId") || "";
    const assignmentStatus = searchParams.get("status") || ""; // pending, submitted, graded

    const student = await Student.findOne({ user: user._id });
    if (!student) {
      return errorResponse("Student profile not found", 404);
    }

    let query = {
      class: student.class,
      status: "published",
    };

    if (subjectId) {
      query.subject = subjectId;
    }

    let assignments = await Assignment.find(query)
      .populate("subject", "name code")
      .populate({
        path: "teacher",
        populate: { path: "user", select: "name" }
      })
      .sort({ dueDate: 1 });

    // Add submission status to each assignment
    assignments = assignments.map(assignment => {
      const submission = assignment.submissions.find(
        s => s.student.toString() === student._id.toString()
      );
      
      let submissionStatus = "pending";
      if (submission) {
        submissionStatus = submission.status;
      } else if (new Date(assignment.dueDate) < new Date()) {
        submissionStatus = "overdue";
      }

      return {
        ...assignment.toObject(),
        submissionStatus,
        mySubmission: submission || null,
      };
    });

    // Filter by status if provided
    if (assignmentStatus) {
      assignments = assignments.filter(a => a.submissionStatus === assignmentStatus);
    }

    const total = assignments.length;
    const paginatedAssignments = assignments.slice(skip, skip + limit);

    return successResponse(createPaginationResponse(paginatedAssignments, total, page, limit));

  } catch (error) {
    return handleMongoError(error);
  }
}
