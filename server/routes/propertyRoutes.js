import { Router } from 'express';
import prisma from '../db.js';

const router = Router();

// ── Properties ──

// GET all properties
router.get('/', async (_req, res) => {
  try {
    const properties = await prisma.property.findMany({
      include: {
        orders: true,
        setupTasks: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(properties);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single property
router.get('/:id', async (req, res) => {
  try {
    const property = await prisma.property.findUnique({
      where: { id: req.params.id },
      include: { orders: true, setupTasks: true },
    });
    if (!property) return res.status(404).json({ error: 'Property not found' });
    res.json(property);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create property
router.post('/', async (req, res) => {
  try {
    const { name, address, type, status, units, beds, baths, notes } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    const property = await prisma.property.create({
      data: {
        name,
        address: address || '',
        type: type || 'short-term',
        status: status || 'setup',
        units: units ? parseInt(units) : 1,
        beds: beds !== undefined ? parseInt(beds) : 0,
        baths: baths !== undefined ? parseFloat(baths) : 0,
        notes: notes || '',
      },
    });
    res.status(201).json(property);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH update property
router.patch('/:id', async (req, res) => {
  try {
    const { name, address, type, status, units, beds, baths, notes } = req.body;
    const property = await prisma.property.update({
      where: { id: req.params.id },
      data: {
        ...(name    !== undefined && { name }),
        ...(address !== undefined && { address }),
        ...(type    !== undefined && { type }),
        ...(status  !== undefined && { status }),
        ...(units   !== undefined && { units: parseInt(units) }),
        ...(beds    !== undefined && { beds: parseInt(beds) }),
        ...(baths   !== undefined && { baths: parseFloat(baths) }),
        ...(notes   !== undefined && { notes }),
      },
    });
    res.json(property);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE property
router.delete('/:id', async (req, res) => {
  try {
    await prisma.property.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Orders ──

// POST create order for a property
router.post('/:id/orders', async (req, res) => {
  try {
    const { title, type, vendor, cost, status, notes } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });
    const order = await prisma.propertyOrder.create({
      data: {
        propertyId: req.params.id,
        title,
        type: type || 'furniture',
        vendor: vendor || '',
        cost: cost ? parseFloat(cost) : 0,
        status: status || 'pending',
        notes: notes || '',
      },
    });
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH update order
router.patch('/:id/orders/:orderId', async (req, res) => {
  try {
    const { title, type, vendor, cost, status, notes } = req.body;
    const order = await prisma.propertyOrder.update({
      where: { id: req.params.orderId },
      data: {
        ...(title !== undefined && { title }),
        ...(type !== undefined && { type }),
        ...(vendor !== undefined && { vendor }),
        ...(cost !== undefined && { cost: parseFloat(cost) }),
        ...(status !== undefined && { status }),
        ...(notes !== undefined && { notes }),
      },
    });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE order
router.delete('/:id/orders/:orderId', async (req, res) => {
  try {
    await prisma.propertyOrder.delete({ where: { id: req.params.orderId } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Setup Tasks ──

// POST create setup task
router.post('/:id/tasks', async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });
    const task = await prisma.setupTask.create({
      data: { propertyId: req.params.id, title },
    });
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH toggle setup task
router.patch('/:id/tasks/:taskId', async (req, res) => {
  try {
    const { done } = req.body;
    const task = await prisma.setupTask.update({
      where: { id: req.params.taskId },
      data: { done: Boolean(done) },
    });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE setup task
router.delete('/:id/tasks/:taskId', async (req, res) => {
  try {
    await prisma.setupTask.delete({ where: { id: req.params.taskId } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
