import connectDB from "@/lib/mongodb";
import Teacher from "@/lib/models/Teacher";
import Assignment from "@/lib/models/Assignment";
import { requireTeacher } from "@/lib/auth";
import { successResponse, errorResponse, handleMongoError } from "@/lib/api-utils";

// GET single assignment with submissions
export async function GET(request, { params }) {
  try {
    const { user, error, status } = await requireTeacher();
    if (error) return errorResponse(error, status);

    const { id } = await params;
    await connectDB();

    const teacher = await Teacher.findOne({ user: user._id });
    if (!teacher) {
      return errorResponse("Teacher profile not found", 404);
    }

    const assignment = await Assignment.findOne({ _id: id, teacher: teacher._id })
      .populate("class", "name section")
      .populate("subject", "name code")
      .populate({
        path: "submissions.student",
        populate: { path: "user", select: "name email" }
      });

    if (!assignment) {
      return errorResponse("Assignment not found", 404);
    }

    return successResponse(assignment);

  } catch (error) {
    return handleMongoError(error);
  }
}

// PUT update assignment
export async function PUT(request, { params }) {
  try {
    const { user, error, status } = await requireTeacher();
    if (error) return errorResponse(error, status);

    const { id } = await params;
    const body = await request.json();

    await connectDB();

    const teacher = await Teacher.findOne({ user: user._id });
    if (!teacher) {
      return errorResponse("Teacher profile not found", 404);
    }

    const assignment = await Assignment.findOneAndUpdate(
      { _id: id, teacher: teacher._id },
      { $set: body },
      { new: true, runValidators: true }
    )
      .populate("class", "name section")
      .populate("subject", "name code");

    if (!assignment) {
      return errorResponse("Assignment not found", 404);
    }

    return successResponse(assignment, "Assignment updated successfully");

  } catch (error) {
    return handleMongoError(error);
  }
}

// DELETE assignment
export async function DELETE(request, { params }) {
  try {
    const { user, error, status } = await requireTeacher();
    if (error) return errorResponse(error, status);

    const { id } = await params;
    await connectDB();

    const teacher = await Teacher.findOne({ user: user._id });
    if (!teacher) {
      return errorResponse("Teacher profile not found", 404);
    }

    const assignment = await Assignment.findOneAndDelete({ _id: id, teacher: teacher._id });
    if (!assignment) {
      return errorResponse("Assignment not found", 404);
    }

    return successResponse(null, "Assignment deleted successfully");

  } catch (error) {
    return handleMongoError(error);
  }
}
