const mongoose = require('mongoose');

const clubSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  category: { type: String, enum: ['Technical', 'Cultural', 'Lifestyle'], required: true },
  description: { type: String, required: true },
  members: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['Member', 'Junior Executive', 'Core Team', 'Admin'], default: 'Member' }
  }],
  privateChannelsAccess: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Club', clubSchema);
