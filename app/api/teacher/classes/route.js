import connectDB from "@/lib/mongodb";
import Teacher from "@/lib/models/Teacher";
import Class from "@/lib/models/Class";
import Student from "@/lib/models/Student";
import { requireTeacher } from "@/lib/auth";
import { successResponse, errorResponse, handleMongoError } from "@/lib/api-utils";

export async function GET(request) {
  try {
    const { user, error, status } = await requireTeacher();
    if (error) return errorResponse(error, status);

    await connectDB();

    const teacher = await Teacher.findOne({ user: user._id });
    if (!teacher) {
      return errorResponse("Teacher profile not found", 404);
    }

    const classes = await Class.find({ _id: { $in: teacher.classes } })
      .populate("subjects.subject", "name code")
      .populate({
        path: "subjects.teacher",
        populate: { path: "user", select: "name" }
      });

    // Add student count to each class
    const classesWithCount = await Promise.all(
      classes.map(async (cls) => {
        const studentCount = await Student.countDocuments({ class: cls._id });
        return {
          ...cls.toObject(),
          studentCount,
        };
      })
    );

    return successResponse(classesWithCount);

  } catch (error) {
    return handleMongoError(error);
  }
}
