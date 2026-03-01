// VITE_API_URL is set in .env.production (Railway URL) and empty in dev (uses Vite proxy)
const BASE_URL = (import.meta.env.VITE_API_URL || '') + '/api';

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
  changePassword: (data) => request('/user/password', { method: 'PATCH', body: JSON.stringify(data) }),
  inviteUser: (data) => request('/user/invite', { method: 'POST', body: JSON.stringify(data) }),
  deleteUser: (id) => request(`/user/${id}`, { method: 'DELETE' }),

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

  // Properties
  getPropertiesV2: () => request('/properties-v2'),
  createProperty: (data) => request('/properties-v2', { method: 'POST', body: JSON.stringify(data) }),
  updateProperty: (id, data) => request(`/properties-v2/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteProperty: (id) => request(`/properties-v2/${id}`, { method: 'DELETE' }),
  createPropertyOrder: (propId, data) => request(`/properties-v2/${propId}/orders`, { method: 'POST', body: JSON.stringify(data) }),
  updatePropertyOrder: (propId, ordId, data) => request(`/properties-v2/${propId}/orders/${ordId}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deletePropertyOrder: (propId, ordId) => request(`/properties-v2/${propId}/orders/${ordId}`, { method: 'DELETE' }),
  createSetupTask: (propId, data) => request(`/properties-v2/${propId}/tasks`, { method: 'POST', body: JSON.stringify(data) }),
  updateSetupTask: (propId, taskId, data) => request(`/properties-v2/${propId}/tasks/${taskId}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteSetupTask: (propId, taskId) => request(`/properties-v2/${propId}/tasks/${taskId}`, { method: 'DELETE' }),

  // Operations
  getSOPs: () => request('/operations/sops'),
  createSOP: (data) => request('/operations/sops', { method: 'POST', body: JSON.stringify(data) }),
  updateSOP: (id, data) => request(`/operations/sops/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteSOP: (id) => request(`/operations/sops/${id}`, { method: 'DELETE' }),
  getSchedule: () => request('/operations/schedule'),
  createScheduleEvent: (data) => request('/operations/schedule', { method: 'POST', body: JSON.stringify(data) }),
  updateScheduleEvent: (id, data) => request(`/operations/schedule/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteScheduleEvent: (id) => request(`/operations/schedule/${id}`, { method: 'DELETE' }),

  // Sales / CRM
  getLeads: () => request('/leads'),
  createLead: (data) => request('/leads', { method: 'POST', body: JSON.stringify(data) }),
  updateLead: (id, data) => request(`/leads/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteLead: (id) => request(`/leads/${id}`, { method: 'DELETE' }),

  // Properties (for sales analysis property picker)
  // getPropertiesV2 already defined above

  // Financials
  getExpenses: () => request('/financials/expenses'),
  createExpense: (data) => request('/financials/expenses', { method: 'POST', body: JSON.stringify(data) }),
  deleteExpense: (id) => request(`/financials/expenses/${id}`, { method: 'DELETE' }),
  getRevenue: () => request('/financials/revenue'),
  createRevenue: (data) => request('/financials/revenue', { method: 'POST', body: JSON.stringify(data) }),
  deleteRevenue: (id) => request(`/financials/revenue/${id}`, { method: 'DELETE' }),
  getFinancialSummary: () => request('/financials/summary'),
  getPortfolio: (start, end) => {
    const params = new URLSearchParams();
    if (start) params.set('start', start);
    if (end)   params.set('end', end);
    const qs = params.toString();
    return request(`/financials/portfolio${qs ? '?' + qs : ''}`);
  },
  getEmployeePerformance: (start, end) => {
    const params = new URLSearchParams();
    if (start) params.set('start', start);
    if (end)   params.set('end', end);
    const qs = params.toString();
    return request(`/financials/employee-performance${qs ? '?' + qs : ''}`);
  },

  // Meetings
  getMeetings: () => request('/meetings'),
  createMeeting: (data) => request('/meetings', { method: 'POST', body: JSON.stringify(data) }),
  updateMeeting: (id, data) => request(`/meetings/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteMeeting: (id) => request(`/meetings/${id}`, { method: 'DELETE' }),

  // Performance Goals
  getPerformanceGoals: () => request('/performance'),
  createPerformanceGoal: (data) => request('/performance', { method: 'POST', body: JSON.stringify(data) }),
  updatePerformanceGoal: (id, data) => request(`/performance/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deletePerformanceGoal: (id) => request(`/performance/${id}`, { method: 'DELETE' }),

  // Onboarding
  getOnboardingSteps: () => request('/onboarding'),
  createOnboardingStep: (data) => request('/onboarding', { method: 'POST', body: JSON.stringify(data) }),
  updateOnboardingStep: (id, data) => request(`/onboarding/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteOnboardingStep: (id) => request(`/onboarding/${id}`, { method: 'DELETE' }),

  // Reports
  getReports: () => request('/reports'),
  getDashboardStats: () => request('/reports/dashboard'),

  // Legacy
  getProperties: () => request('/properties'),
  getOrders: () => request('/orders'),
  getBots: () => request('/bots'),
};

export default api;
