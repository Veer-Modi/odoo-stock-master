const express = require('express');
const router = express.Router();
const ledgerController = require('../controllers/ledgerController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// @route   GET /api/ledger
router.get('/', ledgerController.getLedger);

module.exports = router;

