import connectDB from "@/lib/mongodb";
import Message from "@/lib/models/Message";
import { requireStudent } from "@/lib/auth";
import { 
  successResponse, 
  errorResponse,
  getPaginationParams,
  createPaginationResponse,
  handleMongoError 
} from "@/lib/api-utils";

// GET messages
export async function GET(request) {
  try {
    const { user, error, status } = await requireStudent();
    if (error) return errorResponse(error, status);

    await connectDB();

    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(searchParams);
    const folder = searchParams.get("folder") || "inbox"; // inbox, sent, archived

    let query = { isDeleted: false };

    if (folder === "inbox") {
      query.recipient = user._id;
      query.isArchived = false;
    } else if (folder === "sent") {
      query.sender = user._id;
    } else if (folder === "archived") {
      query.recipient = user._id;
      query.isArchived = true;
    }

    const [messages, total] = await Promise.all([
      Message.find(query)
        .populate("sender", "name email role avatar")
        .populate("recipient", "name email role avatar")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Message.countDocuments(query),
    ]);

    // Get unread count
    const unreadCount = await Message.countDocuments({
      recipient: user._id,
      isRead: false,
      isDeleted: false,
    });

    return successResponse({
      ...createPaginationResponse(messages, total, page, limit),
      unreadCount,
    });

  } catch (error) {
    return handleMongoError(error);
  }
}

// POST send message
export async function POST(request) {
  try {
    const { user, error, status } = await requireStudent();
    if (error) return errorResponse(error, status);

    const body = await request.json();
    const { recipientId, subject, body: messageBody, attachments, parentMessageId } = body;

    if (!recipientId || !subject || !messageBody) {
      return errorResponse("Recipient, subject, and message body are required", 400);
    }

    await connectDB();

    const message = await Message.create({
      sender: user._id,
      recipient: recipientId,
      subject,
      body: messageBody,
      attachments: attachments || [],
      parentMessage: parentMessageId || null,
    });

    await message.populate([
      { path: "sender", select: "name email role avatar" },
      { path: "recipient", select: "name email role avatar" }
    ]);

    return successResponse(message, "Message sent successfully", 201);

  } catch (error) {
    return handleMongoError(error);
  }
}
