const express = require('express');
const router = express.Router();
const receiptController = require('../controllers/receiptController');
const auth = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');

// All routes require authentication
router.use(auth);

// @route   POST /api/receipt (Staff, Manager, Admin)
router.post('/', receiptController.createReceipt);

// @route   GET /api/receipt
router.get('/', receiptController.getReceipts);

// @route   GET /api/receipt/:id
router.get('/:id', receiptController.getReceipt);

// @route   PUT /api/receipt/:id (Staff, Manager, Admin)
router.put('/:id', receiptController.updateReceipt);

// @route   POST /api/receipt/:id/validate (Manager, Admin)
router.post('/:id/validate', roleGuard('MANAGER', 'ADMIN'), receiptController.validateReceipt);

module.exports = router;

