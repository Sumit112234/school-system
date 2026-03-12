import connectDB from "@/lib/mongodb";
import Teacher from "@/lib/models/Teacher";
import User from "@/lib/models/User";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse, handleMongoError } from "@/lib/api-utils";

// GET teacher profile
export async function GET(request) {
  try {
    const { user, error, status } = await requireAuth();
    if (error) return errorResponse(error, status);

    if (user.role !== "teacher") {
      return errorResponse("Access denied. Teachers only.", 403);
    }

    await connectDB();

    const teacher = await Teacher.findOne({ user: user._id })
      .populate("user")
      .populate("subjects", "name code")
      .populate("classes", "name section");

    if (!teacher) {
      return errorResponse("Teacher profile not found", 404);
    }

    return successResponse({
      profile: {
        // User info
        name: teacher.user.name,
        email: teacher.user.email,
        phone: teacher.user.phone,
        avatar: teacher.user.avatar,
        gender: teacher.user.gender,
        dateOfBirth: teacher.user.dateOfBirth,
        address: teacher.user.address,
        isActive: teacher.user.isActive,
        
        // Teacher info
        employeeId: teacher.employeeId,
        department: teacher.department,
        designation: teacher.designation,
        qualification: teacher.qualification,
        joiningDate: teacher.joiningDate,
        
        // Relations
        subjects: teacher.subjects,
        classes: teacher.classes,
      }
    });

  } catch (error) {
    console.error("Get teacher profile error:", error);
    return handleMongoError(error);
  }
}

// PUT update teacher profile
export async function PUT(request) {
  try {
    const { user, error, status } = await requireAuth();
    if (error) return errorResponse(error, status);

    if (user.role !== "teacher") {
      return errorResponse("Access denied. Teachers only.", 403);
    }

    const body = await request.json();
    const { phone, avatar, address } = body;

    await connectDB();

    // Update User fields
    if (phone || avatar || address) {
      await User.findByIdAndUpdate(user._id, {
        ...(phone && { phone }),
        ...(avatar && { avatar }),
        ...(address && { address }),
      });
    }

    // Fetch updated profile
    const teacher = await Teacher.findOne({ user: user._id })
      .populate("user")
      .populate("subjects", "name code")
      .populate("classes", "name section");

    return successResponse(teacher, "Profile updated successfully");

  } catch (error) {
    console.error("Update teacher profile error:", error);
    return handleMongoError(error);
  }
}