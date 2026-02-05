import { db } from "@/lib/data-store";
import { successResponse, errorResponse, paginate, searchFilter } from "@/lib/api-utils";
import { cookies } from "next/headers";

async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");
  if (!sessionCookie?.value) return null;
  return JSON.parse(sessionCookie.value);
}

// Get materials
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
    const classId = searchParams.get("classId") || "";

    let materials = db.materials.findAll();

    // Students see materials for their class
    if (session.role === "student") {
      materials = db.materials.findByClass(session.classId);
    }

    // Teachers see their own materials
    if (session.role === "teacher") {
      materials = db.materials.findByTeacher(session.id);
    }

    // Filter by class
    if (classId) {
      materials = materials.filter((m) => m.classId === classId);
    }

    // Filter by subject
    if (subject) {
      materials = materials.filter((m) => m.subject === subject);
    }

    // Search
    materials = searchFilter(materials, search, ["title", "description", "subject"]);

    // Sort by creation date
    materials.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Add teacher info
    materials = materials.map((material) => {
      const teacher = db.users.findById(material.teacherId);
      const cls = db.classes.findById(material.classId);
      return {
        ...material,
        teacherName: teacher?.name || "Unknown",
        className: cls?.name || "Unknown",
      };
    });

    const result = paginate(materials, page, limit);
    return successResponse(result);
  } catch (error) {
    console.error("Get materials error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// Upload material (teacher only)
export async function POST(request) {
  try {
    const session = await getSession();
    if (!session || !["teacher", "admin"].includes(session.role)) {
      return errorResponse("Forbidden", 403);
    }

    const body = await request.json();
    const { title, description, subject, classId, type, url, size } = body;

    if (!title || !subject || !classId || !url) {
      return errorResponse("Missing required fields", 400);
    }

    const material = db.materials.create({
      title,
      description: description || "",
      subject,
      classId,
      type: type || "document",
      url,
      size: size || "Unknown",
      teacherId: session.id,
    });

    return successResponse(material, "Material uploaded successfully", 201);
  } catch (error) {
    console.error("Upload material error:", error);
    return errorResponse("Internal server error", 500);
  }
}
