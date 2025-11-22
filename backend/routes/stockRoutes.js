const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// @route   GET /api/stock
router.get('/', stockController.getStock);

// @route   GET /api/stock/:productId
router.get('/:productId', stockController.getProductStock);

module.exports = router;

