const Receipt = require('../models/Receipt');
const ProductStock = require('../models/ProductStock');
const Ledger = require('../models/Ledger');

// Helper function to generate receipt reference
const generateReceiptRef = async () => {
  const count = await Receipt.countDocuments();
  return `WH/IN/${String(count + 1).padStart(4, '0')}`;
};

// @route   POST /api/receipt
// @desc    Create receipt (Staff, Manager, Admin)
// @access  Private
exports.createReceipt = async (req, res) => {
  try {
    const { supplier, warehouseId, items } = req.body;

    if (!supplier || !warehouseId || !items || items.length === 0) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const ref = await generateReceiptRef();
    const receipt = await Receipt.create({
      ref,
      supplier,
      warehouseId,
      items,
      createdBy: req.user.userId,
      status: 'Draft'
    });

    const populatedReceipt = await Receipt.findById(receipt._id)
      .populate('warehouseId', 'name code')
      .populate('items.productId', 'name sku unit')
      .populate('createdBy', 'name email');

    res.status(201).json(populatedReceipt);
  } catch (error) {
    console.error('Create receipt error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   GET /api/receipt
// @desc    Get all receipts
// @access  Private
exports.getReceipts = async (req, res) => {
  try {
    const userRole = req.user.role;
    const userWarehouseId = req.user.warehouseId;

    // If staff has no assigned warehouse, return empty
    if (userRole === 'STAFF' && !userWarehouseId) {
      return res.json([]);
    }

    let query = {};
    
    // STAFF can only see their warehouse receipts
    if (userRole === 'STAFF' && userWarehouseId) {
      query.warehouseId = userWarehouseId;
    }

    const receipts = await Receipt.find(query)
      .populate('warehouseId', 'name code')
      .populate('items.productId', 'name sku unit')
      .populate('createdBy', 'name email')
      .populate('validatedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(receipts);
  } catch (error) {
    console.error('Get receipts error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   GET /api/receipt/:id
// @desc    Get single receipt
// @access  Private
exports.getReceipt = async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id)
      .populate('warehouseId', 'name code')
      .populate('items.productId', 'name sku unit')
      .populate('createdBy', 'name email')
      .populate('validatedBy', 'name email');

    if (!receipt) {
      return res.status(404).json({ message: 'Receipt not found' });
    }

    res.json(receipt);
  } catch (error) {
    console.error('Get receipt error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   PUT /api/receipt/:id
// @desc    Update receipt (only if Draft)
// @access  Private
exports.updateReceipt = async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id);
    
    if (!receipt) {
      return res.status(404).json({ message: 'Receipt not found' });
    }

    if (receipt.status !== 'Draft') {
      return res.status(400).json({ message: 'Can only update draft receipts' });
    }

    const { supplier, warehouseId, items } = req.body;

    if (supplier) receipt.supplier = supplier;
    if (warehouseId) receipt.warehouseId = warehouseId;
    if (items) receipt.items = items;

    await receipt.save();

    const updatedReceipt = await Receipt.findById(receipt._id)
      .populate('warehouseId', 'name code')
      .populate('items.productId', 'name sku unit')
      .populate('createdBy', 'name email');

    res.json(updatedReceipt);
  } catch (error) {
    console.error('Update receipt error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   POST /api/receipt/:id/validate
// @desc    Validate receipt and update stock (Manager, Admin)
// @access  Private/Manager,Admin
exports.validateReceipt = async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id);
    
    if (!receipt) {
      return res.status(404).json({ message: 'Receipt not found' });
    }

    if (receipt.status === 'Validated') {
      return res.status(400).json({ message: 'Receipt already validated' });
    }

    // Update stock for each item
    for (const item of receipt.items) {
      let stock = await ProductStock.findOne({
        productId: item.productId,
        warehouseId: receipt.warehouseId
      });

      if (!stock) {
        stock = await ProductStock.create({
          productId: item.productId,
          warehouseId: receipt.warehouseId,
          quantity: item.quantity,
          reserved: 0
        });
      } else {
        const quantityBefore = stock.quantity;
        stock.quantity += item.quantity;
        stock.lastUpdated = new Date();
        await stock.save();

        // Create ledger entry
        await Ledger.create({
          productId: item.productId,
          warehouseId: receipt.warehouseId,
          change: item.quantity,
          type: 'receipt',
          refId: receipt._id,
          refNumber: receipt.ref,
          quantityBefore,
          quantityAfter: stock.quantity,
          createdBy: req.user.userId
        });
      }
    }

    // Update receipt status
    receipt.status = 'Validated';
    receipt.validatedAt = new Date();
    receipt.validatedBy = req.user.userId;
    await receipt.save();

    const validatedReceipt = await Receipt.findById(receipt._id)
      .populate('warehouseId', 'name code')
      .populate('items.productId', 'name sku unit')
      .populate('createdBy', 'name email')
      .populate('validatedBy', 'name email');

    res.json(validatedReceipt);
  } catch (error) {
    console.error('Validate receipt error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

