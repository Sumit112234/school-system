import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";
import Teacher from "@/lib/models/Teacher";
import Class from "@/lib/models/Class";
import { requireAdmin } from "@/lib/auth";
import { successResponse, errorResponse, handleMongoError } from "@/lib/api-utils";

// GET single teacher
export async function GET(request, { params }) {
  try {
    const { error, status } = await requireAdmin();
    if (error) return errorResponse(error, status);

    const { id } = await params;
    await connectDB();

    // Try to find by User ID
    let user = await User.findById(id).select("-password");
    let teacherProfile = null;

    if (user && user.role === "teacher") {
      // Found user, get teacher profile
      teacherProfile = await Teacher.findOne({ user: user._id })
        .populate("subjects", "name code")
        .populate("classes", "name section academicYear")
        .populate("classTeacherOf", "name section academicYear");
    } else {
      // Try to find by Teacher ID
      teacherProfile = await Teacher.findById(id)
        .populate("subjects", "name code")
        .populate("classes", "name section academicYear")
        .populate("classTeacherOf", "name section academicYear");

      if (teacherProfile) {
        user = await User.findById(teacherProfile.user).select("-password");
      }
    }

    if (!user || user.role !== "teacher") {
      return errorResponse("Teacher not found", 404);
    }

    if (!teacherProfile) {
      return errorResponse("Teacher profile not found", 404);
    }

    return successResponse({
      user: user.toPublicJSON(),
      teacherData: {
        _id: teacherProfile._id,
        employeeId: teacherProfile.employeeId,
        department: teacherProfile.department,
        designation: teacherProfile.designation,
        qualification: teacherProfile.qualification,
        subjects: teacherProfile.subjects,
        classes: teacherProfile.classes,
        classTeacherOf: teacherProfile.classTeacherOf,
        joiningDate: teacherProfile.joiningDate,
      },
    });

  } catch (error) {
    return handleMongoError(error);
  }
}

// PUT update teacher
export async function PUT(request, { params }) {
  try {
    const { error, status } = await requireAdmin();
    if (error) return errorResponse(error, status);

    const { id } = await params;
    const body = await request.json();
    
    await connectDB();

    // Try to find by User ID first
    let user = await User.findById(id);
    let teacherProfile = null;

    if (user && user.role === "teacher") {
      teacherProfile = await Teacher.findOne({ user: user._id });
    } else {
      // Try to find by Teacher ID
      teacherProfile = await Teacher.findById(id);
      if (teacherProfile) {
        user = await User.findById(teacherProfile.user);
      }
    }

    if (!user || user.role !== "teacher") {
      return errorResponse("Teacher not found", 404);
    }

    if (!teacherProfile) {
      return errorResponse("Teacher profile not found", 404);
    }

    // Update user fields
    const userAllowedFields = ["name", "phone", "address", "dateOfBirth", "gender", "isActive", "avatar"];
    for (const field of userAllowedFields) {
      if (body[field] !== undefined) {
        user[field] = body[field];
      }
    }

    // Handle password update separately
    if (body.password) {
      user.password = body.password;
    }

    await user.save();

    // Update teacher profile fields
    const teacherAllowedFields = [
      "employeeId", "department", "designation", "qualification", 
      "subjects", "classes", "joiningDate"
    ];
    
    for (const field of teacherAllowedFields) {
      if (body[field] !== undefined) {
        teacherProfile[field] = body[field];
      }
    }

    await teacherProfile.save();

    // Populate the updated data
    await teacherProfile.populate([
      { path: "subjects", select: "name code" },
      { path: "classes", select: "name section academicYear" },
      { path: "classTeacherOf", select: "name section academicYear" },
    ]);

    return successResponse(
      {
        user: user.toPublicJSON(),
        teacherData: {
          _id: teacherProfile._id,
          employeeId: teacherProfile.employeeId,
          department: teacherProfile.department,
          designation: teacherProfile.designation,
          qualification: teacherProfile.qualification,
          subjects: teacherProfile.subjects,
          classes: teacherProfile.classes,
          classTeacherOf: teacherProfile.classTeacherOf,
          joiningDate: teacherProfile.joiningDate,
        },
      },
      "Teacher updated successfully"
    );

  } catch (error) {
    return handleMongoError(error);
  }
}

// DELETE teacher
export async function DELETE(request, { params }) {
  try {
    const { error, status } = await requireAdmin();
    if (error) return errorResponse(error, status);

    const { id } = await params;
    await connectDB();

    // Try to find by User ID first
    let user = await User.findById(id);
    let teacherProfile = null;

    if (user && user.role === "teacher") {
      teacherProfile = await Teacher.findOne({ user: user._id });
    } else {
      // Try to find by Teacher ID
      teacherProfile = await Teacher.findById(id);
      if (teacherProfile) {
        user = await User.findById(teacherProfile.user);
      }
    }

    if (!user || user.role !== "teacher") {
      return errorResponse("Teacher not found", 404);
    }

    if (!teacherProfile) {
      return errorResponse("Teacher profile not found", 404);
    }

    // Check if teacher is assigned as class teacher
    const classTeacherCount = await Class.countDocuments({ classTeacher: teacherProfile._id });
    if (classTeacherCount > 0) {
      return errorResponse(
        `Cannot delete teacher who is assigned as class teacher for ${classTeacherCount} class(es). Please reassign or remove the class teacher assignment first.`,
        400
      );
    }

    // Check if teacher is assigned to teach subjects in any class
    const classesWithTeacher = await Class.countDocuments({
      "subjects.teacher": teacherProfile._id
    });
    if (classesWithTeacher > 0) {
      return errorResponse(
        `Cannot delete teacher who is assigned to teach subjects in ${classesWithTeacher} class(es). Please remove subject assignments first.`,
        400
      );
    }

    // Delete teacher profile and user
    await Teacher.deleteOne({ _id: teacherProfile._id });
    await User.deleteOne({ _id: user._id });

    return successResponse(null, "Teacher deleted successfully");

  } catch (error) {
    return handleMongoError(error);
  }
}