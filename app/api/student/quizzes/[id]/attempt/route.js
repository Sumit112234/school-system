import connectDB from "@/lib/mongodb";
import Student from "@/lib/models/Student";
import Quiz from "@/lib/models/Quiz";
import { requireStudent } from "@/lib/auth";
import { successResponse, errorResponse, handleMongoError } from "@/lib/api-utils";

// GET quiz for attempt (with questions but without answers)
export async function GET(request, { params }) {
  try {
    const { user, error, status } = await requireStudent();
    if (error) return errorResponse(error, status);

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
      .select("-questions.correctAnswer -questions.explanation");

    if (!quiz) {
      return errorResponse("Quiz not found", 404);
    }

    const now = new Date();
    
    // Check if quiz is available
    if (now < new Date(quiz.startDate)) {
      return errorResponse("Quiz has not started yet", 400);
    }

    if (now > new Date(quiz.endDate)) {
      return errorResponse("Quiz has expired", 400);
    }

    // Check attempts
    const myAttempts = quiz.attempts.filter(
      a => a.student.toString() === student._id.toString()
    );

    if (myAttempts.length >= quiz.maxAttempts) {
      return errorResponse("You have used all your attempts", 400);
    }

    // Shuffle questions if enabled
    let questions = quiz.questions;
    if (quiz.shuffleQuestions) {
      questions = [...questions].sort(() => Math.random() - 0.5);
    }

    return successResponse({
      quiz: {
        _id: quiz._id,
        title: quiz.title,
        description: quiz.description,
        subject: quiz.subject,
        duration: quiz.duration,
        totalPoints: quiz.totalPoints,
        questions: questions.map((q, index) => ({
          index,
          question: q.question,
          type: q.type,
          options: q.options,
          points: q.points,
        })),
      },
      attemptsRemaining: quiz.maxAttempts - myAttempts.length,
    });

  } catch (error) {
    return handleMongoError(error);
  }
}

// POST submit quiz attempt
export async function POST(request, { params }) {
  try {
    const { user, error, status } = await requireStudent();
    if (error) return errorResponse(error, status);

    const { id } = await params;
    const body = await request.json();
    const { answers, startedAt } = body;

    if (!answers || !Array.isArray(answers)) {
      return errorResponse("Answers are required", 400);
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

    // Verify not past due
    if (new Date() > new Date(quiz.endDate)) {
      return errorResponse("Quiz has expired", 400);
    }

    // Check attempts
    const myAttempts = quiz.attempts.filter(
      a => a.student.toString() === student._id.toString()
    );

    if (myAttempts.length >= quiz.maxAttempts) {
      return errorResponse("You have used all your attempts", 400);
    }

    // Grade the quiz
    let score = 0;
    const gradedAnswers = answers.map(answer => {
      const question = quiz.questions[answer.questionIndex];
      if (!question) {
        return { ...answer, isCorrect: false, pointsEarned: 0 };
      }

      const isCorrect = question.correctAnswer === answer.answer ||
        (Array.isArray(question.correctAnswer) && 
         Array.isArray(answer.answer) &&
         JSON.stringify(question.correctAnswer.sort()) === JSON.stringify(answer.answer.sort()));

      const pointsEarned = isCorrect ? question.points : 0;
      score += pointsEarned;

      return {
        questionIndex: answer.questionIndex,
        answer: answer.answer,
        isCorrect,
        pointsEarned,
      };
    });

    const percentage = Math.round((score / quiz.totalPoints) * 100);
    const timeTaken = startedAt 
      ? Math.round((Date.now() - new Date(startedAt).getTime()) / 1000)
      : 0;

    // Add attempt
    const attempt = {
      student: student._id,
      answers: gradedAnswers,
      score,
      totalPoints: quiz.totalPoints,
      percentage,
      startedAt: startedAt ? new Date(startedAt) : new Date(),
      completedAt: new Date(),
      timeTaken,
    };

    quiz.attempts.push(attempt);
    await quiz.save();

    // Return results if showResults is enabled
    const result = {
      score,
      totalPoints: quiz.totalPoints,
      percentage,
      passed: percentage >= quiz.passingScore,
      timeTaken,
    };

    if (quiz.showResults) {
      result.answers = gradedAnswers.map((a, index) => ({
        questionIndex: a.questionIndex,
        yourAnswer: a.answer,
        isCorrect: a.isCorrect,
        pointsEarned: a.pointsEarned,
        correctAnswer: quiz.questions[a.questionIndex]?.correctAnswer,
        explanation: quiz.questions[a.questionIndex]?.explanation,
      }));
    }

    return successResponse(result, "Quiz submitted successfully");

  } catch (error) {
    return handleMongoError(error);
  }
}
