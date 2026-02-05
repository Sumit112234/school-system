import { db } from "@/lib/data-store";
import { successResponse, errorResponse } from "@/lib/api-utils";
import { cookies } from "next/headers";

async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");
  if (!sessionCookie?.value) return null;
  return JSON.parse(sessionCookie.value);
}

// Get user by ID
export async function GET(request, { params }) {
  try {
    const session = await getSession();
    if (!session) {
      return errorResponse("Unauthorized", 401);
    }

    const { id } = await params;
    
    // Users can only view their own profile unless admin/helper
    if (session.id !== id && !["admin", "helper"].includes(session.role)) {
      return errorResponse("Forbidden", 403);
    }

    const user = db.users.findById(id);
    if (!user) {
      return errorResponse("User not found", 404);
    }

    const { password, ...userWithoutPassword } = user;
    return successResponse(userWithoutPassword);
  } catch (error) {
    console.error("Get user error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// Update user
export async function PUT(request, { params }) {
  try {
    const session = await getSession();
    if (!session) {
      return errorResponse("Unauthorized", 401);
    }

    const { id } = await params;
    
    // Users can only update their own profile unless admin
    if (session.id !== id && session.role !== "admin") {
      return errorResponse("Forbidden", 403);
    }

    const body = await request.json();
    
    // Prevent changing role unless admin
    if (body.role && session.role !== "admin") {
      delete body.role;
    }

    // Prevent password change through this endpoint
    delete body.password;

    const user = db.users.update(id, body);
    if (!user) {
      return errorResponse("User not found", 404);
    }

    const { password, ...userWithoutPassword } = user;

    // Update session if updating own profile
    if (session.id === id) {
      const cookieStore = await cookies();
      const newSession = {
        ...session,
        name: user.name,
        avatar: user.avatar,
        phone: user.phone,
      };
      cookieStore.set("session", JSON.stringify(newSession), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });
    }

    return successResponse(userWithoutPassword, "User updated successfully");
  } catch (error) {
    console.error("Update user error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// Delete user (admin only)
export async function DELETE(request, { params }) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return errorResponse("Forbidden", 403);
    }

    const { id } = await params;
    
    // Prevent self-deletion
    if (session.id === id) {
      return errorResponse("Cannot delete your own account", 400);
    }

    const deleted = db.users.delete(id);
    if (!deleted) {
      return errorResponse("User not found", 404);
    }

    return successResponse(null, "User deleted successfully");
  } catch (error) {
    console.error("Delete user error:", error);
    return errorResponse("Internal server error", 500);
  }
}
