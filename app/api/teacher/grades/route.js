import connectDB from "@/lib/mongodb";
import Teacher from "@/lib/models/Teacher";
import Grade from "@/lib/models/Grade";
import Settings from "@/lib/models/Settings";
import { requireTeacher } from "@/lib/auth";
import { 
  successResponse, 
  errorResponse,
  getPaginationParams,
  createPaginationResponse,
  handleMongoError 
} from "@/lib/api-utils";

// GET grades (teacher can see grades for their classes)
export async function GET(request) {
  try {
    const { user, error, status } = await requireTeacher();
    if (error) return errorResponse(error, status);

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

    let query = { class: { $in: teacher.classes } };
    if (classId) query.class = classId;
    if (subjectId) query.subject = subjectId;
    if (term) query.term = term;
    if (examType) query.examType = examType;

    const [grades, total] = await Promise.all([
      Grade.find(query)
        .populate({ path: "student", populate: { path: "user", select: "name" } })
        .populate("class", "name section")
        .populate("subject", "name code")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Grade.countDocuments(query),
    ]);

    return successResponse(createPaginationResponse(grades, total, page, limit));

  } catch (error) {
    return handleMongoError(error);
  }
}

// POST add grades
export async function POST(request) {
  try {
    const { user, error, status } = await requireTeacher();
    if (error) return errorResponse(error, status);

    const body = await request.json();
    const { studentId, classId, subjectId, term, examType, marksObtained, totalMarks, remarks } = body;

    if (!studentId || !classId || !subjectId || !term || !examType || marksObtained === undefined || !totalMarks) {
      return errorResponse("All fields are required", 400);
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

    // Get current academic year from settings
    const settings = await Settings.findOne({ key: "main" });
    const academicYear = settings?.currentAcademicYear || "2025-2026";

    // Check if grade already exists
    let grade = await Grade.findOne({
      student: studentId,
      class: classId,
      subject: subjectId,
      term,
      examType,
      academicYear,
    });

    if (grade) {
      // Update existing grade
      grade.marksObtained = marksObtained;
      grade.totalMarks = totalMarks;
      grade.remarks = remarks;
      grade.teacher = teacher._id;
      await grade.save();
    } else {
      // Create new grade
      grade = await Grade.create({
        student: studentId,
        class: classId,
        subject: subjectId,
        academicYear,
        term,
        examType,
        marksObtained,
        totalMarks,
        remarks,
        teacher: teacher._id,
      });
    }

    await grade.populate([
      { path: "student", populate: { path: "user", select: "name" } },
      { path: "class", select: "name section" },
      { path: "subject", select: "name code" }
    ]);

    return successResponse(grade, "Grade saved successfully");

  } catch (error) {
    return handleMongoError(error);
  }
}
