import { db } from "@/lib/data-store";
import { successResponse, errorResponse } from "@/lib/api-utils";
import { cookies } from "next/headers";

async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");
  if (!sessionCookie?.value) return null;
  return JSON.parse(sessionCookie.value);
}

// Add reply to ticket
export async function POST(request, { params }) {
  try {
    const session = await getSession();
    if (!session) {
      return errorResponse("Unauthorized", 401);
    }

    const { id } = await params;
    const ticket = db.tickets.findById(id);

    if (!ticket) {
      return errorResponse("Ticket not found", 404);
    }

    // Only owner, helpers, or admins can reply
    if (ticket.userId !== session.id && !["admin", "helper"].includes(session.role)) {
      return errorResponse("Forbidden", 403);
    }

    // Can't reply to closed tickets
    if (ticket.status === "closed") {
      return errorResponse("Cannot reply to closed ticket", 400);
    }

    const body = await request.json();
    const { content } = body;

    if (!content) {
      return errorResponse("Content is required", 400);
    }

    const message = db.tickets.addMessage(id, {
      senderId: session.id,
      content,
    });

    // If helper replies, update status to in-progress and assign
    if (["helper", "admin"].includes(session.role) && ticket.status === "open") {
      db.tickets.update(id, {
        status: "in-progress",
        assignedTo: ticket.assignedTo || session.id,
      });
    }

    return successResponse(message, "Reply added successfully", 201);
  } catch (error) {
    console.error("Add reply error:", error);
    return errorResponse("Internal server error", 500);
  }
}
