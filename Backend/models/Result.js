const mongoose = require('mongoose');

const ResultSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  marks: {
    type: Number,
    required: true
  },
  grade: {
    type: String,
    required: true
  },
  credits: {
    type: Number,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Result', ResultSchema);
