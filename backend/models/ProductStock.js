const mongoose = require('mongoose');

const productStockSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  warehouseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse',
    required: true
  },
  quantity: {
    type: Number,
    default: 0,
    min: 0
  },
  reserved: {
    type: Number,
    default: 0,
    min: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index to ensure unique product-warehouse combination
productStockSchema.index({ productId: 1, warehouseId: 1 }, { unique: true });

// Virtual for available quantity
productStockSchema.virtual('available').get(function() {
  return Math.max(0, this.quantity - this.reserved);
});

module.exports = mongoose.model('ProductStock', productStockSchema);

