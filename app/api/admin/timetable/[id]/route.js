import connectDB from "@/lib/mongodb";
import Timetable from "@/lib/models/Timetable";
import { requireAdmin } from "@/lib/auth";
import { successResponse, errorResponse, handleMongoError } from "@/lib/api-utils";

// DELETE timetable
export async function DELETE(request, { params }) {
  try {
    const { error, status } = await requireAdmin();
    if (error) return errorResponse(error, status);

    const { id } = await params;
    await connectDB();

    const timetable = await Timetable.findByIdAndDelete(id);
    if (!timetable) {
      return errorResponse("Timetable not found", 404);
    }

    return successResponse(null, "Timetable deleted successfully");

  } catch (error) {
    return handleMongoError(error);
  }
}