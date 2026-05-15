const User = require("../models/User");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "secret123";

const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: "30d" });
};

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

// STUDENT LOGIN
const loginStudent = async (req, res) => {
  try {
    const { registerNumber, password } = req.body;
    const id = (registerNumber || "").trim();

    if (!id || !password) {
      return res.status(400).json({
        message: "Register number and password required",
      });
    }

    const user = await User.findOne({
      role: "student",
      registerNumber: id,
    });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    return res.json({
      token: generateToken(user._id),
      user: toPublicUser(user),
    });
  } catch (error) {
    console.error("Student login error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// FACULTY LOGIN
const loginFaculty = async (req, res) => {
  try {
    const { facultyId, email, password } = req.body;
    const id = (facultyId || email || "").trim();

    if (!id || !password) {
      return res.status(400).json({
        message: "Faculty ID and password required",
      });
    }

    const user = await User.findOne({
      role: "faculty",
      $or: [
        { registerNumber: id },
        { email: id },
        { email: `${id}@campus.edu` },
      ],
    });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    return res.json({
      token: generateToken(user._id),
      user: toPublicUser(user),
    });
  } catch (error) {
    console.error("Faculty login error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// HOD LOGIN
const loginHod = async (req, res) => {
  try {
    const { hodId, email, password } = req.body;
    const id = (hodId || email || "").trim();

    if (!id || !password) {
      return res.status(400).json({
        message: "HOD ID and password required",
      });
    }

    const user = await User.findOne({
      role: "hod",
      $or: [
        { registerNumber: id },
        { email: id },
        { email: `${id}@campus.edu` },
      ],
    });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    return res.json({
      token: generateToken(user._id),
      user: toPublicUser(user),
    });
  } catch (error) {
    console.error("HOD login error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// REGISTER
const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      registerNumber,
      department,
      branch,
      section,
    } = req.body;

    if (!name || !email || !password || !registerNumber) {
      return res.status(400).json({
        message: "Name, email, password, and register number are required",
      });
    }

    const exists = await User.findOne({
      $or: [
        { email: email.toLowerCase().trim() },
        { registerNumber: registerNumber.trim() },
      ],
    });

    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const bcrypt = require("bcryptjs");
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: "student",
      registerNumber: registerNumber.trim(),
      department,
      branch,
      section,
    });

    return res.status(201).json({
      token: generateToken(user._id),
      user: toPublicUser(user),
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  loginStudent,
  loginFaculty,
  loginHod,
  register,
};