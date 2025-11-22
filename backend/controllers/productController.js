const Product = require('../models/Product');
const ProductStock = require('../models/ProductStock');
const Warehouse = require('../models/Warehouse');

// @route   POST /api/product
// @desc    Create product (Admin, Manager)
// @access  Private
exports.createProduct = async (req, res) => {
  try {
    const { name, sku, unit, category, reorderLevel, description } = req.body;

    if (!name || !sku || !unit || !category) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check if SKU already exists
    const existingProduct = await Product.findOne({ sku: sku.toUpperCase() });
    if (existingProduct) {
      return res.status(400).json({ message: 'Product with this SKU already exists' });
    }

    const product = await Product.create({
      name,
      sku: sku.toUpperCase(),
      unit,
      category,
      reorderLevel: reorderLevel || 0,
      description: description || ''
    });

    // Create stock entries for all warehouses
    const warehouses = await Warehouse.find({ isActive: true });
    for (const warehouse of warehouses) {
      await ProductStock.create({
        productId: product._id,
        warehouseId: warehouse._id,
        quantity: 0,
        reserved: 0
      });
    }

    res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   GET /api/product
// @desc    Get all products
// @access  Private
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   GET /api/product/:id
// @desc    Get single product
// @access  Private
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   PUT /api/product/:id
// @desc    Update product (Admin, Manager)
// @access  Private
exports.updateProduct = async (req, res) => {
  try {
    const { name, unit, category, reorderLevel, description } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.name = name || product.name;
    product.unit = unit || product.unit;
    product.category = category || product.category;
    product.reorderLevel = reorderLevel !== undefined ? reorderLevel : product.reorderLevel;
    product.description = description !== undefined ? description : product.description;

    await product.save();
    res.json(product);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   DELETE /api/product/:id
// @desc    Delete product (Admin)
// @access  Private
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if product has stock
    const stock = await ProductStock.findOne({ productId: product._id, quantity: { $gt: 0 } });
    if (stock) {
      return res.status(400).json({ message: 'Cannot delete product with existing stock' });
    }

    await ProductStock.deleteMany({ productId: product._id });
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

