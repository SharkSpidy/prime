const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper that automatically includes credentials (cookies) and handles errors
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    credentials: 'include',          // send httpOnly cookie automatically
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || 'Request failed');
  }

  return res.json();
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const api = {
  auth: {
    signup: (data: { name: string; email: string; password: string; role: string }) =>
      request('/auth/signup', { method: 'POST', body: JSON.stringify(data) }),

    login: (data: { email: string; password: string }) =>
      request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),

    logout: () =>
      request('/auth/logout', { method: 'POST' }),

    me: () =>
      request('/auth/me'),
  },

  // ─── Projects ────────────────────────────────────────────────────────────────
  projects: {
    getAll: () => request('/projects'),
    getOne: (id: string) => request(`/projects/${id}`),
    create: (data: any) => request('/projects', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => request(`/projects/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) => request(`/projects/${id}`, { method: 'DELETE' }),
  },

  // ─── Access Requests ─────────────────────────────────────────────────────────
  accessRequests: {
    getAll: () => request('/access-requests'),
    create: (projectId: string) => request('/access-requests', { method: 'POST', body: JSON.stringify({ projectId }) }),
    approve: (id: string) => request(`/access-requests/${id}/approve`, { method: 'PATCH' }),
    reject: (id: string) => request(`/access-requests/${id}/reject`, { method: 'PATCH' }),
  },

  // ─── Admin ───────────────────────────────────────────────────────────────────
  admin: {
    getUsers: () => request('/admin/users'),
    getProjects: () => request('/admin/projects'),
    approveProject: (id: string) => request(`/admin/projects/${id}/approve`, { method: 'PATCH' }),
    rejectProject: (id: string) => request(`/admin/projects/${id}/reject`, { method: 'PATCH' }),
  },

  // ─── Landing ─────────────────────────────────────────────────────────────────
  landing: {
    get: () => request('/landing'),
    update: (data: any) => request('/landing', { method: 'PUT', body: JSON.stringify(data) }),
  },
};