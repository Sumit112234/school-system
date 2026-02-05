import { db } from "@/lib/data-store";
import { successResponse, errorResponse } from "@/lib/api-utils";
import { cookies } from "next/headers";

async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");
  if (!sessionCookie?.value) return null;
  return JSON.parse(sessionCookie.value);
}

// Get quiz by ID
export async function GET(request, { params }) {
  try {
    const session = await getSession();
    if (!session) {
      return errorResponse("Unauthorized", 401);
    }

    const { id } = await params;
    const quiz = db.quizzes.findById(id);

    if (!quiz) {
      return errorResponse("Quiz not found", 404);
    }

    const teacher = db.users.findById(quiz.teacherId);
    const cls = db.classes.findById(quiz.classId);
    const attempts = db.quizAttempts.findByQuiz(id);

    // For students, hide correct answers if not attempted
    let questions = quiz.questions;
    let myAttempt = null;

    if (session.role === "student") {
      myAttempt = attempts.find((a) => a.studentId === session.id);
      
      // If not attempted, hide correct answers
      if (!myAttempt) {
        questions = questions.map(({ correctAnswer, ...q }) => q);
      }
    }

    // For teachers, include all attempts
    let allAttempts = [];
    if (["teacher", "admin"].includes(session.role)) {
      allAttempts = attempts.map((attempt) => {
        const student = db.users.findById(attempt.studentId);
        return {
          ...attempt,
          studentName: student?.name || "Unknown",
          studentRollNumber: student?.rollNumber || "",
        };
      });
    }

    return successResponse({
      ...quiz,
      questions,
      teacherName: teacher?.name || "Unknown",
      className: cls?.name || "Unknown",
      totalAttempts: attempts.length,
      myAttempt,
      allAttempts,
    });
  } catch (error) {
    console.error("Get quiz error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// Update quiz (teacher only)
export async function PUT(request, { params }) {
  try {
    const session = await getSession();
    if (!session || !["teacher", "admin"].includes(session.role)) {
      return errorResponse("Forbidden", 403);
    }

    const { id } = await params;
    const quiz = db.quizzes.findById(id);

    if (!quiz) {
      return errorResponse("Quiz not found", 404);
    }

    if (session.role === "teacher" && quiz.teacherId !== session.id) {
      return errorResponse("Forbidden", 403);
    }

    const body = await request.json();
    const updated = db.quizzes.update(id, body);

    return successResponse(updated, "Quiz updated successfully");
  } catch (error) {
    console.error("Update quiz error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// Delete quiz (teacher only)
export async function DELETE(request, { params }) {
  try {
    const session = await getSession();
    if (!session || !["teacher", "admin"].includes(session.role)) {
      return errorResponse("Forbidden", 403);
    }

    const { id } = await params;
    const quiz = db.quizzes.findById(id);

    if (!quiz) {
      return errorResponse("Quiz not found", 404);
    }

    if (session.role === "teacher" && quiz.teacherId !== session.id) {
      return errorResponse("Forbidden", 403);
    }

    db.quizzes.delete(id);
    return successResponse(null, "Quiz deleted successfully");
  } catch (error) {
    console.error("Delete quiz error:", error);
    return errorResponse("Internal server error", 500);
  }
}
