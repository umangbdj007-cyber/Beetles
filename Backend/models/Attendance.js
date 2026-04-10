const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  totalClasses: { type: Number, required: true, default: 0 },
  attendedClasses: { type: Number, required: true, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
