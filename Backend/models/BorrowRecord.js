const mongoose = require('mongoose');

const borrowRecordSchema = new mongoose.Schema({
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'ResourceItem', required: true },
  borrowerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  borrowDate: { type: Date, default: Date.now },
  returnDate: { type: Date },
  status: { type: String, enum: ['ACTIVE', 'RETURNED'], default: 'ACTIVE' }
}, { timestamps: true });

module.exports = mongoose.model('BorrowRecord', borrowRecordSchema);
