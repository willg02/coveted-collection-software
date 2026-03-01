import { Router } from 'express';
import prisma from '../db.js';

const router = Router();

// GET /api/reports
// Returns aggregated HR statistics — admin/manager only for cross-user data
router.get('/', async (req, res) => {
  try {
    const isPrivileged = req.user.role === 'admin' || req.user.role === 'manager';

    // ── Time entries ──
    const timeEntries = await prisma.timeEntry.findMany({
      where: isPrivileged ? {} : { userId: req.user.id },
      include: { user: { select: { id: true, name: true } } },
    });

    const today    = new Date().toISOString().slice(0, 10);
    const weekStart = (() => {
      const d = new Date();
      d.setDate(d.getDate() - d.getDay());
      return d.toISOString().slice(0, 10);
    })();
    const monthStart = today.slice(0, 7) + '-01';

    const hoursThisWeek  = timeEntries.filter(e => e.date >= weekStart).reduce((s, e) => s + e.hours, 0);
    const hoursThisMonth = timeEntries.filter(e => e.date >= monthStart).reduce((s, e) => s + e.hours, 0);

    // Hours per user this month
    const hoursByUser = {};
    timeEntries.filter(e => e.date >= monthStart).forEach(e => {
      const name = e.user?.name || 'Unknown';
      hoursByUser[name] = (hoursByUser[name] || 0) + e.hours;
    });

    // ── Leave requests ──
    const leave = await prisma.leaveRequest.findMany({
      where: isPrivileged ? {} : { userId: req.user.id },
      include: { user: { select: { id: true, name: true } } },
    });

    const leaveCounts = { pending: 0, approved: 0, denied: 0 };
    leave.forEach(l => { leaveCounts[l.status] = (leaveCounts[l.status] || 0) + 1; });

    const leaveByType = {};
    leave.filter(l => l.status === 'approved').forEach(l => {
      leaveByType[l.type] = (leaveByType[l.type] || 0) + 1;
    });

    // ── Tasks ──
    const tasks = await prisma.task.findMany({
      where: isPrivileged
        ? {}
        : { OR: [{ assigneeId: req.user.id }, { creatorId: req.user.id }] },
    });

    const taskCounts = { todo: 0, 'in-progress': 0, done: 0 };
    tasks.forEach(t => { taskCounts[t.status] = (taskCounts[t.status] || 0) + 1; });

    const tasksByPriority = { high: 0, medium: 0, low: 0 };
    tasks.filter(t => t.status !== 'done').forEach(t => {
      tasksByPriority[t.priority] = (tasksByPriority[t.priority] || 0) + 1;
    });

    const today_str = new Date().toISOString().slice(0, 10);
    const overdueTasks = tasks.filter(t => t.status !== 'done' && t.dueDate && t.dueDate < today_str).length;

    // ── Messages ──
    const unreadMessages = await prisma.message.count({
      where: { receiverId: req.user.id, read: false },
    });

    res.json({
      time: {
        hoursThisWeek: Math.round(hoursThisWeek * 100) / 100,
        hoursThisMonth: Math.round(hoursThisMonth * 100) / 100,
        hoursByUser,
      },
      leave: {
        counts: leaveCounts,
        byType: leaveByType,
        total: leave.length,
      },
      tasks: {
        counts: taskCounts,
        byPriority: tasksByPriority,
        overdue: overdueTasks,
        total: tasks.length,
      },
      messages: { unread: unreadMessages },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reports/dashboard
// Lightweight stat snapshot for the dashboard top cards + feature card metrics
router.get('/dashboard', async (req, res) => {
  try {
    const today     = new Date().toISOString().slice(0, 10);
    const weekStart = (() => {
      const d = new Date();
      d.setDate(d.getDate() - d.getDay());
      return d.toISOString().slice(0, 10);
    })();

    const [
      activeOrders,
      propertyCount,
      myTasks,
      overdueCount,
      unreadMessages,
      pendingLeave,
      todayEntries,
      weekEntries,
    ] = await Promise.all([
      // Orders that haven't been installed/delivered yet
      prisma.propertyOrder.count({
        where: { status: { in: ['pending', 'ordered'] } },
      }),
      prisma.property.count(),
      // My active (non-done) tasks
      prisma.task.count({
        where: { assigneeId: req.user.id, status: { not: 'done' } },
      }),
      // My overdue tasks
      prisma.task.count({
        where: { assigneeId: req.user.id, status: { not: 'done' }, dueDate: { lt: today } },
      }),
      // My unread messages
      prisma.message.count({
        where: { receiverId: req.user.id, read: false },
      }),
      // Pending leave (all if manager/admin, own if employee)
      prisma.leaveRequest.count({
        where: {
          status: 'pending',
          ...(req.user.role === 'admin' || req.user.role === 'manager' ? {} : { userId: req.user.id }),
        },
      }),
      // Hours logged today
      prisma.timeEntry.findMany({
        where: { userId: req.user.id, date: today },
        select: { hours: true },
      }),
      // Hours logged this week
      prisma.timeEntry.findMany({
        where: { userId: req.user.id, date: { gte: weekStart } },
        select: { hours: true },
      }),
    ]);

    const hoursToday    = Math.round(todayEntries.reduce((s, e) => s + e.hours, 0) * 100) / 100;
    const hoursThisWeek = Math.round(weekEntries.reduce((s, e) => s + e.hours, 0) * 100) / 100;

    res.json({
      activeOrders,
      properties: propertyCount,
      myTasks,
      overdue: overdueCount,
      messages: unreadMessages,
      pendingLeave,
      hoursToday,
      hoursThisWeek,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
