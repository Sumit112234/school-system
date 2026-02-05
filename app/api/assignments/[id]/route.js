import { db } from "@/lib/data-store";
import { successResponse, errorResponse } from "@/lib/api-utils";
import { cookies } from "next/headers";

async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");
  if (!sessionCookie?.value) return null;
  return JSON.parse(sessionCookie.value);
}

// Get assignment by ID
export async function GET(request, { params }) {
  try {
    const session = await getSession();
    if (!session) {
      return errorResponse("Unauthorized", 401);
    }

    const { id } = await params;
    const assignment = db.assignments.findById(id);

    if (!assignment) {
      return errorResponse("Assignment not found", 404);
    }

    const teacher = db.users.findById(assignment.teacherId);
    const cls = db.classes.findById(assignment.classId);

    // For students, include their submission
    let mySubmission = null;
    if (session.role === "student") {
      mySubmission = assignment.submissions?.find((s) => s.studentId === session.id) || null;
    }

    // For teachers, include all submissions with student info
    let submissions = [];
    if (session.role === "teacher" || session.role === "admin") {
      submissions = (assignment.submissions || []).map((sub) => {
        const student = db.users.findById(sub.studentId);
        return {
          ...sub,
          studentName: student?.name || "Unknown",
          studentRollNumber: student?.rollNumber || "",
        };
      });
    }

    return successResponse({
      ...assignment,
      teacherName: teacher?.name || "Unknown",
      className: cls?.name || "Unknown",
      mySubmission,
      submissions,
    });
  } catch (error) {
    console.error("Get assignment error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// Update assignment (teacher only)
export async function PUT(request, { params }) {
  try {
    const session = await getSession();
    if (!session || !["teacher", "admin"].includes(session.role)) {
      return errorResponse("Forbidden", 403);
    }

    const { id } = await params;
    const body = await request.json();

    const assignment = db.assignments.findById(id);
    if (!assignment) {
      return errorResponse("Assignment not found", 404);
    }

    // Teachers can only edit their own assignments
    if (session.role === "teacher" && assignment.teacherId !== session.id) {
      return errorResponse("Forbidden", 403);
    }

    const updated = db.assignments.update(id, body);
    return successResponse(updated, "Assignment updated successfully");
  } catch (error) {
    console.error("Update assignment error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// Delete assignment (teacher only)
export async function DELETE(request, { params }) {
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

    if (session.role === "teacher" && assignment.teacherId !== session.id) {
      return errorResponse("Forbidden", 403);
    }

    db.assignments.delete(id);
    return successResponse(null, "Assignment deleted successfully");
  } catch (error) {
    console.error("Delete assignment error:", error);
    return errorResponse("Internal server error", 500);
  }
}
