const express = require('express');
const router = express.Router();
const adjustmentController = require('../controllers/adjustmentController');
const auth = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');

// All routes require authentication
router.use(auth);

// @route   POST /api/adjustment (Staff, Manager, Admin)
router.post('/', adjustmentController.createAdjustment);

// @route   GET /api/adjustment
router.get('/', adjustmentController.getAdjustments);

// @route   GET /api/adjustment/:id
router.get('/:id', adjustmentController.getAdjustment);

// @route   POST /api/adjustment/:id/validate (Manager, Admin)
router.post('/:id/validate', roleGuard('MANAGER', 'ADMIN'), adjustmentController.validateAdjustment);

module.exports = router;

