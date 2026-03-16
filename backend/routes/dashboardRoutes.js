const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getStudentDashboard,
  getFacultyDashboard,
  getHODDashboard
} = require('../controllers/dashboardController');

router.get('/student', protect, authorize('student'), getStudentDashboard);
router.get('/faculty', protect, authorize('faculty'), getFacultyDashboard);
router.get('/hod', protect, authorize('hod'), getHODDashboard);

module.exports = router;