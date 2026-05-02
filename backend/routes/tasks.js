const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get tasks for a project
router.get('/project/:projectId', auth, async (req, res) => {
  try {
    let where = { projectId: req.params.projectId };
    // Members can only view their assigned tasks
    if (req.user.role !== 'Admin') {
      where.assigneeId = req.user.id;
    }
    const tasks = await prisma.task.findMany({
      where,
      include: { assignee: { select: { id: true, name: true, email: true } } }
    });
    res.json(tasks.map(t => ({ ...t, _id: t.id, assignee: t.assignee ? { ...t.assignee, _id: t.assignee.id } : null })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a task (Admin only)
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, dueDate, priority, project, assignee } = req.body;
    const task = await prisma.task.create({
      data: {
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        priority,
        status: 'To Do',
        projectId: project,
        assigneeId: assignee || null
      }
    });
    res.status(201).json({ ...task, _id: task.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a task
router.put('/:id', auth, async (req, res) => {
  try {
    const task = await prisma.task.findUnique({ where: { id: req.params.id } });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    // Members can only update their assigned tasks
    if (req.user.role !== 'Admin' && task.assigneeId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized: Members can only update their assigned tasks.' });
    }

    const { status, title, description, dueDate, priority, assigneeId } = req.body;
    const updated = await prisma.task.update({
      where: { id: req.params.id },
      data: {
        ...(status && { status }),
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
        ...(priority && { priority }),
        ...(assigneeId !== undefined && { assigneeId })
      }
    });
    res.json({ ...updated, _id: updated.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
