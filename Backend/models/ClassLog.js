const mongoose = require('mongoose');

const classLogSchema = new mongoose.Schema({
  topic: { type: String, required: true },
  date: { type: Date, required: true },
  duration: { type: Number, required: true }, // in minutes
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  attendanceCount: { type: Number, default: 0 },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('ClassLog', classLogSchema);
