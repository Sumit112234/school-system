import { db } from "@/lib/data-store";
import { successResponse, errorResponse } from "@/lib/api-utils";
import { cookies } from "next/headers";

async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");
  if (!sessionCookie?.value) return null;
  return JSON.parse(sessionCookie.value);
}

// Get notice by ID
export async function GET(request, { params }) {
  try {
    const session = await getSession();
    if (!session) {
      return errorResponse("Unauthorized", 401);
    }

    const { id } = await params;
    const notice = db.notices.findById(id);

    if (!notice) {
      return errorResponse("Notice not found", 404);
    }

    const publisher = db.users.findById(notice.publishedBy);

    return successResponse({
      ...notice,
      publisherName: publisher?.name || "Admin",
    });
  } catch (error) {
    console.error("Get notice error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// Update notice (admin only)
export async function PUT(request, { params }) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return errorResponse("Forbidden", 403);
    }

    const { id } = await params;
    const body = await request.json();

    const notice = db.notices.update(id, body);
    if (!notice) {
      return errorResponse("Notice not found", 404);
    }

    return successResponse(notice, "Notice updated successfully");
  } catch (error) {
    console.error("Update notice error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// Delete notice (admin only)
export async function DELETE(request, { params }) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return errorResponse("Forbidden", 403);
    }

    const { id } = await params;
    const deleted = db.notices.delete(id);

    if (!deleted) {
      return errorResponse("Notice not found", 404);
    }

    return successResponse(null, "Notice deleted successfully");
  } catch (error) {
    console.error("Delete notice error:", error);
    return errorResponse("Internal server error", 500);
  }
}
