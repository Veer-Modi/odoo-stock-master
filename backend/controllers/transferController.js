const Transfer = require('../models/Transfer');
const ProductStock = require('../models/ProductStock');
const Ledger = require('../models/Ledger');

// Helper function to generate transfer reference
const generateTransferRef = async () => {
  const count = await Transfer.countDocuments();
  return `WH/INT/${String(count + 1).padStart(4, '0')}`;
};

// @route   POST /api/transfer
// @desc    Create transfer (Staff, Manager, Admin)
// @access  Private
exports.createTransfer = async (req, res) => {
  try {
    const { fromWarehouse, toWarehouse, items } = req.body;

    if (!fromWarehouse || !toWarehouse || !items || items.length === 0) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (fromWarehouse === toWarehouse) {
      return res.status(400).json({ message: 'Source and destination warehouses cannot be the same' });
    }

    const ref = await generateTransferRef();
    const transfer = await Transfer.create({
      ref,
      fromWarehouse,
      toWarehouse,
      items,
      createdBy: req.user.userId,
      status: 'Draft'
    });

    const populatedTransfer = await Transfer.findById(transfer._id)
      .populate('fromWarehouse', 'name code')
      .populate('toWarehouse', 'name code')
      .populate('items.productId', 'name sku unit')
      .populate('createdBy', 'name email');

    res.status(201).json(populatedTransfer);
  } catch (error) {
    console.error('Create transfer error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   GET /api/transfer
// @desc    Get all transfers
// @access  Private
exports.getTransfers = async (req, res) => {
  try {
    const userRole = req.user.role;
    const userWarehouseId = req.user.warehouseId;

    // If staff has no assigned warehouse, return empty
    if (userRole === 'STAFF' && !userWarehouseId) {
      return res.json([]);
    }

    let query = {};
    
    // STAFF can only see transfers involving their warehouse
    if (userRole === 'STAFF' && userWarehouseId) {
      query.$or = [
        { fromWarehouse: userWarehouseId },
        { toWarehouse: userWarehouseId }
      ];
    }

    const transfers = await Transfer.find(query)
      .populate('fromWarehouse', 'name code')
      .populate('toWarehouse', 'name code')
      .populate('items.productId', 'name sku unit')
      .populate('createdBy', 'name email')
      .populate('receivedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(transfers);
  } catch (error) {
    console.error('Get transfers error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   GET /api/transfer/:id
// @desc    Get single transfer
// @access  Private
exports.getTransfer = async (req, res) => {
  try {
    const transfer = await Transfer.findById(req.params.id)
      .populate('fromWarehouse', 'name code')
      .populate('toWarehouse', 'name code')
      .populate('items.productId', 'name sku unit')
      .populate('createdBy', 'name email')
      .populate('receivedBy', 'name email');

    if (!transfer) {
      return res.status(404).json({ message: 'Transfer not found' });
    }

    res.json(transfer);
  } catch (error) {
    console.error('Get transfer error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   POST /api/transfer/:id/dispatch
// @desc    Dispatch transfer - reduce source warehouse stock (Staff)
// @access  Private
exports.dispatchTransfer = async (req, res) => {
  try {
    const transfer = await Transfer.findById(req.params.id);
    
    if (!transfer) {
      return res.status(404).json({ message: 'Transfer not found' });
    }

    if (transfer.status !== 'Draft') {
      return res.status(400).json({ message: 'Can only dispatch draft transfers' });
    }

    // Check and reduce stock from source warehouse
    for (const item of transfer.items) {
      const stock = await ProductStock.findOne({
        productId: item.productId,
        warehouseId: transfer.fromWarehouse
      });

      if (!stock) {
        return res.status(400).json({ 
          message: `Stock not found for product ${item.productId} in source warehouse` 
        });
      }

      const available = stock.quantity - stock.reserved;
      if (available < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient available stock. Available: ${available}, Required: ${item.quantity}` 
        });
      }

      const quantityBefore = stock.quantity;
      stock.quantity -= item.quantity;
      stock.lastUpdated = new Date();
      await stock.save();

      // Create ledger entry for source warehouse
      await Ledger.create({
        productId: item.productId,
        warehouseId: transfer.fromWarehouse,
        change: -item.quantity,
        type: 'transfer',
        refId: transfer._id,
        refNumber: transfer.ref,
        quantityBefore,
        quantityAfter: stock.quantity,
        createdBy: req.user.userId
      });
    }

    transfer.status = 'Dispatched';
    transfer.dispatchedAt = new Date();
    await transfer.save();

    const updatedTransfer = await Transfer.findById(transfer._id)
      .populate('fromWarehouse', 'name code')
      .populate('toWarehouse', 'name code')
      .populate('items.productId', 'name sku unit')
      .populate('createdBy', 'name email');

    res.json(updatedTransfer);
  } catch (error) {
    console.error('Dispatch transfer error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   POST /api/transfer/:id/receive
// @desc    Receive transfer - increase destination warehouse stock (Manager, Admin)
// @access  Private/Manager,Admin
exports.receiveTransfer = async (req, res) => {
  try {
    const transfer = await Transfer.findById(req.params.id);
    
    if (!transfer) {
      return res.status(404).json({ message: 'Transfer not found' });
    }

    if (transfer.status === 'Received') {
      return res.status(400).json({ message: 'Transfer already received' });
    }

    if (transfer.status !== 'Dispatched') {
      return res.status(400).json({ message: 'Transfer must be dispatched before receiving' });
    }

    // Increase stock in destination warehouse
    for (const item of transfer.items) {
      let stock = await ProductStock.findOne({
        productId: item.productId,
        warehouseId: transfer.toWarehouse
      });

      if (!stock) {
        stock = await ProductStock.create({
          productId: item.productId,
          warehouseId: transfer.toWarehouse,
          quantity: item.quantity,
          reserved: 0
        });
      } else {
        const quantityBefore = stock.quantity;
        stock.quantity += item.quantity;
        stock.lastUpdated = new Date();
        await stock.save();

        // Create ledger entry for destination warehouse
        await Ledger.create({
          productId: item.productId,
          warehouseId: transfer.toWarehouse,
          change: item.quantity,
          type: 'transfer',
          refId: transfer._id,
          refNumber: transfer.ref,
          quantityBefore,
          quantityAfter: stock.quantity,
          createdBy: req.user.userId
        });
      }
    }

    transfer.status = 'Received';
    transfer.receivedAt = new Date();
    transfer.receivedBy = req.user.userId;
    await transfer.save();

    const receivedTransfer = await Transfer.findById(transfer._id)
      .populate('fromWarehouse', 'name code')
      .populate('toWarehouse', 'name code')
      .populate('items.productId', 'name sku unit')
      .populate('createdBy', 'name email')
      .populate('receivedBy', 'name email');

    res.json(receivedTransfer);
  } catch (error) {
    console.error('Receive transfer error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

