import { db } from "@/lib/data-store";
import { successResponse, errorResponse, paginate, searchFilter } from "@/lib/api-utils";
import { cookies } from "next/headers";

async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");
  if (!sessionCookie?.value) return null;
  return JSON.parse(sessionCookie.value);
}

// Get quizzes
export async function GET(request) {
  try {
    const session = await getSession();
    if (!session) {
      return errorResponse("Unauthorized", 401);
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const search = searchParams.get("search") || "";
    const subject = searchParams.get("subject") || "";
    const status = searchParams.get("status") || "";

    let quizzes = db.quizzes.findAll();

    // Students see quizzes for their class
    if (session.role === "student") {
      quizzes = db.quizzes.findByClass(session.classId).filter((q) => q.status === "active");
    }

    // Teachers see their quizzes
    if (session.role === "teacher") {
      quizzes = db.quizzes.findByTeacher(session.id);
    }

    // Filter by subject
    if (subject) {
      quizzes = quizzes.filter((q) => q.subject === subject);
    }

    // Filter by status
    if (status) {
      quizzes = quizzes.filter((q) => q.status === status);
    }

    // Search
    quizzes = searchFilter(quizzes, search, ["title", "subject"]);

    // Sort by creation date
    quizzes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Add extra info
    quizzes = quizzes.map((quiz) => {
      const teacher = db.users.findById(quiz.teacherId);
      const cls = db.classes.findById(quiz.classId);
      const attempts = db.quizAttempts.findByQuiz(quiz.id);
      
      // Check if student has attempted
      let attempted = false;
      let myScore = null;
      if (session.role === "student") {
        const myAttempt = attempts.find((a) => a.studentId === session.id);
        attempted = !!myAttempt;
        myScore = myAttempt?.score || null;
      }

      return {
        ...quiz,
        teacherName: teacher?.name || "Unknown",
        className: cls?.name || "Unknown",
        totalAttempts: attempts.length,
        attempted,
        myScore,
        questionCount: quiz.questions?.length || 0,
      };
    });

    const result = paginate(quizzes, page, limit);
    return successResponse(result);
  } catch (error) {
    console.error("Get quizzes error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// Create quiz (teacher only)
export async function POST(request) {
  try {
    const session = await getSession();
    if (!session || !["teacher", "admin"].includes(session.role)) {
      return errorResponse("Forbidden", 403);
    }

    const body = await request.json();
    const { title, subject, classId, duration, totalMarks, passingMarks, questions, startDate, endDate } = body;

    if (!title || !subject || !classId || !questions || questions.length === 0) {
      return errorResponse("Missing required fields", 400);
    }

    // Validate questions
    for (const q of questions) {
      if (!q.question || !q.options || q.options.length < 2 || q.correctAnswer === undefined) {
        return errorResponse("Invalid question format", 400);
      }
    }

    const quiz = db.quizzes.create({
      title,
      subject,
      classId,
      teacherId: session.id,
      duration: duration || 30,
      totalMarks: totalMarks || questions.reduce((sum, q) => sum + (q.marks || 10), 0),
      passingMarks: passingMarks || Math.ceil(totalMarks * 0.4),
      questions,
      status: "active",
      startDate: startDate || new Date().toISOString().split("T")[0],
      endDate: endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    });

    return successResponse(quiz, "Quiz created successfully", 201);
  } catch (error) {
    console.error("Create quiz error:", error);
    return errorResponse("Internal server error", 500);
  }
}
