import connectDB from "@/lib/mongodb";
import Teacher from "@/lib/models/Teacher";
import Quiz from "@/lib/models/Quiz";
import { requireTeacher } from "@/lib/auth";
import { successResponse, errorResponse, handleMongoError } from "@/lib/api-utils";

// GET single quiz with attempts
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

    const quiz = await Quiz.findOne({ _id: id, teacher: teacher._id })
      .populate("class", "name section")
      .populate("subject", "name code")
      .populate({
        path: "attempts.student",
        populate: { path: "user", select: "name email" }
      });

    if (!quiz) {
      return errorResponse("Quiz not found", 404);
    }

    return successResponse(quiz);

  } catch (error) {
    return handleMongoError(error);
  }
}

// PUT update quiz
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

    // Don't allow editing questions if quiz has attempts
    const existingQuiz = await Quiz.findOne({ _id: id, teacher: teacher._id });
    if (!existingQuiz) {
      return errorResponse("Quiz not found", 404);
    }

    if (existingQuiz.attempts.length > 0 && body.questions) {
      return errorResponse("Cannot modify questions after students have taken the quiz", 400);
    }

    const quiz = await Quiz.findOneAndUpdate(
      { _id: id, teacher: teacher._id },
      { $set: body },
      { new: true, runValidators: true }
    )
      .populate("class", "name section")
      .populate("subject", "name code");

    return successResponse(quiz, "Quiz updated successfully");

  } catch (error) {
    return handleMongoError(error);
  }
}

// DELETE quiz
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

    const quiz = await Quiz.findOneAndDelete({ _id: id, teacher: teacher._id });
    if (!quiz) {
      return errorResponse("Quiz not found", 404);
    }

    return successResponse(null, "Quiz deleted successfully");

  } catch (error) {
    return handleMongoError(error);
  }
}
