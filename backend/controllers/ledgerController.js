const Ledger = require('../models/Ledger');

// @route   GET /api/ledger
// @desc    Get ledger entries
// @access  Private
exports.getLedger = async (req, res) => {
  try {
    const { productId, warehouseId, type, startDate, endDate, limit = 100 } = req.query;
    const userRole = req.user.role;
    const userWarehouseId = req.user.warehouseId;

    let query = {};
    
    // STAFF can only see their warehouse ledger
    if (userRole === 'STAFF' && userWarehouseId) {
      query.warehouseId = userWarehouseId;
    } else if (warehouseId && (userRole === 'ADMIN' || userRole === 'MANAGER')) {
      query.warehouseId = warehouseId;
    }

    if (productId) {
      query.productId = productId;
    }

    if (type) {
      query.type = type;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const ledger = await Ledger.find(query)
      .populate('productId', 'name sku unit')
      .populate('warehouseId', 'name code')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json(ledger);
  } catch (error) {
    console.error('Get ledger error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

