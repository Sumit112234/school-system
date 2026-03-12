import connectDB from "@/lib/mongodb";
import Grade from "@/lib/models/Grade";
import Teacher from "@/lib/models/Teacher";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse, handleMongoError } from "@/lib/api-utils";

// GET single grade
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

    const grade = await Grade.findOne({ _id: id, teacher: teacher._id })
      .populate({
        path: "student",
        populate: { path: "user", select: "name email avatar" }
      })
      .populate("class", "name section")
      .populate("subject", "name code");

    if (!grade) {
      return errorResponse("Grade not found", 404);
    }

    return successResponse(grade);

  } catch (error) {
    return handleMongoError(error);
  }
}

// PUT update grade
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

    const grade = await Grade.findOne({ _id: id, teacher: teacher._id });
    if (!grade) {
      return errorResponse("Grade not found", 404);
    }

    // Update fields
    if (body.marksObtained !== undefined) grade.marksObtained = body.marksObtained;
    if (body.totalMarks !== undefined) grade.totalMarks = body.totalMarks;
    if (body.remarks !== undefined) grade.remarks = body.remarks;

    await grade.save(); // Will trigger pre-save hook for percentage and grade

    await grade.populate([
      { path: "student", populate: { path: "user", select: "name email" } },
      { path: "class", select: "name section" },
      { path: "subject", select: "name code" }
    ]);

    return successResponse(grade, "Grade updated successfully");

  } catch (error) {
    return handleMongoError(error);
  }
}

// DELETE grade
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

    const grade = await Grade.findOneAndDelete({ _id: id, teacher: teacher._id });
    if (!grade) {
      return errorResponse("Grade not found", 404);
    }

    return successResponse(null, "Grade deleted successfully");

  } catch (error) {
    return handleMongoError(error);
  }
}