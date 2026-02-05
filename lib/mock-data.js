// Mock Users Database
export const mockUsers = [
  {
    id: "1",
    email: "student@school.com",
    password: "student123",
    name: "Alex Johnson",
    role: "student",
    avatar: "/avatars/student.jpg",
    class: "10-A",
    rollNumber: "2024001",
    parentEmail: "parent@email.com",
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    email: "teacher@school.com",
    password: "teacher123",
    name: "Dr. Sarah Smith",
    role: "teacher",
    avatar: "/avatars/teacher.jpg",
    subject: "Mathematics",
    department: "Science",
    employeeId: "TCH001",
    createdAt: new Date("2023-08-01"),
  },
  {
    id: "3",
    email: "admin@school.com",
    password: "admin123",
    name: "Michael Brown",
    role: "admin",
    avatar: "/avatars/admin.jpg",
    department: "Administration",
    employeeId: "ADM001",
    createdAt: new Date("2022-01-01"),
  },
  {
    id: "4",
    email: "helper@school.com",
    password: "helper123",
    name: "Emily Davis",
    role: "helper",
    avatar: "/avatars/helper.jpg",
    department: "Student Support",
    employeeId: "HLP001",
    createdAt: new Date("2023-06-15"),
  },
];

// Mock Classes
export const mockClasses = [
  { id: "1", name: "10-A", grade: 10, section: "A", teacherId: "2", studentCount: 32 },
  { id: "2", name: "10-B", grade: 10, section: "B", teacherId: "2", studentCount: 30 },
  { id: "3", name: "9-A", grade: 9, section: "A", teacherId: "2", studentCount: 28 },
  { id: "4", name: "9-B", grade: 9, section: "B", teacherId: "2", studentCount: 31 },
];

// Mock Subjects
export const mockSubjects = [
  { id: "1", name: "Mathematics", code: "MATH101", teacherId: "2", credits: 4 },
  { id: "2", name: "Physics", code: "PHY101", teacherId: "2", credits: 4 },
  { id: "3", name: "Chemistry", code: "CHEM101", teacherId: "2", credits: 4 },
  { id: "4", name: "English", code: "ENG101", teacherId: "2", credits: 3 },
  { id: "5", name: "History", code: "HIST101", teacherId: "2", credits: 3 },
];

// Mock Assignments
export const mockAssignments = [
  {
    id: "1",
    title: "Quadratic Equations Practice",
    description: "Solve problems 1-20 from Chapter 4",
    subjectId: "1",
    subjectName: "Mathematics",
    classId: "1",
    teacherId: "2",
    dueDate: new Date("2024-02-15"),
    maxMarks: 100,
    status: "active",
    submissions: 25,
    totalStudents: 32,
  },
  {
    id: "2",
    title: "Newton's Laws Essay",
    description: "Write a 500-word essay on practical applications",
    subjectId: "2",
    subjectName: "Physics",
    classId: "1",
    teacherId: "2",
    dueDate: new Date("2024-02-18"),
    maxMarks: 50,
    status: "active",
    submissions: 18,
    totalStudents: 32,
  },
  {
    id: "3",
    title: "Chemical Bonding Lab Report",
    description: "Submit the lab report for Experiment 5",
    subjectId: "3",
    subjectName: "Chemistry",
    classId: "1",
    teacherId: "2",
    dueDate: new Date("2024-02-10"),
    maxMarks: 75,
    status: "completed",
    submissions: 32,
    totalStudents: 32,
  },
];

// Mock Grades
export const mockGrades = [
  { id: "1", studentId: "1", subjectId: "1", assignmentId: "1", marks: 85, maxMarks: 100, feedback: "Excellent work!" },
  { id: "2", studentId: "1", subjectId: "2", assignmentId: "2", marks: 42, maxMarks: 50, feedback: "Good analysis" },
  { id: "3", studentId: "1", subjectId: "3", assignmentId: "3", marks: 68, maxMarks: 75, feedback: "Well documented" },
];

// Mock Attendance
export const mockAttendance = [
  { id: "1", studentId: "1", date: new Date("2024-02-01"), status: "present", classId: "1" },
  { id: "2", studentId: "1", date: new Date("2024-02-02"), status: "present", classId: "1" },
  { id: "3", studentId: "1", date: new Date("2024-02-03"), status: "absent", classId: "1" },
  { id: "4", studentId: "1", date: new Date("2024-02-04"), status: "present", classId: "1" },
  { id: "5", studentId: "1", date: new Date("2024-02-05"), status: "late", classId: "1" },
];

