const mongoose = require('mongoose');

const CurriculumProgressSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  topics: [{
    id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    status: {
      type: String,
      enum: ['Locked', 'In Progress', 'Completed'],
      default: 'Locked'
    },
    prerequisites: [{ type: String }] // Array of topic ids
  }]
}, { timestamps: true });

module.exports = mongoose.model('CurriculumProgress', CurriculumProgressSchema);
