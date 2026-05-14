const express = require('express');
const router = express.Router();
const { protect } = require('../Middleware/auth');
const {
  login,
  loginStudent,
  loginFaculty,
  loginHod,
  loginAdmin,
  register,
  getProfile,
  updateProfile,
  changePassword,
} = require('../controllers/authController');

// Public routes
router.post('/login', login);
router.post('/login/student', loginStudent);
router.post('/login/faculty', loginFaculty);
router.post('/login/hod', loginHod);
router.post('/login/admin', loginAdmin);
router.post('/register', register);

// Protected routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

module.exports = router;
