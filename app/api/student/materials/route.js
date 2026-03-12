import connectDB from "@/lib/mongodb";
import Material from "@/lib/models/Material";
import Student from "@/lib/models/Student";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse, handleMongoError } from "@/lib/api-utils";

// GET materials for student
export async function GET(request) {
  try {
    const { user, error, status } = await requireAuth();
    if (error) return errorResponse(error, status);

    if (user.role !== "student") {
      return errorResponse("Access denied. Students only.", 403);
    }

    await connectDB();

    const student = await Student.findOne({ user: user._id });
    if (!student || !student.class) {
      return errorResponse("Student profile or class not found", 404);
    }

    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get("subjectId") || "";
    const type = searchParams.get("type") || "";

    let query = {
      class: student.class,
      isPublished: true,
    };

    if (subjectId) query.subject = subjectId;
    if (type) query.type = type;

    const materials = await Material.find(query)
      .populate("subject", "name code")
      .populate({
        path: "teacher",
        populate: { path: "user", select: "name" }
      })
      .sort({ createdAt: -1 });

    return successResponse({ materials });

  } catch (error) {
    console.error("Get student materials error:", error);
    return handleMongoError(error);
  }
}

// POST increment download count
export async function POST(request) {
  try {
    const { user, error, status } = await requireAuth();
    if (error) return errorResponse(error, status);

    if (user.role !== "student") {
      return errorResponse("Access denied. Students only.", 403);
    }

    const body = await request.json();
    const { materialId } = body;

    if (!materialId) {
      return errorResponse("Material ID is required", 400);
    }

    await connectDB();

    const student = await Student.findOne({ user: user._id });
    if (!student) {
      return errorResponse("Student profile not found", 404);
    }

    const material = await Material.findOneAndUpdate(
      { 
        _id: materialId,
        class: student.class,
        isPublished: true 
      },
      { $inc: { downloads: 1 } },
      { new: true }
    );

    if (!material) {
      return errorResponse("Material not found", 404);
    }

    return successResponse(
      { downloads: material.downloads },
      "Download tracked successfully"
    );

  } catch (error) {
    console.error("Track download error:", error);
    return handleMongoError(error);
  }
}