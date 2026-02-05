import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";
import Student from "@/lib/models/Student";
import Teacher from "@/lib/models/Teacher";
import { requireAdmin } from "@/lib/auth";
import { 
  successResponse, 
  errorResponse, 
  getPaginationParams,
  createPaginationResponse,
  buildSearchQuery,
  buildSortQuery,
  handleMongoError 
} from "@/lib/api-utils";

// GET all users (admin only)
export async function GET(request) {
  try {
    const { error, adminStatus } = await requireAdmin();
    if (error) return errorResponse(error, adminStatus);

    await connectDB();

    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(searchParams);
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "";
    const userStatus = searchParams.get("status") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Build query
    let query = {};
    
    if (search) {
      query = { ...query, ...buildSearchQuery(search, ["name", "email"]) };
    }
    
    if (role) {
      query.role = role;
    }
    
    if (userStatus === "active") {
      query.isActive = true;
    } else if (userStatus === "inactive") {
      query.isActive = false;
    }

    const sort = buildSortQuery(sortBy, sortOrder);
    
    const [users, total] = await Promise.all([
      User.find(query).sort(sort).skip(skip).limit(limit).select("-password"),
      User.countDocuments(query),
    ]);

    return successResponse(createPaginationResponse(users, total, page, limit));

  } catch (error) {
    console.error("Get users error:", error);
    return handleMongoError(error);
  }
}

// POST create new user (admin only)
export async function POST(request) {
  try {
    const { error, adminStatus } = await requireAdmin();
    if (error) return errorResponse(error, adminStatus);

    const body = await request.json();
    const { email, password, name, role, phone, dateOfBirth, gender, isActive } = body;

    if (!email || !password || !name || !role) {
      return errorResponse("Email, password, name, and role are required", 400);
    }

    await connectDB();

    // Check if email exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return errorResponse("Email already exists", 409);
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
      isActive: isActive !== false,
    });

    // Create role-specific profile
    if (role === "student") {
      const studentId = body.studentId || `STU${Date.now().toString().slice(-8)}`;
      await Student.create({
        user: user._id,
        studentId,
        class: body.classId || null,
        section: body.section || null,
        rollNumber: body.rollNumber || null,
        parentName: body.parentName || null,
        parentPhone: body.parentPhone || null,
        parentEmail: body.parentEmail || null,
      });
    } else if (role === "teacher") {
      const employeeId = body.employeeId || `TCH${Date.now().toString().slice(-8)}`;
      await Teacher.create({
        user: user._id,
        employeeId,
        department: body.department || null,
        designation: body.designation || "Teacher",
        qualification: body.qualification || null,
        subjects: body.subjects || [],
        classes: body.classes || [],
      });
    }

    return successResponse(user.toPublicJSON(), "User created successfully", 201);

  } catch (error) {
    console.error("Create user error:", error);
    return handleMongoError(error);
  }
}
