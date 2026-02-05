import { db } from "@/lib/data-store";
import { successResponse, errorResponse, paginate, searchFilter, sortData } from "@/lib/api-utils";
import { cookies } from "next/headers";

async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");
  if (!sessionCookie?.value) return null;
  return JSON.parse(sessionCookie.value);
}

// Get all students
export async function GET(request) {
  try {
    const session = await getSession();
    if (!session) {
      return errorResponse("Unauthorized", 401);
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const search = searchParams.get("search") || "";
    const classId = searchParams.get("classId") || "";
    const sortBy = searchParams.get("sortBy") || "name";
    const sortOrder = searchParams.get("sortOrder") || "asc";

    let students = db.users.findByRole("student");

    // Teachers can only see students in their classes
    if (session.role === "teacher") {
      const teacherClasses = db.classes.findByTeacher(session.id);
      const classIds = teacherClasses.map((c) => c.id);
      students = students.filter((s) => classIds.includes(s.classId));
    }

    // Filter by class
    if (classId) {
      students = students.filter((s) => s.classId === classId);
    }

    // Search
    students = searchFilter(students, search, ["name", "email", "rollNumber"]);

    // Sort
    students = sortData(students, sortBy, sortOrder);

    // Remove passwords and add class info
    students = students.map(({ password, ...student }) => {
      const classInfo = db.classes.findById(student.classId);
      return {
        ...student,
        className: classInfo?.name || "Unassigned",
      };
    });

    const result = paginate(students, page, limit);
    return successResponse(result);
  } catch (error) {
    console.error("Get students error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// Create student (admin only)
export async function POST(request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return errorResponse("Forbidden", 403);
    }

    const body = await request.json();
    const { email, password, name, classId, rollNumber } = body;

    if (!email || !password || !name) {
      return errorResponse("Missing required fields", 400);
    }

    if (db.users.findByEmail(email)) {
      return errorResponse("Email already exists", 409);
    }

    const student = db.users.create({
      ...body,
      role: "student",
      status: "active",
      admissionDate: new Date().toISOString().split("T")[0],
    });

    // Update class student count
    if (classId) {
      const cls = db.classes.findById(classId);
      if (cls) {
        db.classes.update(classId, { studentCount: (cls.studentCount || 0) + 1 });
      }
    }

    const { password: _, ...studentWithoutPassword } = student;
    return successResponse(studentWithoutPassword, "Student created successfully", 201);
  } catch (error) {
    console.error("Create student error:", error);
    return errorResponse("Internal server error", 500);
  }
}
