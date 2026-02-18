import { cookies } from "next/headers";
import { successResponse, errorResponse } from "@/lib/api-utils";
import { getCurrentUser } from "@/lib/auth";
import User from "@/lib/models/User";
import Student from "@/lib/models/Student";
import Teacher from "@/lib/models/Teacher";

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

    // if (!["admin", "helper"].includes(session.role)) {
    //   return errorResponse("Forbidden", 403);
    // }

    const { searchParams } = new URL(request.url);

    const page      = Number(searchParams.get("page")) || 1;
    const limit     = Number(searchParams.get("limit")) || 10;
    const search    = searchParams.get("search") || "";
    const role      = searchParams.get("role") || "";
    const sortBy    = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;

    // ---- Build Mongo filter ----
    const filter = {};

    if (role) {
      filter.role = role;
    }

    if (search) {
      filter.$or = [
        { name:  { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    // ---- Query DB ----
    const users = await User.find(filter)
      .select("-password -resetPasswordToken -resetPasswordExpires")
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await User.countDocuments(filter);

    return successResponse({
      data: users,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error("Get users error:", error);
    return errorResponse("Internal server error", 500);
  }
}



export async function POST(request) {
  const session = await getCurrentUser();

  // OPTIONAL: enable later
  // if (!session || session.role !== "admin") {
  //   return errorResponse("Forbidden", 403);
  // }

  const body = await request.json();
  const { email, password, name, role } = body;

  if (!email || !password || !name || !role) {
    return errorResponse("Missing required fields", 400);
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return errorResponse("Email already exists", 409);
  }

  let user;

  try {
    // 1️⃣ Create base user
    user = await User.create({
      ...body,
      isActive: true,
    });

    // 2️⃣ Create role-specific document
    if (role === "student") {
      const { studentId, classId, section } = body;

      if (!studentId) {
        throw new Error("studentId is required for student");
      }

      await Student.create({
        user: user._id,
        studentId,
        class: classId || null,
        section: section || null,
      });
    }

    if (role === "teacher") {
      const { employeeId, department, subjects, classes } = body;

      if (!employeeId) {
        throw new Error("employeeId is required for teacher");
      }

      await Teacher.create({
        user: user._id,
        employeeId,
        department: department || null,
        subjects: subjects || [],
        classes: classes || [],
      });
    }

    // admin & helper → no extra collection (for now)
    if (["admin", "helper"].includes(role)) {
      // nothing extra
    }

    return successResponse(
      user.toPublicJSON(),
      "User created successfully",
      201
    );

  } catch (error) {
    console.error("Create user error:", error);

    // 🔥 rollback user if role creation fails
    if (user?._id) {
      await User.findByIdAndDelete(user._id);
    }

    return errorResponse(error.message || "Internal server error", 500);
  }
}
