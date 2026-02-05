import connectDB from "@/lib/mongodb";
import Student from "@/lib/models/Student";
import Timetable from "@/lib/models/Timetable";
import Settings from "@/lib/models/Settings";
import { requireStudent } from "@/lib/auth";
import { successResponse, errorResponse, handleMongoError } from "@/lib/api-utils";

export async function GET(request) {
  try {
    const { user, error, status } = await requireStudent();
    if (error) return errorResponse(error, status);

    await connectDB();

    const student = await Student.findOne({ user: user._id });
    if (!student) {
      return errorResponse("Student profile not found", 404);
    }

    // Get current academic year from settings
    const settings = await Settings.findOne({ key: "main" });
    const academicYear = settings?.currentAcademicYear || "2025-2026";

    const timetable = await Timetable.find({
      class: student.class,
      academicYear,
      isActive: true,
    })
      .populate("periods.subject", "name code")
      .populate({
        path: "periods.teacher",
        populate: { path: "user", select: "name" }
      })
      .sort({ day: 1 });

    // Organize by day
    const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const organizedTimetable = {};
    
    days.forEach(day => {
      const daySchedule = timetable.find(t => t.day === day);
      organizedTimetable[day] = daySchedule ? daySchedule.periods : [];
    });

    return successResponse({
      timetable: organizedTimetable,
      academicYear,
    });

  } catch (error) {
    return handleMongoError(error);
  }
}
