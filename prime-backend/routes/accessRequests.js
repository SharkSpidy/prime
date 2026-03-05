const express = require('express');
const router = express.Router();
const AccessRequest = require('../models/AccessRequest');
const Project = require('../models/Project');
const { protect, restrictTo } = require('../middleware/auth');

// GET /api/access-requests — get requests relevant to the logged-in user
// Students see requests on THEIR projects; faculty see their OWN requests
router.get('/', protect, async (req, res, next) => {
  try {
    let requests;

    if (req.user.role === 'student') {
      // Find all projects owned by this student
      const myProjects = await Project.find({ ownerId: req.user._id }).select('_id');
      const myProjectIds = myProjects.map(p => p._id);
      requests = await AccessRequest.find({ projectId: { $in: myProjectIds } });
    } else if (req.user.role === 'faculty') {
      requests = await AccessRequest.find({ facultyId: req.user._id });
    } else {
      // Admin sees everything
      requests = await AccessRequest.find({});
    }

    res.json(requests);
  } catch (err) {
    next(err);
  }
});

// POST /api/access-requests — faculty requests access to a project
router.post('/', protect, restrictTo('faculty'), async (req, res, next) => {
  try {
    const { projectId } = req.body;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Prevent duplicate pending requests
    const existing = await AccessRequest.findOne({
      projectId,
      facultyId: req.user._id,
      status: 'pending',
    });
    if (existing) {
      return res.status(409).json({ message: 'Request already pending' });
    }

    const request = await AccessRequest.create({
      projectId,
      facultyId: req.user._id,
      facultyName: req.user.name,
      status: 'pending',
    });

    res.status(201).json(request);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/access-requests/:id/approve — student approves a request
router.patch('/:id/approve', protect, restrictTo('student'), async (req, res, next) => {
  try {
    const request = await AccessRequest.findById(req.params.id).populate('projectId');
    if (!request) return res.status(404).json({ message: 'Request not found' });

    // Verify the student owns the project
    if (request.projectId.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not your project' });
    }

    request.status = 'approved';
    await request.save();

    // Add faculty to the project's approvedFacultyIds
    await Project.findByIdAndUpdate(request.projectId._id, {
      $addToSet: { approvedFacultyIds: request.facultyId },
    });

    res.json(request);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/access-requests/:id/reject — student rejects a request
router.patch('/:id/reject', protect, restrictTo('student'), async (req, res, next) => {
  try {
    const request = await AccessRequest.findById(req.params.id).populate('projectId');
    if (!request) return res.status(404).json({ message: 'Request not found' });

    if (request.projectId.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not your project' });
    }

    request.status = 'rejected';
    await request.save();

    res.json(request);
  } catch (err) {
    next(err);
  }
});

module.exports = router;