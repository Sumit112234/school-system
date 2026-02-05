import connectDB from "@/lib/mongodb";
import Teacher from "@/lib/models/Teacher";
import Student from "@/lib/models/Student";
import Assignment from "@/lib/models/Assignment";
import Attendance from "@/lib/models/Attendance";
import Quiz from "@/lib/models/Quiz";
import { requireTeacher } from "@/lib/auth";
import { successResponse, errorResponse, handleMongoError } from "@/lib/api-utils";

export async function GET(request) {
  try {
    const { user, error, status } = await requireTeacher();
    if (error) return errorResponse(error, status);

    await connectDB();

    const teacher = await Teacher.findOne({ user: user._id })
      .populate("classes", "name section")
      .populate("subjects", "name code");

    if (!teacher) {
      return errorResponse("Teacher profile not found", 404);
    }

    // Get students count in teacher's classes
    const studentCount = await Student.countDocuments({
      class: { $in: teacher.classes.map(c => c._id) }
    });

    // Get pending assignments to grade
    const pendingGrading = await Assignment.countDocuments({
      teacher: teacher._id,
      "submissions.status": "submitted"
    });

    // Get today's attendance count
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayAttendance = await Attendance.countDocuments({
      teacher: teacher._id,
      date: { $gte: today }
    });

    // Get active quizzes
    const activeQuizzes = await Quiz.countDocuments({
      teacher: teacher._id,
      status: "published",
      endDate: { $gte: new Date() }
    });

    // Get recent assignments
    const recentAssignments = await Assignment.find({ teacher: teacher._id })
      .populate("class", "name section")
      .populate("subject", "name")
      .sort({ createdAt: -1 })
      .limit(5);

    // Get upcoming classes from timetable (simplified)
    const stats = {
      teacher: {
        ...teacher.toObject(),
        userName: user.name,
        userEmail: user.email,
      },
      overview: {
        totalClasses: teacher.classes.length,
        totalSubjects: teacher.subjects.length,
        totalStudents: studentCount,
        pendingGrading,
        todayAttendance,
        activeQuizzes,
      },
      recentAssignments,
    };

    return successResponse(stats);

  } catch (error) {
    return handleMongoError(error);
  }
}
