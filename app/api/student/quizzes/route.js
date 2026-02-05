import connectDB from "@/lib/mongodb";
import Student from "@/lib/models/Student";
import Quiz from "@/lib/models/Quiz";
import { requireStudent } from "@/lib/auth";
import { 
  successResponse, 
  errorResponse,
  getPaginationParams,
  createPaginationResponse,
  handleMongoError 
} from "@/lib/api-utils";

export async function GET(request) {
  try {
    const { user, error, status } = await requireStudent();
    if (error) return errorResponse(error, status);

    await connectDB();

    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(searchParams);
    const subjectId = searchParams.get("subjectId") || "";
    const quizStatus = searchParams.get("status") || ""; // available, completed, expired

    const student = await Student.findOne({ user: user._id });
    if (!student) {
      return errorResponse("Student profile not found", 404);
    }

    const now = new Date();

    let query = {
      class: student.class,
      status: "published",
    };

    if (subjectId) {
      query.subject = subjectId;
    }

    let quizzes = await Quiz.find(query)
      .populate("subject", "name code")
      .populate({
        path: "teacher",
        populate: { path: "user", select: "name" }
      })
      .select("-questions.correctAnswer -questions.explanation")
      .sort({ endDate: 1 });

    // Add status and attempt info to each quiz
    quizzes = quizzes.map(quiz => {
      const myAttempts = quiz.attempts.filter(
        a => a.student.toString() === student._id.toString()
      );
      
      let quizState = "available";
      if (now > new Date(quiz.endDate)) {
        quizState = "expired";
      } else if (now < new Date(quiz.startDate)) {
        quizState = "upcoming";
      } else if (myAttempts.length >= quiz.maxAttempts) {
        quizState = "completed";
      }

      const bestScore = myAttempts.length > 0
        ? Math.max(...myAttempts.map(a => a.percentage))
        : null;

      return {
        ...quiz.toObject(),
        quizState,
        attemptsUsed: myAttempts.length,
        bestScore,
        myAttempts: myAttempts.map(a => ({
          score: a.score,
          totalPoints: a.totalPoints,
          percentage: a.percentage,
          completedAt: a.completedAt,
        })),
      };
    });

    // Filter by status if provided
    if (quizStatus) {
      quizzes = quizzes.filter(q => q.quizState === quizStatus);
    }

    const total = quizzes.length;
    const paginatedQuizzes = quizzes.slice(skip, skip + limit);

    return successResponse(createPaginationResponse(paginatedQuizzes, total, page, limit));

  } catch (error) {
    return handleMongoError(error);
  }
}
