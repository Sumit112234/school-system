import connectDB from "@/lib/mongodb";
import Teacher from "@/lib/models/Teacher";
import Quiz from "@/lib/models/Quiz";
import { requireTeacher } from "@/lib/auth";
import { 
  successResponse, 
  errorResponse,
  getPaginationParams,
  createPaginationResponse,
  handleMongoError 
} from "@/lib/api-utils";

// GET teacher's quizzes
export async function GET(request) {
  try {
    const { user, error, status } = await requireTeacher();
    if (error) return errorResponse(error, status);

    await connectDB();

    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(searchParams);
    const classId = searchParams.get("classId") || "";
    const quizStatus = searchParams.get("status") || "";

    const teacher = await Teacher.findOne({ user: user._id });
    if (!teacher) {
      return errorResponse("Teacher profile not found", 404);
    }

    let query = { teacher: teacher._id };
    if (classId) query.class = classId;
    if (quizStatus) query.status = quizStatus;

    const [quizzes, total] = await Promise.all([
      Quiz.find(query)
        .populate("class", "name section")
        .populate("subject", "name code")
        .select("-questions.correctAnswer") // Don't expose answers in list
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Quiz.countDocuments(query),
    ]);

    return successResponse(createPaginationResponse(quizzes, total, page, limit));

  } catch (error) {
    return handleMongoError(error);
  }
}

// POST create quiz
export async function POST(request) {
  try {
    const { user, error, status } = await requireTeacher();
    if (error) return errorResponse(error, status);

    const body = await request.json();
    const { 
      title, description, classId, subjectId, questions, 
      duration, passingScore, startDate, endDate, maxAttempts, 
      shuffleQuestions, showResults, quizStatus 
    } = body;

    if (!title || !classId || !subjectId || !questions || !duration || !endDate) {
      return errorResponse("Title, class, subject, questions, duration, and end date are required", 400);
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return errorResponse("At least one question is required", 400);
    }

    await connectDB();

    const teacher = await Teacher.findOne({ user: user._id });
    if (!teacher) {
      return errorResponse("Teacher profile not found", 404);
    }

    // Verify teacher has access to this class
    if (!teacher.classes.map(c => c.toString()).includes(classId)) {
      return errorResponse("Access denied to this class", 403);
    }

    const quiz = await Quiz.create({
      title,
      description,
      class: classId,
      subject: subjectId,
      teacher: teacher._id,
      questions,
      duration,
      passingScore: passingScore || 50,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: new Date(endDate),
      maxAttempts: maxAttempts || 1,
      shuffleQuestions: shuffleQuestions || false,
      showResults: showResults !== false,
      status: quizStatus || "draft",
    });

    await quiz.populate([
      { path: "class", select: "name section" },
      { path: "subject", select: "name code" }
    ]);

    return successResponse(quiz, "Quiz created successfully", 201);

  } catch (error) {
    return handleMongoError(error);
  }
}
