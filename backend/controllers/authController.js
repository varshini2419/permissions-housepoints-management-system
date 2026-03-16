const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', { expiresIn: '30d' });
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  console.log('🔑 Login attempt:', req.body.registerNumber);
  
  try {
    const { registerNumber, password } = req.body;

    if (!registerNumber || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide register number and password' 
      });
    }

    const user = await User.findOne({
      $or: [
        { registerNumber: registerNumber },
        { email: registerNumber }
      ]
    });

    if (!user) {
      console.log('❌ User not found');
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    console.log('✅ User found:', user.registerNumber);
    console.log('📦 Password in DB:', user.password);
    console.log('🔑 Password received:', password);
    
    // DIRECT COMPARISON - NO BCRYPT
    if (password !== user.password) {
      console.log('❌ Password mismatch');
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    console.log('✅ Password match! Login successful');

    const token = generateToken(user._id);

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        registerNumber: user.registerNumber,
        department: user.department,
        branch: user.branch,
        section: user.section,
        token
      }
    });

  } catch (error) {
    console.error('💥 Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during login' 
    });
  }
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, password, role, registerNumber, department, branch, section } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ 
      $or: [
        { email: email },
        { registerNumber: registerNumber }
      ]
    });

    if (userExists) {
      return res.status(400).json({ 
        success: false, 
        message: 'User already exists with this email or register number' 
      });
    }

    // Create new user (password stored as plain text)
    const user = await User.create({
      name,
      email,
      password, // Plain text password
      role: role || 'student',
      registerNumber,
      department,
      branch,
      section
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        registerNumber: user.registerNumber,
        department: user.department,
        branch: user.branch,
        section: user.section,
        token
      }
    });

  } catch (error) {
    console.error('💥 Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during registration' 
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No token provided' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('💥 Profile error:', error);
    res.status(401).json({ 
      success: false, 
      message: 'Invalid token' 
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No token provided' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
    const { name, department, branch, section } = req.body;
    
    const user = await User.findById(decoded.id);
    
    if (name) user.name = name;
    if (department) user.department = department;
    if (branch) user.branch = branch;
    if (section) user.section = section;
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        registerNumber: user.registerNumber,
        department: user.department,
        branch: user.branch,
        section: user.section
      }
    });

  } catch (error) {
    console.error('💥 Update profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error updating profile' 
    });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No token provided' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(decoded.id);
    
    // Direct plain text comparison
    if (currentPassword !== user.password) {
      return res.status(401).json({ 
        success: false, 
        message: 'Current password is incorrect' 
      });
    }
    
    // Set new password (plain text)
    user.password = newPassword;
    await user.save();
    
    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('💥 Change password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error changing password' 
    });
  }
};

module.exports = {
  login,
  register,
  getProfile,
  updateProfile,
  changePassword
};