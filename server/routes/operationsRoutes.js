import { Router } from 'express';
import prisma from '../db.js';

const router = Router();

// ── SOPs ──

router.get('/sops', async (_req, res) => {
  try {
    const sops = await prisma.sOP.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(sops);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/sops', async (req, res) => {
  try {
    const { title, category, content } = req.body;
    if (!title || !content) return res.status(400).json({ error: 'Title and content are required' });
    const sop = await prisma.sOP.create({
      data: { title, category: category || 'general', content },
    });
    res.status(201).json(sop);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/sops/:id', async (req, res) => {
  try {
    const { title, category, content } = req.body;
    const sop = await prisma.sOP.update({
      where: { id: req.params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(category !== undefined && { category }),
        ...(content !== undefined && { content }),
      },
    });
    res.json(sop);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/sops/:id', async (req, res) => {
  try {
    await prisma.sOP.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Schedule Events ──

router.get('/schedule', async (_req, res) => {
  try {
    const events = await prisma.scheduleEvent.findMany({
      include: { assignee: { select: { id: true, name: true } } },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/schedule', async (req, res) => {
  try {
    const { title, date, startTime, endTime, type, assigneeId, notes } = req.body;
    if (!title || !date) return res.status(400).json({ error: 'Title and date are required' });
    const event = await prisma.scheduleEvent.create({
      data: {
        title,
        date,
        startTime: startTime || null,
        endTime: endTime || null,
        type: type || 'task',
        assigneeId: assigneeId || null,
        notes: notes || '',
      },
      include: { assignee: { select: { id: true, name: true } } },
    });
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/schedule/:id', async (req, res) => {
  try {
    const { title, date, startTime, endTime, type, assigneeId, notes, done } = req.body;
    const event = await prisma.scheduleEvent.update({
      where: { id: req.params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(date !== undefined && { date }),
        ...(startTime !== undefined && { startTime }),
        ...(endTime !== undefined && { endTime }),
        ...(type !== undefined && { type }),
        ...(assigneeId !== undefined && { assigneeId: assigneeId || null }),
        ...(notes !== undefined && { notes }),
        ...(done !== undefined && { done: Boolean(done) }),
      },
      include: { assignee: { select: { id: true, name: true } } },
    });
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/schedule/:id', async (req, res) => {
  try {
    await prisma.scheduleEvent.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
