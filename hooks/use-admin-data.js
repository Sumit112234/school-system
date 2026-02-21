import { useFetch } from './use-fetch';

export function useAdminStats() {
  const { data, loading, error, refetch } = useFetch('/api/admin/stats');
  return { stats: data, loading, error, refetch };
}

export function useAdminUsers() {
  console.log("Fetching users with useAdminUsers hook...");
  const { data, loading, error, refetch } = useFetch('/api/admin/users');
  console.log("Fetched users:", { data, loading, error, refetch });
  return { users: data, loading, error, refetch };
}
export function useAdminStudents() {
  console.log("Fetching students with useAdminStudents hook...");
  const { data, loading, error, refetch } = useFetch('/api/admin/users?role=student');
  console.log("Fetched students:", { data, loading, error, refetch });
  return { students: data, loading, error, refetch };
}
export function useAdminTeachers() {
  console.log("Fetching teachers with useAdminTeachers hook...");
  const { data, loading, error, refetch } = useFetch('/api/admin/users?role=teacher');
  console.log("Fetched teachers:", { data, loading, error, refetch });
  return { teachers: data, loading, error, refetch };
}

export function useAdminClasses() {
  const { data, loading, error, refetch } = useFetch('/api/admin/classes');
  return { classes: data, loading, error, refetch };
}

export function useAdminSubjects() {
  const { data, loading, error, refetch } = useFetch('/api/admin/subjects');
  return { subjects: data, loading, error, refetch };
}

export function useAdminNotices() {
  const { data, loading, error, refetch } = useFetch('/api/admin/notices');
  return { notices: data, loading, error, refetch };
}

export function useAdminSettings() {
  const { data, loading, error, refetch } = useFetch('/api/admin/settings');
  return { settings: data, loading, error, refetch };
}

export async function createUser(userData) {
  const response = await fetch('/api/admin/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  return response.json();
}

export async function updateUser(userId, userData) {
  const response = await fetch(`/api/admin/users/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  return response.json();
}

export async function deleteUser(userId) {
  const response = await fetch(`/api/admin/users/${userId}`, {
    method: 'DELETE',
  });
  return response.json();
}
export async function useHelperTickets() {
  const response = await fetch(`/api/admin/tickets`, {
    method: 'GET',
  });
  return response.json();
}
export async function useHelperUsers() {
  const response = await fetch(`/api/admin/users?role=helper`, {
    method: 'GET',
  });
  return response.json();
}

export async function createClass(classData) {
  const response = await fetch('/api/admin/classes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(classData),
  });
  return response.json();
}

export async function updateClass(classId, classData) {
  const response = await fetch(`/api/admin/classes/${classId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(classData),
  });
  return response.json();
}

export async function deleteClass(classId) {
  const response = await fetch(`/api/admin/classes/${classId}`, {
    method: 'DELETE',
  });
  return response.json();
}

export async function createSubject(subjectData) {
  const response = await fetch('/api/admin/subjects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subjectData),
  });
  return response.json();
}

export async function createNotice(noticeData) {
  const response = await fetch('/api/admin/notices', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(noticeData),
  });
  return response.json();
}

export async function updateSettings(settingsData) {
  const response = await fetch('/api/admin/settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settingsData),
  });
  return response.json();
}
