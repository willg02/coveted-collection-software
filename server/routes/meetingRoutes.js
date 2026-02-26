import { Router } from 'express';
import prisma from '../db.js';

const router = Router();

// GET /api/meetings
router.get('/', async (req, res) => {
  try {
    const meetings = await prisma.meeting.findMany({
      include: { createdBy: { select: { id: true, name: true } } },
      orderBy: { date: 'asc' },
    });
    // Hydrate attendee names
    const allUsers = await prisma.user.findMany({
      select: { id: true, name: true, email: true },
    });
    const userMap = Object.fromEntries(allUsers.map(u => [u.id, u]));
    const result = meetings.map(m => ({
      ...m,
      attendees: (m.attendeeIds || []).map(id => userMap[id]).filter(Boolean),
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/meetings
router.post('/', async (req, res) => {
  try {
    const { title, date, time, videoLink, notes, attendeeIds } = req.body;
    if (!title || !date) return res.status(400).json({ error: 'title and date are required' });

    const meeting = await prisma.meeting.create({
      data: {
        title,
        date,
        time: time || null,
        videoLink: videoLink || '',
        notes: notes || '',
        attendeeIds: attendeeIds || [],
        createdById: req.user.id,
      },
      include: { createdBy: { select: { id: true, name: true } } },
    });
    res.status(201).json(meeting);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/meetings/:id
router.patch('/:id', async (req, res) => {
  try {
    const { title, date, time, videoLink, notes, attendeeIds } = req.body;
    const data = {};
    if (title     !== undefined) data.title      = title;
    if (date      !== undefined) data.date       = date;
    if (time      !== undefined) data.time       = time;
    if (videoLink !== undefined) data.videoLink  = videoLink;
    if (notes     !== undefined) data.notes      = notes;
    if (attendeeIds !== undefined) data.attendeeIds = attendeeIds;

    const meeting = await prisma.meeting.update({
      where: { id: req.params.id },
      data,
      include: { createdBy: { select: { id: true, name: true } } },
    });
    res.json(meeting);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/meetings/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.meeting.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
