const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'secret123';

// 🔐 Generate Token
const generateToken = (id) =>
  jwt.sign({ id }, JWT_SECRET, { expiresIn: '30d' });

// 👤 Public user data
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

// 🔑 Password check
const verifyPassword = async (plain, user) => {
  if (!user?.password) return false;
  return bcrypt.compare(plain, user.password);
};

// ====================
// 🎓 STUDENT LOGIN
// ====================
const loginStudent = async (req, res) => {
  try {
    const { registerNumber, password } = req.body;

    if (!registerNumber || !password) {
      return res.status(400).json({ message: 'Register number and password required' });
    }

    const user = await User.findOne({
      role: 'student',
      registerNumber: registerNumber.trim(),
    });

    if (!user || !(await verifyPassword(password, user))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: toPublicUser(user),
    });
  } catch (error) {
    console.error('Student login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ====================
// 👨‍🏫 FACULTY LOGIN
// ====================
const loginFaculty = async (req, res) => {
  try {
    const { facultyId, password } = req.body;

    if (!facultyId || !password) {
      return res.status(400).json({ message: 'Faculty ID and password required' });
    }

    const user = await User.findOne({
      role: 'faculty',
      $or: [
        { email: facultyId.trim() },
        { registerNumber: facultyId.trim() }
      ]
    });

    if (!user || !(await verifyPassword(password, user))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: toPublicUser(user),
    });
  } catch (error) {
    console.error('Faculty login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ====================
// 👔 HOD LOGIN
// ====================
const loginHod = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const user = await User.findOne({
      role: 'hod',
      email: email.toLowerCase().trim(),
    });

    if (!user || !(await verifyPassword(password, user))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: toPublicUser(user),
    });
  } catch (error) {
    console.error('HOD login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ====================
// 📝 REGISTER (optional)
// ====================
const register = async (req, res) => {
  try {
    const { name, email, password, registerNumber } = req.body;

    if (!name || !email || !password || !registerNumber) {
      return res.status(400).json({
        success: false,
        message: 'All fields required',
      });
    }

    const exists = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { registerNumber }],
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists',
      });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password: hashed,
      role: 'student',
      registerNumber,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: toPublicUser(user),
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ====================
// EXPORTS
// ====================
module.exports = {
  loginStudent,
  loginFaculty,
  loginHod,
  register,
};