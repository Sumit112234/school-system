import connectDB from "@/lib/mongodb";
import Teacher from "@/lib/models/Teacher";
import Attendance from "@/lib/models/Attendance";
import Student from "@/lib/models/Student";
import { requireTeacher } from "@/lib/auth";
import { 
  successResponse, 
  errorResponse,
  getStartOfDay,
  getEndOfDay,
  handleMongoError 
} from "@/lib/api-utils";

// GET attendance records
export async function GET(request) {
  try {
    const { user, error, status } = await requireTeacher();
    if (error) return errorResponse(error, status);

    await connectDB();

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("classId");
    const date = searchParams.get("date");
    const subjectId = searchParams.get("subjectId");

    const teacher = await Teacher.findOne({ user: user._id });
    if (!teacher) {
      return errorResponse("Teacher profile not found", 404);
    }

    let query = { teacher: teacher._id };

    if (classId) {
      if (!teacher.classes.map(c => c.toString()).includes(classId)) {
        return errorResponse("Access denied to this class", 403);
      }
      query.class = classId;
    } else {
      query.class = { $in: teacher.classes };
    }

    if (date) {
      const targetDate = new Date(date);
      query.date = {
        $gte: getStartOfDay(targetDate),
        $lte: getEndOfDay(targetDate),
      };
    }

    if (subjectId) {
      query.subject = subjectId;
    }

    const attendance = await Attendance.find(query)
      .populate("class", "name section")
      .populate("subject", "name code")
      .populate({
        path: "records.student",
        populate: { path: "user", select: "name" }
      })
      .sort({ date: -1 });

    return successResponse(attendance);

  } catch (error) {
    return handleMongoError(error);
  }
}

// POST create/update attendance
export async function POST(request) {
  try {
    const { user, error, status } = await requireTeacher();
    if (error) return errorResponse(error, status);

    const body = await request.json();
    const { classId, subjectId, date, period, records, type } = body;

    if (!classId || !date || !records || !Array.isArray(records)) {
      return errorResponse("Class ID, date, and records are required", 400);
    }

    await connectDB();

    const teacher = await Teacher.findOne({ user: user._id });
    if (!teacher) {
      return errorResponse("Teacher profile not found", 404);
    }

    // Verify teacher has access to this class
    if (!teacher.classes.map(c => c.toString()).includes(classId)) {
      return errorResponse("Access denied to this class", 403);
    }

    const attendanceDate = getStartOfDay(new Date(date));

    // Check if attendance already exists for this class/date/subject
    let attendance = await Attendance.findOne({
      class: classId,
      date: attendanceDate,
      subject: subjectId || null,
      period: period || null,
    });

    if (attendance) {
      // Update existing
      attendance.records = records;
      attendance.teacher = teacher._id;
      await attendance.save();
    } else {
      // Create new
      attendance = await Attendance.create({
        class: classId,
        subject: subjectId || null,
        date: attendanceDate,
        period: period || null,
        teacher: teacher._id,
        records,
        type: type || "daily",
      });
    }

    await attendance.populate([
      { path: "class", select: "name section" },
      { path: "subject", select: "name code" },
      { path: "records.student", populate: { path: "user", select: "name" } }
    ]);

    return successResponse(attendance, "Attendance saved successfully");

  } catch (error) {
    return handleMongoError(error);
  }
}
