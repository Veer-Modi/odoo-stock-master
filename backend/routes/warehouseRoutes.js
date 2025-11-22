const express = require('express');
const router = express.Router();
const warehouseController = require('../controllers/warehouseController');
const auth = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');

// All routes require authentication
router.use(auth);

// @route   POST /api/warehouse (Admin)
router.post('/', roleGuard('ADMIN'), warehouseController.createWarehouse);

// @route   GET /api/warehouse
router.get('/', warehouseController.getWarehouses);

// @route   GET /api/warehouse/:id
router.get('/:id', warehouseController.getWarehouse);

// @route   PUT /api/warehouse/:id (Admin)
router.put('/:id', roleGuard('ADMIN'), warehouseController.updateWarehouse);

// @route   DELETE /api/warehouse/:id (Admin)
router.delete('/:id', roleGuard('ADMIN'), warehouseController.deleteWarehouse);

module.exports = router;

