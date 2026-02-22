import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ──────────────────────────────────────
// Mock data (replace with Prisma / DB)
// ──────────────────────────────────────

const users = [
  { id: '1', name: 'Will Gibson', email: 'will@covetedcollection.com' },
];

const properties = [
  { id: '1', name: 'Property A', orders: ['1'] },
  { id: '2', name: 'Property B', orders: ['2'] },
];

const orders = [
  { id: '1', propertyId: '1', status: 'active' },
  { id: '2', propertyId: '2', status: 'active' },
];

const tasks = [];

const messages = [];

const timeEntries = []; // { id, userId, hours, date }

const bots = [
  { id: '1', name: 'Operations Bot', status: 'ready' },
  { id: '2', name: 'HR Bot', status: 'ready' },
];

const leaveRequests = [];

// ──────────────────────────────────────
// Routes
// ──────────────────────────────────────

// GET /api/user/me
app.get('/api/user/me', (_req, res) => {
  res.json(users[0]);
});

// GET /api/properties
app.get('/api/properties', (_req, res) => {
  res.json(properties);
});

// GET /api/orders
app.get('/api/orders', (_req, res) => {
  res.json(orders);
});

// GET /api/tasks
app.get('/api/tasks', (_req, res) => {
  res.json(tasks);
});

// GET /api/messages
app.get('/api/messages', (_req, res) => {
  res.json(messages);
});

// GET /api/time
app.get('/api/time', (_req, res) => {
  // Aggregate hours for current user
  const today = new Date().toISOString().slice(0, 10);
  const todayHours = timeEntries
    .filter((e) => e.date === today)
    .reduce((sum, e) => sum + e.hours, 0);

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekKey = weekStart.toISOString().slice(0, 10);
  const weekHours = timeEntries
    .filter((e) => e.date >= weekKey)
    .reduce((sum, e) => sum + e.hours, 0);

  res.json({ today: todayHours, thisWeek: weekHours });
});

// GET /api/bots
app.get('/api/bots', (_req, res) => {
  res.json(bots);
});

// GET /api/hr/leave
app.get('/api/hr/leave', (_req, res) => {
  res.json(leaveRequests);
});

// ──────────────────────────────────────
// Start
// ──────────────────────────────────────

app.listen(PORT, () => {
  console.log(`Coveted Collection API running on http://localhost:${PORT}`);
});
