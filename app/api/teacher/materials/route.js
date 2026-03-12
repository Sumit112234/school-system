import connectDB from "@/lib/mongodb";
import Material from "@/lib/models/Material";
import Teacher from "@/lib/models/Teacher";
import { requireAuth } from "@/lib/auth";
import { 
  successResponse, 
  errorResponse,
  getPaginationParams,
  createPaginationResponse,
  handleMongoError 
} from "@/lib/api-utils";

// GET teacher's materials
export async function GET(request) {
  try {
    const { user, error, status } = await requireAuth();
    if (error) return errorResponse(error, status);

    if (user.role !== "teacher") {
      return errorResponse("Access denied. Teachers only.", 403);
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(searchParams);
    const classId = searchParams.get("classId") || "";
    const subjectId = searchParams.get("subjectId") || "";
    const type = searchParams.get("type") || "";

    const teacher = await Teacher.findOne({ user: user._id });
    if (!teacher) {
      return errorResponse("Teacher profile not found", 404);
    }

    let query = { teacher: teacher._id };
    if (classId) query.class = classId;
    if (subjectId) query.subject = subjectId;
    if (type) query.type = type;

    const [materials, total] = await Promise.all([
      Material.find(query)
        .populate("class", "name section")
        .populate("subject", "name code")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Material.countDocuments(query),
    ]);

    return successResponse(createPaginationResponse(materials, total, page, limit));

  } catch (error) {
    console.error("Get materials error:", error);
    return handleMongoError(error);
  }
}

// POST create material
export async function POST(request) {
  try {
    const { user, error, status } = await requireAuth();
    if (error) return errorResponse(error, status);

    if (user.role !== "teacher") {
      return errorResponse("Access denied. Teachers only.", 403);
    }

    const body = await request.json();
    const { 
      title, description, type, classId, subjectId, file, 
      externalLink, tags, isPublished 
    } = body;

    if (!title || !classId || !subjectId || !type) {
      return errorResponse("Title, class, subject, and type are required", 400);
    }

    if (type === "link" && !externalLink) {
      return errorResponse("External link is required for link type", 400);
    }

    if (type !== "link" && !file) {
      return errorResponse("File is required for non-link types", 400);
    }

    await connectDB();

    const teacher = await Teacher.findOne({ user: user._id });
    if (!teacher) {
      return errorResponse("Teacher profile not found", 404);
    }

    const material = await Material.create({
      title,
      description,
      type,
      class: classId,
      subject: subjectId,
      teacher: teacher._id,
      file: file || null,
      externalLink: externalLink || null,
      tags: tags || [],
      isPublished: isPublished !== false,
    });

    await material.populate([
      { path: "class", select: "name section" },
      { path: "subject", select: "name code" }
    ]);

    return successResponse(material, "Material created successfully", 201);

  } catch (error) {
    console.error("Create material error:", error);
    return handleMongoError(error);
  }
}