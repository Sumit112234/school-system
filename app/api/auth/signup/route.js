import connectDB from "@/lib/mongodb";
// import User from "@/lib/models/User";
// import Student from "@/lib/models/Student";
// import Teacher from "@/lib/models/Teacher";
// import Settings from "@/lib/models/Settings";
import {User, Student, Teacher, Settings} from "@/lib/models/index";
import { generateToken, setAuthCookie } from "@/lib/auth";
import { 
  successResponse, 
  errorResponse, 
  validateRequired, 
  validateEmail,
  validatePassword,
} from "@/lib/api-utils";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, name, role, phone, dateOfBirth, gender } = body;
    console.log("Signup request body:", body);

    // Validate required fields
    const missing = validateRequired(["email", "password", "name", "role"], body);
    if (missing.length > 0) {
      return errorResponse(`Missing required fields: ${missing.join(", ")}`, 400);
    }

    // Validate email
    if (!validateEmail(email)) {
      return errorResponse("Invalid email format", 400);
    }

    // Validate password
    if (!validatePassword(password)) {
      return errorResponse("Password must be at least 6 characters", 400);
    }

    // Validate role
    const validRoles = ["student", "teacher", "admin", "helper"];
    if (!validRoles.includes(role)) {
      return errorResponse("Invalid role", 400);
    }

    await connectDB();

    // Check settings for registration permissions
    const settings = await Settings.findOne({ key: "main" });
    
    if (role === "student" && settings && !settings.allowStudentRegistration) {
      return errorResponse("Student registration is currently disabled", 403);
    }
    
    if (role === "teacher" && settings && !settings.allowTeacherRegistration) {
      return errorResponse("Teacher registration is currently disabled", 403);
    }

    if (role === "admin" || role === "helper") {
      return errorResponse("Admin and helper accounts can only be created by administrators", 403);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return errorResponse("Email already registered", 409);
    }

    // Create user
    const user = await User.create({
      email: email.toLowerCase(),
      password,
      name,
      role,
      phone,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      gender,
    });

    // Create role-specific profile
    let roleData = null;
    
    if (role === "student") {
      const studentId = `STU${Date.now().toString().slice(-8)}`;
      roleData = await Student.create({
        user: user._id,
        studentId,
        parentName: body.parentName || null,
        parentPhone: body.parentPhone || null,
        parentEmail: body.parentEmail || null,
      });
    } else if (role === "teacher") {
      const employeeId = `TCH${Date.now().toString().slice(-8)}`;
      roleData = await Teacher.create({
        user: user._id,
        employeeId,
        qualification: body.qualification || null,
        department: body.department || null,
      });
    }

    // Generate token
    const token = generateToken(user);

    // Set cookie
    await setAuthCookie(token);

    return successResponse({
      user: user.toPublicJSON(),
      roleData,
      token,
    }, "Registration successful", 201);

  } catch (error) {
    console.error("Signup error:", error);
    
    if (error.code === 11000) {
      return errorResponse("Email already registered", 409);
    }
    
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return errorResponse(messages.join(", "), 400);
    }
    
    return errorResponse("Internal server error", 500);
  }
}
