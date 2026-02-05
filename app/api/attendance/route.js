import { db } from "@/lib/data-store";
import { successResponse, errorResponse, paginate } from "@/lib/api-utils";
import { cookies } from "next/headers";

async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");
  if (!sessionCookie?.value) return null;
  return JSON.parse(sessionCookie.value);
}

// Get attendance records
export async function GET(request) {
  try {
    const session = await getSession();
    if (!session) {
      return errorResponse("Unauthorized", 401);
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 30;
    const classId = searchParams.get("classId") || "";
    const studentId = searchParams.get("studentId") || "";
    const date = searchParams.get("date") || "";
    const month = searchParams.get("month") || "";

    let attendance = db.attendance.findAll();

    // Students can only see their own attendance
    if (session.role === "student") {
      attendance = db.attendance.findByStudent(session.id);
    }

    // Teachers can see attendance for their classes
    if (session.role === "teacher") {
      const teacherClasses = db.classes.findByTeacher(session.id);
      const classIds = teacherClasses.map((c) => c.id);
      attendance = attendance.filter((a) => classIds.includes(a.classId));
    }

    // Filter by class
    if (classId) {
      attendance = attendance.filter((a) => a.classId === classId);
    }

    // Filter by student
    if (studentId) {
      attendance = attendance.filter((a) => a.studentId === studentId);
    }

    // Filter by date
    if (date) {
      attendance = attendance.filter((a) => a.date === date);
    }

    // Filter by month
    if (month) {
      attendance = attendance.filter((a) => a.date.startsWith(month));
    }

    // Sort by date descending
    attendance.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Add student info
    attendance = attendance.map((record) => {
      const student = db.users.findById(record.studentId);
      const cls = db.classes.findById(record.classId);
      return {
        ...record,
        studentName: student?.name || "Unknown",
        studentRollNumber: student?.rollNumber || "",
        className: cls?.name || "Unknown",
      };
    });

    const result = paginate(attendance, page, limit);

    // Calculate summary for students
    if (session.role === "student") {
      const total = attendance.length;
      const present = attendance.filter((a) => a.status === "present").length;
      const absent = attendance.filter((a) => a.status === "absent").length;
      const late = attendance.filter((a) => a.status === "late").length;
      result.summary = {
        total,
        present,
        absent,
        late,
        percentage: total > 0 ? ((present + late) / total * 100).toFixed(1) : 0,
      };
    }

    return successResponse(result);
  } catch (error) {
    console.error("Get attendance error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// Mark attendance (teacher only)
export async function POST(request) {
  try {
    const session = await getSession();
    if (!session || !["teacher", "admin"].includes(session.role)) {
      return errorResponse("Forbidden", 403);
    }

    const body = await request.json();
    const { classId, date, records } = body;

    if (!classId || !date || !records || !Array.isArray(records)) {
      return errorResponse("Missing required fields", 400);
    }

    // Validate class access for teachers
    if (session.role === "teacher") {
      const teacherClasses = db.classes.findByTeacher(session.id);
      if (!teacherClasses.find((c) => c.id === classId)) {
        return errorResponse("Forbidden", 403);
      }
    }

    // Check if attendance already exists for this date and class
    const existing = db.attendance.findAll().filter(
      (a) => a.classId === classId && a.date === date
    );

    if (existing.length > 0) {
      // Update existing records
      for (const record of records) {
        const existingRecord = existing.find((e) => e.studentId === record.studentId);
        if (existingRecord) {
          db.attendance.update(existingRecord.id, {
            status: record.status,
            remarks: record.remarks || "",
          });
        } else {
          db.attendance.create({
            studentId: record.studentId,
            classId,
            date,
            status: record.status,
            remarks: record.remarks || "",
            markedBy: session.id,
          });
        }
      }
      return successResponse(null, "Attendance updated successfully");
    }

    // Create new attendance records
    const attendanceRecords = records.map((record) => ({
      studentId: record.studentId,
      classId,
      date,
      status: record.status,
      remarks: record.remarks || "",
      markedBy: session.id,
    }));

    db.attendance.bulkCreate(attendanceRecords);
    return successResponse(null, "Attendance marked successfully", 201);
  } catch (error) {
    console.error("Mark attendance error:", error);
    return errorResponse("Internal server error", 500);
  }
}
