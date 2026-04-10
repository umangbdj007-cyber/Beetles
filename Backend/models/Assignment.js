const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  dueDate: { type: Date, required: true },
  estimatedEffort: { type: Number, default: 2 }, // In hours
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  submissions: [{
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: { type: String },
    submittedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Assignment', assignmentSchema);
