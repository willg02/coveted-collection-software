import { Router } from 'express';
import prisma from '../db.js';

const router = Router();

// ── Expenses ──

router.get('/expenses', async (_req, res) => {
  try {
    const expenses = await prisma.expense.findMany({
      include: {
        submittedBy: { select: { id: true, name: true } },
        property: { select: { id: true, name: true } },
      },
      orderBy: { date: 'desc' },
    });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/expenses', async (req, res) => {
  try {
    const { title, amount, category, date, propertyId, notes } = req.body;
    if (!title || !amount || !date) return res.status(400).json({ error: 'Title, amount, and date are required' });
    const expense = await prisma.expense.create({
      data: {
        title,
        amount: parseFloat(amount),
        category: category || 'other',
        date,
        propertyId: propertyId || null,
        notes: notes || '',
        submittedById: req.user.id,
      },
      include: {
        submittedBy: { select: { id: true, name: true } },
        property: { select: { id: true, name: true } },
      },
    });
    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/expenses/:id', async (req, res) => {
  try {
    await prisma.expense.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Revenue ──

router.get('/revenue', async (_req, res) => {
  try {
    const revenues = await prisma.revenue.findMany({
      include: { property: { select: { id: true, name: true } } },
      orderBy: { date: 'desc' },
    });
    res.json(revenues);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/revenue', async (req, res) => {
  try {
    const { title, amount, category, date, propertyId, notes } = req.body;
    if (!title || !amount || !date) return res.status(400).json({ error: 'Title, amount, and date are required' });
    const revenue = await prisma.revenue.create({
      data: {
        title,
        amount: parseFloat(amount),
        category: category || 'booking',
        date,
        propertyId: propertyId || null,
        notes: notes || '',
      },
      include: { property: { select: { id: true, name: true } } },
    });
    res.status(201).json(revenue);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/revenue/:id', async (req, res) => {
  try {
    await prisma.revenue.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Summary ──

router.get('/summary', async (_req, res) => {
  try {
    const [expenses, revenues] = await Promise.all([
      prisma.expense.findMany(),
      prisma.revenue.findMany(),
    ]);
    const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
    const totalRevenue = revenues.reduce((s, r) => s + r.amount, 0);
    res.json({
      totalExpenses,
      totalRevenue,
      netIncome: totalRevenue - totalExpenses,
      expenseCount: expenses.length,
      revenueCount: revenues.length,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
