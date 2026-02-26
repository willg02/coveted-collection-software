import { Router } from 'express';
import prisma from '../db.js';

const router = Router();

// GET /api/messages
router.get('/', async (req, res) => {
  try {
    const items = await prisma.message.findMany({
      where: {
        OR: [{ senderId: req.user.id }, { receiverId: req.user.id }],
      },
      include: {
        sender: { select: { id: true, name: true } },
        receiver: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/messages
router.post('/', async (req, res) => {
  try {
    const { subject, content, receiverId } = req.body;
    if (!subject || !content || !receiverId) {
      return res.status(400).json({ error: 'subject, content, and receiverId are required' });
    }
    const item = await prisma.message.create({
      data: { subject, content, senderId: req.user.id, receiverId },
      include: {
        sender: { select: { id: true, name: true } },
        receiver: { select: { id: true, name: true } },
      },
    });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/messages/:id/read
router.patch('/:id/read', async (req, res) => {
  try {
    const item = await prisma.message.update({
      where: { id: req.params.id },
      data: { read: true },
    });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/messages/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.message.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
