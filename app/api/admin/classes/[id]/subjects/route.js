import connectDB from "@/lib/mongodb";
import Class from "@/lib/models/Class";
import { requireAdmin } from "@/lib/auth";
import { successResponse, errorResponse, handleMongoError } from "@/lib/api-utils";

export async function PUT(request, { params }) {
  // try {
    const { error, status } = await requireAdmin();
    if (error) return errorResponse(error, status);

    const { id } = await params;
    const body = await request.json();
    const { subjects } = body;

    if (!Array.isArray(subjects)) {
      return errorResponse("Subjects must be an array", 400);
    }

    await connectDB();

    const classData = await Class.findByIdAndUpdate(
      id,
      { $set: { subjects } },
      { new: true, runValidators: true }
    )
      .populate("subjects.subject", "name code")
      .populate({
        path: "subjects.teacher",
        populate: { path: "user", select: "name" }
      });

    if (!classData) {
      return errorResponse("Class not found", 404);
    }

    return successResponse(classData, "Class subjects updated successfully");

  // } catch (error) {
  //   return handleMongoError(error);
  // }
}