// Mock Schedule/Timetable
export const mockSchedule = [
  { id: "1", day: "Monday", time: "08:00", subjectId: "1", subjectName: "Mathematics", classId: "1", teacherId: "2", room: "Room 101" },
  { id: "2", day: "Monday", time: "09:00", subjectId: "2", subjectName: "Physics", classId: "1", teacherId: "2", room: "Lab 1" },
  { id: "3", day: "Monday", time: "10:00", subjectId: "4", subjectName: "English", classId: "1", teacherId: "2", room: "Room 102" },
  { id: "4", day: "Monday", time: "11:00", subjectId: "3", subjectName: "Chemistry", classId: "1", teacherId: "2", room: "Lab 2" },
  { id: "5", day: "Tuesday", time: "08:00", subjectId: "5", subjectName: "History", classId: "1", teacherId: "2", room: "Room 103" },
  { id: "6", day: "Tuesday", time: "09:00", subjectId: "1", subjectName: "Mathematics", classId: "1", teacherId: "2", room: "Room 101" },
  { id: "7", day: "Tuesday", time: "10:00", subjectId: "2", subjectName: "Physics", classId: "1", teacherId: "2", room: "Lab 1" },
  { id: "8", day: "Wednesday", time: "08:00", subjectId: "3", subjectName: "Chemistry", classId: "1", teacherId: "2", room: "Lab 2" },
  { id: "9", day: "Wednesday", time: "09:00", subjectId: "4", subjectName: "English", classId: "1", teacherId: "2", room: "Room 102" },
  { id: "10", day: "Thursday", time: "08:00", subjectId: "1", subjectName: "Mathematics", classId: "1", teacherId: "2", room: "Room 101" },
  { id: "11", day: "Thursday", time: "09:00", subjectId: "5", subjectName: "History", classId: "1", teacherId: "2", room: "Room 103" },
  { id: "12", day: "Friday", time: "08:00", subjectId: "2", subjectName: "Physics", classId: "1", teacherId: "2", room: "Lab 1" },
  { id: "13", day: "Friday", time: "09:00", subjectId: "3", subjectName: "Chemistry", classId: "1", teacherId: "2", room: "Lab 2" },
];

// Mock Announcements
export const mockAnnouncements = [
  {
    id: "1",
    title: "Annual Sports Day",
    content: "The annual sports day will be held on February 25th. All students are required to participate.",
    authorId: "3",
    authorName: "Michael Brown",
    authorRole: "admin",
    targetAudience: "all",
    priority: "high",
    createdAt: new Date("2024-02-01"),
    expiresAt: new Date("2024-02-25"),
  },
  {
    id: "2",
    title: "Mathematics Extra Class",
    content: "Extra mathematics class for Class 10-A on Saturday at 10 AM.",
    authorId: "2",
    authorName: "Dr. Sarah Smith",
    authorRole: "teacher",
    targetAudience: "class",
    targetClassId: "1",
    priority: "medium",
    createdAt: new Date("2024-02-05"),
    expiresAt: new Date("2024-02-10"),
  },
  {
    id: "3",
    title: "Library Closure Notice",
    content: "The library will be closed for maintenance from Feb 12-14.",
    authorId: "3",
    authorName: "Michael Brown",
    authorRole: "admin",
    targetAudience: "all",
    priority: "low",
    createdAt: new Date("2024-02-08"),
    expiresAt: new Date("2024-02-14"),
  },
];

// Mock Study Materials
export const mockStudyMaterials = [
  {
    id: "1",
    title: "Quadratic Equations - Notes",
    description: "Comprehensive notes on solving quadratic equations",
    subjectId: "1",
    subjectName: "Mathematics",
    fileType: "pdf",
    fileUrl: "/materials/quadratic-notes.pdf",
    uploadedBy: "2",
    uploadedAt: new Date("2024-01-20"),
    downloads: 45,
  },
  {
    id: "2",
    title: "Newton's Laws Video Lecture",
    description: "Video explanation of Newton's three laws of motion",
    subjectId: "2",
    subjectName: "Physics",
    fileType: "video",
    fileUrl: "/materials/newtons-laws.mp4",
    uploadedBy: "2",
    uploadedAt: new Date("2024-01-25"),
    downloads: 38,
  },
  {
    id: "3",
    title: "Chemical Bonding Presentation",
    description: "PowerPoint slides on types of chemical bonds",
    subjectId: "3",
    subjectName: "Chemistry",
    fileType: "ppt",
    fileUrl: "/materials/chemical-bonding.pptx",
    uploadedBy: "2",
    uploadedAt: new Date("2024-01-28"),
    downloads: 52,
  },
];

