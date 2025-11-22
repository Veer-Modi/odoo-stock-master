const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');
const auth = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');

// All routes require authentication
router.use(auth);

// @route   POST /api/delivery (Staff, Manager, Admin)
router.post('/', deliveryController.createDelivery);

// @route   GET /api/delivery
router.get('/', deliveryController.getDeliveries);

// @route   GET /api/delivery/:id
router.get('/:id', deliveryController.getDelivery);

// @route   PUT /api/delivery/:id (Staff, Manager, Admin)
router.put('/:id', deliveryController.updateDelivery);

// @route   POST /api/delivery/:id/pick (Staff)
router.post('/:id/pick', roleGuard('STAFF'), deliveryController.pickDelivery);

// @route   POST /api/delivery/:id/pack (Staff)
router.post('/:id/pack', roleGuard('STAFF'), deliveryController.packDelivery);

// @route   POST /api/delivery/:id/validate (Manager, Admin)
router.post('/:id/validate', roleGuard('MANAGER', 'ADMIN'), deliveryController.validateDelivery);

module.exports = router;

