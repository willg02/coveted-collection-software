import { Router } from 'express';
import prisma from '../db.js';

const router = Router();

// GET /api/tasks
router.get('/', async (req, res) => {
  try {
    const items = await prisma.task.findMany({
      where: {
        OR: [{ assigneeId: req.user.id }, { creatorId: req.user.id }],
      },
      include: {
        assignee: { select: { id: true, name: true } },
        creator: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/tasks
router.post('/', async (req, res) => {
  try {
    const { title, description, priority, dueDate, assigneeId } = req.body;
    if (!title) return res.status(400).json({ error: 'title is required' });

    const item = await prisma.task.create({
      data: {
        title,
        description: description || '',
        priority: priority || 'medium',
        dueDate: dueDate || null,
        assigneeId: assigneeId || req.user.id,
        creatorId: req.user.id,
      },
      include: {
        assignee: { select: { id: true, name: true } },
        creator: { select: { id: true, name: true } },
      },
    });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/tasks/:id
router.patch('/:id', async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, assigneeId } = req.body;
    const data = {};
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (status !== undefined) data.status = status;
    if (priority !== undefined) data.priority = priority;
    if (dueDate !== undefined) data.dueDate = dueDate;
    if (assigneeId !== undefined) data.assigneeId = assigneeId;

    const item = await prisma.task.update({
      where: { id: req.params.id },
      data,
      include: {
        assignee: { select: { id: true, name: true } },
        creator: { select: { id: true, name: true } },
      },
    });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.task.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
