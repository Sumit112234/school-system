import connectDB from "@/lib/mongodb";
import Student from "@/lib/models/Student";
import Assignment from "@/lib/models/Assignment";
import Quiz from "@/lib/models/Quiz";
import Material from "@/lib/models/Material";
import Attendance from "@/lib/models/Attendance";
import Grade from "@/lib/models/Grade";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse, handleMongoError } from "@/lib/api-utils";

// GET student dashboard data
export async function GET(request) {
  try {
    const { user, error, status } = await requireAuth();
    if (error) return errorResponse(error, status);

    if (user.role !== "student") {
      return errorResponse("Access denied. Students only.", 403);
    }

    await connectDB();

    const student = await Student.findOne({ user: user._id })
      .populate("class", "name section")
      .populate("subjects", "name code");

    if (!student) {
      return errorResponse("Student profile not found", 404);
    }

    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get assignments
    const assignments = await Assignment.find({
      class: student.class,
      status: "published",
    }).select("title dueDate submissions");

    const myAssignments = {
      total: assignments.length,
      pending: 0,
      submitted: 0,
      overdue: 0,
    };

    assignments.forEach(a => {
      const mySubmission = a.submissions.find(s => s.student.toString() === student._id.toString());
      if (mySubmission) {
        myAssignments.submitted++;
      } else if (new Date(a.dueDate) < now) {
        myAssignments.overdue++;
      } else {
        myAssignments.pending++;
      }
    });

    // Get quizzes
    const quizzes = await Quiz.find({
      class: student.class,
      status: "published",
      startDate: { $lte: now },
    }).select("title endDate attempts maxAttempts");

    const myQuizzes = {
      total: quizzes.length,
      available: 0,
      completed: 0,
      expired: 0,
    };

    quizzes.forEach(q => {
      const myAttempts = q.attempts.filter(a => a.student.toString() === student._id.toString());
      if (new Date(q.endDate) < now) {
        myQuizzes.expired++;
      } else if (myAttempts.length >= q.maxAttempts) {
        myQuizzes.completed++;
      } else {
        myQuizzes.available++;
      }
    });

    // Get materials count
    const materialsCount = await Material.countDocuments({
      class: student.class,
      isPublished: true,
    });

    // Get attendance (last 30 days)
    const attendanceRecords = await Attendance.find({
      student: student._id,
      date: { $gte: thirtyDaysAgo },
    });

    const attendance = {
      totalDays: attendanceRecords.length,
      present: attendanceRecords.filter(a => a.status === "present").length,
      absent: attendanceRecords.filter(a => a.status === "absent").length,
      late: attendanceRecords.filter(a => a.status === "late").length,
      percentage: 0,
    };

    if (attendance.totalDays > 0) {
      attendance.percentage = ((attendance.present / attendance.totalDays) * 100).toFixed(1);
    }

    // Get grades (current academic year)
    const grades = await Grade.find({
      student: student._id,
      academicYear: student.class?.academicYear || "2026-2027",
    });

    const gradeStats = {
      total: grades.length,
      averagePercentage: 0,
      highestGrade: grades.length > 0 ? Math.max(...grades.map(g => g.percentage)) : 0,
      lowestGrade: grades.length > 0 ? Math.min(...grades.map(g => g.percentage)) : 0,
    };

    if (grades.length > 0) {
      gradeStats.averagePercentage = (grades.reduce((sum, g) => sum + g.percentage, 0) / grades.length).toFixed(1);
    }

    // Get upcoming assignments (next 7 days)
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const upcomingAssignments = await Assignment.find({
      class: student.class,
      status: "published",
      dueDate: { $gte: now, $lte: sevenDaysFromNow },
    })
      .populate("subject", "name code")
      .sort({ dueDate: 1 })
      .limit(5);

    const upcoming = upcomingAssignments.filter(a => {
      const mySubmission = a.submissions.find(s => s.student.toString() === student._id.toString());
      return !mySubmission;
    });

    // Recent grades
    const recentGrades = await Grade.find({
      student: student._id,
    })
      .populate("subject", "name code")
      .sort({ createdAt: -1 })
      .limit(5);

    return successResponse({
      student: {
        name: user.name,
        studentId: student.studentId,
        class: student.class,
        subjects: student.subjects,
      },
      statistics: {
        assignments: myAssignments,
        quizzes: myQuizzes,
        materials: materialsCount,
        attendance,
        grades: gradeStats,
      },
      upcomingAssignments: upcoming.map(a => ({
        _id: a._id,
        title: a.title,
        subject: a.subject,
        dueDate: a.dueDate,
        totalMarks: a.totalMarks,
      })),
      recentGrades: recentGrades.map(g => ({
        _id: g._id,
        subject: g.subject,
        examType: g.examType,
        term: g.term,
        marksObtained: g.marksObtained,
        totalMarks: g.totalMarks,
        percentage: g.percentage,
        grade: g.grade,
      })),
    });

  } catch (error) {
    console.error("Get student dashboard error:", error);
    return handleMongoError(error);
  }
}