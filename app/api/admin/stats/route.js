import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";
import Student from "@/lib/models/Student";
import Teacher from "@/lib/models/Teacher";
import Class from "@/lib/models/Class";
import Subject from "@/lib/models/Subject";
import Assignment from "@/lib/models/Assignment";
import Notice from "@/lib/models/Notice";
import Ticket from "@/lib/models/Ticket";
import { requireAdmin } from "@/lib/auth";
import { successResponse, errorResponse, handleMongoError } from "@/lib/api-utils";

export async function GET(request) {
  try {
    const { error, status } = await requireAdmin();
    if (error) return errorResponse(error, status);

    await connectDB();

    const [
      totalStudents,
      totalTeachers,
      totalClasses,
      totalSubjects,
      activeStudents,
      activeTeachers,
      pendingAssignments,
      openTickets,
      recentNotices,
      usersByRole,
    ] = await Promise.all([
      Student.countDocuments(),
      Teacher.countDocuments(),
      Class.countDocuments({ isActive: true }),
      Subject.countDocuments({ isActive: true }),
      User.countDocuments({ role: "student", isActive: true }),
      User.countDocuments({ role: "teacher", isActive: true }),
      Assignment.countDocuments({ status: "published", dueDate: { $gte: new Date() } }),
      Ticket.countDocuments({ status: { $in: ["open", "in-progress"] } }),
      Notice.countDocuments({ isPublished: true, startDate: { $lte: new Date() } }),
      User.aggregate([
        { $group: { _id: "$role", count: { $sum: 1 } } }
      ]),
    ]);

    // Get recent activity
    const recentUsers = await User.find()
      .select("name email role createdAt")
      .sort({ createdAt: -1 })
      .limit(5);

    const stats = {
      overview: {
        totalStudents,
        totalTeachers,
        totalClasses,
        totalSubjects,
        activeStudents,
        activeTeachers,
      },
      activity: {
        pendingAssignments,
        openTickets,
        recentNotices,
      },
      usersByRole: usersByRole.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      recentUsers,
    };

    return successResponse(stats);

  } catch (error) {
    return handleMongoError(error);
  }
}
