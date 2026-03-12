import connectDB from "@/lib/mongodb";
import Student from "@/lib/models/Student";
import Class from "@/lib/models/Class";
import Timetable from "@/lib/models/Timetable";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse, handleMongoError } from "@/lib/api-utils";

// GET student's class information
export async function GET(request) {
  try {
    const { user, error, status } = await requireAuth();
    if (error) return errorResponse(error, status);

    if (user.role !== "student") {
      return errorResponse("Access denied. Students only.", 403);
    }

    await connectDB();

    const student = await Student.findOne({ user: user._id })
      .populate("class")
      .populate("subjects", "name code type credits");

    if (!student || !student.class) {
      return errorResponse("Student class not found", 404);
    }

    // Get detailed class information
    const classData = await Class.findById(student.class._id)
      .populate({
        path: "classTeacher",
        populate: { path: "user", select: "name email phone avatar" }
      })
      .populate("subjects.subject", "name code type credits totalMarks passingMarks")
      .populate({
        path: "subjects.teacher",
        populate: { path: "user", select: "name email" }
      });

    // Get classmates (other students in the same class)
    const classmates = await Student.find({
      class: student.class._id,
      _id: { $ne: student._id } // Exclude current student
    })
      .populate("user", "name email avatar")
      .sort({ rollNumber: 1 })
      .limit(50);

    // Get timetable for the class
    const timetables = await Timetable.find({
      class: student.class._id,
      isActive: true
    })
      .populate("periods.subject", "name code")
      .populate({
        path: "periods.teacher",
        populate: { path: "user", select: "name" }
      })
      .sort({ day: 1 });

    // Get total student count
    const totalStudents = await Student.countDocuments({ class: student.class._id });

    return successResponse({
      myInfo: {
        studentId: student.studentId,
        rollNumber: student.rollNumber,
        section: student.section,
        admissionDate: student.admissionDate,
        bloodGroup: student.bloodGroup,
        subjects: student.subjects,
      },
      class: {
        _id: classData._id,
        name: classData.name,
        section: classData.section,
        academicYear: classData.academicYear,
        room: classData.room,
        capacity: classData.capacity,
        description: classData.description,
        isActive: classData.isActive,
        classTeacher: classData.classTeacher ? {
          _id: classData.classTeacher._id,
          name: classData.classTeacher.user?.name,
          email: classData.classTeacher.user?.email,
          phone: classData.classTeacher.user?.phone,
          avatar: classData.classTeacher.user?.avatar,
        } : null,
        subjects: classData.subjects.map(s => ({
          _id: s.subject._id,
          name: s.subject.name,
          code: s.subject.code,
          type: s.subject.type,
          credits: s.subject.credits,
          totalMarks: s.subject.totalMarks,
          passingMarks: s.subject.passingMarks,
          teacher: s.teacher ? {
            _id: s.teacher._id,
            name: s.teacher.user?.name,
            email: s.teacher.user?.email,
          } : null,
        })),
        totalStudents,
      },
      classmates: classmates.map(c => ({
        _id: c._id,
        studentId: c.studentId,
        rollNumber: c.rollNumber,
        name: c.user?.name,
        email: c.user?.email,
        avatar: c.user?.avatar,
      })),
      timetable: timetables,
    });

  } catch (error) {
    console.error("Get student class error:", error);
    return handleMongoError(error);
  }
}