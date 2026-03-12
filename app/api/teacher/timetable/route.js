import connectDB from "@/lib/mongodb";
import Timetable from "@/lib/models/Timetable";
import Teacher from "@/lib/models/Teacher";
import Class from "@/lib/models/Class";
import { requireAuth } from "@/lib/auth";
import { successResponse, errorResponse, handleMongoError } from "@/lib/api-utils";

// GET timetables for teacher
export async function GET(request) {
  try {
    const { user, error, status } = await requireAuth();
    if (error) return errorResponse(error, status);

    if (user.role !== "teacher") {
      return errorResponse("Access denied. Teachers only.", 403);
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("classId");

    // Get teacher profile
    const teacherProfile = await Teacher.findOne({ user: user._id });
    if (!teacherProfile) {
      return errorResponse("Teacher profile not found", 404);
    }

    // Get classes where teacher teaches
    const teacherClasses = await Class.find({
      $or: [
        { classTeacher: teacherProfile._id },
        { "subjects.teacher": teacherProfile._id }
      ]
    }).select("_id name section academicYear");

    // If specific class requested, verify access
    let query = {};
    if (classId) {
      const hasAccess = teacherClasses.some(c => c._id.toString() === classId);
      if (!hasAccess) {
        return errorResponse("Access denied to this class", 403);
      }
      query.class = classId;
    } else {
      // Get timetables for all teacher's classes
      query.class = { $in: teacherClasses.map(c => c._id) };
    }

    const timetables = await Timetable.find(query)
      .populate("class", "name section academicYear")
      .populate("periods.subject", "name code")
      .populate({
        path: "periods.teacher",
        populate: { path: "user", select: "name" }
      })
      .sort({ class: 1, day: 1 });

    // Group by class if viewing all
    const groupedByClass = {};
    timetables.forEach(tt => {
      const classKey = tt.class._id.toString();
      if (!groupedByClass[classKey]) {
        groupedByClass[classKey] = {
          class: tt.class,
          timetables: []
        };
      }
      groupedByClass[classKey].timetables.push(tt);
    });

    return successResponse({
      timetables: classId ? timetables : Object.values(groupedByClass),
      teacherClasses: teacherClasses.map(c => ({
        _id: c._id,
        name: c.name,
        section: c.section,
        academicYear: c.academicYear,
      })),
    });

  } catch (error) {
    console.error("Get teacher timetables error:", error);
    return handleMongoError(error);
  }
}