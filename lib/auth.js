import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import connectDB from "./mongodb";
import User from "./models/User";

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";
const JWT_EXPIRES_IN = "7d";

// Generate JWT token
export function generateToken(user) {
  return jwt.sign(
    {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// Verify JWT token
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Get current user from cookies
export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return null;
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return null;
    }

    await connectDB();
    const user = await User.findById(decoded.userId).select("-password");

    if (!user || !user.isActive) {
      return null;
    }

    return user;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

// Set auth cookie
export async function setAuthCookie(token) {
  const cookieStore = await cookies();

  console.log("Setting auth cookie with token:", process.env.NODE_ENV);

  cookieStore.set("auth_token", token, {
    httpOnly: true,
    secure: false || process.env.NODE_ENV === "production",           // REQUIRED on Vercel
    sameSite: "none",       // REQUIRED for cross-domain
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  })

  // cookieStore.set("auth_token", token, {
  //   httpOnly: true,
  //   secure: process.env.NODE_ENV === "production",
  //   sameSite: "lax",
  //   maxAge: 60 * 60 * 24 * 7, // 7 days
  //   path: "/",
  // });
}

// Clear auth cookie
export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete("auth_token");
}

// Middleware to check authentication
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Unauthorized", status: 401 };
  }
  return { user };
}

// Middleware to check specific role
export async function requireRole(allowedRoles) {
  const { user, error, status } = await requireAuth();
  if (error) {
    return { error, status };
  }

  if (!allowedRoles.includes(user.role)) {
    return { error: "Forbidden - Insufficient permissions", status: 403 };
  }

  return { user };
}

// Helper to check if user is admin
export async function requireAdmin() {
  return requireRole(["admin"]);
}

// Helper to check if user is teacher
export async function requireTeacher() {
  return requireRole(["teacher", "admin"]);
}

// Helper to check if user is student
export async function requireStudent() {
  return requireRole(["student"]);
}

// Helper to check if user is helper
export async function requireHelper() {
  return requireRole(["helper", "admin"]);
}


// =-----------------------------------

// temporary fixes
// /app/api/helper/dashboard/route.js:2:1

export async function verifyAuth(req) {
  return requireRole(["helper", "admin"]);
}