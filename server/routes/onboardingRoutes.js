import { Router } from 'express';
import prisma from '../db.js';

const router = Router();

// GET /api/onboarding
// Admin/manager sees all; employee sees own
router.get('/', async (req, res) => {
  try {
    const where = (req.user.role === 'admin' || req.user.role === 'manager')
      ? {}
      : { assigneeId: req.user.id };

    const steps = await prisma.onboardingStep.findMany({
      where,
      include: { assignee: { select: { id: true, name: true } } },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
    res.json(steps);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/onboarding
router.post('/', async (req, res) => {
  try {
    const { title, description, category, sortOrder, assigneeId } = req.body;
    if (!title) return res.status(400).json({ error: 'title is required' });

    const ownerId = (assigneeId && (req.user.role === 'admin' || req.user.role === 'manager'))
      ? assigneeId
      : req.user.id;

    const step = await prisma.onboardingStep.create({
      data: {
        title,
        description: description || '',
        category: category || 'general',
        sortOrder: sortOrder || 0,
        assigneeId: ownerId,
      },
      include: { assignee: { select: { id: true, name: true } } },
    });
    res.status(201).json(step);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/onboarding/:id
router.patch('/:id', async (req, res) => {
  try {
    const { title, description, category, done, sortOrder } = req.body;
    const data = {};
    if (title       !== undefined) data.title       = title;
    if (description !== undefined) data.description = description;
    if (category    !== undefined) data.category    = category;
    if (done        !== undefined) data.done        = done;
    if (sortOrder   !== undefined) data.sortOrder   = sortOrder;

    const step = await prisma.onboardingStep.update({
      where: { id: req.params.id },
      data,
      include: { assignee: { select: { id: true, name: true } } },
    });
    res.json(step);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/onboarding/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.onboardingStep.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
