import connectDB from "@/lib/mongodb";
import Class from "@/lib/models/Class";
import Student from "@/lib/models/Student";
import User from "@/lib/models/User";
import { requireAdmin } from "@/lib/auth";
import { successResponse, errorResponse, handleMongoError } from "@/lib/api-utils";
import { requireAuth } from "@/lib/auth";

// GET all students in a class
export async function GET(request, { params }) {
  try {
    // const { error, status } = await requireAdmin();
    // if (error) return errorResponse(error, status);


     const { user, error, status } = await requireAuth();
    if (error) return errorResponse(error, status);

    if (user.role !== "teacher" && user.role !== "admin") {
      return errorResponse("Access denied. Teachers and admins only.", 403);
    }
    const { id } = await params;
    await connectDB();

    // Get class details with subjects
    const classData = await Class.findById(id)
      .populate("subjects.subject", "name code")
      .populate({
        path: "classTeacher",
        populate: { path: "user", select: "name email" }
      });

    if (!classData) {
      return errorResponse("Class not found", 404);
    }

    // Get students in this class
    const studentsInClass = await Student.find({ class: id })
      .populate("user", "name email phone avatar isActive")
      .populate("subjects", "name code")
      .sort({ rollNumber: 1, createdAt: 1 });

    // Get all students not in any class (available for assignment)
    const availableStudents = await Student.find({ 
      $or: [
        { class: null },
        { class: { $exists: false } }
      ]
    })
      .populate("user", "name email phone avatar isActive")
      .sort({ createdAt: -1 });

    return successResponse({
      class: classData,
      studentsInClass: studentsInClass.map(s => ({
        _id: s._id,
        studentId: s.studentId,
        rollNumber: s.rollNumber,
        section: s.section,
        subjects: s.subjects,
        user: s.user,
        admissionDate: s.admissionDate,
      })),
      availableStudents: availableStudents.map(s => ({
        _id: s._id,
        studentId: s.studentId,
        user: s.user,
      })),
      classSubjects: classData.subjects.map(sub => ({
        _id: sub.subject._id,
        name: sub.subject.name,
        code: sub.subject.code,
      })),
    });

  } catch (error) {
    return handleMongoError(error);
  }
}

// POST - Bulk assign students to class
export async function POST(request, { params }) {
  try {
    const { error, status } = await requireAdmin();
    if (error) return errorResponse(error, status);

    const { id } = await params;
    const body = await request.json();
    const { studentIds, assignSubjects } = body;

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return errorResponse("studentIds array is required and cannot be empty", 400);
    }

    await connectDB();

    const classData = await Class.findById(id);
    if (!classData) {
      return errorResponse("Class not found", 404);
    }

    // Get class subjects if assignSubjects is true
    const subjectIds = assignSubjects && classData.subjects.length > 0
      ? classData.subjects.map(s => s.subject)
      : [];

    // Update all students at once
    const result = await Student.updateMany(
      { _id: { $in: studentIds } },
      { 
        $set: { 
          class: id,
          section: classData.section,
          ...(subjectIds.length > 0 && { subjects: subjectIds })
        } 
      }
    );

    return successResponse(
      { 
        modifiedCount: result.modifiedCount,
        assignedSubjects: subjectIds.length > 0,
        subjectCount: subjectIds.length,
      },
      `Successfully assigned ${result.modifiedCount} student(s) to ${classData.name} - Section ${classData.section}`
    );

  } catch (error) {
    return handleMongoError(error);
  }
}

// DELETE - Remove students from class (bulk)
export async function DELETE(request, { params }) {
  try {
    const { error, status } = await requireAdmin();
    if (error) return errorResponse(error, status);

    const { id } = await params;
    const body = await request.json();
    const { studentIds } = body;

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return errorResponse("studentIds array is required and cannot be empty", 400);
    }

    await connectDB();

    // Remove class assignment from students
    const result = await Student.updateMany(
      { 
        _id: { $in: studentIds },
        class: id 
      },
      { 
        $unset: { class: "", section: "" },
        $set: { subjects: [] }
      }
    );

    return successResponse(
      { modifiedCount: result.modifiedCount },
      `Successfully removed ${result.modifiedCount} student(s) from class`
    );

  } catch (error) {
    return handleMongoError(error);
  }
}