const express = require('express');
const router = express.Router();
const LandingContent = require('../models/LandingContent');
const { protect, restrictTo } = require('../middleware/auth');

// GET /api/landing — public, no auth required
router.get('/', async (req, res, next) => {
  try {
    // Always returns the single document; seed it if it doesn't exist
    let content = await LandingContent.findOne();
    if (!content) {
      content = await LandingContent.create(defaultContent);
    }
    res.json(content);
  } catch (err) {
    next(err);
  }
});

// PUT /api/landing — admin only
router.put('/', protect, restrictTo('admin'), async (req, res, next) => {
  try {
    const { hero, stats, features, howItWorks, cta } = req.body;

    let content = await LandingContent.findOne();
    if (!content) {
      content = new LandingContent({});
    }

    if (hero) content.hero = hero;
    if (stats) content.stats = stats;
    if (features) content.features = features;
    if (howItWorks) content.howItWorks = howItWorks;
    if (cta) content.cta = cta;

    await content.save();
    res.json(content);
  } catch (err) {
    next(err);
  }
});

// Default landing content (mirrors your landingContent.ts)
const defaultContent = {
  hero: {
    badge: 'Academic Project Platform',
    title: 'Where Student Innovation Meets',
    highlight: 'Academic Excellence',
    description: 'PRIME is a college-first platform for hosting, showcasing, and collaborating on academic projects — bridging students, faculty, and opportunities.',
  },
  stats: [
    { value: '500+', label: 'Projects Hosted' },
    { value: '1,200+', label: 'Students' },
    { value: '80+', label: 'Faculty Members' },
    { value: '25+', label: 'Domains' },
  ],
  features: [
    { title: 'Host Projects', description: 'Students can showcase their academic projects with detailed documentation.' },
    { title: 'Collaborate Seamlessly', description: 'Faculty and students work together through integrated discussion and review features.' },
    { title: 'Access Control', description: 'Private by default with a request-approve workflow ensuring project privacy.' },
    { title: 'Real-time Updates', description: 'Track project timelines, commits, and discussions in one workspace.' },
  ],
  howItWorks: [
    { title: 'Create Your Project', description: 'Upload your project details, code, and documentation.' },
    { title: 'Invite Collaborators', description: 'Add team members and manage who can view your work.' },
    { title: 'Get Recognized', description: 'Faculty review and approve exceptional projects for visibility.' },
  ],
  cta: {
    title: 'Ready to Showcase Your Work?',
    description: 'Join thousands of students and faculty already using PRIME.',
  },
};

module.exports = router;