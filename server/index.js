import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import prisma from './db.js';
import { authMiddleware } from './auth.js';

import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import announcementRoutes from './routes/announcementRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import leaveRoutes from './routes/leaveRoutes.js';
import timeRoutes from './routes/timeRoutes.js';
import taskRoutes from './routes/taskRoutes.js';

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = [
  'http://localhost:5173',
  'https://willg02.github.io',
];
app.use(cors({
  origin: (origin, cb) => {
    // allow server-to-server requests (no origin) and listed origins
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json());

// ──────────────────────────────────────
// Public routes
// ──────────────────────────────────────
app.use('/api/auth', authRoutes);

// ──────────────────────────────────────
// Protected routes (require JWT)
// ──────────────────────────────────────
app.use('/api/user', authMiddleware, userRoutes);
app.use('/api/announcements', authMiddleware, announcementRoutes);
app.use('/api/messages', authMiddleware, messageRoutes);
app.use('/api/leave', authMiddleware, leaveRoutes);
app.use('/api/time', authMiddleware, timeRoutes);
app.use('/api/tasks', authMiddleware, taskRoutes);

// ──────────────────────────────────────
// Legacy mock endpoints (dashboard cards)
// ──────────────────────────────────────
const properties = [
  { id: '1', name: 'Property A', orders: ['1'] },
  { id: '2', name: 'Property B', orders: ['2'] },
];
const orders = [
  { id: '1', propertyId: '1', status: 'active' },
  { id: '2', propertyId: '2', status: 'active' },
];
const bots = [
  { id: '1', name: 'Operations Bot', status: 'ready' },
  { id: '2', name: 'HR Bot', status: 'ready' },
];

app.get('/api/properties', (_req, res) => res.json(properties));
app.get('/api/orders', (_req, res) => res.json(orders));
app.get('/api/bots', (_req, res) => res.json(bots));

// ──────────────────────────────────────
// Seed default admin on first run
// ──────────────────────────────────────
async function seedDefault() {
  const count = await prisma.user.count();
  if (count === 0) {
    const hashed = await bcrypt.hash('admin123', 10);
    await prisma.user.create({
      data: { name: 'Will Gibson', email: 'will@covetedcollection.com', password: hashed, role: 'admin' },
    });
    console.log('Seeded default admin: will@covetedcollection.com / admin123');
  }
}

// ──────────────────────────────────────
// Start
// ──────────────────────────────────────

seedDefault().then(() => {
  app.listen(PORT, () => {
    console.log(`Coveted Collection API running on http://localhost:${PORT}`);
  });
});
