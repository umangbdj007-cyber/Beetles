const mongoose = require('mongoose');

const crowdStatusSchema = new mongoose.Schema({
  status: { type: String, enum: ['Empty', 'Moderate', 'Crowded'], required: true },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now, expires: '30m' } // Autodeletes after 30 minutes
});

module.exports = mongoose.model('CrowdStatus', crowdStatusSchema);
