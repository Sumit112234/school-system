import connectDB from "@/lib/mongodb";
import Class from "@/lib/models/Class";
import User from "@/lib/models/User";
import Subject from "@/lib/models/Subject";
import Teacher from "@/lib/models/Teacher";
import { requireAdmin } from "@/lib/auth";
import { 
  successResponse, 
  errorResponse,
  getPaginationParams,
  createPaginationResponse,
  handleMongoError 
} from "@/lib/api-utils";

// GET all classes
export async function GET(request) {
  try {
    const { error, status } = await requireAdmin();
    if (error) return errorResponse(error, status);

    await connectDB();

    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(searchParams);
    const academicYear = searchParams.get("academicYear") || "";
    const isActive = searchParams.get("isActive");

    let query = {};
    if (academicYear) query.academicYear = academicYear;
    if (isActive !== null && isActive !== "") {
      query.isActive = isActive === "true";
    }

    const [classes, total] = await Promise.all([
      Class.find(query)
        .populate("classTeacher", "employeeId")
        .populate({
          path: "classTeacher",
          populate: { path: "user", select: "name email" }
        })
        .populate("subjects.subject", "name code")
        .populate({
          path: "subjects.teacher",
          populate: { path: "user", select: "name" }
        })
        .sort({ name: 1, section: 1 })
        .skip(skip)
        .limit(limit),
      Class.countDocuments(query),
    ]);

    return successResponse(createPaginationResponse(classes, total, page, limit));

  } catch (error) {
    return handleMongoError(error);
  }
}

// POST create class
export async function POST(request) {
  try {
    const { error, status } = await requireAdmin();
    if (error) return errorResponse(error, status);

    const body = await request.json();
    const { name, section, academicYear, classTeacher, room, capacity, subjects } = body;

    if (!name || !section || !academicYear) {
      return errorResponse("Name, section, and academic year are required", 400);
    }

    await connectDB();

    // Check if class already exists
    const existingClass = await Class.findOne({ name, section, academicYear });
    if (existingClass) {
      return errorResponse("Class with this name and section already exists for this academic year", 409);
    }

    const newClass = await Class.create({
      name,
      section,
      academicYear,
      classTeacher: classTeacher || null,
      room: room || null,
      capacity: capacity || 40,
      subjects: subjects || [],
    });

    return successResponse(newClass, "Class created successfully", 201);

  } catch (error) {
    return handleMongoError(error);
  }
}
