import { getCurrentUser } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Student from "@/lib/models/Student";
import Teacher from "@/lib/models/Teacher";
import Class from "@/lib/models/Class";
import Subject from "@/lib/models/Subject";
import { successResponse, errorResponse } from "@/lib/api-utils";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return errorResponse("Not authenticated", 401);
    }

    await connectDB();

    // Get role-specific data
    let roleData = null;
    if (user.role === "student") {
      roleData = await Student.findOne({ user: user._id })
        .populate("class", "name section")
        .populate("subjects", "name code");
    } else if (user.role === "teacher") {
      roleData = await Teacher.findOne({ user: user._id })
        .populate("classes", "name section")
        .populate("subjects", "name code");
    }

    return successResponse({
      user: user.toPublicJSON(),
      roleData,
    }, "Session valid");

  } catch (error) {
    console.error("Session error:", error);
    return errorResponse("Internal server error", 500);
  }
}
