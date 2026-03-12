import connectDB from "@/lib/mongodb";
import Class from "@/lib/models/Class";
import Teacher from "@/lib/models/Teacher";
import Student from "@/lib/models/Student";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse, handleMongoError } from "@/lib/api-utils";

// GET single class details for teacher
export async function GET(request, { params }) {
  try {
    const { user, error, status } = await requireAuth();
    if (error) return errorResponse(error, status);

    if (user.role !== "teacher") {
      return errorResponse("Access denied. Teachers only.", 403);
    }

    const { id } = await params;
    await connectDB();

    // Get teacher profile
    const teacherProfile = await Teacher.findOne({ user: user._id });
    if (!teacherProfile) {
      return errorResponse("Teacher profile not found", 404);
    }

    // Get class with full details
    const classData = await Class.findById(id)
      .populate({
        path: "classTeacher",
        populate: { path: "user", select: "name email phone" }
      })
      .populate("subjects.subject", "name code type credits totalMarks passingMarks")
      .populate({
        path: "subjects.teacher",
        populate: { path: "user", select: "name email" }
      });

    if (!classData) {
      return errorResponse("Class not found", 404);
    }

    // Check if teacher has access to this class
    const isClassTeacher = classData.classTeacher?._id?.toString() === teacherProfile._id.toString();
    const isSubjectTeacher = classData.subjects.some(
      s => s.teacher?._id?.toString() === teacherProfile._id.toString()
    );

    if (!isClassTeacher && !isSubjectTeacher) {
      return errorResponse("Access denied. You don't teach this class.", 403);
    }

    // Get students in this class
    const students = await Student.find({ class: id })
      .populate("user", "name email phone avatar gender isActive")
      .populate("subjects", "name code")
      .sort({ rollNumber: 1, createdAt: 1 });

    // Find subjects taught by this teacher in this class
    const mySubjects = classData.subjects.filter(
      s => s.teacher?._id?.toString() === teacherProfile._id.toString()
    );

    return successResponse({
      class: {
        _id: classData._id,
        name: classData.name,
        section: classData.section,
        academicYear: classData.academicYear,
        room: classData.room,
        capacity: classData.capacity,
        description: classData.description,
        isActive: classData.isActive,
        createdAt: classData.createdAt,
      },
      isClassTeacher,
      classTeacher: classData.classTeacher ? {
        _id: classData.classTeacher._id,
        name: classData.classTeacher.user?.name,
        email: classData.classTeacher.user?.email,
        phone: classData.classTeacher.user?.phone,
      } : null,
      mySubjects: mySubjects.map(s => ({
        _id: s.subject._id,
        name: s.subject.name,
        code: s.subject.code,
        type: s.subject.type,
        credits: s.subject.credits,
        totalMarks: s.subject.totalMarks,
        passingMarks: s.subject.passingMarks,
      })),
      allSubjects: classData.subjects.map(s => ({
        _id: s.subject._id,
        name: s.subject.name,
        code: s.subject.code,
        type: s.subject.type,
        credits: s.subject.credits,
        teacher: s.teacher ? {
          _id: s.teacher._id,
          name: s.teacher.user?.name,
          email: s.teacher.user?.email,
        } : null,
        isMine: s.teacher?._id?.toString() === teacherProfile._id.toString(),
      })),
      students: students.map(s => ({
        _id: s._id,
        studentId: s.studentId,
        rollNumber: s.rollNumber,
        section: s.section,
        admissionDate: s.admissionDate,
        user: s.user,
        subjects: s.subjects,
      })),
      stats: {
        totalStudents: students.length,
        activeStudents: students.filter(s => s.user?.isActive).length,
        totalSubjects: classData.subjects.length,
        mySubjectsCount: mySubjects.length,
      }
    });

  } catch (error) {
    console.error("Get class details error:", error);
    return handleMongoError(error);
  }
}