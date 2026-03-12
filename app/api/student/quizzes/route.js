// import connectDB from "@/lib/mongodb";
// import Student from "@/lib/models/Student";
// import Quiz from "@/lib/models/Quiz";
// import { requireStudent } from "@/lib/auth";
// import { 
//   successResponse, 
//   errorResponse,
//   getPaginationParams,
//   createPaginationResponse,
//   handleMongoError 
// } from "@/lib/api-utils";

// export async function GET(request) {
//   try {
//     const { user, error, status } = await requireStudent();
//     if (error) return errorResponse(error, status);

//     await connectDB();

//     const { searchParams } = new URL(request.url);
//     const { page, limit, skip } = getPaginationParams(searchParams);
//     const subjectId = searchParams.get("subjectId") || "";
//     const quizStatus = searchParams.get("status") || ""; // available, completed, expired

//     const student = await Student.findOne({ user: user._id });
//     if (!student) {
//       return errorResponse("Student profile not found", 404);
//     }

//     const now = new Date();

//     let query = {
//       class: student.class,
//       status: "published",
//     };

//     if (subjectId) {
//       query.subject = subjectId;
//     }

//     let quizzes = await Quiz.find(query)
//       .populate("subject", "name code")
//       .populate({
//         path: "teacher",
//         populate: { path: "user", select: "name" }
//       })
//       .select("-questions.correctAnswer -questions.explanation")
//       .sort({ endDate: 1 });

//     // Add status and attempt info to each quiz
//     quizzes = quizzes.map(quiz => {
//       const myAttempts = quiz.attempts.filter(
//         a => a.student.toString() === student._id.toString()
//       );
      
//       let quizState = "available";
//       if (now > new Date(quiz.endDate)) {
//         quizState = "expired";
//       } else if (now < new Date(quiz.startDate)) {
//         quizState = "upcoming";
//       } else if (myAttempts.length >= quiz.maxAttempts) {
//         quizState = "completed";
//       }

//       const bestScore = myAttempts.length > 0
//         ? Math.max(...myAttempts.map(a => a.percentage))
//         : null;

//       return {
//         ...quiz.toObject(),
//         quizState,
//         attemptsUsed: myAttempts.length,
//         bestScore,
//         myAttempts: myAttempts.map(a => ({
//           score: a.score,
//           totalPoints: a.totalPoints,
//           percentage: a.percentage,
//           completedAt: a.completedAt,
//         })),
//       };
//     });

//     // Filter by status if provided
//     if (quizStatus) {
//       quizzes = quizzes.filter(q => q.quizState === quizStatus);
//     }

//     const total = quizzes.length;
//     const paginatedQuizzes = quizzes.slice(skip, skip + limit);

//     return successResponse(createPaginationResponse(paginatedQuizzes, total, page, limit));

//   } catch (error) {
//     return handleMongoError(error);
//   }
// }


import connectDB from "@/lib/mongodb";
import Quiz from "@/lib/models/Quiz";
import Student from "@/lib/models/Student";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse, handleMongoError } from "@/lib/api-utils";

// GET available quizzes for student
export async function GET(request) {
  try {
    const { user, error, status } = await requireAuth();
    if (error) return errorResponse(error, status);

    if (user.role !== "student") {
      return errorResponse("Access denied. Students only.", 403);
    }

    await connectDB();

    const student = await Student.findOne({ user: user._id }).select("class");
    if (!student || !student.class) {
      return errorResponse("Student profile or class not found", 404);
    }

    const now = new Date();

    // Get all published quizzes for student's class
    const quizzes = await Quiz.find({
      class: student.class,
      status: "published",
      startDate: { $lte: now },
    })
      .populate("subject", "name code")
      .populate("class", "name section")
      .select("-questions.correctAnswer -questions.explanation") // Don't expose answers
      .sort({ startDate: -1 });

    // Add attempt information for each quiz
    const quizzesWithAttempts = quizzes.map(quiz => {
      const studentAttempts = quiz.attempts.filter(
        a => a.student.toString() === student._id.toString()
      );

      const isExpired = quiz.endDate < now;
      const attemptsTaken = studentAttempts.length;
      const canAttempt = !isExpired && attemptsTaken < quiz.maxAttempts;

      return {
        _id: quiz._id,
        title: quiz.title,
        description: quiz.description,
        subject: quiz.subject,
        class: quiz.class,
        duration: quiz.duration,
        totalPoints: quiz.totalPoints,
        passingScore: quiz.passingScore,
        startDate: quiz.startDate,
        endDate: quiz.endDate,
        maxAttempts: quiz.maxAttempts,
        questionCount: quiz.questions.length,
        attemptsTaken,
        canAttempt,
        isExpired,
        bestScore: studentAttempts.length > 0
          ? Math.max(...studentAttempts.map(a => a.percentage))
          : null,
        lastAttempt: studentAttempts.length > 0
          ? studentAttempts[studentAttempts.length - 1]
          : null,
      };
    });

    return successResponse({ quizzes: quizzesWithAttempts });

  } catch (error) {
    console.error("Get student quizzes error:", error);
    return handleMongoError(error);
  }
}