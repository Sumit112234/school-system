import connectDB from "@/lib/mongodb";
import Student from "@/lib/models/Student";
import Grade from "@/lib/models/Grade";
import { requireStudent } from "@/lib/auth";
import { successResponse, errorResponse, handleMongoError } from "@/lib/api-utils";

export async function GET(request) {
  try {
    const { user, error, status } = await requireStudent();
    if (error) return errorResponse(error, status);

    await connectDB();

    const { searchParams } = new URL(request.url);
    const term = searchParams.get("term") || "";
    const subjectId = searchParams.get("subjectId") || "";
    const academicYear = searchParams.get("academicYear") || "";

    const student = await Student.findOne({ user: user._id });
    if (!student) {
      return errorResponse("Student profile not found", 404);
    }

    let query = { student: student._id };
    if (term) query.term = term;
    if (subjectId) query.subject = subjectId;
    if (academicYear) query.academicYear = academicYear;

    const grades = await Grade.find(query)
      .populate("subject", "name code")
      .populate("class", "name section")
      .sort({ createdAt: -1 });

    // Group grades by subject for summary
    const subjectSummary = {};
    grades.forEach(grade => {
      const subjectId = grade.subject?._id.toString();
      if (!subjectSummary[subjectId]) {
        subjectSummary[subjectId] = {
          subject: grade.subject,
          grades: [],
          totalMarks: 0,
          totalObtained: 0,
        };
      }
      subjectSummary[subjectId].grades.push(grade);
      subjectSummary[subjectId].totalMarks += grade.totalMarks;
      subjectSummary[subjectId].totalObtained += grade.marksObtained;
    });

    // Calculate overall stats
    const overallStats = {
      totalGrades: grades.length,
      averagePercentage: grades.length > 0
        ? Math.round(grades.reduce((sum, g) => sum + g.percentage, 0) / grades.length)
        : 0,
      highestGrade: grades.length > 0
        ? Math.max(...grades.map(g => g.percentage))
        : 0,
      lowestGrade: grades.length > 0
        ? Math.min(...grades.map(g => g.percentage))
        : 0,
    };

    return successResponse({
      grades,
      subjectSummary: Object.values(subjectSummary),
      overallStats,
    });

  } catch (error) {
    return handleMongoError(error);
  }
}
