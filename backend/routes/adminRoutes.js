// backend/routes/adminRoutes.js
const express = require('express');
const router = express.Router();

// Import controllers
const {
  addStudent,
  addFaculty,
  addHOD,
  createDepartment,
  resetUserPassword,
  viewSystemReports,
  deleteUser,
  updateUser,
  getAllUsers
} = require('../controllers/adminController');

// Import middleware
const { protect } = require('../Middleware/authMiddleware');
const { authorize } = require('../Middleware/roleMiddleware');

// All routes in this file are protected and restricted to admin
router.use(protect);
router.use(authorize('admin'));

/**
 * @route   POST /api/admin/add-student
 * @desc    Add new student
 * @access  Private (Admin only)
 */
router.post('/add-student', addStudent);

/**
 * @route   POST /api/admin/add-faculty
 * @desc    Add new faculty
 * @access  Private (Admin only)
 */
router.post('/add-faculty', addFaculty);

/**
 * @route   POST /api/admin/add-hod
 * @desc    Add new HOD
 * @access  Private (Admin only)
 */
router.post('/add-hod', addHOD);

/**
 * @route   POST /api/admin/create-department
 * @desc    Create new department
 * @access  Private (Admin only)
 */
router.post('/create-department', createDepartment);

/**
 * @route   GET /api/admin/users
 * @desc    Get all users (with filtering)
 * @access  Private (Admin only)
 */
router.get('/users', getAllUsers);

/**
 * @route   GET /api/admin/reports
 * @desc    View system reports
 * @access  Private (Admin only)
 */
router.get('/reports', viewSystemReports);

/**
 * @route   PUT /api/admin/reset-password/:id
 * @desc    Reset user password
 * @access  Private (Admin only)
 */
router.put('/reset-password/:id', resetUserPassword);

/**
 * @route   PUT /api/admin/update-user/:id
 * @desc    Update user details
 * @access  Private (Admin only)
 */
router.put('/update-user/:id', updateUser);

/**
 * @route   DELETE /api/admin/delete-user/:id
 * @desc    Delete user
 * @access  Private (Admin only)
 */
router.delete('/delete-user/:id', deleteUser);

module.exports = router;