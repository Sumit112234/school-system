import { successResponse, errorResponse } from "@/lib/api-utils";
import { getCurrentUser } from "@/lib/auth";

import User from "@/lib/models/User";
import Student from "@/lib/models/Student";
import Teacher from "@/lib/models/Teacher";

export async function PUT(request, { params }) {
  const session = await getCurrentUser();

  // OPTIONAL
  // if (!session || session.role !== "admin") {
  //   return errorResponse("Forbidden", 403);
  // }

  const { id } = params;
  const body = await request.json();

  const user = await User.findById(id);
  if (!user) {
    return errorResponse("User not found", 404);
  }

  // ❌ prevent email change
  delete body.email;
  delete body.password; // handle password change separately

  // 1️⃣ Update base user
  await User.findByIdAndUpdate(id, body, { new: true });

  // 2️⃣ Update role-specific data
  if (user.role === "student") {
    await Student.findOneAndUpdate(
      { user: id },
      body,
      { new: true }
    );
  }

  if (user.role === "teacher") {
    await Teacher.findOneAndUpdate(
      { user: id },
      body,
      { new: true }
    );
  }

  const updatedUser = await User.findById(id);

  return successResponse(
    updatedUser.toPublicJSON(),
    "User updated successfully"
  );
}
