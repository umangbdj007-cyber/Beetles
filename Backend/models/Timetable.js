const mongoose = require('mongoose');

const TimetableSchema = new mongoose.Schema({
  day: {
    type: String,
    required: true,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  },
  time: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  room: {
    type: String,
    required: true
  },
  teacher: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Timetable', TimetableSchema);
