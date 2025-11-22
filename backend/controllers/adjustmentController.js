const Adjustment = require('../models/Adjustment');
const ProductStock = require('../models/ProductStock');
const Ledger = require('../models/Ledger');

// Helper function to generate adjustment reference
const generateAdjustmentRef = async () => {
  const count = await Adjustment.countDocuments();
  return `ADJ/${String(count + 1).padStart(4, '0')}`;
};

// @route   POST /api/adjustment
// @desc    Create adjustment (Staff, Manager, Admin)
// @access  Private
exports.createAdjustment = async (req, res) => {
  try {
    const { productId, warehouseId, previousQty, countedQty, reason } = req.body;

    if (!productId || !warehouseId || previousQty === undefined || countedQty === undefined || !reason) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const difference = countedQty - previousQty;
    const ref = await generateAdjustmentRef();

    const adjustment = await Adjustment.create({
      ref,
      productId,
      warehouseId,
      previousQty,
      countedQty,
      difference,
      reason,
      createdBy: req.user.userId,
      status: 'Draft'
    });

    const populatedAdjustment = await Adjustment.findById(adjustment._id)
      .populate('productId', 'name sku unit')
      .populate('warehouseId', 'name code')
      .populate('createdBy', 'name email');

    res.status(201).json(populatedAdjustment);
  } catch (error) {
    console.error('Create adjustment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   GET /api/adjustment
// @desc    Get all adjustments
// @access  Private
exports.getAdjustments = async (req, res) => {
  try {
    const userRole = req.user.role;
    const userWarehouseId = req.user.warehouseId;

    let query = {};
    
    // STAFF can only see their warehouse adjustments
    if (userRole === 'STAFF' && userWarehouseId) {
      query.warehouseId = userWarehouseId;
    }

    const adjustments = await Adjustment.find(query)
      .populate('productId', 'name sku unit')
      .populate('warehouseId', 'name code')
      .populate('createdBy', 'name email')
      .populate('validatedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(adjustments);
  } catch (error) {
    console.error('Get adjustments error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   GET /api/adjustment/:id
// @desc    Get single adjustment
// @access  Private
exports.getAdjustment = async (req, res) => {
  try {
    const adjustment = await Adjustment.findById(req.params.id)
      .populate('productId', 'name sku unit')
      .populate('warehouseId', 'name code')
      .populate('createdBy', 'name email')
      .populate('validatedBy', 'name email');

    if (!adjustment) {
      return res.status(404).json({ message: 'Adjustment not found' });
    }

    res.json(adjustment);
  } catch (error) {
    console.error('Get adjustment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   POST /api/adjustment/:id/validate
// @desc    Validate adjustment and update stock (Manager, Admin)
// @access  Private/Manager,Admin
exports.validateAdjustment = async (req, res) => {
  try {
    const adjustment = await Adjustment.findById(req.params.id);
    
    if (!adjustment) {
      return res.status(404).json({ message: 'Adjustment not found' });
    }

    if (adjustment.status === 'Validated') {
      return res.status(400).json({ message: 'Adjustment already validated' });
    }

    // Update stock
    let stock = await ProductStock.findOne({
      productId: adjustment.productId,
      warehouseId: adjustment.warehouseId
    });

    if (!stock) {
      // Create stock entry if it doesn't exist
      stock = await ProductStock.create({
        productId: adjustment.productId,
        warehouseId: adjustment.warehouseId,
        quantity: adjustment.countedQty,
        reserved: 0
      });
    } else {
      const quantityBefore = stock.quantity;
      stock.quantity = adjustment.countedQty;
      stock.lastUpdated = new Date();
      await stock.save();

      // Create ledger entry
      await Ledger.create({
        productId: adjustment.productId,
        warehouseId: adjustment.warehouseId,
        change: adjustment.difference,
        type: 'adjustment',
        refId: adjustment._id,
        refNumber: adjustment.ref,
        quantityBefore,
        quantityAfter: stock.quantity,
        createdBy: req.user.userId
      });
    }

    // Update adjustment status
    adjustment.status = 'Validated';
    adjustment.validatedAt = new Date();
    adjustment.validatedBy = req.user.userId;
    await adjustment.save();

    const validatedAdjustment = await Adjustment.findById(adjustment._id)
      .populate('productId', 'name sku unit')
      .populate('warehouseId', 'name code')
      .populate('createdBy', 'name email')
      .populate('validatedBy', 'name email');

    res.json(validatedAdjustment);
  } catch (error) {
    console.error('Validate adjustment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

