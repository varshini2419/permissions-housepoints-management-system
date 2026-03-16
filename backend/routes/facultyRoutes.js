// backend/routes/facultyRoutes.js
const express = require('express');
const router = express.Router();

// Import controllers
const {
  getDepartmentStudents,
  viewPermissionRequests,
  approvePermission,
  rejectPermission,
  forwardPermissionToHOD,
  viewActivitySubmissions,
  approveActivity,
  rejectActivity,
  assignHousePoints
} = require('../controllers/facultyController');

// Import middleware
const { protect } = require('../Middleware/authMiddleware');
const { authorize } = require('../Middleware/roleMiddleware');

// All routes in this file are protected and restricted to faculty
router.use(protect);
router.use(authorize('faculty'));

router.get('/dashboard', viewPermissionRequests);
router.get('/students', getDepartmentStudents);
router.get('/permission-requests', viewPermissionRequests);
router.get('/activity-submissions', viewActivitySubmissions);

router.put('/approve-permission/:id', approvePermission);
router.put('/reject-permission/:id', rejectPermission);
router.put('/forward-permission/:id', forwardPermissionToHOD);
router.put('/approve-activity/:id', approveActivity);
router.put('/reject-activity/:id', rejectActivity);
router.post('/assign-points', assignHousePoints);

module.exports = router;