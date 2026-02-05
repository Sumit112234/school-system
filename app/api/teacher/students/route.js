import connectDB from "@/lib/mongodb";
import Teacher from "@/lib/models/Teacher";
import Student from "@/lib/models/Student";
import { requireTeacher } from "@/lib/auth";
import { 
  successResponse, 
  errorResponse,
  getPaginationParams,
  createPaginationResponse,
  buildSearchQuery,
  handleMongoError 
} from "@/lib/api-utils";

export async function GET(request) {
  try {
    const { user, error, status } = await requireTeacher();
    if (error) return errorResponse(error, status);

    await connectDB();

    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(searchParams);
    const search = searchParams.get("search") || "";
    const classId = searchParams.get("classId") || "";

    const teacher = await Teacher.findOne({ user: user._id });
    if (!teacher) {
      return errorResponse("Teacher profile not found", 404);
    }

    // Build query - only students in teacher's classes
    let query = { class: { $in: teacher.classes } };
    
    if (classId && teacher.classes.includes(classId)) {
      query.class = classId;
    }

    const [students, total] = await Promise.all([
      Student.find(query)
        .populate("user", "name email phone avatar isActive")
        .populate("class", "name section")
        .sort({ rollNumber: 1 })
        .skip(skip)
        .limit(limit),
      Student.countDocuments(query),
    ]);

    // Filter by search if provided
    let filteredStudents = students;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredStudents = students.filter(s => 
        s.user?.name?.toLowerCase().includes(searchLower) ||
        s.studentId?.toLowerCase().includes(searchLower) ||
        s.rollNumber?.toLowerCase().includes(searchLower)
      );
    }

    return successResponse(createPaginationResponse(filteredStudents, total, page, limit));

  } catch (error) {
    return handleMongoError(error);
  }
}
