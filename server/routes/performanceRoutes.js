import { Router } from 'express';
import prisma from '../db.js';

const router = Router();

// GET /api/performance
// Admin/manager sees all; employee sees own
router.get('/', async (req, res) => {
  try {
    const where = (req.user.role === 'admin' || req.user.role === 'manager')
      ? {}
      : { userId: req.user.id };

    const goals = await prisma.performanceGoal.findMany({
      where,
      include: { user: { select: { id: true, name: true, department: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(goals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/performance
router.post('/', async (req, res) => {
  try {
    const { title, description, category, targetDate, userId } = req.body;
    if (!title) return res.status(400).json({ error: 'title is required' });

    // Admins/managers can set goals for others; employees only for themselves
    const ownerId = (userId && (req.user.role === 'admin' || req.user.role === 'manager'))
      ? userId
      : req.user.id;

    const goal = await prisma.performanceGoal.create({
      data: {
        title,
        description: description || '',
        category: category || 'work',
        targetDate: targetDate || null,
        userId: ownerId,
      },
      include: { user: { select: { id: true, name: true } } },
    });
    res.status(201).json(goal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/performance/:id
router.patch('/:id', async (req, res) => {
  try {
    const { title, description, category, status, progress, targetDate } = req.body;
    const data = {};
    if (title       !== undefined) data.title       = title;
    if (description !== undefined) data.description = description;
    if (category    !== undefined) data.category    = category;
    if (status      !== undefined) data.status      = status;
    if (progress    !== undefined) data.progress    = parseInt(progress, 10);
    if (targetDate  !== undefined) data.targetDate  = targetDate;

    const goal = await prisma.performanceGoal.update({
      where: { id: req.params.id },
      data,
      include: { user: { select: { id: true, name: true } } },
    });
    res.json(goal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/performance/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.performanceGoal.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
