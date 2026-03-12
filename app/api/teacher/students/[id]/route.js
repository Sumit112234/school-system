import connectDB from "@/lib/mongodb";
import Student from "@/lib/models/Student";
import Teacher from "@/lib/models/Teacher";
import Class from "@/lib/models/Class";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse, handleMongoError } from "@/lib/api-utils";

// GET single student details for teacher
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

    // Get student with full details
    const student = await Student.findById(id)
      .populate("user", "name email phone avatar gender dateOfBirth address isActive createdAt")
      .populate("class", "name section academicYear room capacity")
      .populate("subjects", "name code type credits");

    if (!student) {
      return errorResponse("Student not found", 404);
    }

    // Check if teacher has access to this student's class
    const hasAccess = await Class.findOne({
      _id: student.class,
      $or: [
        { classTeacher: teacherProfile._id },
        { "subjects.teacher": teacherProfile._id }
      ]
    });

    if (!hasAccess) {
      return errorResponse("Access denied. You don't teach this student.", 403);
    }

    // Get class details with teacher info
    const classDetails = await Class.findById(student.class)
      .populate({
        path: "classTeacher",
        populate: { path: "user", select: "name email" }
      })
      .populate("subjects.subject", "name code")
      .populate({
        path: "subjects.teacher",
        populate: { path: "user", select: "name" }
      });

    // Calculate age if date of birth is available
    let age = null;
    if (student.user?.dateOfBirth) {
      const today = new Date();
      const birthDate = new Date(student.user.dateOfBirth);
      age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
    }

    return successResponse({
      student: {
        _id: student._id,
        studentId: student.studentId,
        rollNumber: student.rollNumber,
        section: student.section,
        admissionDate: student.admissionDate,
        bloodGroup: student.bloodGroup,
        emergencyContact: student.emergencyContact,
        subjects: student.subjects,
        user: {
          ...student.user.toObject(),
          age,
        },
      },
      class: classDetails ? {
        _id: classDetails._id,
        name: classDetails.name,
        section: classDetails.section,
        academicYear: classDetails.academicYear,
        room: classDetails.room,
        capacity: classDetails.capacity,
        classTeacher: classDetails.classTeacher ? {
          name: classDetails.classTeacher.user?.name,
          email: classDetails.classTeacher.user?.email,
        } : null,
        subjects: classDetails.subjects.map(s => ({
          subject: s.subject,
          teacher: s.teacher ? {
            _id: s.teacher._id,
            name: s.teacher.user?.name,
          } : null,
        })),
      } : null,
      parentInfo: {
        parentName: student.parentName,
        parentPhone: student.parentPhone,
        parentEmail: student.parentEmail,
      },
    });

  } catch (error) {
    console.error("Get student details error:", error);
    return handleMongoError(error);
  }
}