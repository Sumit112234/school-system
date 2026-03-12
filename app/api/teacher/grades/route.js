import connectDB from "@/lib/mongodb";
import Grade from "@/lib/models/Grade";
import Teacher from "@/lib/models/Teacher";
import Student from "@/lib/models/Student";
import { requireAuth } from "@/lib/auth";
import { 
  successResponse, 
  errorResponse,
  getPaginationParams,
  createPaginationResponse,
  handleMongoError 
} from "@/lib/api-utils";

// GET grades (teacher's classes)
export async function GET(request) {
  try {
    const { user, error, status } = await requireAuth();
    if (error) return errorResponse(error, status);

    if (user.role !== "teacher") {
      return errorResponse("Access denied. Teachers only.", 403);
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(searchParams);
    const classId = searchParams.get("classId") || "";
    const subjectId = searchParams.get("subjectId") || "";
    const term = searchParams.get("term") || "";
    const examType = searchParams.get("examType") || "";

    const teacher = await Teacher.findOne({ user: user._id });
    if (!teacher) {
      return errorResponse("Teacher profile not found", 404);
    }

    let query = { teacher: teacher._id };
    if (classId) query.class = classId;
    if (subjectId) query.subject = subjectId;
    if (term) query.term = term;
    if (examType) query.examType = examType;

    const [grades, total] = await Promise.all([
      Grade.find(query)
        .populate({
          path: "student",
          populate: { path: "user", select: "name email avatar" }
        })
        .populate("class", "name section")
        .populate("subject", "name code")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Grade.countDocuments(query),
    ]);

    return successResponse(createPaginationResponse(grades, total, page, limit));

  } catch (error) {
    console.error("Get grades error:", error);
    return handleMongoError(error);
  }
}

// POST create/update grades (bulk)
export async function POST(request) {
  try {
    const { user, error, status } = await requireAuth();
    if (error) return errorResponse(error, status);

    if (user.role !== "teacher") {
      return errorResponse("Access denied. Teachers only.", 403);
    }

    const body = await request.json();
    const { grades: gradesData } = body;

    if (!Array.isArray(gradesData) || gradesData.length === 0) {
      return errorResponse("Grades array is required", 400);
    }

    await connectDB();

    const teacher = await Teacher.findOne({ user: user._id });
    if (!teacher) {
      return errorResponse("Teacher profile not found", 404);
    }

    const results = [];
    const errors = [];

    for (const gradeData of gradesData) {
      try {
        const {
          studentId, classId, subjectId, academicYear, term, examType,
          marksObtained, totalMarks, remarks
        } = gradeData;

        if (!studentId || !classId || !subjectId || !academicYear || !term || !examType) {
          errors.push({ studentId, error: "Missing required fields" });
          continue;
        }

        if (marksObtained === undefined || totalMarks === undefined) {
          errors.push({ studentId, error: "Marks are required" });
          continue;
        }

        // Check if grade already exists
        const existingGrade = await Grade.findOne({
          student: studentId,
          class: classId,
          subject: subjectId,
          academicYear,
          term,
          examType,
        });

        if (existingGrade) {
          // Update existing
          existingGrade.marksObtained = marksObtained;
          existingGrade.totalMarks = totalMarks;
          existingGrade.remarks = remarks || null;
          existingGrade.teacher = teacher._id;
          await existingGrade.save();
          results.push(existingGrade);
        } else {
          // Create new
          const newGrade = await Grade.create({
            student: studentId,
            class: classId,
            subject: subjectId,
            academicYear,
            term,
            examType,
            marksObtained,
            totalMarks,
            remarks: remarks || null,
            teacher: teacher._id,
          });
          results.push(newGrade);
        }
      } catch (err) {
        errors.push({ studentId: gradeData.studentId, error: err.message });
      }
    }

    return successResponse(
      { 
        success: results.length,
        failed: errors.length,
        results,
        errors 
      },
      `Successfully processed ${results.length} grade(s)`
    );

  } catch (error) {
    console.error("Create grades error:", error);
    return handleMongoError(error);
  }
}