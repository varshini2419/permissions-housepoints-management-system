// backend/routes/index.js
const express = require('express');
const router = express.Router();

// Import all route modules
const authRoutes = require('./authRoutes');
const studentRoutes = require('./studentRoutes');
const facultyRoutes = require('./facultyRoutes');
const hodRoutes = require('./hodRoutes');
const adminRoutes = require('./adminRoutes');
const permissionRoutes = require('./permissionRoutes');
const activityRoutes = require('./activityRoutes');

// Register routes with API prefixes
router.use('/api/auth', authRoutes);
router.use('/api/student', studentRoutes);
router.use('/api/faculty', facultyRoutes);
router.use('/api/hod', hodRoutes);
router.use('/api/admin', adminRoutes);
router.use('/api/permissions', permissionRoutes);
router.use('/api/activities', activityRoutes);

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 404 handler for undefined routes
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

module.exports = router;