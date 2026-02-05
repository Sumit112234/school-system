// In-memory data store (simulates database)
// In production, replace with MongoDB/PostgreSQL

import { generateId } from "./api-utils";

// Initialize with mock data
const dataStore = {
  users: [
    {
      id: "usr_1",
      email: "student@school.com",
      password: "Student123",
      name: "John Doe",
      role: "student",
      avatar: null,
      phone: "+1234567890",
      address: "123 Main St",
      classId: "cls_1",
      rollNumber: "STU001",
      parentName: "Robert Doe",
      parentPhone: "+1234567891",
      dateOfBirth: "2008-05-15",
      admissionDate: "2023-01-15",
      status: "active",
      createdAt: "2023-01-15T10:00:00Z",
    },
    {
      id: "usr_2",
      email: "teacher@school.com",
      password: "Teacher123",
      name: "Sarah Smith",
      role: "teacher",
      avatar: null,
      phone: "+1234567892",
      address: "456 Oak Ave",
      subjects: ["Mathematics", "Physics"],
      qualification: "M.Sc Mathematics",
      experience: "8 years",
      salary: 55000,
      joiningDate: "2020-06-01",
      status: "active",
      createdAt: "2020-06-01T10:00:00Z",
    },
    {
      id: "usr_3",
      email: "admin@school.com",
      password: "Admin123",
      name: "Michael Johnson",
      role: "admin",
      avatar: null,
      phone: "+1234567893",
      status: "active",
      createdAt: "2019-01-01T10:00:00Z",
    },
    {
      id: "usr_4",
      email: "helper@school.com",
      password: "Helper123",
      name: "Emily Brown",
      role: "helper",
      avatar: null,
      phone: "+1234567894",
      department: "IT Support",
      status: "active",
      createdAt: "2021-03-15T10:00:00Z",
    },
  ],
  
  classes: [
    {
      id: "cls_1",
      name: "10th Grade - Section A",
      grade: "10",
      section: "A",
      teacherId: "usr_2",
      studentCount: 35,
      room: "Room 101",
      capacity: 40,
      subjects: ["Mathematics", "Physics", "Chemistry", "English", "History"],
      schedule: "Morning Shift",
      createdAt: "2023-01-01T10:00:00Z",
    },
    {
      id: "cls_2",
      name: "10th Grade - Section B",
      grade: "10",
      section: "B",
      teacherId: "usr_2",
      studentCount: 32,
      room: "Room 102",
      capacity: 40,
      subjects: ["Mathematics", "Physics", "Chemistry", "English", "History"],
      schedule: "Morning Shift",
      createdAt: "2023-01-01T10:00:00Z",
    },
  ],
  
  subjects: [
    { id: "sub_1", name: "Mathematics", code: "MATH101", credits: 4 },
    { id: "sub_2", name: "Physics", code: "PHY101", credits: 4 },
    { id: "sub_3", name: "Chemistry", code: "CHEM101", credits: 4 },
    { id: "sub_4", name: "English", code: "ENG101", credits: 3 },
    { id: "sub_5", name: "History", code: "HIST101", credits: 3 },
  ],
  
  assignments: [
    {
      id: "asg_1",
      title: "Quadratic Equations Practice",
      description: "Solve problems 1-20 from Chapter 4",
      subject: "Mathematics",
      classId: "cls_1",
      teacherId: "usr_2",
      dueDate: "2024-02-15",
      totalMarks: 100,
      status: "active",
      attachments: [],
      submissions: [],
      createdAt: "2024-02-01T10:00:00Z",
    },
    {
      id: "asg_2",
      title: "Newton's Laws Essay",
      description: "Write a 500-word essay on Newton's three laws of motion",
      subject: "Physics",
      classId: "cls_1",
      teacherId: "usr_2",
      dueDate: "2024-02-20",
      totalMarks: 50,
      status: "active",
      attachments: [],
      submissions: [],
      createdAt: "2024-02-05T10:00:00Z",
    },
  ],
  
  attendance: [],
  
  grades: [
    {
      id: "grd_1",
      studentId: "usr_1",
      subject: "Mathematics",
      examType: "Midterm",
      marks: 85,
      totalMarks: 100,
      grade: "A",
      remarks: "Excellent performance",
      teacherId: "usr_2",
      date: "2024-01-15",
    },
    {
      id: "grd_2",
      studentId: "usr_1",
      subject: "Physics",
      examType: "Midterm",
      marks: 78,
      totalMarks: 100,
      grade: "B+",
      remarks: "Good work",
      teacherId: "usr_2",
      date: "2024-01-16",
    },
  ],
  
  timetable: [
    { id: "tt_1", classId: "cls_1", day: "Monday", period: 1, subject: "Mathematics", teacherId: "usr_2", time: "8:00 AM - 8:45 AM", room: "Room 101" },
    { id: "tt_2", classId: "cls_1", day: "Monday", period: 2, subject: "Physics", teacherId: "usr_2", time: "8:45 AM - 9:30 AM", room: "Room 101" },
    { id: "tt_3", classId: "cls_1", day: "Monday", period: 3, subject: "Chemistry", teacherId: "usr_2", time: "9:45 AM - 10:30 AM", room: "Lab 1" },
    { id: "tt_4", classId: "cls_1", day: "Monday", period: 4, subject: "English", teacherId: "usr_2", time: "10:30 AM - 11:15 AM", room: "Room 101" },
    { id: "tt_5", classId: "cls_1", day: "Tuesday", period: 1, subject: "History", teacherId: "usr_2", time: "8:00 AM - 8:45 AM", room: "Room 101" },
    { id: "tt_6", classId: "cls_1", day: "Tuesday", period: 2, subject: "Mathematics", teacherId: "usr_2", time: "8:45 AM - 9:30 AM", room: "Room 101" },
  ],
  
  materials: [
    {
      id: "mat_1",
      title: "Algebra Fundamentals",
      description: "Complete guide to basic algebra concepts",
      subject: "Mathematics",
      type: "pdf",
      url: "/materials/algebra.pdf",
      size: "2.5 MB",
      teacherId: "usr_2",
      classId: "cls_1",
      downloads: 45,
      createdAt: "2024-01-10T10:00:00Z",
    },
    {
      id: "mat_2",
      title: "Physics Lab Manual",
      description: "Lab experiments and procedures",
      subject: "Physics",
      type: "pdf",
      url: "/materials/physics-lab.pdf",
      size: "5.2 MB",
      teacherId: "usr_2",
      classId: "cls_1",
      downloads: 38,
      createdAt: "2024-01-12T10:00:00Z",
    },
  ],
  
  messages: [
    {
      id: "msg_1",
      senderId: "usr_2",
      receiverId: "usr_1",
      subject: "Assignment Feedback",
      content: "Great work on your recent assignment. Keep it up!",
      read: false,
      createdAt: "2024-02-10T14:30:00Z",
    },
  ],
  
  notices: [
    {
      id: "not_1",
      title: "Annual Day Celebration",
      content: "Annual day will be celebrated on March 15th. All students must participate.",
      type: "event",
      priority: "high",
      targetRoles: ["student", "teacher"],
      publishedBy: "usr_3",
      publishedAt: "2024-02-01T10:00:00Z",
      expiresAt: "2024-03-16T00:00:00Z",
    },
    {
      id: "not_2",
      title: "Exam Schedule Released",
      content: "Final exam schedule has been released. Please check the academic calendar.",
      type: "academic",
      priority: "high",
      targetRoles: ["student", "teacher"],
      publishedBy: "usr_3",
      publishedAt: "2024-02-05T10:00:00Z",
      expiresAt: "2024-04-01T00:00:00Z",
    },
  ],
  
  quizzes: [
    {
      id: "qz_1",
      title: "Mathematics Quiz - Chapter 4",
      subject: "Mathematics",
      classId: "cls_1",
      teacherId: "usr_2",
      duration: 30,
      totalMarks: 50,
      passingMarks: 25,
      questions: [
        {
          id: "q1",
          question: "What is the quadratic formula?",
          options: ["x = -b ± √(b²-4ac) / 2a", "x = b ± √(b²-4ac) / 2a", "x = -b ± √(b²+4ac) / 2a", "x = -b ± √(b²-4ac) / a"],
          correctAnswer: 0,
          marks: 10,
        },
        {
          id: "q2",
          question: "If x² - 5x + 6 = 0, what are the roots?",
          options: ["2 and 3", "1 and 6", "-2 and -3", "2 and -3"],
          correctAnswer: 0,
          marks: 10,
        },
      ],
      status: "active",
      startDate: "2024-02-10",
      endDate: "2024-02-20",
      createdAt: "2024-02-01T10:00:00Z",
    },
  ],
  
  quizAttempts: [],
  
  tickets: [
    {
      id: "tkt_1",
      userId: "usr_1",
      subject: "Cannot access course materials",
      description: "I am unable to download the physics lab manual.",
      category: "technical",
      priority: "medium",
      status: "open",
      assignedTo: "usr_4",
      messages: [
        {
          id: "tm_1",
          senderId: "usr_1",
          content: "I am unable to download the physics lab manual.",
          createdAt: "2024-02-08T10:00:00Z",
        },
      ],
      createdAt: "2024-02-08T10:00:00Z",
      updatedAt: "2024-02-08T10:00:00Z",
    },
  ],
  
  settings: {
    schoolName: "Excellence Academy",
    schoolEmail: "info@excellenceacademy.edu",
    schoolPhone: "+1 (555) 123-4567",
    schoolAddress: "123 Education Lane, Knowledge City, KC 12345",
    academicYear: "2023-2024",
    timezone: "America/New_York",
    dateFormat: "MM/DD/YYYY",
    language: "en",
    maintenanceMode: false,
    allowRegistration: true,
    emailNotifications: true,
    smsNotifications: false,
  },
};

