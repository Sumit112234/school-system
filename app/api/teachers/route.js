import { db } from "@/lib/data-store";
import { successResponse, errorResponse, paginate, searchFilter, sortData } from "@/lib/api-utils";
import { cookies } from "next/headers";

async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");
  if (!sessionCookie?.value) return null;
  return JSON.parse(sessionCookie.value);
}

// Get all teachers
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
    const subject = searchParams.get("subject") || "";
    const sortBy = searchParams.get("sortBy") || "name";
    const sortOrder = searchParams.get("sortOrder") || "asc";

    let teachers = db.users.findByRole("teacher");

    // Filter by subject
    if (subject) {
      teachers = teachers.filter((t) => t.subjects?.includes(subject));
    }

    // Search
    teachers = searchFilter(teachers, search, ["name", "email", "qualification"]);

    // Sort
    teachers = sortData(teachers, sortBy, sortOrder);

    // Remove passwords and add class info
    teachers = teachers.map(({ password, ...teacher }) => {
      const classes = db.classes.findByTeacher(teacher.id);
      return {
        ...teacher,
        classCount: classes.length,
        classes: classes.map((c) => ({ id: c.id, name: c.name })),
      };
    });

    const result = paginate(teachers, page, limit);
    return successResponse(result);
  } catch (error) {
    console.error("Get teachers error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// Create teacher (admin only)
export async function POST(request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return errorResponse("Forbidden", 403);
    }

    const body = await request.json();
    const { email, password, name, subjects, qualification } = body;

    if (!email || !password || !name) {
      return errorResponse("Missing required fields", 400);
    }

    if (db.users.findByEmail(email)) {
      return errorResponse("Email already exists", 409);
    }

    const teacher = db.users.create({
      ...body,
      role: "teacher",
      status: "active",
      joiningDate: new Date().toISOString().split("T")[0],
    });

    const { password: _, ...teacherWithoutPassword } = teacher;
    return successResponse(teacherWithoutPassword, "Teacher created successfully", 201);
  } catch (error) {
    console.error("Create teacher error:", error);
    return errorResponse("Internal server error", 500);
  }
}
