import { db } from "@/lib/data-store";
import { successResponse, errorResponse } from "@/lib/api-utils";
import { cookies } from "next/headers";

async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");
  if (!sessionCookie?.value) return null;
  return JSON.parse(sessionCookie.value);
}

// Get class by ID
export async function GET(request, { params }) {
  try {
    const session = await getSession();
    if (!session) {
      return errorResponse("Unauthorized", 401);
    }

    const { id } = await params;
    const cls = db.classes.findById(id);

    if (!cls) {
      return errorResponse("Class not found", 404);
    }

    // Get teacher info
    const teacher = db.users.findById(cls.teacherId);

    // Get students in class
    const students = db.users.findByRole("student").filter((s) => s.classId === id);

    return successResponse({
      ...cls,
      teacherName: teacher?.name || "Unassigned",
      students: students.map(({ password, ...s }) => s),
    });
  } catch (error) {
    console.error("Get class error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// Update class (admin only)
export async function PUT(request, { params }) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return errorResponse("Forbidden", 403);
    }

    const { id } = await params;
    const body = await request.json();

    const cls = db.classes.update(id, body);
    if (!cls) {
      return errorResponse("Class not found", 404);
    }

    return successResponse(cls, "Class updated successfully");
  } catch (error) {
    console.error("Update class error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// Delete class (admin only)
export async function DELETE(request, { params }) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return errorResponse("Forbidden", 403);
    }

    const { id } = await params;

    // Check if class has students
    const students = db.users.findByRole("student").filter((s) => s.classId === id);
    if (students.length > 0) {
      return errorResponse("Cannot delete class with students", 400);
    }

    const deleted = db.classes.delete(id);
    if (!deleted) {
      return errorResponse("Class not found", 404);
    }

    return successResponse(null, "Class deleted successfully");
  } catch (error) {
    console.error("Delete class error:", error);
    return errorResponse("Internal server error", 500);
  }
}
