import connectDB from "@/lib/mongodb";
import Class from "@/lib/models/Class";
import Subject from "@/lib/models/Subject";
import Teacher from "@/lib/models/Teacher";
import { requireAdmin } from "@/lib/auth";
import { successResponse, errorResponse, handleMongoError } from "@/lib/api-utils";

export async function PUT(request, { params }) {
  // try {
    const { error, status } = await requireAdmin();
    if (error) return errorResponse(error, status);

    const { id } = await params;
    const body = await request.json();
    const { subjects } = body;

    if (!Array.isArray(subjects)) {
      return errorResponse("Subjects must be an array", 400);
    }

    await connectDB();

    // console.log("Updating class subjects:", { classId: id, subjects, body});

    const classData = await Class.findByIdAndUpdate(
      id,
      { $set: { subjects } },
      { new: true, runValidators: true }
    )
      .populate("subjects.subject", "name code")
      .populate({
        path: "subjects.teacher",
        populate: { path: "user", select: "name" }
      });

    // Update teacher's subjects
      for (const subj of subjects) {
        if (!subj.teacher || !subj.subject) continue;

        await Teacher.findByIdAndUpdate(subj.teacher, {
          $addToSet: {
            subjects: subj.subject,
            classes: id,
          },
        });
      }

    if (!classData) {
      return errorResponse("Class not found", 404);
    }

    return successResponse(classData ?? null, "Class subjects updated successfully");

  // } catch (error) {
  //   return handleMongoError(error);
  // }
}