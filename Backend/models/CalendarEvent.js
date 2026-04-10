const mongoose = require('mongoose');

const CalendarEventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  type: {
    type: String,
    enum: ['Exam', 'Assignment', 'Holiday', 'Other'],
    required: true
  },
  description: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('CalendarEvent', CalendarEventSchema);
