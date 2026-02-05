import connectDB from "@/lib/mongodb";
import Student from "@/lib/models/Student";
import Assignment from "@/lib/models/Assignment";
import Attendance from "@/lib/models/Attendance";
import Grade from "@/lib/models/Grade";
import Quiz from "@/lib/models/Quiz";
import Notice from "@/lib/models/Notice";
import { requireStudent } from "@/lib/auth";
import { successResponse, errorResponse, handleMongoError } from "@/lib/api-utils";

export async function GET(request) {
  try {
    const { user, error, status } = await requireStudent();
    if (error) return errorResponse(error, status);

    await connectDB();

    const student = await Student.findOne({ user: user._id })
      .populate("class", "name section")
      .populate("subjects", "name code");

    if (!student) {
      return errorResponse("Student profile not found", 404);
    }

    // Get pending assignments
    const pendingAssignments = await Assignment.countDocuments({
      class: student.class?._id,
      status: "published",
      dueDate: { $gte: new Date() },
      "submissions.student": { $ne: student._id },
    });

    // Get attendance stats (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const attendanceRecords = await Attendance.find({
      class: student.class?._id,
      date: { $gte: thirtyDaysAgo },
      "records.student": student._id,
    });

    let presentCount = 0;
    let totalCount = 0;
    attendanceRecords.forEach(record => {
      const studentRecord = record.records.find(r => r.student.toString() === student._id.toString());
      if (studentRecord) {
        totalCount++;
        if (studentRecord.status === "present" || studentRecord.status === "late") {
          presentCount++;
        }
      }
    });

    const attendancePercentage = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

    // Get average grade
    const grades = await Grade.find({ student: student._id });
    const averageGrade = grades.length > 0
      ? Math.round(grades.reduce((sum, g) => sum + g.percentage, 0) / grades.length)
      : 0;

    // Get available quizzes
    const availableQuizzes = await Quiz.countDocuments({
      class: student.class?._id,
      status: "published",
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() },
      "attempts.student": { $ne: student._id },
    });

    // Get recent assignments
    const recentAssignments = await Assignment.find({
      class: student.class?._id,
      status: "published",
    })
      .populate("subject", "name code")
      .sort({ dueDate: 1 })
      .limit(5);

    // Get recent notices
    const recentNotices = await Notice.find({
      isPublished: true,
      startDate: { $lte: new Date() },
      $or: [
        { endDate: null },
        { endDate: { $gte: new Date() } }
      ],
      $or: [
        { targetAudience: "all" },
        { targetAudience: "students" },
        { targetClasses: student.class?._id }
      ]
    })
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(5);

    return successResponse({
      student: {
        ...student.toObject(),
        userName: user.name,
        userEmail: user.email,
        userAvatar: user.avatar,
      },
      stats: {
        pendingAssignments,
        attendancePercentage,
        averageGrade,
        availableQuizzes,
        totalSubjects: student.subjects?.length || 0,
      },
      recentAssignments,
      recentNotices,
    });

  } catch (error) {
    return handleMongoError(error);
  }
}
