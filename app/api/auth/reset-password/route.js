import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";
import crypto from "crypto";
import { successResponse, errorResponse, validateEmail } from "@/lib/api-utils";

// Request password reset
export async function POST(request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || !validateEmail(email)) {
      return errorResponse("Valid email is required", 400);
    }

    await connectDB();

    const user = await User.findOne({ email: email.toLowerCase() });

    // Always return success to prevent email enumeration
    if (!user) {
      return successResponse(null, "If email exists, reset instructions will be sent");
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // In production, send email here with resetToken
    return successResponse({ 
      message: "Password reset instructions sent to email",
    });

  } catch (error) {
    console.error("Reset password error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// Reset password with token
export async function PUT(request) {
  try {
    const body = await request.json();
    const { token, newPassword } = body;

    if (!token || !newPassword) {
      return errorResponse("Token and new password are required", 400);
    }

    if (newPassword.length < 6) {
      return errorResponse("Password must be at least 6 characters", 400);
    }

    await connectDB();

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    }).select("+password");

    if (!user) {
      return errorResponse("Invalid or expired reset token", 400);
    }

    // Update password
    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    return successResponse(null, "Password reset successful");

  } catch (error) {
    console.error("Reset password error:", error);
    return errorResponse("Internal server error", 500);
  }
}