// Mock Quizzes
export const mockQuizzes = [
  {
    id: "1",
    title: "Algebra Basics Quiz",
    subjectId: "1",
    subjectName: "Mathematics",
    questions: [
      {
        id: "q1",
        question: "What is the value of x in: 2x + 5 = 15?",
        options: ["3", "5", "7", "10"],
        correctAnswer: 1,
      },
      {
        id: "q2",
        question: "Simplify: (x + 2)(x - 2)",
        options: ["x² - 4", "x² + 4", "x² - 2", "2x"],
        correctAnswer: 0,
      },
      {
        id: "q3",
        question: "What is the quadratic formula?",
        options: [
          "x = -b ± √(b² - 4ac) / 2a",
          "x = b ± √(b² - 4ac) / 2a",
          "x = -b ± √(b² + 4ac) / 2a",
          "x = -b ± √(b - 4ac) / 2a",
        ],
        correctAnswer: 0,
      },
    ],
    duration: 15,
    totalMarks: 30,
    createdBy: "2",
    createdAt: new Date("2024-02-01"),
  },
  {
    id: "2",
    title: "Physics Motion Quiz",
    subjectId: "2",
    subjectName: "Physics",
    questions: [
      {
        id: "q1",
        question: "What is the SI unit of force?",
        options: ["Joule", "Newton", "Watt", "Pascal"],
        correctAnswer: 1,
      },
      {
        id: "q2",
        question: "According to Newton's first law, an object at rest stays at rest unless acted upon by:",
        options: ["Gravity", "Friction", "An external force", "Inertia"],
        correctAnswer: 2,
      },
    ],
    duration: 10,
    totalMarks: 20,
    createdBy: "2",
    createdAt: new Date("2024-02-03"),
  },
];

// Mock Notifications
export const mockNotifications = [
  { id: "1", userId: "1", title: "Assignment Due", message: "Quadratic Equations Practice is due tomorrow", read: false, createdAt: new Date("2024-02-14") },
  { id: "2", userId: "1", title: "Grade Posted", message: "Your Chemistry lab report has been graded", read: false, createdAt: new Date("2024-02-13") },
  { id: "3", userId: "1", title: "New Announcement", message: "Check out the Annual Sports Day announcement", read: true, createdAt: new Date("2024-02-01") },
];

// Mock Messages
export const mockMessages = [
  {
    id: "1",
    senderId: "2",
    senderName: "Dr. Sarah Smith",
    senderRole: "teacher",
    receiverId: "1",
    subject: "Regarding your assignment",
    content: "Great work on your recent assignment. Keep it up!",
    read: false,
    createdAt: new Date("2024-02-10"),
  },
  {
    id: "2",
    senderId: "4",
    senderName: "Emily Davis",
    senderRole: "helper",
    receiverId: "1",
    subject: "Counseling Session Reminder",
    content: "This is a reminder for your scheduled counseling session tomorrow at 2 PM.",
    read: true,
    createdAt: new Date("2024-02-08"),
  },
];

// Mock Fee Records
export const mockFeeRecords = [
  {
    id: "1",
    studentId: "1",
    type: "Tuition Fee",
    amount: 5000,
    dueDate: new Date("2024-02-28"),
    status: "pending",
    semester: "Spring 2024",
  },
  {
    id: "2",
    studentId: "1",
    type: "Lab Fee",
    amount: 500,
    dueDate: new Date("2024-02-15"),
    status: "paid",
    paidDate: new Date("2024-02-10"),
    semester: "Spring 2024",
  },
  {
    id: "3",
    studentId: "1",
    type: "Library Fee",
    amount: 200,
    dueDate: new Date("2024-02-20"),
    status: "paid",
    paidDate: new Date("2024-02-05"),
    semester: "Spring 2024",
  },
];

// Mock Leave Requests
export const mockLeaveRequests = [
  {
    id: "1",
    userId: "1",
    userRole: "student",
    type: "sick",
    startDate: new Date("2024-02-20"),
    endDate: new Date("2024-02-22"),
    reason: "Fever and cold",
    status: "pending",
    createdAt: new Date("2024-02-18"),
  },
  {
    id: "2",
    userId: "2",
    userRole: "teacher",
    type: "personal",
    startDate: new Date("2024-03-01"),
    endDate: new Date("2024-03-02"),
    reason: "Family function",
    status: "approved",
    approvedBy: "3",
    createdAt: new Date("2024-02-15"),
  },
];

// Dashboard Statistics
export const mockDashboardStats = {
  admin: {
    totalStudents: 450,
    totalTeachers: 32,
    totalClasses: 15,
    totalRevenue: 225000,
    attendanceRate: 94.5,
    pendingLeaves: 8,
    upcomingEvents: 3,
  },
  teacher: {
    totalClasses: 4,
    totalStudents: 121,
    pendingAssignments: 5,
    averageAttendance: 92.3,
    upcomingClasses: 3,
  },
  student: {
    attendanceRate: 95,
    pendingAssignments: 3,
    averageGrade: 85.5,
    upcomingClasses: 2,
    unreadMessages: 2,
  },
  helper: {
    pendingRequests: 12,
    resolvedToday: 5,
    scheduledSessions: 4,
    activeStudents: 25,
  },
};
