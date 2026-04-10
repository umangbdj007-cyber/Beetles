const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  location: { type: String, required: true },
  approvalStatus: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

// Virtual for timeline status (UPCOMING / ONGOING / COMPLETED)
eventSchema.virtual('status').get(function() {
  const now = new Date();
  if (now < this.startTime) return 'UPCOMING';
  if (now >= this.startTime && now <= this.endTime) return 'ONGOING';
  return 'COMPLETED';
});

// Ensure virtuals are included in JSON/Object conversions
eventSchema.set('toJSON', { virtuals: true });
eventSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Event', eventSchema);
