import { useFetch } from './use-fetch';

export function useStudentDashboard() {
  const { data, loading, error, refetch } = useFetch('/api/student/dashboard');
  return { dashboardData: data, loading, error, refetch };
}

export function useStudentAssignments() {
  const { data, loading, error, refetch } = useFetch('/api/student/assignments');
  return { assignments: data, loading, error, refetch };
}

export function useStudentAttendance() {
  const { data, loading, error, refetch } = useFetch('/api/student/attendance');
  return { attendance: data, loading, error, refetch };
}

export function useStudentGrades() {
  const { data, loading, error, refetch } = useFetch('/api/student/grades');
  return { grades: data, loading, error, refetch };
}

export function useStudentQuizzes() {
  const { data, loading, error, refetch } = useFetch('/api/student/quizzes');
  return { quizzes: data, loading, error, refetch };
}

export function useStudentMaterials() {
  const { data, loading, error, refetch } = useFetch('/api/student/materials');
  return { materials: data, loading, error, refetch };
}

export function useStudentTimetable() {
  const { data, loading, error, refetch } = useFetch('/api/student/timetable');
  return { timetable: data, loading, error, refetch };
}

export function useStudentMessages() {
  const { data, loading, error, refetch } = useFetch('/api/student/messages');
  return { messages: data, loading, error, refetch };
}
export function useStudentClasses() {
  const { data, loading, error, refetch } = useFetch('/api/student/classes');
  return { classes: data, loading, error, refetch };
}

export async function submitAssignment(assignmentId, submissionData) {
  const response = await fetch(`/api/student/assignments/${assignmentId}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(submissionData),
  });
  return response.json();
}

export async function attemptQuiz(quizId, answers) {
  const response = await fetch(`/api/student/quizzes/${quizId}/attempt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers }),
  });
  return response.json();
}
