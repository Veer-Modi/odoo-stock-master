const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');

// @route   POST /api/auth/login
router.post('/login', authController.login);

// @route   POST /api/auth/register (Public - creates STAFF user by default)
router.post('/register', authController.register);

// @route   POST /api/auth/register-admin (Admin only - can create any role)
router.post('/register-admin', auth, roleGuard('ADMIN'), authController.registerAdmin);

// @route   GET /api/auth/me
router.get('/me', auth, authController.getMe);

module.exports = router;

