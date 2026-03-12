import connectDB from "@/lib/mongodb";
import Attendance from "@/lib/models/Attendance";
import Teacher from "@/lib/models/Teacher";
import Class from "@/lib/models/Class";
import Student from "@/lib/models/Student";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse, handleMongoError } from "@/lib/api-utils";

// GET attendance records
export async function GET(request) {
  try {
    const { user, error, status } = await requireAuth();
    if (error) return errorResponse(error, status);

    // console.log({user})
    if (user.role !== "teacher") {
      return errorResponse("Access denied. Teachers only.", 403);
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("classId");
    const date = searchParams.get("date");
    const subjectId = searchParams.get("subjectId");

    if (!classId || !date) {
      return errorResponse("Class ID and date are required", 400);
    }

    // Get teacher profile
    const teacherProfile = await Teacher.findOne({ user: user._id });
    if (!teacherProfile) {
      return errorResponse("Teacher profile not found", 404);
    }

    // Verify teacher has access to this class
    const classData = await Class.findOne({
      _id: classId,
      $or: [
        { classTeacher: teacherProfile._id },
        { "subjects.teacher": teacherProfile._id }
      ]
    });
    // console.log({classData})

    if (!classData) {
      return errorResponse("Access denied to this class", 403);
    }

    // Build query
    const query = {
      class: classId,
      date: new Date(date),
    };

    // console.log({query})
    if (subjectId && subjectId !== "general") {
      query.subject = subjectId;
    } else {
      query.subject = null; // General attendance
    }

    // Get attendance records
    const records = await Attendance.find(query)
      .populate("student", "studentId rollNumber")
      .populate({
        path: "student",
        populate: { path: "user", select: "name avatar" }
      })
      .sort({ "student.rollNumber": 1 });

    return successResponse({
      records: records.map(r => ({
        _id: r._id,
        student: {
          _id: r.student._id,
          studentId: r.student.studentId,
          rollNumber: r.student.rollNumber,
          name: r.student.user?.name,
          avatar: r.student.user?.avatar,
        },
        status: r.status,
        remarks: r.remarks,
      })),
    });

  } catch (error) {
    console.error("Get attendance error:", error);
    return handleMongoError(error);
  }
}

// POST - Submit attendance
export async function POST(request) {
  try {
    const { user, error, status } = await requireAuth();
    if (error) return errorResponse(error, status);

    if (user.role !== "teacher") {
      return errorResponse("Access denied. Teachers only.", 403);
    }

    const body = await request.json();
    const { classId, date, subjectId, attendanceRecords } = body;

    if (!classId || !date || !Array.isArray(attendanceRecords)) {
      return errorResponse("Class ID, date, and attendance records are required", 400);
    }

    await connectDB();

    // Get teacher profile
    const teacherProfile = await Teacher.findOne({ user: user._id });
    if (!teacherProfile) {
      return errorResponse("Teacher profile not found", 404);
    }

    // Verify teacher has access to this class
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

    // If subject is specified, verify teacher teaches it
    if (subjectId && subjectId !== "general") {
      const teachesSubject = classData.subjects.some(
        s => s.subject.toString() === subjectId && s.teacher?.toString() === teacherProfile._id.toString()
      );
      
      if (!teachesSubject) {
        return errorResponse("You don't teach this subject in this class", 403);
      }
    }

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    // Delete existing attendance for this class, date, and subject
    await Attendance.deleteMany({
      class: classId,
      date: attendanceDate,
      subject: subjectId && subjectId !== "general" ? subjectId : null,
    });

    // Create new attendance records
    const records = attendanceRecords.map(record => ({
      class: classId,
      student: record.studentId,
      subject: subjectId && subjectId !== "general" ? subjectId : null,
      date: attendanceDate,
      status: record.status,
      markedBy: teacherProfile._id,
      remarks: record.remarks || null,
    }));

    await Attendance.insertMany(records);

    return successResponse(
      { count: records.length },
      `Attendance recorded successfully for ${records.length} student(s)`
    );

  } catch (error) {
    console.error("Submit attendance error:", error);
    return handleMongoError(error);
  }
}