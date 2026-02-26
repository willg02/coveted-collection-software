// In production (GitHub Pages) use the deployed Railway URL;
// in dev, Vite proxies /api → localhost:3001
const BASE_URL = (import.meta.env.VITE_API_URL ?? '') + '/api';

function getToken() {
  return localStorage.getItem('cc_token');
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `API error: ${res.status}`);
  }
  return res.json();
}

const api = {
  // Auth
  login: (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  // User
  getUser: () => request('/user/me'),
  getAllUsers: () => request('/user/all'),

  // Announcements
  getAnnouncements: () => request('/announcements'),
  createAnnouncement: (data) => request('/announcements', { method: 'POST', body: JSON.stringify(data) }),
  deleteAnnouncement: (id) => request(`/announcements/${id}`, { method: 'DELETE' }),

  // Messages
  getMessages: () => request('/messages'),
  sendMessage: (data) => request('/messages', { method: 'POST', body: JSON.stringify(data) }),
  markRead: (id) => request(`/messages/${id}/read`, { method: 'PATCH' }),
  deleteMessage: (id) => request(`/messages/${id}`, { method: 'DELETE' }),

  // Leave
  getLeave: () => request('/leave'),
  submitLeave: (data) => request('/leave', { method: 'POST', body: JSON.stringify(data) }),
  reviewLeave: (id, status) => request(`/leave/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  // Time
  getTime: () => request('/time'),
  logTime: (data) => request('/time', { method: 'POST', body: JSON.stringify(data) }),
  clockIn: () => request('/time/clock-in', { method: 'POST' }),
  clockOut: (id) => request(`/time/${id}/clock-out`, { method: 'PATCH' }),
  deleteTime: (id) => request(`/time/${id}`, { method: 'DELETE' }),

  // Tasks
  getTasks: () => request('/tasks'),
  createTask: (data) => request('/tasks', { method: 'POST', body: JSON.stringify(data) }),
  updateTask: (id, data) => request(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteTask: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),

  // Legacy
  getProperties: () => request('/properties'),
  getOrders: () => request('/orders'),
  getBots: () => request('/bots'),
};

export default api;
