const mongoose = require('mongoose');

const deliveryItemSchema = new mongoose.Schema({
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

const deliverySchema = new mongoose.Schema({
  ref: {
    type: String,
    required: true,
    unique: true
  },
  customer: {
    type: String,
    required: true
  },
  warehouseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse',
    required: true
  },
  items: [deliveryItemSchema],
  status: {
    type: String,
    enum: ['Draft', 'Picked', 'Packed', 'Validated'],
    default: 'Draft'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  pickedAt: {
    type: Date,
    default: null
  },
  packedAt: {
    type: Date,
    default: null
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

module.exports = mongoose.model('Delivery', deliverySchema);

