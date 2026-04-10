const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['Pending', 'In Progress', 'Resolved'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('Complaint', complaintSchema);
