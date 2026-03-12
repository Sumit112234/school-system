import connectDB from "@/lib/mongodb";
import Timetable from "@/lib/models/Timetable";
import Class from "@/lib/models/Class";
import { requireAdmin } from "@/lib/auth";
import { successResponse, errorResponse, handleMongoError } from "@/lib/api-utils";

// GET timetables for a class
export async function GET(request) {
  try {
    const { error, status } = await requireAdmin();
    if (error) return errorResponse(error, status);

    await connectDB();

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("classId");
    const academicYear = searchParams.get("academicYear");

    if (!classId) {
      return errorResponse("Class ID is required", 400);
    }

    const query = { class: classId };
    if (academicYear) {
      query.academicYear = academicYear;
    }

    const timetables = await Timetable.find(query)
      .populate("periods.subject", "name code")
      .populate({
        path: "periods.teacher",
        populate: { path: "user", select: "name" }
      })
      .sort({ day: 1 });

    // Get class details
    const classData = await Class.findById(classId)
      .select("name section academicYear");

    return successResponse({
      timetables,
      class: classData,
    });

  } catch (error) {
    console.error("Get timetables error:", error);
    return handleMongoError(error);
  }
}

// POST - Create or update timetable
export async function POST(request) {
  try {
    const { error, status } = await requireAdmin();
    if (error) return errorResponse(error, status);

    const body = await request.json();
    const { classId, day, academicYear, periods } = body;

    if (!classId || !day || !academicYear || !Array.isArray(periods)) {
      return errorResponse("Class ID, day, academic year, and periods are required", 400);
    }

    await connectDB();

    // Validate class exists
    const classData = await Class.findById(classId);
    if (!classData) {
      return errorResponse("Class not found", 404);
    }

    // Upsert timetable
    const timetable = await Timetable.findOneAndUpdate(
      { class: classId, day, academicYear },
      { 
        class: classId,
        day,
        academicYear,
        periods,
        isActive: true,
      },
      { 
        new: true, 
        upsert: true,
        runValidators: true 
      }
    )
      .populate("periods.subject", "name code")
      .populate({
        path: "periods.teacher",
        populate: { path: "user", select: "name" }
      });

    return successResponse(
      timetable,
      `Timetable ${timetable.isNew ? 'created' : 'updated'} successfully`,
      201
    );

  } catch (error) {
    console.error("Create/update timetable error:", error);
    return handleMongoError(error);
  }
}