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

// ── Portfolio (property-level breakdown + timeframe filter) ──

router.get('/portfolio', async (req, res) => {
  try {
    const { start, end } = req.query; // optional YYYY-MM-DD bounds
    const dateFilter = {};
    if (start) dateFilter.gte = start;
    if (end)   dateFilter.lte = end;
    const dateWhere = (start || end) ? { date: dateFilter } : {};

    const [properties, expenses, revenues] = await Promise.all([
      prisma.property.findMany({ orderBy: { name: 'asc' } }),
      prisma.expense.findMany({ where: dateWhere, include: { property: { select: { id: true, name: true } } } }),
      prisma.revenue.findMany({ where: dateWhere, include: { property: { select: { id: true, name: true } } } }),
    ]);

    const totalIncome   = revenues.reduce((s, r) => s + r.amount, 0);
    const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
    const netProfit     = totalIncome - totalExpenses;
    const profitMargin  = totalIncome > 0 ? Math.round((netProfit / totalIncome) * 100) : 0;

    // Per-property breakdown
    const propMap = {};
    for (const p of properties) propMap[p.id] = { id: p.id, name: p.name, income: 0, expenses: 0 };
    for (const r of revenues)  if (r.propertyId && propMap[r.propertyId]) propMap[r.propertyId].income   += r.amount;
    for (const e of expenses)  if (e.propertyId && propMap[e.propertyId]) propMap[e.propertyId].expenses += e.amount;
    const propertyBreakdown = Object.values(propMap).map(p => ({
      ...p,
      netProfit: p.income - p.expenses,
    }));

    // Expense breakdown by category
    const expByCategory = {};
    for (const e of expenses) expByCategory[e.category] = (expByCategory[e.category] || 0) + e.amount;

    // Revenue breakdown by category
    const revByCategory = {};
    for (const r of revenues) revByCategory[r.category] = (revByCategory[r.category] || 0) + r.amount;

    // Monthly trend (last 12 months)
    const monthlyMap = {};
    for (const r of revenues) {
      const m = r.date.slice(0, 7);
      if (!monthlyMap[m]) monthlyMap[m] = { month: m, income: 0, expenses: 0 };
      monthlyMap[m].income += r.amount;
    }
    for (const e of expenses) {
      const m = e.date.slice(0, 7);
      if (!monthlyMap[m]) monthlyMap[m] = { month: m, income: 0, expenses: 0 };
      monthlyMap[m].expenses += e.amount;
    }
    const monthly = Object.values(monthlyMap).sort((a, b) => a.month.localeCompare(b.month));

    res.json({
      totalIncome,
      totalExpenses,
      netProfit,
      profitMargin,
      propertyBreakdown,
      expByCategory,
      revByCategory,
      monthly,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Employee Performance (for Custom Reports) ──

router.get('/employee-performance', async (req, res) => {
  try {
    const { start, end } = req.query;
    const dateFilter = {};
    if (start) dateFilter.gte = start;
    if (end)   dateFilter.lte = end;

    const users = await prisma.user.findMany({ select: { id: true, name: true } });
    const tasks = await prisma.task.findMany({
      where: (start || end) ? { createdAt: dateFilter } : {},
      select: { assigneeId: true, status: true },
    });

    const perf = users.map(u => {
      const userTasks = tasks.filter(t => t.assigneeId === u.id);
      const total     = userTasks.length;
      const completed = userTasks.filter(t => t.status === 'done').length;
      const rate      = total > 0 ? Math.round((completed / total) * 100) : 0;
      return { id: u.id, name: u.name, totalJobs: total, completed, completionRate: rate, avgRating: 0, reviews: 0 };
    }).filter(u => u.totalJobs > 0);

    res.json(perf);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
