const mongoose = require('mongoose');

const mentorshipRequestSchema = new mongoose.Schema({
  requesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  skillRequired: { type: String, required: true },
  duration: { type: Number, required: true }, // in minutes
  preferredTime: { type: Date, required: true },
  status: { type: String, enum: ['PENDING', 'ACCEPTED', 'COMPLETED'], default: 'PENDING' }
}, { timestamps: true });

module.exports = mongoose.model('MentorshipRequest', mentorshipRequestSchema);
