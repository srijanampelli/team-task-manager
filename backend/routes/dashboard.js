const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    // Get all projects the user is part of
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { ownerId: req.user.id },
          { members: { some: { id: req.user.id } } }
        ]
      }
    });

    const projectIds = projects.map(p => p.id);
    const allTasks = await prisma.task.findMany({ where: { projectId: { in: projectIds } } });

    const totalTasks = allTasks.length;
    const tasksByStatus = {
      'To Do': allTasks.filter(t => t.status === 'To Do').length,
      'In Progress': allTasks.filter(t => t.status === 'In Progress').length,
      'Done': allTasks.filter(t => t.status === 'Done').length,
    };

    const now = new Date();
    const overdueTasks = allTasks.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'Done').length;
    const userTasks = allTasks.filter(t => t.assigneeId === req.user.id).length;

    res.json({ totalTasks, tasksByStatus, userTasks, overdueTasks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
