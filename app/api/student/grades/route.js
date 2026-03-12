import connectDB from "@/lib/mongodb";
import Grade from "@/lib/models/Grade";
import Student from "@/lib/models/Student";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse, handleMongoError } from "@/lib/api-utils";

// GET student's grades
export async function GET(request) {
  try {
    const { user, error, status } = await requireAuth();
    if (error) return errorResponse(error, status);

    if (user.role !== "student") {
      return errorResponse("Access denied. Students only.", 403);
    }

    await connectDB();

    const student = await Student.findOne({ user: user._id });
    if (!student) {
      return errorResponse("Student profile not found", 404);
    }

    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get("subjectId") || "";
    const term = searchParams.get("term") || "";
    const academicYear = searchParams.get("academicYear") || "";

    let query = { student: student._id };
    if (subjectId) query.subject = subjectId;
    if (term) query.term = term;
    if (academicYear) query.academicYear = academicYear;

    const grades = await Grade.find(query)
      .populate("subject", "name code")
      .populate({
        path: "teacher",
        populate: { path: "user", select: "name" }
      })
      .sort({ createdAt: -1 });

    // Calculate statistics
    const stats = {
      totalGrades: grades.length,
      averagePercentage: grades.length > 0
        ? grades.reduce((sum, g) => sum + g.percentage, 0) / grades.length
        : 0,
      highestGrade: grades.length > 0
        ? Math.max(...grades.map(g => g.percentage))
        : 0,
      lowestGrade: grades.length > 0
        ? Math.min(...grades.map(g => g.percentage))
        : 0,
    };

    // Group by subject
    const gradesBySubject = grades.reduce((acc, grade) => {
      const subjectId = grade.subject._id.toString();
      if (!acc[subjectId]) {
        acc[subjectId] = {
          subject: grade.subject,
          grades: [],
          average: 0,
        };
      }
      acc[subjectId].grades.push(grade);
      return acc;
    }, {});

    // Calculate averages
    Object.values(gradesBySubject).forEach(subj => {
      subj.average = subj.grades.reduce((sum, g) => sum + g.percentage, 0) / subj.grades.length;
    });

    return successResponse({
      grades,
      stats,
      gradesBySubject: Object.values(gradesBySubject),
    });

  } catch (error) {
    console.error("Get student grades error:", error);
    return handleMongoError(error);
  }
}