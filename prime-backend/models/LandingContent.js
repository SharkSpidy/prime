const mongoose = require('mongoose');

// Mirrors the LandingContent TypeScript type exactly
const landingContentSchema = new mongoose.Schema({
  hero: {
    badge: String,
    title: String,
    highlight: String,
    description: String,
  },
  stats: [{ value: String, label: String }],
  features: [{ title: String, description: String }],
  howItWorks: [{ title: String, description: String }],
  cta: { title: String, description: String },
}, { timestamps: true });

module.exports = mongoose.model('LandingContent', landingContentSchema);