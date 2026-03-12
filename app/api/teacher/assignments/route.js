import connectDB from "@/lib/mongodb";
import Assignment from "@/lib/models/Assignment";
import Teacher from "@/lib/models/Teacher";
import { requireAuth } from "@/lib/auth";
import { 
  successResponse, 
  errorResponse,
  getPaginationParams,
  createPaginationResponse,
  handleMongoError 
} from "@/lib/api-utils";

// GET teacher's assignments
export async function GET(request) {
  try {
    const { user, error, status } = await requireAuth();
    if (error) return errorResponse(error, status);

    if (user.role !== "teacher") {
      return errorResponse("Access denied. Teachers only.", 403);
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(searchParams);
    const classId = searchParams.get("classId") || "";
    const assignmentStatus = searchParams.get("status") || "";

    const teacher = await Teacher.findOne({ user: user._id });
    if (!teacher) {
      return errorResponse("Teacher profile not found", 404);
    }

    let query = { teacher: teacher._id };
    if (classId) query.class = classId;
    if (assignmentStatus) query.status = assignmentStatus;

    const [assignments, total] = await Promise.all([
      Assignment.find(query)
        .populate("class", "name section")
        .populate("subject", "name code")
        .populate({
          path: "submissions.student",
          populate: { path: "user", select: "name email" }
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Assignment.countDocuments(query),
    ]);

    // Add submission stats
    const assignmentsWithStats = assignments.map(a => {
      const obj = a.toObject();
      obj.submittedCount = a.submissions.filter(s => s.status !== "resubmit").length;
      obj.gradedCount = a.submissions.filter(s => s.status === "graded").length;
      obj.pendingCount = a.submissions.filter(s => s.status === "submitted").length;
      return obj;
    });

    return successResponse(createPaginationResponse(assignmentsWithStats, total, page, limit));

  } catch (error) {
    console.error("Get assignments error:", error);
    return handleMongoError(error);
  }
}

// POST create assignment
export async function POST(request) {
  try {
    const { user, error, status } = await requireAuth();
    if (error) return errorResponse(error, status);

    if (user.role !== "teacher") {
      return errorResponse("Access denied. Teachers only.", 403);
    }

    const body = await request.json();
    const { 
      title, description, instructions, classId, subjectId, dueDate,
      totalMarks, attachments, assignmentStatus, allowLateSubmission, lateSubmissionPenalty
    } = body;

    if (!title || !classId || !subjectId || !dueDate) {
      return errorResponse("Title, class, subject, and due date are required", 400);
    }

    await connectDB();

    const teacher = await Teacher.findOne({ user: user._id });
    if (!teacher) {
      return errorResponse("Teacher profile not found", 404);
    }

    const assignment = await Assignment.create({
      title,
      description,
      instructions,
      class: classId,
      subject: subjectId,
      teacher: teacher._id,
      dueDate: new Date(dueDate),
      totalMarks: totalMarks || 100,
      attachments: attachments || [],
      status: assignmentStatus || "published",
      allowLateSubmission: allowLateSubmission || false,
      lateSubmissionPenalty: lateSubmissionPenalty || 0,
    });

    await assignment.populate([
      { path: "class", select: "name section" },
      { path: "subject", select: "name code" }
    ]);

    return successResponse(assignment, "Assignment created successfully", 201);

  } catch (error) {
    console.error("Create assignment error:", error);
    return handleMongoError(error);
  }
}