import { Router } from 'express';
import prisma from '../db.js';

const router = Router();

// GET all leads
router.get('/', async (_req, res) => {
  try {
    const leads = await prisma.lead.findMany({
      include: { assignee: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(leads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create lead
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, source, stage, value, notes, assigneeId } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    const lead = await prisma.lead.create({
      data: {
        name,
        email: email || '',
        phone: phone || '',
        source: source || 'direct',
        stage: stage || 'new',
        value: value ? parseFloat(value) : 0,
        notes: notes || '',
        assigneeId: assigneeId || null,
      },
      include: { assignee: { select: { id: true, name: true } } },
    });
    res.status(201).json(lead);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH update lead (including stage changes)
router.patch('/:id', async (req, res) => {
  try {
    const { name, email, phone, source, stage, value, notes, assigneeId } = req.body;
    const lead = await prisma.lead.update({
      where: { id: req.params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone }),
        ...(source !== undefined && { source }),
        ...(stage !== undefined && { stage }),
        ...(value !== undefined && { value: parseFloat(value) }),
        ...(notes !== undefined && { notes }),
        ...(assigneeId !== undefined && { assigneeId: assigneeId || null }),
      },
      include: { assignee: { select: { id: true, name: true } } },
    });
    res.json(lead);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE lead
router.delete('/:id', async (req, res) => {
  try {
    await prisma.lead.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
