import connectDB from "@/lib/mongodb";
import Student from "@/lib/models/Student";
import Attendance from "@/lib/models/Attendance";
import { requireStudent } from "@/lib/auth";
import { successResponse, errorResponse, handleMongoError } from "@/lib/api-utils";

export async function GET(request) {
  try {
    const { user, error, status } = await requireStudent();
    if (error) return errorResponse(error, status);

    await connectDB();

    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month"); // Format: YYYY-MM
    const subjectId = searchParams.get("subjectId");

    const student = await Student.findOne({ user: user._id });
    if (!student) {
      return errorResponse("Student profile not found", 404);
    }

    let query = {
      class: student.class,
      "records.student": student._id,
    };

    // Filter by month if provided
    if (month) {
      const [year, monthNum] = month.split("-").map(Number);
      const startDate = new Date(year, monthNum - 1, 1);
      const endDate = new Date(year, monthNum, 0, 23, 59, 59);
      query.date = { $gte: startDate, $lte: endDate };
    }

    if (subjectId) {
      query.subject = subjectId;
    }

    const attendanceRecords = await Attendance.find(query)
      .populate("subject", "name code")
      .sort({ date: -1 });

    // Extract student's attendance from each record
    const myAttendance = attendanceRecords.map(record => {
      const myRecord = record.records.find(
        r => r.student.toString() === student._id.toString()
      );
      return {
        date: record.date,
        subject: record.subject,
        type: record.type,
        period: record.period,
        status: myRecord?.status || "absent",
        remarks: myRecord?.remarks || null,
      };
    });

    // Calculate stats
    const stats = {
      total: myAttendance.length,
      present: myAttendance.filter(a => a.status === "present").length,
      absent: myAttendance.filter(a => a.status === "absent").length,
      late: myAttendance.filter(a => a.status === "late").length,
      excused: myAttendance.filter(a => a.status === "excused").length,
    };
    stats.percentage = stats.total > 0 
      ? Math.round(((stats.present + stats.late) / stats.total) * 100) 
      : 0;

    return successResponse({
      attendance: myAttendance,
      stats,
    });

  } catch (error) {
    return handleMongoError(error);
  }
}
