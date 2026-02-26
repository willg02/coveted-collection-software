import { Router } from 'express';
import prisma from '../db.js';

const router = Router();

// GET /api/time?date=YYYY-MM-DD (or defaults to today)
router.get('/', async (req, res) => {
  try {
    const entries = await prisma.timeEntry.findMany({
      where: { userId: req.user.id },
      orderBy: { date: 'desc' },
    });

    // Calculate today & this week totals
    const today = new Date().toISOString().slice(0, 10);
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekKey = weekStart.toISOString().slice(0, 10);

    const todayHours = entries
      .filter((e) => e.date === today)
      .reduce((sum, e) => sum + e.hours, 0);
    const weekHours = entries
      .filter((e) => e.date >= weekKey)
      .reduce((sum, e) => sum + e.hours, 0);

    res.json({ entries, today: todayHours, thisWeek: weekHours });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/time  (manual entry)
router.post('/', async (req, res) => {
  try {
    const { date, hours, note } = req.body;
    if (!date || hours == null) {
      return res.status(400).json({ error: 'date and hours are required' });
    }
    const entry = await prisma.timeEntry.create({
      data: { userId: req.user.id, date, hours: parseFloat(hours), note: note || '' },
    });
    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/time/clock-in
router.post('/clock-in', async (req, res) => {
  try {
    const now = new Date();
    const date = now.toISOString().slice(0, 10);
    const clockIn = now.toTimeString().slice(0, 5);

    const entry = await prisma.timeEntry.create({
      data: { userId: req.user.id, date, hours: 0, clockIn },
    });
    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/time/:id/clock-out
router.patch('/:id/clock-out', async (req, res) => {
  try {
    const entry = await prisma.timeEntry.findUnique({ where: { id: req.params.id } });
    if (!entry || !entry.clockIn) return res.status(400).json({ error: 'No active clock-in found' });

    const now = new Date();
    const clockOut = now.toTimeString().slice(0, 5);

    // Calculate hours
    const [inH, inM] = entry.clockIn.split(':').map(Number);
    const [outH, outM] = clockOut.split(':').map(Number);
    const hours = Math.round(((outH * 60 + outM) - (inH * 60 + inM)) / 60 * 100) / 100;

    const updated = await prisma.timeEntry.update({
      where: { id: req.params.id },
      data: { clockOut, hours: Math.max(hours, 0) },
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/time/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.timeEntry.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
