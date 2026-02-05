import { db } from "@/lib/data-store";
import { successResponse, errorResponse } from "@/lib/api-utils";
import { cookies } from "next/headers";

async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");
  if (!sessionCookie?.value) return null;
  return JSON.parse(sessionCookie.value);
}

// Submit assignment (student only)
export async function POST(request, { params }) {
  try {
    const session = await getSession();
    if (!session || session.role !== "student") {
      return errorResponse("Only students can submit assignments", 403);
    }

    const { id } = await params;
    const assignment = db.assignments.findById(id);

    if (!assignment) {
      return errorResponse("Assignment not found", 404);
    }

    // Check if assignment is for student's class
    if (assignment.classId !== session.classId) {
      return errorResponse("Assignment not available for your class", 403);
    }

    // Check due date
    if (new Date(assignment.dueDate) < new Date()) {
      return errorResponse("Assignment deadline has passed", 400);
    }

    // Check if already submitted
    const existingSubmission = assignment.submissions?.find((s) => s.studentId === session.id);
    if (existingSubmission) {
      return errorResponse("You have already submitted this assignment", 400);
    }

    const body = await request.json();
    const { content, attachments } = body;

    if (!content && (!attachments || attachments.length === 0)) {
      return errorResponse("Please provide content or attachments", 400);
    }

    const submission = db.assignments.addSubmission(id, {
      studentId: session.id,
      content: content || "",
      attachments: attachments || [],
      status: "submitted",
      marks: null,
      feedback: null,
    });

    return successResponse(submission, "Assignment submitted successfully", 201);
  } catch (error) {
    console.error("Submit assignment error:", error);
    return errorResponse("Internal server error", 500);
  }
}
