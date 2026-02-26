import { Router } from 'express';
import prisma from '../db.js';

const router = Router();

// GET /api/announcements
router.get('/', async (_req, res) => {
  try {
    const items = await prisma.announcement.findMany({
      include: { author: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/announcements
router.post('/', async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) return res.status(400).json({ error: 'title and content are required' });

    const item = await prisma.announcement.create({
      data: { title, content, authorId: req.user.id },
      include: { author: { select: { id: true, name: true } } },
    });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/announcements/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.announcement.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
