import connectDB from "@/lib/mongodb";
import Student from "@/lib/models/Student";
import Teacher from "@/lib/models/Teacher";
import Class from "@/lib/models/Class";
import { requireAuth } from "@/lib/auth";
import { 
  successResponse, 
  errorResponse,
  getPaginationParams,
  createPaginationResponse,
  buildSearchQuery,
  handleMongoError 
} from "@/lib/api-utils";

// GET students for teacher
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
    const search = searchParams.get("search") || "";
    const classId = searchParams.get("classId") || "";

    // Get teacher profile to find their classes
    const teacherProfile = await Teacher.findOne({ user: user._id });
    if (!teacherProfile) {
      return errorResponse("Teacher profile not found", 404);
    }

    // Get all classes where this teacher teaches or is class teacher
    const teacherClasses = await Class.find({
      $or: [
        { classTeacher: teacherProfile._id },
        { "subjects.teacher": teacherProfile._id }
      ]
    }).select("_id name section academicYear subjects");

    const teacherClassIds = teacherClasses.map(c => c._id);

    // Build query
    let query = {
      class: { $in: teacherClassIds }
    };

    // Filter by specific class if provided
    if (classId) {
      // Check if teacher has access to this class
      if (!teacherClassIds.some(id => id.toString() === classId)) {
        return errorResponse("Access denied to this class", 403);
      }
      query.class = classId;
    }

    // Add search if provided
    if (search) {
      // Get users matching search
      const userQuery = buildSearchQuery(search, ["name", "email"]);
      const matchingUsers = await Student.find({})
        .populate("user")
        .then(students => 
          students.filter(s => {
            const name = s.user?.name?.toLowerCase() || "";
            const email = s.user?.email?.toLowerCase() || "";
            return name.includes(search.toLowerCase()) || email.includes(search.toLowerCase());
          }).map(s => s._id)
        );
      
      query._id = { $in: matchingUsers };
    }

    const [students, total] = await Promise.all([
      Student.find(query)
        .populate("user", "name email phone avatar gender dateOfBirth isActive")
        .populate("class", "name section academicYear")
        .populate("subjects", "name code")
        .sort({ "class": 1, rollNumber: 1 })
        .skip(skip)
        .limit(limit),
      Student.countDocuments(query),
    ]);

    return successResponse({
      ...createPaginationResponse(students, total, page, limit),
      teacherClasses: teacherClasses.map(c => ({
        _id: c._id,
        name: c.name,
        section: c.section,
        academicYear: c.academicYear,
      })),
    });

  } catch (error) {
    console.error("Get students error:", error);
    return handleMongoError(error);
  }
}