import { db } from "@/lib/data-store";
import { successResponse, errorResponse, paginate, searchFilter } from "@/lib/api-utils";
import { cookies } from "next/headers";

async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");
  if (!sessionCookie?.value) return null;
  return JSON.parse(sessionCookie.value);
}

// Get all assignments
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
    const classId = searchParams.get("classId") || "";
    const subject = searchParams.get("subject") || "";
    const status = searchParams.get("status") || "";

    let assignments = db.assignments.findAll();

    // Filter by role
    if (session.role === "student") {
      assignments = assignments.filter((a) => a.classId === session.classId);
    } else if (session.role === "teacher") {
      assignments = db.assignments.findByTeacher(session.id);
    }

    // Filter by class
    if (classId) {
      assignments = assignments.filter((a) => a.classId === classId);
    }

    // Filter by subject
    if (subject) {
      assignments = assignments.filter((a) => a.subject === subject);
    }

    // Filter by status
    if (status) {
      assignments = assignments.filter((a) => a.status === status);
    }

    // Search
    assignments = searchFilter(assignments, search, ["title", "description", "subject"]);

    // Add teacher and class info
    assignments = assignments.map((assignment) => {
      const teacher = db.users.findById(assignment.teacherId);
      const cls = db.classes.findById(assignment.classId);
      
      // Check submission status for students
      let submissionStatus = null;
      if (session.role === "student") {
        const submission = assignment.submissions?.find((s) => s.studentId === session.id);
        submissionStatus = submission ? "submitted" : "pending";
      }

      return {
        ...assignment,
        teacherName: teacher?.name || "Unknown",
        className: cls?.name || "Unknown",
        submissionStatus,
        submissionCount: assignment.submissions?.length || 0,
      };
    });

    // Sort by due date
    assignments.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    const result = paginate(assignments, page, limit);
    return successResponse(result);
  } catch (error) {
    console.error("Get assignments error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// Create assignment (teacher only)
export async function POST(request) {
  try {
    const session = await getSession();
    if (!session || !["teacher", "admin"].includes(session.role)) {
      return errorResponse("Forbidden", 403);
    }

    const body = await request.json();
    const { title, description, subject, classId, dueDate, totalMarks } = body;

    if (!title || !subject || !classId || !dueDate) {
      return errorResponse("Missing required fields", 400);
    }

    const assignment = db.assignments.create({
      title,
      description: description || "",
      subject,
      classId,
      teacherId: session.id,
      dueDate,
      totalMarks: totalMarks || 100,
      status: "active",
      attachments: body.attachments || [],
    });

    return successResponse(assignment, "Assignment created successfully", 201);
  } catch (error) {
    console.error("Create assignment error:", error);
    return errorResponse("Internal server error", 500);
  }
}
