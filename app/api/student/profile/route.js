import connectDB from "@/lib/mongodb";
import Student from "@/lib/models/Student";
import User from "@/lib/models/User";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse, handleMongoError } from "@/lib/api-utils";

// GET student profile
export async function GET(request) {
  try {
    const { user, error, status } = await requireAuth();
    if (error) return errorResponse(error, status);

    if (user.role !== "student") {
      return errorResponse("Access denied. Students only.", 403);
    }

    await connectDB();

    const student = await Student.findOne({ user: user._id })
      .populate("user")
      .populate("class", "name section academicYear")
      .populate("subjects", "name code");

    if (!student) {
      return errorResponse("Student profile not found", 404);
    }

    return successResponse({
      profile: {
        // User info
        name: student.user.name,
        email: student.user.email,
        phone: student.user.phone,
        avatar: student.user.avatar,
        gender: student.user.gender,
        dateOfBirth: student.user.dateOfBirth,
        address: student.user.address,
        isActive: student.user.isActive,
        
        // Student info
        studentId: student.studentId,
        rollNumber: student.rollNumber,
        section: student.section,
        admissionDate: student.admissionDate,
        bloodGroup: student.bloodGroup,
        emergencyContact: student.emergencyContact,
        
        // Relations
        class: student.class,
        subjects: student.subjects,
        
        // Parent info
        parentName: student.parentName,
        parentPhone: student.parentPhone,
        parentEmail: student.parentEmail,
      }
    });

  } catch (error) {
    console.error("Get student profile error:", error);
    return handleMongoError(error);
  }
}

// PUT update student profile
export async function PUT(request) {
  try {
    const { user, error, status } = await requireAuth();
    if (error) return errorResponse(error, status);

    if (user.role !== "student") {
      return errorResponse("Access denied. Students only.", 403);
    }

    const body = await request.json();
    const { phone, avatar, address, emergencyContact, parentPhone, parentEmail } = body;

    await connectDB();

    // Update User fields
    if (phone || avatar || address) {
      await User.findByIdAndUpdate(user._id, {
        ...(phone && { phone }),
        ...(avatar && { avatar }),
        ...(address && { address }),
      });
    }

    // Update Student fields
    const updateFields = {};
    if (emergencyContact) updateFields.emergencyContact = emergencyContact;
    if (parentPhone) updateFields.parentPhone = parentPhone;
    if (parentEmail) updateFields.parentEmail = parentEmail;

    if (Object.keys(updateFields).length > 0) {
      await Student.findOneAndUpdate(
        { user: user._id },
        { $set: updateFields }
      );
    }

    // Fetch updated profile
    const student = await Student.findOne({ user: user._id })
      .populate("user")
      .populate("class", "name section")
      .populate("subjects", "name code");

    return successResponse(student, "Profile updated successfully");

  } catch (error) {
    console.error("Update student profile error:", error);
    return handleMongoError(error);
  }
}