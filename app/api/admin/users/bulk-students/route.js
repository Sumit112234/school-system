import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";
import Student from "@/lib/models/Student";
import { requireAdmin } from "@/lib/auth";
import { successResponse, errorResponse, handleMongoError } from "@/lib/api-utils";

// POST create multiple students at once
export async function POST(request) {
  try {
    const { error, adminStatus } = await requireAdmin();
    if (error) return errorResponse(error, adminStatus);

    const body = await request.json();
    const { students } = body;

    if (!Array.isArray(students) || students.length === 0) {
      return errorResponse("Students array is required and cannot be empty", 400);
    }

    if (students.length > 100) {
      return errorResponse("Cannot create more than 100 students at once", 400);
    }

    await connectDB();

    const results = {
      successful: [],
      failed: [],
      total: students.length,
    };

    // Validate all students first
    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      
      if (!student.email || !student.password || !student.name) {
        results.failed.push({
          index: i,
          student: student,
          error: "Email, password, and name are required",
        });
        continue;
      }

      // Check for duplicate emails in the batch
      const duplicateInBatch = students.findIndex(
        (s, idx) => idx !== i && s.email.toLowerCase() === student.email.toLowerCase()
      );
      
      if (duplicateInBatch !== -1) {
        results.failed.push({
          index: i,
          student: student,
          error: `Duplicate email in batch at index ${duplicateInBatch}`,
        });
        continue;
      }

      // Check if email already exists in database
      const existingUser = await User.findOne({ email: student.email.toLowerCase() });
      if (existingUser) {
        results.failed.push({
          index: i,
          student: student,
          error: "Email already exists in database",
        });
        continue;
      }

      // If validation passes, mark for creation
      try {
        // Create user
        const user = await User.create({
          email: student.email.toLowerCase(),
          password: student.password,
          name: student.name,
          role: "student",
          phone: student.phone || null,
          dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth) : null,
          gender: student.gender || null,
          address: student.address || null,
          isActive: student.isActive !== false,
        });

        // Generate student ID if not provided
        const studentId = student.studentId || `STU${Date.now().toString().slice(-8)}${i}`;

        // Create student profile
        const studentProfile = await Student.create({
          user: user._id,
          studentId,
          class: student.classId || null,
          section: student.section || null,
          rollNumber: student.rollNumber || null,
          parentName: student.parentName || null,
          parentPhone: student.parentPhone || null,
          parentEmail: student.parentEmail || null,
          bloodGroup: student.bloodGroup || null,
          emergencyContact: student.emergencyContact || null,
          admissionDate: student.admissionDate ? new Date(student.admissionDate) : new Date(),
          subjects: student.subjects || [],
        });

        results.successful.push({
          index: i,
          user: user.toPublicJSON(),
          studentId: studentProfile.studentId,
        });

      } catch (err) {
        results.failed.push({
          index: i,
          student: student,
          error: err.message || "Failed to create student",
        });
      }
    }

    const statusCode = results.failed.length === 0 ? 201 : 207; // 207 = Multi-Status
    const message = results.failed.length === 0
      ? `Successfully created ${results.successful.length} students`
      : `Created ${results.successful.length} students, ${results.failed.length} failed`;

    return successResponse(results, message, statusCode);

  } catch (error) {
    console.error("Bulk create students error:", error);
    return handleMongoError(error);
  }
}