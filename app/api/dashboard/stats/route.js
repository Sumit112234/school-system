import { db } from "@/lib/data-store";
import { successResponse, errorResponse } from "@/lib/api-utils";
import { cookies } from "next/headers";

async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");
  if (!sessionCookie?.value) return null;
  return JSON.parse(sessionCookie.value);
}

// Get dashboard stats based on role
export async function GET(request) {
  try {
    const session = await getSession();
    if (!session) {
      return errorResponse("Unauthorized", 401);
    }

    let stats = {};

    if (session.role === "student") {
      // Student stats
      const attendance = db.attendance.findByStudent(session.id);
      const grades = db.grades.findByStudent(session.id);
      const assignments = db.assignments.findByClass(session.classId);
      const quizzes = db.quizzes.findByClass(session.classId);
      const messages = db.messages.findInbox(session.id);

      const totalAttendance = attendance.length;
      const presentDays = attendance.filter((a) => a.status === "present" || a.status === "late").length;

      const totalMarks = grades.reduce((sum, g) => sum + g.marks, 0);
      const maxMarks = grades.reduce((sum, g) => sum + g.totalMarks, 0);

      const pendingAssignments = assignments.filter((a) => {
        const submission = a.submissions?.find((s) => s.studentId === session.id);
        return !submission && new Date(a.dueDate) > new Date();
      });

      const availableQuizzes = quizzes.filter((q) => {
        const attempted = db.quizAttempts.findByStudentAndQuiz(session.id, q.id);
        return !attempted && q.status === "active";
      });

      stats = {
        attendance: {
          percentage: totalAttendance > 0 ? ((presentDays / totalAttendance) * 100).toFixed(1) : 0,
          present: presentDays,
          total: totalAttendance,
        },
        grades: {
          average: maxMarks > 0 ? ((totalMarks / maxMarks) * 100).toFixed(1) : 0,
          totalExams: grades.length,
        },
        assignments: {
          pending: pendingAssignments.length,
          total: assignments.length,
        },
        quizzes: {
          available: availableQuizzes.length,
        },
        messages: {
          unread: messages.filter((m) => !m.read).length,
        },
      };
    } else if (session.role === "teacher") {
      // Teacher stats
      const classes = db.classes.findByTeacher(session.id);
      const classIds = classes.map((c) => c.id);
      const students = db.users.findByRole("student").filter((s) => classIds.includes(s.classId));
      const assignments = db.assignments.findByTeacher(session.id);
      const quizzes = db.quizzes.findByTeacher(session.id);

      const pendingGrading = assignments.reduce((count, a) => {
        const ungradedSubmissions = a.submissions?.filter((s) => s.status === "submitted").length || 0;
        return count + ungradedSubmissions;
      }, 0);

      const todayAttendance = db.attendance.findByDate(new Date().toISOString().split("T")[0])
        .filter((a) => classIds.includes(a.classId));

      stats = {
        classes: {
          total: classes.length,
        },
        students: {
          total: students.length,
        },
        assignments: {
          total: assignments.length,
          pendingGrading,
        },
        quizzes: {
          total: quizzes.length,
          active: quizzes.filter((q) => q.status === "active").length,
        },
        attendance: {
          markedToday: todayAttendance.length > 0,
          presentToday: todayAttendance.filter((a) => a.status === "present").length,
        },
      };
    } else if (session.role === "admin") {
      // Admin stats
      const students = db.users.findByRole("student");
      const teachers = db.users.findByRole("teacher");
      const classes = db.classes.findAll();
      const notices = db.notices.findActive();

      const activeStudents = students.filter((s) => s.status === "active").length;
      const activeTeachers = teachers.filter((t) => t.status === "active").length;

      stats = {
        students: {
          total: students.length,
          active: activeStudents,
        },
        teachers: {
          total: teachers.length,
          active: activeTeachers,
        },
        classes: {
          total: classes.length,
          averageStudents: classes.length > 0 
            ? Math.round(classes.reduce((sum, c) => sum + (c.studentCount || 0), 0) / classes.length)
            : 0,
        },
        notices: {
          active: notices.length,
        },
        recentActivity: {
          newStudents: students.filter((s) => {
            const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            return new Date(s.createdAt) > oneWeekAgo;
          }).length,
        },
      };
    } else if (session.role === "helper") {
      // Helper stats
      const tickets = db.tickets.findAll();
      const myTickets = db.tickets.findByAssignee(session.id);

      stats = {
        tickets: {
          total: tickets.length,
          open: tickets.filter((t) => t.status === "open").length,
          inProgress: tickets.filter((t) => t.status === "in-progress").length,
          resolved: tickets.filter((t) => t.status === "resolved").length,
          myAssigned: myTickets.length,
          myPending: myTickets.filter((t) => t.status !== "closed" && t.status !== "resolved").length,
        },
        users: {
          total: db.users.findAll().length,
        },
      };
    }

    return successResponse(stats);
  } catch (error) {
    console.error("Get stats error:", error);
    return errorResponse("Internal server error", 500);
  }
}
