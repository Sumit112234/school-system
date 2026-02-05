import { db } from "@/lib/data-store";
import { successResponse, errorResponse, paginate } from "@/lib/api-utils";
import { cookies } from "next/headers";

async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");
  if (!sessionCookie?.value) return null;
  return JSON.parse(sessionCookie.value);
}

// Get grades
export async function GET(request) {
  try {
    const session = await getSession();
    if (!session) {
      return errorResponse("Unauthorized", 401);
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;
    const studentId = searchParams.get("studentId") || "";
    const subject = searchParams.get("subject") || "";
    const examType = searchParams.get("examType") || "";

    let grades = db.grades.findAll();

    // Students can only see their own grades
    if (session.role === "student") {
      grades = db.grades.findByStudent(session.id);
    }

    // Teachers can see grades they assigned
    if (session.role === "teacher") {
      grades = db.grades.findByTeacher(session.id);
    }

    // Filter by student
    if (studentId && ["teacher", "admin"].includes(session.role)) {
      grades = grades.filter((g) => g.studentId === studentId);
    }

    // Filter by subject
    if (subject) {
      grades = grades.filter((g) => g.subject === subject);
    }

    // Filter by exam type
    if (examType) {
      grades = grades.filter((g) => g.examType === examType);
    }

    // Sort by date descending
    grades.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Add student and teacher info
    grades = grades.map((grade) => {
      const student = db.users.findById(grade.studentId);
      const teacher = db.users.findById(grade.teacherId);
      return {
        ...grade,
        studentName: student?.name || "Unknown",
        teacherName: teacher?.name || "Unknown",
      };
    });

    const result = paginate(grades, page, limit);

    // Calculate summary for students
    if (session.role === "student") {
      const totalMarks = grades.reduce((sum, g) => sum + g.marks, 0);
      const maxMarks = grades.reduce((sum, g) => sum + g.totalMarks, 0);
      const average = maxMarks > 0 ? ((totalMarks / maxMarks) * 100).toFixed(1) : 0;
      
      // Group by subject
      const bySubject = grades.reduce((acc, g) => {
        if (!acc[g.subject]) {
          acc[g.subject] = { marks: 0, total: 0, count: 0 };
        }
        acc[g.subject].marks += g.marks;
        acc[g.subject].total += g.totalMarks;
        acc[g.subject].count++;
        return acc;
      }, {});

      result.summary = {
        totalMarks,
        maxMarks,
        average,
        bySubject: Object.entries(bySubject).map(([subject, data]) => ({
          subject,
          average: ((data.marks / data.total) * 100).toFixed(1),
          exams: data.count,
        })),
      };
    }

    return successResponse(result);
  } catch (error) {
    console.error("Get grades error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// Add grade (teacher only)
export async function POST(request) {
  try {
    const session = await getSession();
    if (!session || !["teacher", "admin"].includes(session.role)) {
      return errorResponse("Forbidden", 403);
    }

    const body = await request.json();
    const { studentId, subject, examType, marks, totalMarks, remarks } = body;

    if (!studentId || !subject || !examType || marks === undefined || !totalMarks) {
      return errorResponse("Missing required fields", 400);
    }

    if (marks < 0 || marks > totalMarks) {
      return errorResponse(`Marks must be between 0 and ${totalMarks}`, 400);
    }

    // Calculate grade
    const percentage = (marks / totalMarks) * 100;
    let grade = "F";
    if (percentage >= 90) grade = "A+";
    else if (percentage >= 80) grade = "A";
    else if (percentage >= 70) grade = "B+";
    else if (percentage >= 60) grade = "B";
    else if (percentage >= 50) grade = "C";
    else if (percentage >= 40) grade = "D";

    const newGrade = db.grades.create({
      studentId,
      subject,
      examType,
      marks,
      totalMarks,
      grade,
      remarks: remarks || "",
      teacherId: session.id,
      date: new Date().toISOString().split("T")[0],
    });

    return successResponse(newGrade, "Grade added successfully", 201);
  } catch (error) {
    console.error("Add grade error:", error);
    return errorResponse("Internal server error", 500);
  }
}
