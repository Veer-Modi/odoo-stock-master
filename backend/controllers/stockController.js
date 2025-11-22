const ProductStock = require('../models/ProductStock');
const Product = require('../models/Product');
const Warehouse = require('../models/Warehouse');

// @route   GET /api/stock
// @desc    Get all stock (filtered by warehouse for STAFF)
// @access  Private
exports.getStock = async (req, res) => {
  try {
    const { warehouseId } = req.query;
    const userRole = req.user.role;
    const userWarehouseId = req.user.warehouseId;

    // If staff has no assigned warehouse, return empty result
    if (userRole === 'STAFF' && !userWarehouseId) {
      return res.json([]);
    }

    let query = {};
    
    // STAFF can only see their warehouse stock
    if (userRole === 'STAFF' && userWarehouseId) {
      query.warehouseId = userWarehouseId;
    } else if (warehouseId && (userRole === 'ADMIN' || userRole === 'MANAGER')) {
      query.warehouseId = warehouseId;
    }

    const stock = await ProductStock.find(query)
      .populate('productId', 'name sku unit category reorderLevel')
      .populate('warehouseId', 'name code')
      .sort({ 'productId.name': 1 });

    // Calculate available quantity
    const stockWithAvailable = stock.map(item => ({
      ...item.toObject(),
      available: Math.max(0, item.quantity - item.reserved)
    }));

    res.json(stockWithAvailable);
  } catch (error) {
    console.error('Get stock error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   GET /api/stock/:productId
// @desc    Get stock for specific product
// @access  Private
exports.getProductStock = async (req, res) => {
  try {
    const { productId } = req.params;
    const userRole = req.user.role;
    const userWarehouseId = req.user.warehouseId;

    // If staff has no assigned warehouse, return empty result
    if (userRole === 'STAFF' && !userWarehouseId) {
      return res.json([]);
    }

    let query = { productId };
    
    // STAFF can only see their warehouse stock
    if (userRole === 'STAFF' && userWarehouseId) {
      query.warehouseId = userWarehouseId;
    }

    const stock = await ProductStock.find(query)
      .populate('warehouseId', 'name code')
      .sort({ 'warehouseId.name': 1 });

    const stockWithAvailable = stock.map(item => ({
      ...item.toObject(),
      available: Math.max(0, item.quantity - item.reserved)
    }));

    res.json(stockWithAvailable);
  } catch (error) {
    console.error('Get product stock error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

