const mongoose = require('mongoose');

const receiptItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  }
}, { _id: false });

const receiptSchema = new mongoose.Schema({
  ref: {
    type: String,
    required: true,
    unique: true
  },
  supplier: {
    type: String,
    required: true
  },
  warehouseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse',
    required: true
  },
  items: [receiptItemSchema],
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

module.exports = mongoose.model('Receipt', receiptSchema);

