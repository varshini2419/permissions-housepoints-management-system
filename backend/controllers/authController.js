const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const JWT_SECRET = process.env.JWT_SECRET || "secret123";

const generateToken = (id) =>
  jwt.sign({ id }, JWT_SECRET, { expiresIn: "30d" });

const toPublicUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  registerNumber: user.registerNumber,
});

const verifyPassword = async (plain, user) => {
  if (!user?.password) return false;
  return bcrypt.compare(plain, user.password);
};

// ====================
// STUDENT LOGIN
// ====================
const loginStudent = async (req, res) => {
  try {
    const { registerNumber, password } = req.body;

    if (!registerNumber || !password) {
      return res.status(400).json({ message: "Credentials required" });
    }

    const user = await User.findOne({
      role: "student",
      registerNumber,
    });

    if (!user || !(await verifyPassword(password, user))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({
      token: generateToken(user._id),
      user: toPublicUser(user),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ====================
// FACULTY LOGIN
// ====================
const loginFaculty = async (req, res) => {
  try {
    const { facultyId, password } = req.body;

    if (!facultyId || !password) {
      return res.status(400).json({ message: "Credentials required" });
    }

    const user = await User.findOne({
      role: "faculty",
      $or: [{ email: facultyId }, { registerNumber: facultyId }],
    });

    if (!user || !(await verifyPassword(password, user))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({
      token: generateToken(user._id),
      user: toPublicUser(user),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ====================
// HOD LOGIN
// ====================
const loginHod = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Credentials required" });
    }

    const user = await User.findOne({
      role: "hod",
      email,
    });

    if (!user || !(await verifyPassword(password, user))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({
      token: generateToken(user._id),
      user: toPublicUser(user),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ====================
// REGISTER
// ====================
const register = async (req, res) => {
  try {
    const { name, email, password, registerNumber } = req.body;

    if (!name || !email || !password || !registerNumber) {
      return res.status(400).json({ message: "All fields required" });
    }

    const exists = await User.findOne({
      $or: [{ email }, { registerNumber }],
    });

    if (exists) {
      return res.status(400).json({ message: "User exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
      role: "student",
      registerNumber,
    });

    res.status(201).json({
      token: generateToken(user._id),
      user: toPublicUser(user),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  loginStudent,
  loginFaculty,
  loginHod,
  register,
};