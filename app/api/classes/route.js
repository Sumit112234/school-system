import { db } from "@/lib/data-store";
import { successResponse, errorResponse, paginate, searchFilter } from "@/lib/api-utils";
import { cookies } from "next/headers";

async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");
  if (!sessionCookie?.value) return null;
  return JSON.parse(sessionCookie.value);
}

// Get all classes
export async function GET(request) {
  try {
    const session = await getSession();
    if (!session) {
      return errorResponse("Unauthorized", 401);
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const search = searchParams.get("search") || "";

    let classes = db.classes.findAll();

    // Teachers only see their classes
    if (session.role === "teacher") {
      classes = db.classes.findByTeacher(session.id);
    }

    // Students only see their class
    if (session.role === "student") {
      classes = classes.filter((c) => c.id === session.classId);
    }

    // Search
    classes = searchFilter(classes, search, ["name", "grade", "section"]);

    // Add teacher info
    classes = classes.map((cls) => {
      const teacher = db.users.findById(cls.teacherId);
      return {
        ...cls,
        teacherName: teacher?.name || "Unassigned",
      };
    });

    const result = paginate(classes, page, limit);
    return successResponse(result);
  } catch (error) {
    console.error("Get classes error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// Create class (admin only)
export async function POST(request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return errorResponse("Forbidden", 403);
    }

    const body = await request.json();
    const { name, grade, section, teacherId, room, capacity } = body;

    if (!name || !grade || !section) {
      return errorResponse("Missing required fields", 400);
    }

    const newClass = db.classes.create({
      name,
      grade,
      section,
      teacherId: teacherId || null,
      room: room || null,
      capacity: capacity || 40,
      studentCount: 0,
      subjects: body.subjects || [],
      schedule: body.schedule || "Morning Shift",
    });

    return successResponse(newClass, "Class created successfully", 201);
  } catch (error) {
    console.error("Create class error:", error);
    return errorResponse("Internal server error", 500);
  }
}
