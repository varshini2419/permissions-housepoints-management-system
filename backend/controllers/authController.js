const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'secret123';

const generateToken = (id) =>
  jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });

const toPublicUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  registerNumber: user.registerNumber,
  department: user.department,
  branch: user.branch,
  section: user.section,
});

const respondRoleLogin = (res, user) => {
  const token = generateToken(user._id);
  res.json({
    token,
    user: toPublicUser(user),
  });
};

const verifyPassword = async (plain, user) => {
  if (!user?.password) return false;
  return bcrypt.compare(plain, user.password);
};

/** Generic login (register number or email + password) */
const login = async (req, res) => {
  try {
    const { registerNumber, password } = req.body;
    const identifier = registerNumber || req.body.email;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Credentials required',
      });
    }

    const user = await User.findOne({
      $or: [{ registerNumber: identifier }, { email: identifier }],
    });

    if (!user || !(await verifyPassword(password, user))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const token = generateToken(user._id);
    res.json({
      success: true,
      data: {
        ...toPublicUser(user),
        token,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const loginStudent = async (req, res) => {
  try {
    const { registerNumber, password } = req.body;
    if (!registerNumber || !password) {
      return res.status(400).json({ message: 'Register number and password required' });
    }
    const user = await User.findOne({
      role: 'student',
      $or: [{ registerNumber }, { email: registerNumber }],
    });
    if (!user || !(await verifyPassword(password, user))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    respondRoleLogin(res, user);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

const loginFaculty = async (req, res) => {
  try {
    const { facultyId, password } = req.body;
    if (!facultyId || !password) {
      return res.status(400).json({ message: 'Faculty ID and password required' });
    }
    const user = await User.findOne({
      role: 'faculty',
      $or: [{ email: facultyId }, { registerNumber: facultyId }],
    });
    if (!user || !(await verifyPassword(password, user))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    respondRoleLogin(res, user);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

const loginHod = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }
    const user = await User.findOne({ role: 'hod', email: email.toLowerCase().trim() });
    if (!user || !(await verifyPassword(password, user))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    respondRoleLogin(res, user);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }
    const user = await User.findOne({ role: 'admin', email: email.toLowerCase().trim() });
    if (!user || !(await verifyPassword(password, user))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    respondRoleLogin(res, user);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
};

/** Student self-registration */
const register = async (req, res) => {
  try {
    const { name, email, password, registerNumber, department, branch, section } = req.body;
    if (!name || !email || !password || !registerNumber) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, and register number are required',
      });
    }

    const exists = await User.findOne({
      $or: [{ email: email.toLowerCase().trim() }, { registerNumber }],
    });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or register number already exists',
      });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password: hashed,
      role: 'student',
      registerNumber,
      department,
      branch,
      section,
    });

    const token = generateToken(user._id);
    res.status(201).json({
      success: true,
      data: {
        ...toPublicUser(user),
        token,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: toPublicUser(user) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, department, branch, section } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (department !== undefined) updates.department = department;
    if (branch !== undefined) updates.branch = branch;
    if (section !== undefined) updates.section = section;

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: toPublicUser(user) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current and new password are required',
      });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters',
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!(await verifyPassword(currentPassword, user))) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ success: true, message: 'Password updated' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  login,
  loginStudent,
  loginFaculty,
  loginHod,
  loginAdmin,
  register,
  getProfile,
  updateProfile,
  changePassword,
};
