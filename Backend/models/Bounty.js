const mongoose = require('mongoose');

const bountySchema = new mongoose.Schema({
  poster: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  acceptor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  topic: { type: String, required: true },
  description: { type: String, required: true },
  reward: { type: Number, required: true, default: 10 },
  sessionTime: { type: Date }, // Proposed time for the session
  deadline: { type: Date, required: true },
  status: { type: String, enum: ['Open', 'Accepted', 'Completed'], default: 'Open' }
}, { timestamps: true });

module.exports = mongoose.model('Bounty', bountySchema);
