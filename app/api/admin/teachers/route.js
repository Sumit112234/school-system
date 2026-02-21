import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";
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

// GET all teachers (admin only)
export async function GET(request) {
  try {
    const { error, adminStatus } = await requireAdmin();
    if (error) return errorResponse(error, adminStatus);

    await connectDB();

    const { searchParams } = new URL(request.url);
    const { page, limit, skip } = getPaginationParams(searchParams);
    const search = searchParams.get("search") || "";
    const department = searchParams.get("department") || "";
    const status = searchParams.get("status") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Build query for User model
    let userQuery = { role: "teacher" };
    
    if (search) {
      userQuery = { ...userQuery, ...buildSearchQuery(search, ["name", "email"]) };
    }
    
    if (status === "active") {
      userQuery.isActive = true;
    } else if (status === "inactive") {
      userQuery.isActive = false;
    }

    const sort = buildSortQuery(sortBy, sortOrder);
    
    // Get users with teacher role
    const [users, totalUsers] = await Promise.all([
      User.find(userQuery).sort(sort).skip(skip).limit(limit).select("-password"),
      User.countDocuments(userQuery),
    ]);

    // Get teacher profiles for these users
    const userIds = users.map(u => u._id);
    const teacherProfiles = await Teacher.find({ user: { $in: userIds } })
      .populate("subjects", "name code")
      .populate("classes", "name section")
      .populate("classTeacherOf", "name section");

    // Create a map of user ID to teacher profile
    const teacherMap = {};
    teacherProfiles.forEach(t => {
      teacherMap[t.user.toString()] = t;
    });

    // Filter by department if specified
    let filteredUsers = users;
    if (department) {
      filteredUsers = users.filter(u => {
        const teacherProfile = teacherMap[u._id.toString()];
        return teacherProfile && teacherProfile.department === department;
      });
    }

    // Combine user and teacher data
    const teachers = filteredUsers.map(user => {
      const teacherProfile = teacherMap[user._id.toString()];
      return {
        ...user.toPublicJSON(),
        teacherData: teacherProfile ? {
            _id : teacherProfile._id,
          employeeId: teacherProfile.employeeId,
          department: teacherProfile.department,
          designation: teacherProfile.designation,
          qualification: teacherProfile.qualification,
          subjects: teacherProfile.subjects,
          classes: teacherProfile.classes,
          classTeacherOf: teacherProfile.classTeacherOf,
          joiningDate: teacherProfile.joiningDate,
        } : null,
      };
    });
    // console.log("Teachers fetched:", teachers, teacherProfiles);

    return successResponse(
      createPaginationResponse(
        teachers,
        department ? filteredUsers.length : totalUsers,
        page,
        limit
      )
    );

  } catch (error) {
    console.error("Get teachers error:", error);
    return handleMongoError(error);
  }
}

// POST create new teacher (admin only)
export async function POST(request) {
  try {
    const { error, adminStatus } = await requireAdmin();
    if (error) return errorResponse(error, adminStatus);

    const body = await request.json();
    const { 
      email, password, name, phone, dateOfBirth, gender, address, isActive,
      employeeId, department, designation, qualification, subjects, classes, joiningDate
    } = body;

    if (!email || !password || !name) {
      return errorResponse("Email, password, and name are required", 400);
    }

    await connectDB();

    // Check if email exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return errorResponse("Email already exists", 409);
    }

    // Create user with teacher role
    const user = await User.create({
      email: email.toLowerCase(),
      password,
      name,
      role: "teacher",
      phone: phone || null,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      gender: gender || null,
      address: address || null,
      isActive: isActive !== false,
    });

    // Create teacher profile
    const generatedEmployeeId = employeeId || `TCH${Date.now().toString().slice(-8)}`;
    const teacher = await Teacher.create({
      user: user._id,
      employeeId: generatedEmployeeId,
      department: department || null,
      designation: designation || "Teacher",
      qualification: qualification || null,
      subjects: subjects || [],
      classes: classes || [],
      joiningDate: joiningDate ? new Date(joiningDate) : new Date(),
    });

    // Populate the teacher data
    await teacher.populate([
      { path: "subjects", select: "name code" },
      { path: "classes", select: "name section" },
    ]);

    return successResponse(
      {
        ...user.toPublicJSON(),
        teacherData: {
          employeeId: teacher.employeeId,
          department: teacher.department,
          designation: teacher.designation,
          qualification: teacher.qualification,
          subjects: teacher.subjects,
          classes: teacher.classes,
          joiningDate: teacher.joiningDate,
        },
      },
      "Teacher created successfully",
      201
    );

  } catch (error) {
    console.error("Create teacher error:", error);
    return handleMongoError(error);
  }
}