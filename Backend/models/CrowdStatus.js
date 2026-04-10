const mongoose = require('mongoose');

const crowdStatusSchema = new mongoose.Schema({
  locationId: { type: String, required: true, enum: ['Library', 'Gym', 'Study Hall', 'Canteen', 'Labs'] },
  status: { type: String, enum: ['EMPTY', 'MODERATE', 'CROWDED'], required: true },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  ipAddress: { type: String }, // Used to track anonymous/unauthenticated submissions for rate limiting
  createdAt: { type: Date, default: Date.now, expires: '15m' } // Autodeletes after 15 minutes (TTL index)
});

module.exports = mongoose.model('CrowdStatus', crowdStatusSchema);
