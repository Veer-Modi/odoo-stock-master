const mongoose = require('mongoose');

const ledgerSchema = new mongoose.Schema({
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
  change: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['receipt', 'delivery', 'transfer', 'adjustment'],
    required: true
  },
  refId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  refNumber: {
    type: String,
    required: true
  },
  quantityBefore: {
    type: Number,
    required: true
  },
  quantityAfter: {
    type: Number,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
ledgerSchema.index({ productId: 1, warehouseId: 1, createdAt: -1 });
ledgerSchema.index({ type: 1, refId: 1 });

module.exports = mongoose.model('Ledger', ledgerSchema);

