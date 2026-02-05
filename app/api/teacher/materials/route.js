import connectDB from "@/lib/mongodb";
import Teacher from "@/lib/models/Teacher";
import Material from "@/lib/models/Material";
import { requireTeacher } from "@/lib/auth";
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
    const { user, error, status } = await requireTeacher();
    if (error) return errorResponse(error, status);

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
    return handleMongoError(error);
  }
}

// POST create material
export async function POST(request) {
  try {
    const { user, error, status } = await requireTeacher();
    if (error) return errorResponse(error, status);

    const body = await request.json();
    const { title, description, type, classId, subjectId, file, externalLink, tags } = body;

    if (!title || !classId || !subjectId) {
      return errorResponse("Title, class, and subject are required", 400);
    }

    await connectDB();

    const teacher = await Teacher.findOne({ user: user._id });
    if (!teacher) {
      return errorResponse("Teacher profile not found", 404);
    }

    // Verify teacher has access to this class
    if (!teacher.classes.map(c => c.toString()).includes(classId)) {
      return errorResponse("Access denied to this class", 403);
    }

    const material = await Material.create({
      title,
      description,
      type: type || "document",
      class: classId,
      subject: subjectId,
      teacher: teacher._id,
      file: file || null,
      externalLink: externalLink || null,
      tags: tags || [],
    });

    await material.populate([
      { path: "class", select: "name section" },
      { path: "subject", select: "name code" }
    ]);

    return successResponse(material, "Material uploaded successfully", 201);

  } catch (error) {
    return handleMongoError(error);
  }
}
