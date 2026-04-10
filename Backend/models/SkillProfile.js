const mongoose = require('mongoose');

const skillProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  teachSkills: [{ type: String }],
  learnSkills: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('SkillProfile', skillProfileSchema);
