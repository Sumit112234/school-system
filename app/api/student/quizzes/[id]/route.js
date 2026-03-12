import connectDB from "@/lib/mongodb";
import Quiz from "@/lib/models/Quiz";
import Student from "@/lib/models/Student";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse, handleMongoError } from "@/lib/api-utils";

// GET quiz details for taking (without answers)
export async function GET(request, { params }) {
  try {
    const { user, error, status } = await requireAuth();
    if (error) return errorResponse(error, status);

    if (user.role !== "student") {
      return errorResponse("Access denied. Students only.", 403);
    }

    const { id } = await params;
    await connectDB();

    const student = await Student.findOne({ user: user._id });
    if (!student) {
      return errorResponse("Student profile not found", 404);
    }

    const quiz = await Quiz.findOne({
      _id: id,
      class: student.class,
      status: "published",
    })
      .populate("subject", "name code")
      .select("-questions.correctAnswer -questions.explanation -attempts");

    if (!quiz) {
      return errorResponse("Quiz not found or not available", 404);
    }

    const now = new Date();
    if (quiz.startDate > now) {
      return errorResponse("Quiz has not started yet", 403);
    }
    if (quiz.endDate < now) {
      return errorResponse("Quiz has expired", 403);
    }

    // Check attempts
    const studentAttempts = await Quiz.findById(id).select("attempts").then(q =>
      q.attempts.filter(a => a.student.toString() === student._id.toString())
    );

    if (studentAttempts.length >= quiz.maxAttempts) {
      return errorResponse("Maximum attempts reached", 403);
    }

    // Shuffle questions if required
    let questions = quiz.questions.map((q, index) => ({
      index,
      question: q.question,
      type: q.type,
      options: q.options,
      points: q.points,
    }));

    if (quiz.shuffleQuestions) {
      questions = questions.sort(() => Math.random() - 0.5);
    }

    return successResponse({
      quiz: {
        _id: quiz._id,
        title: quiz.title,
        description: quiz.description,
        subject: quiz.subject,
        duration: quiz.duration,
        totalPoints: quiz.totalPoints,
        passingScore: quiz.passingScore,
        questions,
      },
      attemptNumber: studentAttempts.length + 1,
    });

  } catch (error) {
    return handleMongoError(error);
  }
}

// POST submit quiz attempt
export async function POST(request, { params }) {
  try {
    const { user, error, status } = await requireAuth();
    if (error) return errorResponse(error, status);

    if (user.role !== "student") {
      return errorResponse("Access denied. Students only.", 403);
    }

    const { id } = await params;
    const body = await request.json();
    const { answers, startedAt, completedAt } = body;

    if (!Array.isArray(answers)) {
      return errorResponse("Answers array is required", 400);
    }

    await connectDB();

    const student = await Student.findOne({ user: user._id });
    if (!student) {
      return errorResponse("Student profile not found", 404);
    }

    const quiz = await Quiz.findOne({
      _id: id,
      class: student.class,
      status: "published",
    });

    if (!quiz) {
      return errorResponse("Quiz not found", 404);
    }

    // Validate attempt
    const now = new Date();
    if (quiz.endDate < now) {
      return errorResponse("Quiz has expired", 403);
    }

    const studentAttempts = quiz.attempts.filter(
      a => a.student.toString() === student._id.toString()
    );

    if (studentAttempts.length >= quiz.maxAttempts) {
      return errorResponse("Maximum attempts reached", 403);
    }

    // Grade the quiz
    let score = 0;
    const gradedAnswers = answers.map(ans => {
      const question = quiz.questions[ans.questionIndex];
      if (!question) {
        return {
          questionIndex: ans.questionIndex,
          answer: ans.answer,
          isCorrect: false,
          pointsEarned: 0,
        };
      }

      let isCorrect = false;

      if (question.type === "multiple-choice" || question.type === "true-false") {
        isCorrect = ans.answer === question.correctAnswer;
      } else if (question.type === "short-answer") {
        isCorrect = ans.answer?.toLowerCase().trim() === 
                    question.correctAnswer?.toLowerCase().trim();
      }

      const pointsEarned = isCorrect ? question.points : 0;
      score += pointsEarned;

      return {
        questionIndex: ans.questionIndex,
        answer: ans.answer,
        isCorrect,
        pointsEarned,
      };
    });

    const percentage = (score / quiz.totalPoints) * 100;
    const timeTaken = completedAt && startedAt
      ? Math.floor((new Date(completedAt) - new Date(startedAt)) / 1000)
      : 0;

    // Add attempt
    quiz.attempts.push({
      student: student._id,
      answers: gradedAnswers,
      score,
      totalPoints: quiz.totalPoints,
      percentage,
      startedAt: startedAt ? new Date(startedAt) : new Date(),
      completedAt: completedAt ? new Date(completedAt) : new Date(),
      timeTaken,
    });

    await quiz.save();

    // Prepare result
    const result = {
      score,
      totalPoints: quiz.totalPoints,
      percentage: parseFloat(percentage.toFixed(2)),
      passed: percentage >= quiz.passingScore,
      timeTaken,
    };

    if (quiz.showResults) {
      result.answers = gradedAnswers.map((ans, index) => ({
        ...ans,
        correctAnswer: quiz.questions[ans.questionIndex]?.correctAnswer,
        explanation: quiz.questions[ans.questionIndex]?.explanation,
      }));
    }

    return successResponse(result, "Quiz submitted successfully");

  } catch (error) {
    return handleMongoError(error);
  }
}