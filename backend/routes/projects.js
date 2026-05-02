const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all projects for a user
router.get('/', auth, async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { ownerId: req.user.id },
          { members: { some: { id: req.user.id } } }
        ]
      },
      include: {
        owner: { select: { name: true, email: true } },
        members: { select: { name: true, email: true } }
      }
    });
    // Maps `id` to `_id` so the frontend logic doesn't break
    res.json(projects.map(p => ({ ...p, _id: p.id, owner: { ...p.owner, _id: p.ownerId } })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single project
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: { select: { id: true, name: true, email: true } }
      }
    });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    
    // Maps `id` to `_id` for frontend compatibility
    res.json({ ...project, _id: project.id, owner: { ...project.owner, _id: project.owner.id }, members: project.members.map(m => ({...m, _id: m.id})) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a project
router.post('/', auth, async (req, res) => {
  try {
    const { name, description } = req.body;
    const project = await prisma.project.create({
      data: {
        name,
        description,
        ownerId: req.user.id,
      }
    });
    
    if (req.user.role !== 'Admin') {
      await prisma.user.update({
        where: { id: req.user.id },
        data: { role: 'Admin' }
      });
    }

    res.status(201).json({ ...project, _id: project.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
