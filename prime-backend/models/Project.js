const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  contribution: { type: String, required: true },
}, { _id: false });

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  abstract: { type: String, required: true },
  domains: [{ type: String }],
  year: { type: String, required: true },
  license: { type: String, required: true },
  techStack: [{ type: String }],
  status: {
    type: String,
    enum: ['public', 'locked', 'approved'],
    default: 'locked',
  },
  owner: { type: String, required: true },          // display name (denormalized)
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  teamMembers: [teamMemberSchema],
  approvedFacultyIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
}, { timestamps: true });

// Map Mongoose _id to id for frontend compatibility
projectSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    ret.ownerId = ret.ownerId.toString();
    ret.approvedFacultyIds = (ret.approvedFacultyIds || []).map(id => id.toString());
    ret.createdAt = ret.createdAt?.toISOString();
    ret.lastUpdated = ret.updatedAt?.toISOString();
    delete ret._id;
    delete ret.__v;
    delete ret.updatedAt;
    return ret;
  },
});

module.exports = mongoose.model('Project', projectSchema);