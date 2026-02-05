import connectDB from "@/lib/mongodb";
import Subject from "@/lib/models/Subject";
import { requireAdmin } from "@/lib/auth";
import { 
  successResponse, 
  errorResponse,
  getPaginationParams,
  createPaginationResponse,
  buildSearchQuery,
  handleMongoError 
} from "@/lib/api-utils";

// GET all subjects
export async function GET(request) {
  try {
    const { error, status } = await requireAdmin();
    if (error) return errorResponse(error, status);

    await connectDB();

    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(searchParams);
    const search = searchParams.get("search") || "";
    const department = searchParams.get("department") || "";
    const type = searchParams.get("type") || "";

    let query = {};
    if (search) {
      query = { ...query, ...buildSearchQuery(search, ["name", "code"]) };
    }
    if (department) query.department = department;
    if (type) query.type = type;

    const [subjects, total] = await Promise.all([
      Subject.find(query).sort({ name: 1 }).skip(skip).limit(limit),
      Subject.countDocuments(query),
    ]);

    return successResponse(createPaginationResponse(subjects, total, page, limit));

  } catch (error) {
    return handleMongoError(error);
  }
}

// POST create subject
export async function POST(request) {
  try {
    const { error, status } = await requireAdmin();
    if (error) return errorResponse(error, status);

    const body = await request.json();
    const { name, code, description, department, credits, type, passingMarks, totalMarks } = body;

    if (!name || !code) {
      return errorResponse("Name and code are required", 400);
    }

    await connectDB();

    const subject = await Subject.create({
      name,
      code: code.toUpperCase(),
      description,
      department,
      credits: credits || 1,
      type: type || "core",
      passingMarks: passingMarks || 35,
      totalMarks: totalMarks || 100,
    });

    return successResponse(subject, "Subject created successfully", 201);

  } catch (error) {
    return handleMongoError(error);
  }
}
