import connectDB from "@/lib/mongodb";
import Class from "@/lib/models/Class";
import Student from "@/lib/models/Student";
import { requireAdmin } from "@/lib/auth";
import Teacher from "@/lib/models/Teacher";
import Subject from "@/lib/models/Subject";
import { successResponse, errorResponse, handleMongoError } from "@/lib/api-utils";




export async function PUT(request, { params }) {
  try {
    const { error, status } = await requireAdmin();
    if (error) return errorResponse(error, status);

    const { id } = await params;
    const body = await request.json();

    await connectDB();

    // 1️⃣ Get old class data
    const oldClass = await Class.findById(id);
    if (!oldClass) {
      return errorResponse("Class not found", 404);
    }

    const oldTeacherId = oldClass.classTeacher?.toString();
    const newTeacherId = body.classTeacher;

    // 2️⃣ Update class
    const classData = await Class.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    )
      .populate({
        path: "classTeacher",
        populate: { path: "user", select: "name email" }
      })
      .populate("subjects.subject", "name code");

    // 3️⃣ If class teacher changed → update teachers
    if (newTeacherId && newTeacherId !== oldTeacherId) {

      // 🔴 Remove old class teacher
      if (oldTeacherId) {
        await Teacher.findByIdAndUpdate(oldTeacherId, {
          $pull: { classes: id },
          $set: {
            isClassTeacher: false,
            classTeacherOf: null,
          },
        });
      }

      // 🟢 Assign new class teacher
      await Teacher.findByIdAndUpdate(newTeacherId, {
        $addToSet: { classes: id },
        $set: {
          isClassTeacher: true,
          classTeacherOf: id,
        },
      });
    }

    return successResponse(classData, "Class updated successfully");

  } catch (error) {
    return handleMongoError(error);
  }
}


// export async function PUT(request, { params }) {
//   try {
//     const { error, status } = await requireAdmin();
//     if (error) return errorResponse(error, status);

//     const { id } = await params;
//     const body = await request.json();

//     await connectDB();

//     const classData = await Class.findByIdAndUpdate(
//       id,
//       { $set: body },
//       { new: true, runValidators: true }
//     )
//       .populate({
//         path: "classTeacher",
//         populate: { path: "user", select: "name email" }
//       })
//       .populate("subjects.subject", "name code");


//       // update teacher also

     
//     if (!classData) {
//       return errorResponse("Class not found", 404);
//     }

//     return successResponse(classData, "Class updated successfully");

//   } catch (error) {
//     return handleMongoError(error);
//   }
// }

// GET single class with students


export async function GET(request, { params }) {
  try {
    const { error, status } = await requireAdmin();
    if (error) return errorResponse(error, status);

    const { id } = await params;
    await connectDB();

    const classData = await Class.findById(id)
      .populate({
        path: "classTeacher",
        populate: { path: "user", select: "name email phone" }
      })
      .populate("subjects.subject", "name code")
      .populate({
        path: "subjects.teacher",
        populate: { path: "user", select: "name" }
      });

    if (!classData) {
      return errorResponse("Class not found", 404);
    }

    // Get students in this class
    const students = await Student.find({ class: id })
      .populate("user", "name email phone avatar")
      .sort({ rollNumber: 1 });

    return successResponse({ class: classData, students });

  } catch (error) {
    return handleMongoError(error);
  }
}

// PUT update class

// DELETE class
export async function DELETE(request, { params }) {
  try {
    const { error, status } = await requireAdmin();
    if (error) return errorResponse(error, status);

    const { id } = await params;
    await connectDB();

    // Check if class has students
    const studentCount = await Student.countDocuments({ class: id });
    if (studentCount > 0) {
      return errorResponse(`Cannot delete class with ${studentCount} students. Remove students first.`, 400);
    }

    const classData = await Class.findByIdAndDelete(id);
    if (!classData) {
      return errorResponse("Class not found", 404);
    }

    return successResponse(null, "Class deleted successfully");

  } catch (error) {
    return handleMongoError(error);
  }
}
