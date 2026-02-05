import { clearAuthCookie } from "@/lib/auth";
import { successResponse } from "@/lib/api-utils";

export async function POST() {
  try {
    await clearAuthCookie();
    return successResponse(null, "Logged out successfully");
  } catch (error) {
    console.error("Logout error:", error);
    return successResponse(null, "Logged out");
  }
}

export async function GET() {
  try {
    await clearAuthCookie();
    return successResponse(null, "Logged out successfully");
  } catch (error) {
    return successResponse(null, "Logged out");
  }
}
