const express = require('express');
const router = express.Router();
const { login, register, getProfile, updateProfile, changePassword } = require('../controllers/authController');

// Public routes
router.post('/login', login);
router.post('/register', register);

// Protected routes
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);

module.exports = router;