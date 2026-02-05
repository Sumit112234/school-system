import { db } from "@/lib/data-store";
import { successResponse, errorResponse } from "@/lib/api-utils";
import { cookies } from "next/headers";

async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");
  if (!sessionCookie?.value) return null;
  return JSON.parse(sessionCookie.value);
}

// Grade a submission (teacher only)
export async function POST(request, { params }) {
  try {
    const session = await getSession();
    if (!session || !["teacher", "admin"].includes(session.role)) {
      return errorResponse("Forbidden", 403);
    }

    const { id } = await params;
    const assignment = db.assignments.findById(id);

    if (!assignment) {
      return errorResponse("Assignment not found", 404);
    }

    // Teachers can only grade their own assignments
    if (session.role === "teacher" && assignment.teacherId !== session.id) {
      return errorResponse("Forbidden", 403);
    }

    const body = await request.json();
    const { studentId, marks, feedback } = body;

    if (!studentId || marks === undefined) {
      return errorResponse("Student ID and marks are required", 400);
    }

    if (marks < 0 || marks > assignment.totalMarks) {
      return errorResponse(`Marks must be between 0 and ${assignment.totalMarks}`, 400);
    }

    // Find and update submission
    const submissionIndex = assignment.submissions?.findIndex((s) => s.studentId === studentId);
    if (submissionIndex === -1 || submissionIndex === undefined) {
      return errorResponse("Submission not found", 404);
    }

    assignment.submissions[submissionIndex] = {
      ...assignment.submissions[submissionIndex],
      marks,
      feedback: feedback || "",
      status: "graded",
      gradedAt: new Date().toISOString(),
      gradedBy: session.id,
    };

    db.assignments.update(id, { submissions: assignment.submissions });

    // Also add to grades table
    const percentage = (marks / assignment.totalMarks) * 100;
    let grade = "F";
    if (percentage >= 90) grade = "A+";
    else if (percentage >= 80) grade = "A";
    else if (percentage >= 70) grade = "B+";
    else if (percentage >= 60) grade = "B";
    else if (percentage >= 50) grade = "C";
    else if (percentage >= 40) grade = "D";

    db.grades.create({
      studentId,
      subject: assignment.subject,
      examType: "Assignment",
      marks,
      totalMarks: assignment.totalMarks,
      grade,
      remarks: feedback || "",
      teacherId: session.id,
      date: new Date().toISOString().split("T")[0],
      assignmentId: id,
    });

    return successResponse(assignment.submissions[submissionIndex], "Submission graded successfully");
  } catch (error) {
    console.error("Grade submission error:", error);
    return errorResponse("Internal server error", 500);
  }
}
