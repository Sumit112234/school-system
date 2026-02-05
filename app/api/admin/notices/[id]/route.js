import connectDB from "@/lib/mongodb";
import Notice from "@/lib/models/Notice";
import { requireAdmin } from "@/lib/auth";
import { successResponse, errorResponse, handleMongoError } from "@/lib/api-utils";

// GET single notice
export async function GET(request, { params }) {
  try {
    const { error, status } = await requireAdmin();
    if (error) return errorResponse(error, status);

    const { id } = await params;
    await connectDB();

    const notice = await Notice.findById(id)
      .populate("author", "name email role")
      .populate("targetClasses", "name section");

    if (!notice) {
      return errorResponse("Notice not found", 404);
    }

    return successResponse(notice);

  } catch (error) {
    return handleMongoError(error);
  }
}

// PUT update notice
export async function PUT(request, { params }) {
  try {
    const { error, status } = await requireAdmin();
    if (error) return errorResponse(error, status);

    const { id } = await params;
    const body = await request.json();

    await connectDB();

    const notice = await Notice.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    ).populate("author", "name email");

    if (!notice) {
      return errorResponse("Notice not found", 404);
    }

    return successResponse(notice, "Notice updated successfully");

  } catch (error) {
    return handleMongoError(error);
  }
}

// DELETE notice
export async function DELETE(request, { params }) {
  try {
    const { error, status } = await requireAdmin();
    if (error) return errorResponse(error, status);

    const { id } = await params;
    await connectDB();

    const notice = await Notice.findByIdAndDelete(id);
    if (!notice) {
      return errorResponse("Notice not found", 404);
    }

    return successResponse(null, "Notice deleted successfully");

  } catch (error) {
    return handleMongoError(error);
  }
}
