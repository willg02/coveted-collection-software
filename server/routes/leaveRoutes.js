import { Router } from 'express';
import prisma from '../db.js';

const router = Router();

// GET /api/leave
router.get('/', async (req, res) => {
  try {
    const where = req.user.role === 'admin' || req.user.role === 'manager'
      ? {}
      : { userId: req.user.id };

    const items = await prisma.leaveRequest.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, department: true } },
        reviewer: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/leave
router.post('/', async (req, res) => {
  try {
    const { type, startDate, endDate, reason } = req.body;
    if (!type || !startDate || !endDate) {
      return res.status(400).json({ error: 'type, startDate, and endDate are required' });
    }
    const item = await prisma.leaveRequest.create({
      data: { userId: req.user.id, type, startDate, endDate, reason: reason || '' },
      include: { user: { select: { id: true, name: true } } },
    });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/leave/:id  (approve / deny)
router.patch('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'denied'].includes(status)) {
      return res.status(400).json({ error: 'status must be approved or denied' });
    }
    const item = await prisma.leaveRequest.update({
      where: { id: req.params.id },
      data: { status, reviewerId: req.user.id },
      include: {
        user: { select: { id: true, name: true } },
        reviewer: { select: { id: true, name: true } },
      },
    });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
