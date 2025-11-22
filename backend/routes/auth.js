const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendOTPEmail } = require('../utils/emailService');

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Register user
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = new User({ email, password, name });
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Error registering user' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
});

// Forgot password - Send OTP
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found with this email' });
    }

    // Generate OTP
    const otp = generateOTP();
    
    // Save OTP and expiry time (10 minutes)
    user.resetOTP = otp;
    user.resetOTPExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // Send OTP via email
    try {
      // Development mode: Log OTP to console if email not configured
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD || 
          process.env.EMAIL_USER === 'your-email@gmail.com') {
        console.log('\n=================================');
        console.log('🔐 DEVELOPMENT MODE - OTP Code:');
        console.log(`📧 Email: ${email}`);
        console.log(`🔢 OTP: ${otp}`);
        console.log('⏰ Expires in 10 minutes');
        console.log('=================================\n');
        
        res.json({
          message: 'OTP generated successfully (check console in development mode)',
          email: email,
        });
      } else {
        // Production mode: Send actual email
        console.log(`Attempting to send email to: ${email}`);
        console.log(`Using email config: ${process.env.EMAIL_USER}`);
        
        await sendOTPEmail(email, otp);
        
        console.log('✅ Email sent successfully!');
        res.json({
          message: 'OTP sent successfully to your email',
          email: email,
        });
      }
    } catch (emailError) {
      console.error('❌ Email sending failed:', emailError.message);
      
      // Fallback: Log OTP to console if email fails
      console.log('\n=================================');
      console.log('⚠️  EMAIL FAILED - OTP Code:');
      console.log(`📧 Email: ${email}`);
      console.log(`🔢 OTP: ${otp}`);
      console.log('⏰ Expires in 10 minutes');
      console.log(`❌ Error: ${emailError.message}`);
      console.log('=================================\n');
      
      res.json({ 
        message: 'OTP generated (email sending failed, check server console)',
        email: email,
      });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Error processing forgot password request' });
  }
});

// Reset password with OTP
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if OTP exists
    if (!user.resetOTP) {
      return res.status(400).json({ message: 'No OTP request found. Please request a new OTP.' });
    }

    // Check if OTP is expired
    if (Date.now() > user.resetOTPExpires) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    // Verify OTP
    if (user.resetOTP !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Update password
    user.password = newPassword;
    user.resetOTP = null;
    user.resetOTPExpires = null;
    await user.save();

    res.json({
      message: 'Password reset successful',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Error resetting password' });
  }
});

module.exports = router;
