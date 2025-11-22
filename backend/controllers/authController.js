const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token (include warehouseId for role-based scoping)
const generateToken = (userId, role, warehouseId) => {
  return jwt.sign({ userId, role, warehouseId }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).populate('warehouseId', 'name code');
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id, user.role, user.warehouseId?._id || user.warehouseId || null);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        warehouseId: user.warehouseId?._id,
        warehouseName: user.warehouseId?.name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   POST /api/auth/register
// @desc    Register new user (Public - creates STAFF user)
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, warehouseId, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Allow public registration to create any valid role. Default to STAFF if none provided.
    const allowedRoles = ['ADMIN', 'MANAGER', 'STAFF'];
    const finalRole = allowedRoles.includes(role) ? role : 'STAFF';

    const user = await User.create({
      name,
      email,
      password,
      role: finalRole,
      warehouseId: warehouseId || null
    });

    const token = generateToken(user._id, user.role, user.warehouseId);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        warehouseId: user.warehouseId
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   POST /api/auth/register-admin
// @desc    Register new user with any role (Admin only)
// @access  Private/Admin
exports.registerAdmin = async (req, res) => {
  try {
    const { name, email, password, role, warehouseId } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (!['ADMIN', 'MANAGER', 'STAFF'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      warehouseId: warehouseId || null
    });

    const token = generateToken(user._id, user.role, user.warehouseId || null);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        warehouseId: user.warehouseId
      }
    });
  } catch (error) {
    console.error('Register admin error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select('-password')
      .populate('warehouseId', 'name code');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      warehouseId: user.warehouseId?._id,
      warehouseName: user.warehouseId?.name
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

