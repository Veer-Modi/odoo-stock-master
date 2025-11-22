const express = require('express');
const router = express.Router();
const transferController = require('../controllers/transferController');
const auth = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');

// All routes require authentication
router.use(auth);

// @route   POST /api/transfer (Staff, Manager, Admin)
router.post('/', transferController.createTransfer);

// @route   GET /api/transfer
router.get('/', transferController.getTransfers);

// @route   GET /api/transfer/:id
router.get('/:id', transferController.getTransfer);

// @route   POST /api/transfer/:id/dispatch (Staff)
router.post('/:id/dispatch', roleGuard('STAFF'), transferController.dispatchTransfer);

// @route   POST /api/transfer/:id/receive (Manager, Admin)
router.post('/:id/receive', roleGuard('MANAGER', 'ADMIN'), transferController.receiveTransfer);

module.exports = router;

