import connectDB from "@/lib/mongodb";
import Student from "@/lib/models/Student";
import Material from "@/lib/models/Material";
import { requireStudent } from "@/lib/auth";
import { 
  successResponse, 
  errorResponse,
  getPaginationParams,
  createPaginationResponse,
  handleMongoError 
} from "@/lib/api-utils";

export async function GET(request) {
  try {
    const { user, error, status } = await requireStudent();
    if (error) return errorResponse(error, status);

    await connectDB();

    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(searchParams);
    const subjectId = searchParams.get("subjectId") || "";
    const type = searchParams.get("type") || "";
    const search = searchParams.get("search") || "";

    const student = await Student.findOne({ user: user._id });
    if (!student) {
      return errorResponse("Student profile not found", 404);
    }

    let query = {
      class: student.class,
      isPublished: true,
    };

    if (subjectId) {
      query.subject = subjectId;
    }

    if (type) {
      query.type = type;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ];
    }

    const [materials, total] = await Promise.all([
      Material.find(query)
        .populate("subject", "name code")
        .populate({
          path: "teacher",
          populate: { path: "user", select: "name" }
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Material.countDocuments(query),
    ]);

    return successResponse(createPaginationResponse(materials, total, page, limit));

  } catch (error) {
    return handleMongoError(error);
  }
}
