const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const authController = require('../controllers/authController');

// All routes require authentication and admin role
router.use(auth);
router.use(roleGuard('ADMIN'));

// @route   POST /api/user/create
// @desc    Create user (Admin)
// @access  Private/Admin
router.post('/create', (req, res) => authController.registerAdmin(req, res));

// @route   GET /api/user
// @desc    Get all users
// @access  Private/Admin
router.get('/', async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .populate('warehouseId', 'name code')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/user/:id
// @desc    Get single user
// @access  Private/Admin
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('warehouseId', 'name code');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/user/:id
// @desc    Update user
// @access  Private/Admin
router.put('/:id', async (req, res) => {
  try {
    const { name, email, role, warehouseId, isActive } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = name || user.name;
    user.email = email || user.email;
    if (role) user.role = role;
    if (warehouseId !== undefined) user.warehouseId = warehouseId || null;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    const updatedUser = await User.findById(user._id)
      .select('-password')
      .populate('warehouseId', 'name code');

    res.json(updatedUser);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/user/:id
// @desc    Delete user
// @access  Private/Admin
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

