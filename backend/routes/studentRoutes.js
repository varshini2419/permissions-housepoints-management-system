// backend/routes/studentRoutes.js
const express = require('express');
const router = express.Router();

// Import controllers
const {
  getStudentDashboard,
  applyPermission,
  submitActivity,
  getActivityHistory,
  getHousePoints,
  trackPermissionStatus
} = require('../controllers/studentController');

// Import middleware
const { protect } = require('../Middleware/authMiddleware');
const { authorize } = require('../Middleware/roleMiddleware');
const { 
  uploadSinglePermissionLetter,
  uploadSingleActivityProof
} = require('../Middleware/uploadMiddleware');

// Error handler middleware for multer
const handleUploadError = (err, req, res, next) => {
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message || 'File upload error'
    });
  }
  next();
};

// All routes in this file are protected and restricted to students
router.use(protect);
router.use(authorize('student'));

router.get('/dashboard', getStudentDashboard);
router.get('/housepoints', getHousePoints);
router.get('/activities', getActivityHistory);
router.get('/permissions', getActivityHistory);
router.get('/permission/:id/status', trackPermissionStatus);

router.post(
  '/apply-permission',
  (req, res, next) => {
    uploadSinglePermissionLetter('letter')(req, res, (err) => {
      if (err) return handleUploadError(err, req, res, next);
      next();
    });
  },
  applyPermission
);

router.post(
  '/submit-activity',
  (req, res, next) => {
    uploadSingleActivityProof('proof')(req, res, (err) => {
      if (err) return handleUploadError(err, req, res, next);
      next();
    });
  },
  submitActivity
);

module.exports = router;