// CRUD Operations
export const db = {
  // Users
  users: {
    findAll: () => dataStore.users,
    findById: (id) => dataStore.users.find((u) => u.id === id),
    findByEmail: (email) => dataStore.users.find((u) => u.email === email),
    findByRole: (role) => dataStore.users.filter((u) => u.role === role),
    create: (data) => {
      const user = { id: generateId(), ...data, createdAt: new Date().toISOString() };
      dataStore.users.push(user);
      return user;
    },
    update: (id, data) => {
      const index = dataStore.users.findIndex((u) => u.id === id);
      if (index === -1) return null;
      dataStore.users[index] = { ...dataStore.users[index], ...data };
      return dataStore.users[index];
    },
    delete: (id) => {
      const index = dataStore.users.findIndex((u) => u.id === id);
      if (index === -1) return false;
      dataStore.users.splice(index, 1);
      return true;
    },
  },
  
  // Classes
  classes: {
    findAll: () => dataStore.classes,
    findById: (id) => dataStore.classes.find((c) => c.id === id),
    findByTeacher: (teacherId) => dataStore.classes.filter((c) => c.teacherId === teacherId),
    create: (data) => {
      const cls = { id: generateId(), ...data, createdAt: new Date().toISOString() };
      dataStore.classes.push(cls);
      return cls;
    },
    update: (id, data) => {
      const index = dataStore.classes.findIndex((c) => c.id === id);
      if (index === -1) return null;
      dataStore.classes[index] = { ...dataStore.classes[index], ...data };
      return dataStore.classes[index];
    },
    delete: (id) => {
      const index = dataStore.classes.findIndex((c) => c.id === id);
      if (index === -1) return false;
      dataStore.classes.splice(index, 1);
      return true;
    },
  },
  
  // Subjects
  subjects: {
    findAll: () => dataStore.subjects,
    findById: (id) => dataStore.subjects.find((s) => s.id === id),
    create: (data) => {
      const subject = { id: generateId(), ...data };
      dataStore.subjects.push(subject);
      return subject;
    },
    update: (id, data) => {
      const index = dataStore.subjects.findIndex((s) => s.id === id);
      if (index === -1) return null;
      dataStore.subjects[index] = { ...dataStore.subjects[index], ...data };
      return dataStore.subjects[index];
    },
    delete: (id) => {
      const index = dataStore.subjects.findIndex((s) => s.id === id);
      if (index === -1) return false;
      dataStore.subjects.splice(index, 1);
      return true;
    },
  },
  
  // Assignments
  assignments: {
    findAll: () => dataStore.assignments,
    findById: (id) => dataStore.assignments.find((a) => a.id === id),
    findByClass: (classId) => dataStore.assignments.filter((a) => a.classId === classId),
    findByTeacher: (teacherId) => dataStore.assignments.filter((a) => a.teacherId === teacherId),
    create: (data) => {
      const assignment = { id: generateId(), ...data, submissions: [], createdAt: new Date().toISOString() };
      dataStore.assignments.push(assignment);
      return assignment;
    },
    update: (id, data) => {
      const index = dataStore.assignments.findIndex((a) => a.id === id);
      if (index === -1) return null;
      dataStore.assignments[index] = { ...dataStore.assignments[index], ...data };
      return dataStore.assignments[index];
    },
    delete: (id) => {
      const index = dataStore.assignments.findIndex((a) => a.id === id);
      if (index === -1) return false;
      dataStore.assignments.splice(index, 1);
      return true;
    },
    addSubmission: (assignmentId, submission) => {
      const assignment = dataStore.assignments.find((a) => a.id === assignmentId);
      if (!assignment) return null;
      submission.id = generateId();
      submission.submittedAt = new Date().toISOString();
      assignment.submissions.push(submission);
      return submission;
    },
  },
  
  // Attendance
  attendance: {
    findAll: () => dataStore.attendance,
    findByStudent: (studentId) => dataStore.attendance.filter((a) => a.studentId === studentId),
    findByClass: (classId) => dataStore.attendance.filter((a) => a.classId === classId),
    findByDate: (date) => dataStore.attendance.filter((a) => a.date === date),
    create: (data) => {
      const attendance = { id: generateId(), ...data, createdAt: new Date().toISOString() };
      dataStore.attendance.push(attendance);
      return attendance;
    },
    bulkCreate: (records) => {
      const created = records.map((record) => ({
        id: generateId(),
        ...record,
        createdAt: new Date().toISOString(),
      }));
      dataStore.attendance.push(...created);
      return created;
    },
    update: (id, data) => {
      const index = dataStore.attendance.findIndex((a) => a.id === id);
      if (index === -1) return null;
      dataStore.attendance[index] = { ...dataStore.attendance[index], ...data };
      return dataStore.attendance[index];
    },
  },
  
  // Grades
  grades: {
    findAll: () => dataStore.grades,
    findById: (id) => dataStore.grades.find((g) => g.id === id),
    findByStudent: (studentId) => dataStore.grades.filter((g) => g.studentId === studentId),
    findByTeacher: (teacherId) => dataStore.grades.filter((g) => g.teacherId === teacherId),
    create: (data) => {
      const grade = { id: generateId(), ...data };
      dataStore.grades.push(grade);
      return grade;
    },
    update: (id, data) => {
      const index = dataStore.grades.findIndex((g) => g.id === id);
      if (index === -1) return null;
      dataStore.grades[index] = { ...dataStore.grades[index], ...data };
      return dataStore.grades[index];
    },
    delete: (id) => {
      const index = dataStore.grades.findIndex((g) => g.id === id);
      if (index === -1) return false;
      dataStore.grades.splice(index, 1);
      return true;
    },
  },
  
  // Timetable
  timetable: {
    findAll: () => dataStore.timetable,
    findByClass: (classId) => dataStore.timetable.filter((t) => t.classId === classId),
    findByTeacher: (teacherId) => dataStore.timetable.filter((t) => t.teacherId === teacherId),
    create: (data) => {
      const entry = { id: generateId(), ...data };
      dataStore.timetable.push(entry);
      return entry;
    },
    update: (id, data) => {
      const index = dataStore.timetable.findIndex((t) => t.id === id);
      if (index === -1) return null;
      dataStore.timetable[index] = { ...dataStore.timetable[index], ...data };
      return dataStore.timetable[index];
    },
    delete: (id) => {
      const index = dataStore.timetable.findIndex((t) => t.id === id);
      if (index === -1) return false;
      dataStore.timetable.splice(index, 1);
      return true;
    },
  },
  
  // Materials
  materials: {
    findAll: () => dataStore.materials,
    findById: (id) => dataStore.materials.find((m) => m.id === id),
    findByClass: (classId) => dataStore.materials.filter((m) => m.classId === classId),
    findByTeacher: (teacherId) => dataStore.materials.filter((m) => m.teacherId === teacherId),
    create: (data) => {
      const material = { id: generateId(), ...data, downloads: 0, createdAt: new Date().toISOString() };
      dataStore.materials.push(material);
      return material;
    },
    update: (id, data) => {
      const index = dataStore.materials.findIndex((m) => m.id === id);
      if (index === -1) return null;
      dataStore.materials[index] = { ...dataStore.materials[index], ...data };
      return dataStore.materials[index];
    },
    delete: (id) => {
      const index = dataStore.materials.findIndex((m) => m.id === id);
      if (index === -1) return false;
      dataStore.materials.splice(index, 1);
      return true;
    },
    incrementDownloads: (id) => {
      const material = dataStore.materials.find((m) => m.id === id);
      if (material) material.downloads++;
      return material;
    },
  },
  
  // Messages
  messages: {
    findAll: () => dataStore.messages,
    findById: (id) => dataStore.messages.find((m) => m.id === id),
    findByUser: (userId) => dataStore.messages.filter((m) => m.senderId === userId || m.receiverId === userId),
    findInbox: (userId) => dataStore.messages.filter((m) => m.receiverId === userId),
    findSent: (userId) => dataStore.messages.filter((m) => m.senderId === userId),
    create: (data) => {
      const message = { id: generateId(), ...data, read: false, createdAt: new Date().toISOString() };
      dataStore.messages.push(message);
      return message;
    },
    markAsRead: (id) => {
      const message = dataStore.messages.find((m) => m.id === id);
      if (message) message.read = true;
      return message;
    },
    delete: (id) => {
      const index = dataStore.messages.findIndex((m) => m.id === id);
      if (index === -1) return false;
      dataStore.messages.splice(index, 1);
      return true;
    },
  },
  
  // Notices
  notices: {
    findAll: () => dataStore.notices,
    findById: (id) => dataStore.notices.find((n) => n.id === id),
    findActive: () => dataStore.notices.filter((n) => new Date(n.expiresAt) > new Date()),
    findByRole: (role) => dataStore.notices.filter((n) => n.targetRoles.includes(role)),
    create: (data) => {
      const notice = { id: generateId(), ...data, publishedAt: new Date().toISOString() };
      dataStore.notices.push(notice);
      return notice;
    },
    update: (id, data) => {
      const index = dataStore.notices.findIndex((n) => n.id === id);
      if (index === -1) return null;
      dataStore.notices[index] = { ...dataStore.notices[index], ...data };
      return dataStore.notices[index];
    },
    delete: (id) => {
      const index = dataStore.notices.findIndex((n) => n.id === id);
      if (index === -1) return false;
      dataStore.notices.splice(index, 1);
      return true;
    },
  },
  
  // Quizzes
  quizzes: {
    findAll: () => dataStore.quizzes,
    findById: (id) => dataStore.quizzes.find((q) => q.id === id),
    findByClass: (classId) => dataStore.quizzes.filter((q) => q.classId === classId),
    findByTeacher: (teacherId) => dataStore.quizzes.filter((q) => q.teacherId === teacherId),
    findActive: () => dataStore.quizzes.filter((q) => q.status === "active" && new Date(q.endDate) > new Date()),
    create: (data) => {
      const quiz = { id: generateId(), ...data, createdAt: new Date().toISOString() };
      dataStore.quizzes.push(quiz);
      return quiz;
    },
    update: (id, data) => {
      const index = dataStore.quizzes.findIndex((q) => q.id === id);
      if (index === -1) return null;
      dataStore.quizzes[index] = { ...dataStore.quizzes[index], ...data };
      return dataStore.quizzes[index];
    },
    delete: (id) => {
      const index = dataStore.quizzes.findIndex((q) => q.id === id);
      if (index === -1) return false;
      dataStore.quizzes.splice(index, 1);
      return true;
    },
  },
  
  // Quiz Attempts
  quizAttempts: {
    findAll: () => dataStore.quizAttempts,
    findByStudent: (studentId) => dataStore.quizAttempts.filter((a) => a.studentId === studentId),
    findByQuiz: (quizId) => dataStore.quizAttempts.filter((a) => a.quizId === quizId),
    findByStudentAndQuiz: (studentId, quizId) => dataStore.quizAttempts.find((a) => a.studentId === studentId && a.quizId === quizId),
    create: (data) => {
      const attempt = { id: generateId(), ...data, completedAt: new Date().toISOString() };
      dataStore.quizAttempts.push(attempt);
      return attempt;
    },
  },
  
  // Tickets
  tickets: {
    findAll: () => dataStore.tickets,
    findById: (id) => dataStore.tickets.find((t) => t.id === id),
    findByUser: (userId) => dataStore.tickets.filter((t) => t.userId === userId),
    findByAssignee: (assigneeId) => dataStore.tickets.filter((t) => t.assignedTo === assigneeId),
    findByStatus: (status) => dataStore.tickets.filter((t) => t.status === status),
    create: (data) => {
      const ticket = { 
        id: generateId(), 
        ...data, 
        messages: [{ id: generateId(), senderId: data.userId, content: data.description, createdAt: new Date().toISOString() }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      dataStore.tickets.push(ticket);
      return ticket;
    },
    update: (id, data) => {
      const index = dataStore.tickets.findIndex((t) => t.id === id);
      if (index === -1) return null;
      dataStore.tickets[index] = { ...dataStore.tickets[index], ...data, updatedAt: new Date().toISOString() };
      return dataStore.tickets[index];
    },
    addMessage: (ticketId, message) => {
      const ticket = dataStore.tickets.find((t) => t.id === ticketId);
      if (!ticket) return null;
      const msg = { id: generateId(), ...message, createdAt: new Date().toISOString() };
      ticket.messages.push(msg);
      ticket.updatedAt = new Date().toISOString();
      return msg;
    },
    delete: (id) => {
      const index = dataStore.tickets.findIndex((t) => t.id === id);
      if (index === -1) return false;
      dataStore.tickets.splice(index, 1);
      return true;
    },
  },
  
  // Settings
  settings: {
    get: () => dataStore.settings,
    update: (data) => {
      dataStore.settings = { ...dataStore.settings, ...data };
      return dataStore.settings;
    },
  },
};
