const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  description: { type: String },
  deadline: { type: Date, required: true },
  difficultyLevel: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  submissions: [{
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: { type: String },
    submittedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Assignment', assignmentSchema);
