import connectDB from "@/lib/mongodb";
import Teacher from "@/lib/models/Teacher";
import Assignment from "@/lib/models/Assignment";
import { requireTeacher } from "@/lib/auth";
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
    const { user, error, status } = await requireTeacher();
    if (error) return errorResponse(error, status);

    await connectDB();

    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(searchParams);
    const classId = searchParams.get("classId") || "";
    const subjectId = searchParams.get("subjectId") || "";
    const assignmentStatus = searchParams.get("status") || "";

    const teacher = await Teacher.findOne({ user: user._id });
    if (!teacher) {
      return errorResponse("Teacher profile not found", 404);
    }

    let query = { teacher: teacher._id };
    if (classId) query.class = classId;
    if (subjectId) query.subject = subjectId;
    if (assignmentStatus) query.status = assignmentStatus;

    const [assignments, total] = await Promise.all([
      Assignment.find(query)
        .populate("class", "name section")
        .populate("subject", "name code")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Assignment.countDocuments(query),
    ]);

    return successResponse(createPaginationResponse(assignments, total, page, limit));

  } catch (error) {
    return handleMongoError(error);
  }
}

// POST create assignment
export async function POST(request) {
  try {
    const { user, error, status } = await requireTeacher();
    if (error) return errorResponse(error, status);

    const body = await request.json();
    const { title, description, instructions, classId, subjectId, dueDate, totalMarks, attachments, allowLateSubmission } = body;

    if (!title || !classId || !subjectId || !dueDate) {
      return errorResponse("Title, class, subject, and due date are required", 400);
    }

    await connectDB();

    const teacher = await Teacher.findOne({ user: user._id });
    if (!teacher) {
      return errorResponse("Teacher profile not found", 404);
    }

    // Verify teacher has access to this class
    if (!teacher.classes.map(c => c.toString()).includes(classId)) {
      return errorResponse("Access denied to this class", 403);
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
      allowLateSubmission: allowLateSubmission || false,
    });

    await assignment.populate([
      { path: "class", select: "name section" },
      { path: "subject", select: "name code" }
    ]);

    return successResponse(assignment, "Assignment created successfully", 201);

  } catch (error) {
    return handleMongoError(error);
  }
}
