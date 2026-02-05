import { db } from "@/lib/data-store";
import { successResponse, errorResponse } from "@/lib/api-utils";
import { cookies } from "next/headers";

async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");
  if (!sessionCookie?.value) return null;
  return JSON.parse(sessionCookie.value);
}

// Get ticket by ID
export async function GET(request, { params }) {
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

    // Only owner, helpers, or admins can view
    if (ticket.userId !== session.id && !["admin", "helper"].includes(session.role)) {
      return errorResponse("Forbidden", 403);
    }

    const user = db.users.findById(ticket.userId);
    const assignee = db.users.findById(ticket.assignedTo);

    // Add sender info to messages
    const messagesWithSenders = ticket.messages.map((msg) => {
      const sender = db.users.findById(msg.senderId);
      return {
        ...msg,
        senderName: sender?.name || "Unknown",
        senderRole: sender?.role || "unknown",
      };
    });

    return successResponse({
      ...ticket,
      messages: messagesWithSenders,
      userName: user?.name || "Unknown",
      userEmail: user?.email || "",
      userRole: user?.role || "unknown",
      assigneeName: assignee?.name || "Unassigned",
    });
  } catch (error) {
    console.error("Get ticket error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// Update ticket (helper/admin)
export async function PUT(request, { params }) {
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

    const body = await request.json();

    // Regular users can only close their own tickets
    if (!["admin", "helper"].includes(session.role)) {
      if (ticket.userId !== session.id) {
        return errorResponse("Forbidden", 403);
      }
      // Users can only update status to closed
      if (body.status && body.status !== "closed") {
        return errorResponse("You can only close your tickets", 400);
      }
      body.status = "closed";
    }

    const updated = db.tickets.update(id, body);
    return successResponse(updated, "Ticket updated successfully");
  } catch (error) {
    console.error("Update ticket error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// Delete ticket (admin only)
export async function DELETE(request, { params }) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return errorResponse("Forbidden", 403);
    }

    const { id } = await params;
    const deleted = db.tickets.delete(id);

    if (!deleted) {
      return errorResponse("Ticket not found", 404);
    }

    return successResponse(null, "Ticket deleted successfully");
  } catch (error) {
    console.error("Delete ticket error:", error);
    return errorResponse("Internal server error", 500);
  }
}
