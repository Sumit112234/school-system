import connectDB from "@/lib/mongodb";
import Subject from "@/lib/models/Subject";
import { requireAdmin } from "@/lib/auth";
import { successResponse, errorResponse, handleMongoError } from "@/lib/api-utils";

// GET single subject
export async function GET(request, { params }) {
  try {
    const { error, status } = await requireAdmin();
    if (error) return errorResponse(error, status);

    const { id } = await params;
    await connectDB();

    const subject = await Subject.findById(id);
    if (!subject) {
      return errorResponse("Subject not found", 404);
    }

    return successResponse(subject);

  } catch (error) {
    return handleMongoError(error);
  }
}

// PUT update subject
export async function PUT(request, { params }) {
  try {
    const { error, status } = await requireAdmin();
    if (error) return errorResponse(error, status);

    const { id } = await params;
    const body = await request.json();

    await connectDB();

    const subject = await Subject.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!subject) {
      return errorResponse("Subject not found", 404);
    }

    return successResponse(subject, "Subject updated successfully");

  } catch (error) {
    return handleMongoError(error);
  }
}

// DELETE subject
export async function DELETE(request, { params }) {
  try {
    const { error, status } = await requireAdmin();
    if (error) return errorResponse(error, status);

    const { id } = await params;
    await connectDB();

    const subject = await Subject.findByIdAndDelete(id);
    if (!subject) {
      return errorResponse("Subject not found", 404);
    }

    return successResponse(null, "Subject deleted successfully");

  } catch (error) {
    return handleMongoError(error);
  }
}
