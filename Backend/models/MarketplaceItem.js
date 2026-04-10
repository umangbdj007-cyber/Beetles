const mongoose = require('mongoose');

const marketplaceItemSchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number },
  type: { type: String, enum: ['Sale', 'Service'], default: 'Sale' },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['Available', 'Sold', 'Closed'], default: 'Available' }
}, { timestamps: true });

module.exports = mongoose.model('MarketplaceItem', marketplaceItemSchema);
