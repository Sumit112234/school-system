import { db } from "@/lib/data-store";
import { successResponse, errorResponse } from "@/lib/api-utils";
import { cookies } from "next/headers";

async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");
  if (!sessionCookie?.value) return null;
  return JSON.parse(sessionCookie.value);
}

// Submit quiz attempt (student only)
export async function POST(request, { params }) {
  try {
    const session = await getSession();
    if (!session || session.role !== "student") {
      return errorResponse("Only students can attempt quizzes", 403);
    }

    const { id } = await params;
    const quiz = db.quizzes.findById(id);

    if (!quiz) {
      return errorResponse("Quiz not found", 404);
    }

    // Check if quiz is active
    if (quiz.status !== "active") {
      return errorResponse("Quiz is not active", 400);
    }

    // Check if quiz is available
    const now = new Date();
    const startDate = new Date(quiz.startDate);
    const endDate = new Date(quiz.endDate);
    
    if (now < startDate) {
      return errorResponse("Quiz has not started yet", 400);
    }
    
    if (now > endDate) {
      return errorResponse("Quiz has ended", 400);
    }

    // Check if quiz is for student's class
    if (quiz.classId !== session.classId) {
      return errorResponse("Quiz not available for your class", 403);
    }

    // Check if already attempted
    const existingAttempt = db.quizAttempts.findByStudentAndQuiz(session.id, id);
    if (existingAttempt) {
      return errorResponse("You have already attempted this quiz", 400);
    }

    const body = await request.json();
    const { answers, timeTaken } = body;

    if (!answers || typeof answers !== "object") {
      return errorResponse("Answers are required", 400);
    }

    // Calculate score
    let score = 0;
    const results = quiz.questions.map((question, index) => {
      const userAnswer = answers[question.id] ?? answers[index];
      const isCorrect = userAnswer === question.correctAnswer;
      if (isCorrect) {
        score += question.marks || 10;
      }
      return {
        questionId: question.id || index,
        userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        marks: isCorrect ? (question.marks || 10) : 0,
      };
    });

    const passed = score >= quiz.passingMarks;

    // Calculate grade
    const percentage = (score / quiz.totalMarks) * 100;
    let grade = "F";
    if (percentage >= 90) grade = "A+";
    else if (percentage >= 80) grade = "A";
    else if (percentage >= 70) grade = "B+";
    else if (percentage >= 60) grade = "B";
    else if (percentage >= 50) grade = "C";
    else if (percentage >= 40) grade = "D";

    // Save attempt
    const attempt = db.quizAttempts.create({
      quizId: id,
      studentId: session.id,
      answers,
      results,
      score,
      totalMarks: quiz.totalMarks,
      passed,
      grade,
      timeTaken: timeTaken || 0,
    });

    // Also add to grades
    db.grades.create({
      studentId: session.id,
      subject: quiz.subject,
      examType: "Quiz",
      marks: score,
      totalMarks: quiz.totalMarks,
      grade,
      remarks: passed ? "Passed" : "Failed",
      teacherId: quiz.teacherId,
      date: new Date().toISOString().split("T")[0],
      quizId: id,
    });

    return successResponse({
      attempt,
      score,
      totalMarks: quiz.totalMarks,
      percentage: percentage.toFixed(1),
      grade,
      passed,
      results,
    }, "Quiz submitted successfully", 201);
  } catch (error) {
    console.error("Submit quiz error:", error);
    return errorResponse("Internal server error", 500);
  }
}
