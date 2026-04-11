const mongoose = require('mongoose');

const recruitmentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  club: { type: mongoose.Schema.Types.ObjectId, ref: 'Club', required: true },
  roleAppliedFor: { type: String, required: true },
  interviewDate: { type: Date },
  status: { 
    type: String, 
    enum: ['Candidate', 'Interview Scheduled', 'Selected', 'Rejected'], 
    default: 'Candidate' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Recruitment', recruitmentSchema);
