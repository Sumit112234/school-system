import connectDB from "@/lib/mongodb";
import Class from "@/lib/models/Class";
import Teacher from "@/lib/models/Teacher";
import Student from "@/lib/models/Student";
import Subject from "@/lib/models/Subject";
import { requireAuth } from "@/lib/auth";
import { 
  successResponse, 
  errorResponse,
  handleMongoError 
} from "@/lib/api-utils";

// GET all classes for teacher
export async function GET(request) {
  try {
    const { user, error, status } = await requireAuth();
    if (error) return errorResponse(error, status);

    if (user.role !== "teacher") {
      return errorResponse("Access denied. Teachers only.", 403);
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const academicYear = searchParams.get("academicYear") || "";

    // Get teacher profile
    const teacherProfile = await Teacher.findOne({ user: user._id });
    if (!teacherProfile) {
      return errorResponse("Teacher profile not found", 404);
    }

    // Build query to find classes where teacher is involved
    let query = {
      $or: [
        { classTeacher: teacherProfile._id },
        { "subjects.teacher": teacherProfile._id }
      ]
    };

    if (academicYear) {
      query.academicYear = academicYear;
    }

    // Get all classes
    const classes = await Class.find(query)
      .populate({
        path: "classTeacher",
        populate: { path: "user", select: "name email" }
      })
      .populate("subjects.subject", "name code")
      .populate({
        path: "subjects.teacher",
        populate: { path: "user", select: "name" }
      })
      .sort({ name: 1, section: 1 });

    // Get student counts for each class
    const classIds = classes.map(c => c._id);
    const studentCounts = await Student.aggregate([
      { $match: { class: { $in: classIds } } },
      { $group: { _id: "$class", count: { $sum: 1 } } }
    ]);

    const studentCountMap = {};
    studentCounts.forEach(sc => {
      studentCountMap[sc._id.toString()] = sc.count;
    });

    // Format response with additional data
    const formattedClasses = classes.map(cls => {
      const isClassTeacher = cls.classTeacher?._id?.toString() === teacherProfile._id.toString();
      
      // Find subjects taught by this teacher in this class
      const mySubjects = cls.subjects.filter(
        s => s.teacher?._id?.toString() === teacherProfile._id.toString()
      );

      return {
        _id: cls._id,
        name: cls.name,
        section: cls.section,
        academicYear: cls.academicYear,
        room: cls.room,
        capacity: cls.capacity,
        description: cls.description,
        isActive: cls.isActive,
        studentCount: studentCountMap[cls._id.toString()] || 0,
        isClassTeacher,
        classTeacher: cls.classTeacher ? {
          _id: cls.classTeacher._id,
          name: cls.classTeacher.user?.name,
          email: cls.classTeacher.user?.email,
        } : null,
        mySubjects: mySubjects.map(s => ({
          _id: s.subject._id,
          name: s.subject.name,
          code: s.subject.code,
        })),
        allSubjects: cls.subjects.map(s => ({
          _id: s.subject._id,
          name: s.subject.name,
          code: s.subject.code,
          teacher: s.teacher ? {
            _id: s.teacher._id,
            name: s.teacher.user?.name,
          } : null,
        })),
      };
    });

    // Get unique academic years
    const academicYears = [...new Set(classes.map(c => c.academicYear))].sort().reverse();

    return successResponse({
      classes: formattedClasses,
      academicYears,
      summary: {
        totalClasses: formattedClasses.length,
        classTeacherOf: formattedClasses.filter(c => c.isClassTeacher).length,
        subjectTeacherOf: formattedClasses.filter(c => !c.isClassTeacher && c.mySubjects.length > 0).length,
        totalStudents: Object.values(studentCountMap).reduce((sum, count) => sum + count, 0),
      }
    });

  } catch (error) {
    console.error("Get teacher classes error:", error);
    return handleMongoError(error);
  }
}