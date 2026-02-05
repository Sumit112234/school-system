import { db } from "@/lib/data-store";
import { successResponse, errorResponse } from "@/lib/api-utils";
import { cookies } from "next/headers";
import { getCurrentUser } from "../../../lib/auth";

// Get session helper
async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");
  if (!sessionCookie?.value) return null;
  return JSON.parse(sessionCookie.value);
}

// Get all users (admin/helper only)
export async function GET(request) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return errorResponse("Unauthorized", 401);
    }

    if (!["admin", "helper"].includes(session.role)) {
      return errorResponse("Forbidden", 403);
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    let users = db.users.findAll();

    // Filter by role if specified
    if (role) {
      users = users.filter((u) => u.role === role);
    }

    // Search
    // users = searchFilter(users, search, ["name", "email", "phone"]);

    // Sort
    // users = sortData(users, sortBy, sortOrder);

    // Remove passwords
    users = users.map(({ password, ...user }) => user);

    // Paginate
    const result = users //paginate(users, page, limit);

    return successResponse(result);
  } catch (error) {
    console.error("Get users error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// Create user (admin only)
export async function POST(request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return errorResponse("Forbidden", 403);
    }

    const body = await request.json();
    const { email, password, name, role } = body;

    if (!email || !password || !name || !role) {
      return errorResponse("Missing required fields", 400);
    }

    // Check if email exists
    if (db.users.findByEmail(email)) {
      return errorResponse("Email already exists", 409);
    }

    const user = db.users.create({
      ...body,
      status: "active",
    });

    const { password: _, ...userWithoutPassword } = user;
    return successResponse(userWithoutPassword, "User created successfully", 201);
  } catch (error) {
    console.error("Create user error:", error);
    return errorResponse("Internal server error", 500);
  }
}
