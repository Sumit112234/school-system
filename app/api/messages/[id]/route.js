import { db } from "@/lib/data-store";
import { successResponse, errorResponse } from "@/lib/api-utils";
import { cookies } from "next/headers";

async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");
  if (!sessionCookie?.value) return null;
  return JSON.parse(sessionCookie.value);
}

// Get message by ID
export async function GET(request, { params }) {
  try {
    const session = await getSession();
    if (!session) {
      return errorResponse("Unauthorized", 401);
    }

    const { id } = await params;
    const message = db.messages.findById(id);

    if (!message) {
      return errorResponse("Message not found", 404);
    }

    // Only sender or receiver can view
    if (message.senderId !== session.id && message.receiverId !== session.id) {
      return errorResponse("Forbidden", 403);
    }

    // Mark as read if receiver is viewing
    if (message.receiverId === session.id && !message.read) {
      db.messages.markAsRead(id);
      message.read = true;
    }

    const sender = db.users.findById(message.senderId);
    const receiver = db.users.findById(message.receiverId);

    return successResponse({
      ...message,
      senderName: sender?.name || "Unknown",
      senderRole: sender?.role || "unknown",
      senderAvatar: sender?.avatar || null,
      receiverName: receiver?.name || "Unknown",
      receiverRole: receiver?.role || "unknown",
    });
  } catch (error) {
    console.error("Get message error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// Delete message
export async function DELETE(request, { params }) {
  try {
    const session = await getSession();
    if (!session) {
      return errorResponse("Unauthorized", 401);
    }

    const { id } = await params;
    const message = db.messages.findById(id);

    if (!message) {
      return errorResponse("Message not found", 404);
    }

    // Only sender or receiver can delete
    if (message.senderId !== session.id && message.receiverId !== session.id) {
      return errorResponse("Forbidden", 403);
    }

    db.messages.delete(id);
    return successResponse(null, "Message deleted successfully");
  } catch (error) {
    console.error("Delete message error:", error);
    return errorResponse("Internal server error", 500);
  }
}
