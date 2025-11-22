const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const auth = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');

// All routes require authentication
router.use(auth);

// @route   POST /api/product (Admin, Manager)
router.post('/', roleGuard('ADMIN', 'MANAGER'), productController.createProduct);

// @route   GET /api/product
router.get('/', productController.getProducts);

// @route   GET /api/product/:id
router.get('/:id', productController.getProduct);

// @route   PUT /api/product/:id (Admin, Manager)
router.put('/:id', roleGuard('ADMIN', 'MANAGER'), productController.updateProduct);

// @route   DELETE /api/product/:id (Admin)
router.delete('/:id', roleGuard('ADMIN'), productController.deleteProduct);

module.exports = router;

