const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const { protect, restrictTo } = require('../middleware/auth');

// GET /api/projects — all approved projects (public dashboard feed)
router.get('/', protect, async (req, res, next) => {
  try {
    // Show only admin-approved projects in the main feed
    // Students/faculty see all approved; admin sees everything
    const filter = req.user.role === 'admin' ? {} : { approvalStatus: 'approved' };
    const projects = await Project.find(filter).sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    next(err);
  }
});

// POST /api/projects — create project (students only)
router.post('/', protect, restrictTo('student'), async (req, res, next) => {
  try {
    const {
      title, abstract, domains, year, license,
      techStack, teamMembers,
    } = req.body;

    const project = await Project.create({
      title,
      abstract,
      domains,
      year,
      license,
      techStack,
      teamMembers,
      status: 'locked',
      owner: req.user.name,
      ownerId: req.user._id,
      approvalStatus: 'pending',
    });

    res.status(201).json(project);
  } catch (err) {
    next(err);
  }
});

// GET /api/projects/:id — single project detail
router.get('/:id', protect, async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/projects/:id — update project (owner only)
router.patch('/:id', protect, restrictTo('student'), async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (project.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not your project' });
    }

    const allowed = ['title', 'abstract', 'domains', 'year', 'license', 'techStack', 'teamMembers', 'status'];
    allowed.forEach(field => {
      if (req.body[field] !== undefined) project[field] = req.body[field];
    });

    await project.save();
    res.json(project);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/projects/:id — delete project (owner or admin)
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const isOwner = project.ownerId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await project.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;