const mongoose = require('mongoose');

const resourceItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['HARDWARE', 'LITERATURE', 'ELECTRONICS', 'MISCELLANEOUS'], 
    default: 'MISCELLANEOUS' 
  },
  description: { type: String, required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['AVAILABLE', 'LENT', 'RESERVED'], default: 'AVAILABLE' }
}, { timestamps: true });

module.exports = mongoose.model('ResourceItem', resourceItemSchema);
