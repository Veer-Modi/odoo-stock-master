const mongoose = require('mongoose');

const transferItemSchema = new mongoose.Schema({
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

const transferSchema = new mongoose.Schema({
  ref: {
    type: String,
    required: true,
    unique: true
  },
  fromWarehouse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse',
    required: true
  },
  toWarehouse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse',
    required: true
  },
  items: [transferItemSchema],
  status: {
    type: String,
    enum: ['Draft', 'Dispatched', 'Received'],
    default: 'Draft'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dispatchedAt: {
    type: Date,
    default: null
  },
  receivedAt: {
    type: Date,
    default: null
  },
  receivedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Transfer', transferSchema);

