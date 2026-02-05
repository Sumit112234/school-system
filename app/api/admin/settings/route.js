import connectDB from "@/lib/mongodb";
import Settings from "@/lib/models/Settings";
import { requireAdmin } from "@/lib/auth";
import { successResponse, errorResponse, handleMongoError } from "@/lib/api-utils";

// GET settings
export async function GET(request) {
  try {
    const { error, status } = await requireAdmin();
    if (error) return errorResponse(error, status);

    await connectDB();

    let settings = await Settings.findOne({ key: "main" });
    
    // Create default settings if not exists
    if (!settings) {
      settings = await Settings.create({ key: "main" });
    }

    return successResponse(settings);

  } catch (error) {
    return handleMongoError(error);
  }
}

// PUT update settings
export async function PUT(request) {
  try {
    const { error, status } = await requireAdmin();
    if (error) return errorResponse(error, status);

    const body = await request.json();

    await connectDB();

    const settings = await Settings.findOneAndUpdate(
      { key: "main" },
      { $set: body },
      { new: true, upsert: true, runValidators: true }
    );

    return successResponse(settings, "Settings updated successfully");

  } catch (error) {
    return handleMongoError(error);
  }
}
