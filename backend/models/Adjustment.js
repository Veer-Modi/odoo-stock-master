const mongoose = require('mongoose');

const adjustmentSchema = new mongoose.Schema({
  ref: {
    type: String,
    required: true,
    unique: true
  },
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
  previousQty: {
    type: Number,
    required: true,
    min: 0
  },
  countedQty: {
    type: Number,
    required: true,
    min: 0
  },
  difference: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Draft', 'Validated'],
    default: 'Draft'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  validatedAt: {
    type: Date,
    default: null
  },
  validatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Adjustment', adjustmentSchema);

