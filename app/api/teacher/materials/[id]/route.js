import connectDB from "@/lib/mongodb";
import Material from "@/lib/models/Material";
import Teacher from "@/lib/models/Teacher";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse, handleMongoError } from "@/lib/api-utils";

// GET single material
export async function GET(request, { params }) {
  try {
    const { user, error, status } = await requireAuth();
    if (error) return errorResponse(error, status);

    if (user.role !== "teacher") {
      return errorResponse("Access denied. Teachers only.", 403);
    }

    const { id } = await params;
    await connectDB();

    const teacher = await Teacher.findOne({ user: user._id });
    if (!teacher) {
      return errorResponse("Teacher profile not found", 404);
    }

    const material = await Material.findOne({ _id: id, teacher: teacher._id })
      .populate("class", "name section")
      .populate("subject", "name code");

    if (!material) {
      return errorResponse("Material not found", 404);
    }

    return successResponse(material);

  } catch (error) {
    return handleMongoError(error);
  }
}

// PUT update material
export async function PUT(request, { params }) {
  try {
    const { user, error, status } = await requireAuth();
    if (error) return errorResponse(error, status);

    if (user.role !== "teacher") {
      return errorResponse("Access denied. Teachers only.", 403);
    }

    const { id } = await params;
    const body = await request.json();

    await connectDB();

    const teacher = await Teacher.findOne({ user: user._id });
    if (!teacher) {
      return errorResponse("Teacher profile not found", 404);
    }

    const material = await Material.findOneAndUpdate(
      { _id: id, teacher: teacher._id },
      { $set: body },
      { new: true, runValidators: true }
    )
      .populate("class", "name section")
      .populate("subject", "name code");

    if (!material) {
      return errorResponse("Material not found", 404);
    }

    return successResponse(material, "Material updated successfully");

  } catch (error) {
    return handleMongoError(error);
  }
}

// DELETE material (with Cloudinary cleanup)
export async function DELETE(request, { params }) {
  try {
    const { user, error, status } = await requireAuth();
    if (error) return errorResponse(error, status);

    if (user.role !== "teacher") {
      return errorResponse("Access denied. Teachers only.", 403);
    }

    const { id } = await params;
    await connectDB();

    const teacher = await Teacher.findOne({ user: user._id });
    if (!teacher) {
      return errorResponse("Teacher profile not found", 404);
    }

    const material = await Material.findOneAndDelete({ _id: id, teacher: teacher._id });
    if (!material) {
      return errorResponse("Material not found", 404);
    }

    // Return publicId so frontend can delete from Cloudinary
    return successResponse(
      { publicId: material.file?.publicId },
      "Material deleted successfully"
    );

  } catch (error) {
    return handleMongoError(error);
  }
}