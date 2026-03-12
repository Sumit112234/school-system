import connectDB from "@/lib/mongodb";
import Attendance from "@/lib/models/Attendance";
import Teacher from "@/lib/models/Teacher";
import Class from "@/lib/models/Class";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse, handleMongoError } from "@/lib/api-utils";

// GET attendance statistics
export async function GET(request) {
  try {
    const { user, error, status } = await requireAuth();
    if (error) return errorResponse(error, status);

    if (user.role !== "teacher") {
      return errorResponse("Access denied. Teachers only.", 403);
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("classId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!classId || !startDate || !endDate) {
      return errorResponse("Class ID, start date, and end date are required", 400);
    }

    // Get teacher profile
    const teacherProfile = await Teacher.findOne({ user: user._id });
    if (!teacherProfile) {
      return errorResponse("Teacher profile not found", 404);
    }

    // Verify access
    const classData = await Class.findOne({
      _id: classId,
      $or: [
        { classTeacher: teacherProfile._id },
        { "subjects.teacher": teacherProfile._id }
      ]
    });

    if (!classData) {
      return errorResponse("Access denied to this class", 403);
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    // Get attendance statistics
    const stats = await Attendance.aggregate([
      {
        $match: {
          class: classData._id,
          date: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: "$student",
          totalDays: { $sum: 1 },
          present: {
            $sum: { $cond: [{ $eq: ["$status", "present"] }, 1, 0] }
          },
          absent: {
            $sum: { $cond: [{ $eq: ["$status", "absent"] }, 1, 0] }
          },
          late: {
            $sum: { $cond: [{ $eq: ["$status", "late"] }, 1, 0] }
          },
          excused: {
            $sum: { $cond: [{ $eq: ["$status", "excused"] }, 1, 0] }
          }
        }
      }
    ]);

    // Populate student details
    const studentIds = stats.map(s => s._id);
    const Student = require("@/lib/models/Student").default;
    const students = await Student.find({ _id: { $in: studentIds } })
      .populate("user", "name avatar email");

    const studentMap = {};
    students.forEach(s => {
      studentMap[s._id.toString()] = s;
    });

    const formattedStats = stats.map(stat => {
      const student = studentMap[stat._id.toString()];
      const attendancePercentage = stat.totalDays > 0
        ? ((stat.present / stat.totalDays) * 100).toFixed(1)
        : 0;

      return {
        student: {
          _id: student._id,
          studentId: student.studentId,
          rollNumber: student.rollNumber,
          name: student.user?.name,
          avatar: student.user?.avatar,
          email: student.user?.email,
        },
        stats: {
          totalDays: stat.totalDays,
          present: stat.present,
          absent: stat.absent,
          late: stat.late,
          excused: stat.excused,
          attendancePercentage: parseFloat(attendancePercentage),
        }
      };
    });

    return successResponse({
      stats: formattedStats,
      summary: {
        totalStudents: formattedStats.length,
        avgAttendance: formattedStats.length > 0
          ? (formattedStats.reduce((sum, s) => sum + s.stats.attendancePercentage, 0) / formattedStats.length).toFixed(1)
          : 0,
      }
    });

  } catch (error) {
    console.error("Get attendance stats error:", error);
    return handleMongoError(error);
  }
}