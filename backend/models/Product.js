const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  sku: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  unit: {
    type: String,
    required: true,
    enum: ['pcs', 'kg', 'liters', 'meters', 'boxes']
  },
  category: {
    type: String,
    required: true
  },
  reorderLevel: {
    type: Number,
    default: 0
  },
  description: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);

