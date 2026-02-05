import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";
import Student from "@/lib/models/Student";
import Teacher from "@/lib/models/Teacher";
import { requireAdmin } from "@/lib/auth";
import { successResponse, errorResponse, handleMongoError } from "@/lib/api-utils";

// GET single user
export async function GET(request, { params }) {
  try {
    const { error, status } = await requireAdmin();
    if (error) return errorResponse(error, status);

    const { id } = await params;
    await connectDB();

    const user = await User.findById(id).select("-password");
    if (!user) {
      return errorResponse("User not found", 404);
    }

    // Get role-specific data
    let roleData = null;
    if (user.role === "student") {
      roleData = await Student.findOne({ user: user._id })
        .populate("class", "name section")
        .populate("subjects", "name code");
    } else if (user.role === "teacher") {
      roleData = await Teacher.findOne({ user: user._id })
        .populate("classes", "name section")
        .populate("subjects", "name code")
        .populate("classTeacherOf", "name section");
    }

    return successResponse({ user: user.toPublicJSON(), roleData });

  } catch (error) {
    return handleMongoError(error);
  }
}

// PUT update user
export async function PUT(request, { params }) {
  try {
    const { error, status } = await requireAdmin();
    if (error) return errorResponse(error, status);

    const { id } = await params;
    const body = await request.json();
    
    await connectDB();

    const user = await User.findById(id);
    if (!user) {
      return errorResponse("User not found", 404);
    }

    // Update allowed fields
    const allowedFields = ["name", "phone", "address", "dateOfBirth", "gender", "isActive", "avatar"];
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        user[field] = body[field];
      }
    }

    // Handle password update separately
    if (body.password) {
      user.password = body.password;
    }

    await user.save();

    // Update role-specific data
    if (user.role === "student" && body.studentData) {
      await Student.findOneAndUpdate(
        { user: user._id },
        { $set: body.studentData },
        { new: true }
      );
    } else if (user.role === "teacher" && body.teacherData) {
      await Teacher.findOneAndUpdate(
        { user: user._id },
        { $set: body.teacherData },
        { new: true }
      );
    }

    return successResponse(user.toPublicJSON(), "User updated successfully");

  } catch (error) {
    return handleMongoError(error);
  }
}

// DELETE user
export async function DELETE(request, { params }) {
  try {
    const { error, status } = await requireAdmin();
    if (error) return errorResponse(error, status);

    const { id } = await params;
    await connectDB();

    const user = await User.findById(id);
    if (!user) {
      return errorResponse("User not found", 404);
    }

    // Delete role-specific data
    if (user.role === "student") {
      await Student.deleteOne({ user: user._id });
    } else if (user.role === "teacher") {
      await Teacher.deleteOne({ user: user._id });
    }

    // Delete user
    await User.deleteOne({ _id: id });

    return successResponse(null, "User deleted successfully");

  } catch (error) {
    return handleMongoError(error);
  }
}
