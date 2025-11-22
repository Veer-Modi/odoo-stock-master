const Warehouse = require('../models/Warehouse');
const Product = require('../models/Product');
const ProductStock = require('../models/ProductStock');

// @route   POST /api/warehouse
// @desc    Create warehouse (Admin)
// @access  Private/Admin
exports.createWarehouse = async (req, res) => {
  try {
    const { name, code, address, capacity } = req.body;

    if (!name || !code || !address) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check if code already exists
    const existingWarehouse = await Warehouse.findOne({ code: code.toUpperCase() });
    if (existingWarehouse) {
      return res.status(400).json({ message: 'Warehouse with this code already exists' });
    }

    const warehouse = await Warehouse.create({
      name,
      code: code.toUpperCase(),
      address,
      capacity: capacity || ''
    });

    // Create stock entries for all products
    const products = await Product.find();
    for (const product of products) {
      await ProductStock.create({
        productId: product._id,
        warehouseId: warehouse._id,
        quantity: 0,
        reserved: 0
      });
    }

    res.status(201).json(warehouse);
  } catch (error) {
    console.error('Create warehouse error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   GET /api/warehouse
// @desc    Get all warehouses
// @access  Private
exports.getWarehouses = async (req, res) => {
  try {
    const warehouses = await Warehouse.find({ isActive: true }).sort({ name: 1 });
    res.json(warehouses);
  } catch (error) {
    console.error('Get warehouses error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   GET /api/warehouse/:id
// @desc    Get single warehouse
// @access  Private
exports.getWarehouse = async (req, res) => {
  try {
    const warehouse = await Warehouse.findById(req.params.id);
    if (!warehouse) {
      return res.status(404).json({ message: 'Warehouse not found' });
    }
    res.json(warehouse);
  } catch (error) {
    console.error('Get warehouse error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   PUT /api/warehouse/:id
// @desc    Update warehouse (Admin)
// @access  Private/Admin
exports.updateWarehouse = async (req, res) => {
  try {
    const { name, address, capacity, isActive } = req.body;

    const warehouse = await Warehouse.findById(req.params.id);
    if (!warehouse) {
      return res.status(404).json({ message: 'Warehouse not found' });
    }

    warehouse.name = name || warehouse.name;
    warehouse.address = address || warehouse.address;
    warehouse.capacity = capacity !== undefined ? capacity : warehouse.capacity;
    warehouse.isActive = isActive !== undefined ? isActive : warehouse.isActive;

    await warehouse.save();
    res.json(warehouse);
  } catch (error) {
    console.error('Update warehouse error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   DELETE /api/warehouse/:id
// @desc    Delete warehouse (Admin)
// @access  Private/Admin
exports.deleteWarehouse = async (req, res) => {
  try {
    const warehouse = await Warehouse.findById(req.params.id);
    if (!warehouse) {
      return res.status(404).json({ message: 'Warehouse not found' });
    }

    // Check if warehouse has stock
    const stock = await ProductStock.findOne({ warehouseId: warehouse._id, quantity: { $gt: 0 } });
    if (stock) {
      return res.status(400).json({ message: 'Cannot delete warehouse with existing stock' });
    }

    await ProductStock.deleteMany({ warehouseId: warehouse._id });
    await Warehouse.findByIdAndDelete(req.params.id);
    res.json({ message: 'Warehouse deleted successfully' });
  } catch (error) {
    console.error('Delete warehouse error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

