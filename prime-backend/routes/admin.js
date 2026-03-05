const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Project = require('../models/Project');
const { protect, restrictTo } = require('../middleware/auth');

// All admin routes require authentication AND admin role
router.use(protect, restrictTo('admin'));

// GET /api/admin/users — list all users
router.get('/users', async (req, res, next) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    const formatted = users.map(u => ({
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      role: u.role,
    }));
    res.json(formatted);
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/projects — list all projects (regardless of approvalStatus)
router.get('/projects', async (req, res, next) => {
  try {
    const projects = await Project.find({}).sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/projects/:id/approve — admin approves a project
router.patch('/projects/:id/approve', async (req, res, next) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { approvalStatus: 'approved' },
      { new: true }
    );
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/projects/:id/reject — admin rejects a project
router.patch('/projects/:id/reject', async (req, res, next) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { approvalStatus: 'rejected' },
      { new: true }
    );
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (err) {
    next(err);
  }
});

module.exports = router;