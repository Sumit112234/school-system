import { db } from "@/lib/data-store";
import { successResponse, errorResponse } from "@/lib/api-utils";
import { cookies } from "next/headers";

async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");
  if (!sessionCookie?.value) return null;
  return JSON.parse(sessionCookie.value);
}

// Get material by ID
export async function GET(request, { params }) {
  try {
    const session = await getSession();
    if (!session) {
      return errorResponse("Unauthorized", 401);
    }

    const { id } = await params;
    const material = db.materials.findById(id);

    if (!material) {
      return errorResponse("Material not found", 404);
    }

    const teacher = db.users.findById(material.teacherId);
    const cls = db.classes.findById(material.classId);

    return successResponse({
      ...material,
      teacherName: teacher?.name || "Unknown",
      className: cls?.name || "Unknown",
    });
  } catch (error) {
    console.error("Get material error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// Update material (teacher only)
export async function PUT(request, { params }) {
  try {
    const session = await getSession();
    if (!session || !["teacher", "admin"].includes(session.role)) {
      return errorResponse("Forbidden", 403);
    }

    const { id } = await params;
    const material = db.materials.findById(id);

    if (!material) {
      return errorResponse("Material not found", 404);
    }

    // Teachers can only update their own materials
    if (session.role === "teacher" && material.teacherId !== session.id) {
      return errorResponse("Forbidden", 403);
    }

    const body = await request.json();
    const updated = db.materials.update(id, body);

    return successResponse(updated, "Material updated successfully");
  } catch (error) {
    console.error("Update material error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// Delete material (teacher only)
export async function DELETE(request, { params }) {
  try {
    const session = await getSession();
    if (!session || !["teacher", "admin"].includes(session.role)) {
      return errorResponse("Forbidden", 403);
    }

    const { id } = await params;
    const material = db.materials.findById(id);

    if (!material) {
      return errorResponse("Material not found", 404);
    }

    if (session.role === "teacher" && material.teacherId !== session.id) {
      return errorResponse("Forbidden", 403);
    }

    db.materials.delete(id);
    return successResponse(null, "Material deleted successfully");
  } catch (error) {
    console.error("Delete material error:", error);
    return errorResponse("Internal server error", 500);
  }
}
