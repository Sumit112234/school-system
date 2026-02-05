import { db } from "@/lib/data-store";
import { successResponse, errorResponse } from "@/lib/api-utils";
import { cookies } from "next/headers";

async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");
  if (!sessionCookie?.value) return null;
  return JSON.parse(sessionCookie.value);
}

// Track download and return URL
export async function POST(request, { params }) {
  try {
    const session = await getSession();
    if (!session) {
      return errorResponse("Unauthorized", 401);
    }

    const { id } = await params;
    const material = db.materials.findById(id);

    if (!material) {
      return errorResponse("Material not found", 404);
    }

    // Increment download count
    db.materials.incrementDownloads(id);

    return successResponse({
      url: material.url,
      title: material.title,
    }, "Download tracked");
  } catch (error) {
    console.error("Download material error:", error);
    return errorResponse("Internal server error", 500);
  }
}
