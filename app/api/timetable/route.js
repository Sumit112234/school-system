import { db } from "@/lib/data-store";
import { successResponse, errorResponse } from "@/lib/api-utils";
import { cookies } from "next/headers";

async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");
  if (!sessionCookie?.value) return null;
  return JSON.parse(sessionCookie.value);
}

// Get timetable
export async function GET(request) {
  try {
    const session = await getSession();
    if (!session) {
      return errorResponse("Unauthorized", 401);
    }

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("classId") || "";
    const day = searchParams.get("day") || "";

    let timetable = db.timetable.findAll();

    // Students see their class timetable
    if (session.role === "student") {
      timetable = db.timetable.findByClass(session.classId);
    }

    // Teachers see their timetable
    if (session.role === "teacher") {
      timetable = db.timetable.findByTeacher(session.id);
    }

    // Filter by class
    if (classId && ["admin", "helper"].includes(session.role)) {
      timetable = db.timetable.findByClass(classId);
    }

    // Filter by day
    if (day) {
      timetable = timetable.filter((t) => t.day === day);
    }

    // Add class and teacher info
    timetable = timetable.map((entry) => {
      const cls = db.classes.findById(entry.classId);
      const teacher = db.users.findById(entry.teacherId);
      return {
        ...entry,
        className: cls?.name || "Unknown",
        teacherName: teacher?.name || "Unknown",
      };
    });

    // Sort by day and period
    const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    timetable.sort((a, b) => {
      const dayDiff = dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
      if (dayDiff !== 0) return dayDiff;
      return a.period - b.period;
    });

    // Group by day
    const groupedByDay = timetable.reduce((acc, entry) => {
      if (!acc[entry.day]) {
        acc[entry.day] = [];
      }
      acc[entry.day].push(entry);
      return acc;
    }, {});

    return successResponse({
      timetable,
      groupedByDay,
    });
  } catch (error) {
    console.error("Get timetable error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// Create/Update timetable entry (admin only)
export async function POST(request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return errorResponse("Forbidden", 403);
    }

    const body = await request.json();
    const { classId, day, period, subject, teacherId, time, room } = body;

    if (!classId || !day || !period || !subject || !time) {
      return errorResponse("Missing required fields", 400);
    }

    // Check if entry already exists
    const existing = db.timetable.findAll().find(
      (t) => t.classId === classId && t.day === day && t.period === period
    );

    if (existing) {
      // Update existing
      const updated = db.timetable.update(existing.id, {
        subject,
        teacherId: teacherId || null,
        time,
        room: room || null,
      });
      return successResponse(updated, "Timetable entry updated successfully");
    }

    // Create new
    const entry = db.timetable.create({
      classId,
      day,
      period,
      subject,
      teacherId: teacherId || null,
      time,
      room: room || null,
    });

    return successResponse(entry, "Timetable entry created successfully", 201);
  } catch (error) {
    console.error("Create timetable error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// Delete timetable entry (admin only)
export async function DELETE(request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return errorResponse("Forbidden", 403);
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return errorResponse("Entry ID required", 400);
    }

    const deleted = db.timetable.delete(id);
    if (!deleted) {
      return errorResponse("Entry not found", 404);
    }

    return successResponse(null, "Timetable entry deleted successfully");
  } catch (error) {
    console.error("Delete timetable error:", error);
    return errorResponse("Internal server error", 500);
  }
}
