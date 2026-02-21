import { useFetch } from './use-fetch';

export function useTeacherDashboard() {
  const { data, loading, error, refetch } = useFetch('/api/teacher/dashboard');
  return { dashboardData: data, loading, error, refetch };
}

export function useTeacherClasses() {
  const { data, loading, error, refetch } = useFetch('/api/teacher/classes');
  return { classes: data, loading, error, refetch };
}
export function useTeacherTimetable() {
  const { data, loading, error, refetch } = useFetch('/api/teacher/timetable');
  return { timetable: data, loading, error, refetch };
}

export function useTeacherStudents() {
  const { data, loading, error, refetch } = useFetch('/api/teacher/students');
  return { students: data, loading, error, refetch };
}

export function useTeacherAssignments() {
  const { data, loading, error, refetch } = useFetch('/api/teacher/assignments');
  return { assignments: data, loading, error, refetch };
}

export function useTeacherAttendance() {
  const { data, loading, error, refetch } = useFetch('/api/teacher/attendance');
  return { attendance: data, loading, error, refetch };
}

export function useTeacherGrades() {
  const { data, loading, error, refetch } = useFetch('/api/teacher/grades');
  return { grades: data, loading, error, refetch };
}

export function useTeacherQuizzes() {
  const { data, loading, error, refetch } = useFetch('/api/teacher/quizzes');
  return { quizzes: data, loading, error, refetch };
}

export function useTeacherMaterials() {
  const { data, loading, error, refetch } = useFetch('/api/teacher/materials');
  return { materials: data, loading, error, refetch };
}

export async function createAssignment(classId, assignmentData) {
  const response = await fetch('/api/teacher/assignments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...assignmentData, classId }),
  });
  return response.json();
}

export async function gradeAssignment(assignmentId, studentId, grade, feedback) {
  const response = await fetch(`/api/teacher/assignments/${assignmentId}/grade`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentId, grade, feedback }),
  });
  return response.json();
}

export async function markAttendance(classId, date, attendance) {
  const response = await fetch('/api/teacher/attendance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ classId, date, attendance }),
  });
  return response.json();
}

export async function createQuiz(classId, quizData) {
  const response = await fetch('/api/teacher/quizzes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...quizData, classId }),
  });
  return response.json();
}
