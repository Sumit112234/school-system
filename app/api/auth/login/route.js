import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";
import Student from "@/lib/models/Student";
import Teacher from "@/lib/models/Teacher";
import { generateToken, setAuthCookie } from "@/lib/auth";
import { successResponse, errorResponse, validateRequired, validateEmail } from "@/lib/api-utils";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate required fields
    const missing = validateRequired(["email", "password"], body);
    if (missing.length > 0) {
      return errorResponse(`Missing required fields: ${missing.join(", ")}`, 400);
    }

    // Validate email format
    if (!validateEmail(email)) {
      return errorResponse("Invalid email format", 400);
    }

    await connectDB();

    // Find user with password
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

    if (!user) {
      return errorResponse("Invalid email or password", 401);
    }

    // Check if user is active
    if (!user.isActive) {
      return errorResponse("Your account has been deactivated. Please contact admin.", 403);
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return errorResponse("Invalid email or password", 401);
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Get role-specific data
    let roleData = null;
    if (user.role === "student") {
      roleData = await Student.findOne({ user: user._id })
        .populate("class", "name section")
        .populate("subjects", "name code");
    } else if (user.role === "teacher") {
      roleData = await Teacher.findOne({ user: user._id })
        .populate("classes", "name section")
        .populate("subjects", "name code");
    }

    // Generate token
    const token = generateToken(user);

    // Set cookie
    await setAuthCookie(token);

    return successResponse({
      user: user.toPublicJSON(),
      roleData,
      token,
    }, "Login successful");

  } catch (error) {
    console.error("Login error:", error);
    return errorResponse("Internal server error", 500);
  }
}
