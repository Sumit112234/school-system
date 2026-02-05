import connectDB from "@/lib/mongodb";
import Notice from "@/lib/models/Notice";
import { requireAdmin, getCurrentUser } from "@/lib/auth";
import { 
  successResponse, 
  errorResponse,
  getPaginationParams,
  createPaginationResponse,
  handleMongoError 
} from "@/lib/api-utils";

// GET all notices
export async function GET(request) {
  try {
    const { error, status } = await requireAdmin();
    if (error) return errorResponse(error, status);

    await connectDB();

    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(searchParams);
    const type = searchParams.get("type") || "";
    const priority = searchParams.get("priority") || "";

    let query = {};
    if (type) query.type = type;
    if (priority) query.priority = priority;

    const [notices, total] = await Promise.all([
      Notice.find(query)
        .populate("author", "name email role")
        .sort({ isPinned: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Notice.countDocuments(query),
    ]);

    return successResponse(createPaginationResponse(notices, total, page, limit));

  } catch (error) {
    return handleMongoError(error);
  }
}

// POST create notice
export async function POST(request) {
  try {
    const { user, error, status } = await requireAdmin();
    if (error) return errorResponse(error, status);

    const body = await request.json();
    const { title, content, type, priority, targetAudience, targetClasses, startDate, endDate, isPinned } = body;

    if (!title || !content) {
      return errorResponse("Title and content are required", 400);
    }

    await connectDB();

    const notice = await Notice.create({
      title,
      content,
      type: type || "general",
      priority: priority || "medium",
      targetAudience: targetAudience || ["all"],
      targetClasses: targetClasses || [],
      author: user._id,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : null,
      isPinned: isPinned || false,
    });

    await notice.populate("author", "name email");

    return successResponse(notice, "Notice created successfully", 201);

  } catch (error) {
    return handleMongoError(error);
  }
}
