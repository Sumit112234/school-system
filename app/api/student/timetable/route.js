import connectDB from "@/lib/mongodb";
import Student from "@/lib/models/Student";
import Timetable from "@/lib/models/Timetable";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse, handleMongoError } from "@/lib/api-utils";

// GET student's timetable
export async function GET(request) {
  try {
    const { user, error, status } = await requireAuth();
    if (error) return errorResponse(error, status);

    if (user.role !== "student") {
      return errorResponse("Access denied. Students only.", 403);
    }

    await connectDB();

    const student = await Student.findOne({ user: user._id });
    if (!student || !student.class) {
      return errorResponse("Student class not found", 404);
    }

    const { searchParams } = new URL(request.url);
    const day = searchParams.get("day") || "";

    let query = {
      class: student.class,
      isActive: true,
    };

    if (day) {
      query.day = day;
    }

    const timetables = await Timetable.find(query)
      .populate("class", "name section academicYear")
      .populate("periods.subject", "name code")
      .populate({
        path: "periods.teacher",
        populate: { path: "user", select: "name" }
      })
      .sort({ day: 1 });

    // Get current day for highlighting
    const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const currentTime = new Date().toTimeString().slice(0, 5); // HH:MM format

    // Find current/next period
    let currentPeriod = null;
    let nextPeriod = null;

    const todayTimetable = timetables.find(t => t.day === currentDay);
    if (todayTimetable) {
      for (let i = 0; i < todayTimetable.periods.length; i++) {
        const period = todayTimetable.periods[i];
        if (currentTime >= period.startTime && currentTime <= period.endTime) {
          currentPeriod = { ...period.toObject(), day: currentDay };
          if (i + 1 < todayTimetable.periods.length) {
            nextPeriod = { ...todayTimetable.periods[i + 1].toObject(), day: currentDay };
          }
          break;
        } else if (currentTime < period.startTime) {
          nextPeriod = { ...period.toObject(), day: currentDay };
          break;
        }
      }
    }

    return successResponse({
      timetables,
      currentDay,
      currentTime,
      currentPeriod,
      nextPeriod,
    });

  } catch (error) {
    console.error("Get student timetable error:", error);
    return handleMongoError(error);
  }
}