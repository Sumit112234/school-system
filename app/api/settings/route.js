import { db } from "@/lib/data-store";
import { successResponse, errorResponse } from "@/lib/api-utils";
import { cookies } from "next/headers";

async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");
  if (!sessionCookie?.value) return null;
  return JSON.parse(sessionCookie.value);
}

// Get settings
export async function GET(request) {
  try {
    const session = await getSession();
    if (!session) {
      return errorResponse("Unauthorized", 401);
    }

    const settings = db.settings.get();

    // Non-admins get limited settings
    if (session.role !== "admin") {
      return successResponse({
        schoolName: settings.schoolName,
        schoolEmail: settings.schoolEmail,
        schoolPhone: settings.schoolPhone,
        academicYear: settings.academicYear,
        timezone: settings.timezone,
        dateFormat: settings.dateFormat,
      });
    }

    return successResponse(settings);
  } catch (error) {
    console.error("Get settings error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// Update settings (admin only)
export async function PUT(request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return errorResponse("Forbidden", 403);
    }

    const body = await request.json();
    const updated = db.settings.update(body);

    return successResponse(updated, "Settings updated successfully");
  } catch (error) {
    console.error("Update settings error:", error);
    return errorResponse("Internal server error", 500);
  }
}
