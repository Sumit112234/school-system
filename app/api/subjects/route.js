import { db } from "@/lib/data-store";
import { successResponse, errorResponse } from "@/lib/api-utils";
import { cookies } from "next/headers";

async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");
  if (!sessionCookie?.value) return null;
  return JSON.parse(sessionCookie.value);
}

// Get all subjects
export async function GET(request) {
  try {
    const session = await getSession();
    if (!session) {
      return errorResponse("Unauthorized", 401);
    }

    const subjects = db.subjects.findAll();
    return successResponse(subjects);
  } catch (error) {
    console.error("Get subjects error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// Create subject (admin only)
export async function POST(request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return errorResponse("Forbidden", 403);
    }

    const body = await request.json();
    const { name, code, credits } = body;

    if (!name || !code) {
      return errorResponse("Name and code are required", 400);
    }

    // Check if subject code already exists
    const existing = db.subjects.findAll().find((s) => s.code === code);
    if (existing) {
      return errorResponse("Subject code already exists", 409);
    }

    const subject = db.subjects.create({
      name,
      code,
      credits: credits || 3,
    });

    return successResponse(subject, "Subject created successfully", 201);
  } catch (error) {
    console.error("Create subject error:", error);
    return errorResponse("Internal server error", 500);
  }
}
