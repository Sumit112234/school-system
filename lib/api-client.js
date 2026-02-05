// API Client for making requests to backend

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

class APIClient {
  constructor() {
    this.baseURL = BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include' // Include cookies
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error(`API Error: ${endpoint}`, error);
      throw error;
    }
  }

  // Auth endpoints
  async login(email, password) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }

  async signup(userData) {
    return this.request('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async logout() {
    return this.request('/api/auth/logout', {
      method: 'POST'
    });
  }

  async getSession() {
    return this.request('/api/auth/session');
  }

  async resetPassword(email) {
    return this.request('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  }

  // Profile endpoints
  async getProfile() {
    return this.request('/api/profile');
  }

  async updateProfile(data) {
    return this.request('/api/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async changePassword(currentPassword, newPassword, confirmPassword) {
    return this.request('/api/profile/password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword, confirmPassword })
    });
  }

  // Upload endpoints
  async uploadFile(file, type = 'image') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    return this.request('/api/upload', {
      method: 'POST',
      headers: {}, // Let browser set Content-Type for FormData
      body: formData
    });
  }

  // Student endpoints
  async getStudentDashboard() {
    return this.request('/api/student/dashboard');
  }

  async getStudentAssignments() {
    return this.request('/api/student/assignments');
  }

  async submitAssignment(assignmentId, data) {
    return this.request(`/api/student/assignments/${assignmentId}/submit`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getStudentAttendance() {
    return this.request('/api/student/attendance');
  }

  async getStudentGrades() {
    return this.request('/api/student/grades');
  }

  async getStudentQuizzes() {
    return this.request('/api/student/quizzes');
  }

  async attemptQuiz(quizId, answers) {
    return this.request(`/api/student/quizzes/${quizId}/attempt`, {
      method: 'POST',
      body: JSON.stringify({ answers })
    });
  }

  async getStudentMaterials() {
    return this.request('/api/student/materials');
  }

  async getStudentTimetable() {
    return this.request('/api/student/timetable');
  }

  async getStudentMessages(recipientId, page = 1) {
    return this.request(
      `/api/student/messages?recipientId=${recipientId}&page=${page}`
    );
  }

  // Teacher endpoints
  async getTeacherDashboard() {
    return this.request('/api/teacher/dashboard');
  }

  async getTeacherClasses() {
    return this.request('/api/teacher/classes');
  }

  async getTeacherStudents() {
    return this.request('/api/teacher/students');
  }

  async markAttendance(data) {
    return this.request('/api/teacher/attendance', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getAttendanceRecords(classId) {
    return this.request(`/api/teacher/attendance?classId=${classId}`);
  }

  async createAssignment(data) {
    return this.request('/api/teacher/assignments', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getTeacherAssignments() {
    return this.request('/api/teacher/assignments');
  }

  async updateAssignment(assignmentId, data) {
    return this.request(`/api/teacher/assignments/${assignmentId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async gradeAssignment(assignmentId, studentId, marks, feedback) {
    return this.request(
      `/api/teacher/assignments/${assignmentId}/grade`,
      {
        method: 'POST',
        body: JSON.stringify({ studentId, marks, feedback })
      }
    );
  }

  async createQuiz(data) {
    return this.request('/api/teacher/quizzes', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getTeacherQuizzes() {
    return this.request('/api/teacher/quizzes');
  }

  async updateQuiz(quizId, data) {
    return this.request(`/api/teacher/quizzes/${quizId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async uploadMaterial(data) {
    return this.request('/api/teacher/materials', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getTeacherMaterials() {
    return this.request('/api/teacher/materials');
  }

  async getTeacherGrades(classId) {
    return this.request(`/api/teacher/grades?classId=${classId}`);
  }

  // Admin endpoints
  async getAdminStats() {
    return this.request('/api/admin/stats');
  }

  async getAllUsers(page = 1, role = null) {
    let url = `/api/admin/users?page=${page}`;
    if (role) url += `&role=${role}`;
    return this.request(url);
  }

  async getUser(userId) {
    return this.request(`/api/admin/users/${userId}`);
  }

  async updateUser(userId, data) {
    return this.request(`/api/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteUser(userId) {
    return this.request(`/api/admin/users/${userId}`, {
      method: 'DELETE'
    });
  }

  async getAdminClasses(page = 1) {
    return this.request(`/api/admin/classes?page=${page}`);
  }

  async createClass(data) {
    return this.request('/api/admin/classes', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateClass(classId, data) {
    return this.request(`/api/admin/classes/${classId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteClass(classId) {
    return this.request(`/api/admin/classes/${classId}`, {
      method: 'DELETE'
    });
  }

  async getAdminSubjects(page = 1) {
    return this.request(`/api/admin/subjects?page=${page}`);
  }

  async createSubject(data) {
    return this.request('/api/admin/subjects', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateSubject(subjectId, data) {
    return this.request(`/api/admin/subjects/${subjectId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteSubject(subjectId) {
    return this.request(`/api/admin/subjects/${subjectId}`, {
      method: 'DELETE'
    });
  }

  async createNotice(data) {
    return this.request('/api/admin/notices', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getAdminNotices(page = 1) {
    return this.request(`/api/admin/notices?page=${page}`);
  }

  async updateNotice(noticeId, data) {
    return this.request(`/api/admin/notices/${noticeId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteNotice(noticeId) {
    return this.request(`/api/admin/notices/${noticeId}`, {
      method: 'DELETE'
    });
  }

  async getAdminSettings() {
    return this.request('/api/admin/settings');
  }

  async updateAdminSettings(data) {
    return this.request('/api/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // Helper endpoints
  async getHelperDashboard() {
    return this.request('/api/helper/dashboard');
  }

  async getHelperTickets(status = null, page = 1) {
    let url = `/api/helper/tickets?page=${page}`;
    if (status) url += `&status=${status}`;
    return this.request(url);
  }

  async getTicket(ticketId) {
    return this.request(`/api/helper/tickets/${ticketId}`);
  }

  async updateTicketStatus(ticketId, status) {
    return this.request('/api/helper/tickets', {
      method: 'PUT',
      body: JSON.stringify({ ticketId, status })
    });
  }

  async replyToTicket(ticketId, message) {
    return this.request(`/api/helper/tickets/${ticketId}/reply`, {
      method: 'POST',
      body: JSON.stringify({ message })
    });
  }

  async getHelperUsers(search = '', role = null, page = 1) {
    let url = `/api/helper/users?page=${page}`;
    if (search) url += `&search=${search}`;
    if (role) url += `&role=${role}`;
    return this.request(url);
  }

  async resetUserPassword(userId, password) {
    return this.request('/api/helper/users', {
      method: 'PUT',
      body: JSON.stringify({ userId, password })
    });
  }

  // Shared endpoints
  async getMessages(recipientId, page = 1) {
    return this.request(
      `/api/messages?recipientId=${recipientId}&page=${page}`
    );
  }

  async sendMessage(recipientId, message) {
    return this.request('/api/messages', {
      method: 'POST',
      body: JSON.stringify({ recipientId, message })
    });
  }

  async getNotices(page = 1) {
    return this.request(`/api/notices?page=${page}`);
  }

  async createNoticeForAll(data) {
    return this.request('/api/notices', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
}

export const apiClient = new APIClient();
