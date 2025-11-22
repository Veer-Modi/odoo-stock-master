const Delivery = require('../models/Delivery');
const ProductStock = require('../models/ProductStock');
const Ledger = require('../models/Ledger');

// Helper function to generate delivery reference
const generateDeliveryRef = async () => {
  const count = await Delivery.countDocuments();
  return `WH/OUT/${String(count + 1).padStart(4, '0')}`;
};

// @route   POST /api/delivery
// @desc    Create delivery (Staff, Manager, Admin)
// @access  Private
exports.createDelivery = async (req, res) => {
  try {
    const { customer, warehouseId, items } = req.body;

    if (!customer || !warehouseId || !items || items.length === 0) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const ref = await generateDeliveryRef();
    const delivery = await Delivery.create({
      ref,
      customer,
      warehouseId,
      items,
      createdBy: req.user.userId,
      status: 'Draft'
    });

    const populatedDelivery = await Delivery.findById(delivery._id)
      .populate('warehouseId', 'name code')
      .populate('items.productId', 'name sku unit')
      .populate('createdBy', 'name email');

    res.status(201).json(populatedDelivery);
  } catch (error) {
    console.error('Create delivery error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   GET /api/delivery
// @desc    Get all deliveries
// @access  Private
exports.getDeliveries = async (req, res) => {
  try {
    const userRole = req.user.role;
    const userWarehouseId = req.user.warehouseId;

    // If staff has no assigned warehouse, return empty
    if (userRole === 'STAFF' && !userWarehouseId) {
      return res.json([]);
    }

    let query = {};
    
    // STAFF can only see their warehouse deliveries
    if (userRole === 'STAFF' && userWarehouseId) {
      query.warehouseId = userWarehouseId;
    }

    const deliveries = await Delivery.find(query)
      .populate('warehouseId', 'name code')
      .populate('items.productId', 'name sku unit')
      .populate('createdBy', 'name email')
      .populate('validatedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(deliveries);
  } catch (error) {
    console.error('Get deliveries error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   GET /api/delivery/:id
// @desc    Get single delivery
// @access  Private
exports.getDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id)
      .populate('warehouseId', 'name code')
      .populate('items.productId', 'name sku unit')
      .populate('createdBy', 'name email')
      .populate('validatedBy', 'name email');

    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    res.json(delivery);
  } catch (error) {
    console.error('Get delivery error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   PUT /api/delivery/:id
// @desc    Update delivery (only if Draft)
// @access  Private
exports.updateDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id);
    
    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    if (delivery.status !== 'Draft') {
      return res.status(400).json({ message: 'Can only update draft deliveries' });
    }

    const { customer, warehouseId, items } = req.body;

    if (customer) delivery.customer = customer;
    if (warehouseId) delivery.warehouseId = warehouseId;
    if (items) delivery.items = items;

    await delivery.save();

    const updatedDelivery = await Delivery.findById(delivery._id)
      .populate('warehouseId', 'name code')
      .populate('items.productId', 'name sku unit')
      .populate('createdBy', 'name email');

    res.json(updatedDelivery);
  } catch (error) {
    console.error('Update delivery error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   POST /api/delivery/:id/pick
// @desc    Pick items - reserve stock (Staff)
// @access  Private
exports.pickDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id);
    
    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    if (delivery.status !== 'Draft') {
      return res.status(400).json({ message: 'Can only pick draft deliveries' });
    }

    // Check and reserve stock
    for (const item of delivery.items) {
      const stock = await ProductStock.findOne({
        productId: item.productId,
        warehouseId: delivery.warehouseId
      });

      if (!stock) {
        return res.status(400).json({ 
          message: `Insufficient stock for product ${item.productId}` 
        });
      }

      const available = stock.quantity - stock.reserved;
      if (available < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient available stock. Available: ${available}, Required: ${item.quantity}` 
        });
      }

      stock.reserved += item.quantity;
      stock.lastUpdated = new Date();
      await stock.save();
    }

    delivery.status = 'Picked';
    delivery.pickedAt = new Date();
    await delivery.save();

    const updatedDelivery = await Delivery.findById(delivery._id)
      .populate('warehouseId', 'name code')
      .populate('items.productId', 'name sku unit')
      .populate('createdBy', 'name email');

    res.json(updatedDelivery);
  } catch (error) {
    console.error('Pick delivery error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   POST /api/delivery/:id/pack
// @desc    Pack items (Staff)
// @access  Private
exports.packDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id);
    
    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    if (delivery.status !== 'Picked') {
      return res.status(400).json({ message: 'Delivery must be picked before packing' });
    }

    delivery.status = 'Packed';
    delivery.packedAt = new Date();
    await delivery.save();

    const updatedDelivery = await Delivery.findById(delivery._id)
      .populate('warehouseId', 'name code')
      .populate('items.productId', 'name sku unit')
      .populate('createdBy', 'name email');

    res.json(updatedDelivery);
  } catch (error) {
    console.error('Pack delivery error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   POST /api/delivery/:id/validate
// @desc    Validate delivery and reduce stock (Manager, Admin)
// @access  Private/Manager,Admin
exports.validateDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id);
    
    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found' });
    }

    if (delivery.status === 'Validated') {
      return res.status(400).json({ message: 'Delivery already validated' });
    }

    if (delivery.status !== 'Packed') {
      return res.status(400).json({ message: 'Delivery must be packed before validation' });
    }

    // Update stock for each item
    for (const item of delivery.items) {
      const stock = await ProductStock.findOne({
        productId: item.productId,
        warehouseId: delivery.warehouseId
      });

      if (!stock) {
        return res.status(400).json({ 
          message: `Stock not found for product ${item.productId}` 
        });
      }

      const quantityBefore = stock.quantity;
      stock.quantity -= item.quantity;
      stock.reserved -= item.quantity;
      
      if (stock.quantity < 0 || stock.reserved < 0) {
        return res.status(400).json({ 
          message: `Insufficient stock. Available: ${quantityBefore}, Reserved: ${stock.reserved + item.quantity}, Required: ${item.quantity}` 
        });
      }

      stock.lastUpdated = new Date();
      await stock.save();

      // Create ledger entry
      await Ledger.create({
        productId: item.productId,
        warehouseId: delivery.warehouseId,
        change: -item.quantity,
        type: 'delivery',
        refId: delivery._id,
        refNumber: delivery.ref,
        quantityBefore,
        quantityAfter: stock.quantity,
        createdBy: req.user.userId
      });
    }

    // Update delivery status
    delivery.status = 'Validated';
    delivery.validatedAt = new Date();
    delivery.validatedBy = req.user.userId;
    await delivery.save();

    const validatedDelivery = await Delivery.findById(delivery._id)
      .populate('warehouseId', 'name code')
      .populate('items.productId', 'name sku unit')
      .populate('createdBy', 'name email')
      .populate('validatedBy', 'name email');

    res.json(validatedDelivery);
  } catch (error) {
    console.error('Validate delivery error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

