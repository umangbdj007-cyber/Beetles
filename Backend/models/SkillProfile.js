const mongoose = require('mongoose');

const skillProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  skills: [
    {
      name: { type: String, required: true },
      level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' }
    }
  ],
  availabilityStatus: { type: String, enum: ['AVAILABLE', 'BUSY'], default: 'AVAILABLE' }
}, { timestamps: true });

module.exports = mongoose.model('SkillProfile', skillProfileSchema);
