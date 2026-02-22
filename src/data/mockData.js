/**
 * Mock data that mirrors the entities visible in the Coveted Collection dashboard UI.
 * Replace these with real API calls once the Express backend is wired up.
 */

export const currentUser = {
  id: '1',
  name: 'Will Gibson',
  email: 'will@covetedcollection.com',
};

export const dashboardStats = {
  activeOrders: 2,
  myTasks: 0,
  messages: 0,
  overdue: 0,
};

export const properties = [
  { id: '1', name: 'Property A', orders: [] },
  { id: '2', name: 'Property B', orders: [] },
];

export const orders = [
  { id: '1', propertyId: '1', status: 'active' },
  { id: '2', propertyId: '2', status: 'active' },
];

export const tasks = [];

export const messages = [];

export const bots = [
  { id: '1', name: 'Operations Bot', status: 'ready' },
  { id: '2', name: 'HR Bot', status: 'ready' },
];

export const timeEntries = {
  today: 0,
  thisWeek: 0,
};

export const leaveRequests = [];
