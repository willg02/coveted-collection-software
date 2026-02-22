const BASE_URL = '/api';

async function request(path) {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

const api = {
  getUser: () => request('/user/me'),
  getProperties: () => request('/properties'),
  getOrders: () => request('/orders'),
  getTasks: () => request('/tasks'),
  getMessages: () => request('/messages'),
  getTime: () => request('/time'),
  getBots: () => request('/bots'),
  getLeave: () => request('/hr/leave'),
};

export default api;
