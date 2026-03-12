import connectDB from "@/lib/mongodb";
import Student from "@/lib/models/Student";
import Attendance from "@/lib/models/Attendance";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse, handleMongoError } from "@/lib/api-utils";

// GET student's attendance records
export async function GET(request) {
  try {
    const { user, error, status } = await requireAuth();
    if (error) return errorResponse(error, status);

    if (user.role !== "student") {
      return errorResponse("Access denied. Students only.", 403);
    }

    await connectDB();

    const student = await Student.findOne({ user: user._id });
    if (!student) {
      return errorResponse("Student profile not found", 404);
    }

    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get("subjectId") || "";
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";
    const month = searchParams.get("month") || ""; // YYYY-MM format

    let query = { student: student._id };

    if (subjectId) {
      query.subject = subjectId;
    }

    // Date filtering
    if (month) {
      const [year, monthNum] = month.split("-");
      const start = new Date(year, parseInt(monthNum) - 1, 1);
      const end = new Date(year, parseInt(monthNum), 0);
      end.setHours(23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    } else if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate + "T23:59:59.999Z")
      };
    } else {
      // Default: Last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      query.date = { $gte: thirtyDaysAgo };
    }

    const attendanceRecords = await Attendance.find(query)
      .populate("subject", "name code")
      .populate("class", "name section")
      .sort({ date: -1 });

    // Calculate statistics
    const totalDays = attendanceRecords.length;
    const presentDays = attendanceRecords.filter(a => a.status === "present").length;
    const absentDays = attendanceRecords.filter(a => a.status === "absent").length;
    const lateDays = attendanceRecords.filter(a => a.status === "late").length;
    const excusedDays = attendanceRecords.filter(a => a.status === "excused").length;

    const attendancePercentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

    // Group by subject
    const bySubject = {};
    attendanceRecords.forEach(record => {
      const subjectKey = record.subject?._id?.toString() || "general";
      if (!bySubject[subjectKey]) {
        bySubject[subjectKey] = {
          subject: record.subject,
          total: 0,
          present: 0,
          absent: 0,
          late: 0,
          excused: 0,
          percentage: 0,
        };
      }
      bySubject[subjectKey].total++;
      bySubject[subjectKey][record.status]++;
    });

    // Calculate percentages for each subject
    Object.values(bySubject).forEach(subj => {
      subj.percentage = subj.total > 0 ? (subj.present / subj.total) * 100 : 0;
    });

    // Group by month for trend analysis
    const byMonth = {};
    attendanceRecords.forEach(record => {
      const monthKey = new Date(record.date).toISOString().slice(0, 7); // YYYY-MM
      if (!byMonth[monthKey]) {
        byMonth[monthKey] = {
          month: monthKey,
          total: 0,
          present: 0,
          percentage: 0,
        };
      }
      byMonth[monthKey].total++;
      if (record.status === "present") byMonth[monthKey].present++;
    });

    Object.values(byMonth).forEach(m => {
      m.percentage = m.total > 0 ? (m.present / m.total) * 100 : 0;
    });

    return successResponse({
      records: attendanceRecords.map(r => ({
        _id: r._id,
        date: r.date,
        status: r.status,
        remarks: r.remarks,
        subject: r.subject,
        class: r.class,
      })),
      statistics: {
        totalDays,
        presentDays,
        absentDays,
        lateDays,
        excusedDays,
        attendancePercentage: parseFloat(attendancePercentage.toFixed(2)),
      },
      bySubject: Object.values(bySubject),
      byMonth: Object.values(byMonth).sort((a, b) => a.month.localeCompare(b.month)),
    });

  } catch (error) {
    console.error("Get student attendance error:", error);
    return handleMongoError(error);
  }
}