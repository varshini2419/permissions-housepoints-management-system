// backend/routes/hodRoutes.js
const express = require('express');
const router = express.Router();

// Import controllers
const {
  getAllDepartmentsOverview,
  viewAllPermissionRequests,
  approvePermissionFinal,
  rejectPermissionFinal,
  viewLeaderboard,
  viewStudentPerformance,
  generateDepartmentReport
} = require('../controllers/hodController');

// Import middleware
const { protect } = require('../Middleware/authMiddleware');
const { authorize } = require('../Middleware/roleMiddleware');

// All routes in this file are protected and restricted to HOD
router.use(protect);
router.use(authorize('hod'));

router.get('/dashboard', getAllDepartmentsOverview);
router.get('/departments-overview', getAllDepartmentsOverview);
router.get('/permissions', viewAllPermissionRequests);
router.put('/approve-permission/:id', approvePermissionFinal);
router.put('/reject-permission/:id', rejectPermissionFinal);
router.get('/leaderboard', viewLeaderboard);
router.get('/student-performance/:id', viewStudentPerformance);
router.get('/reports', generateDepartmentReport);

module.exports = router;