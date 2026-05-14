const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../Middleware/auth'); // Fixed typo
const {
  createActivity,
  getActivities,
  approveActivity,
  rejectActivity
} = require('../controllers/activityController');

router.post('/', protect, authorize('student'), createActivity);
router.get('/', protect, getActivities);
router.put('/:id/approve', protect, authorize('faculty'), approveActivity);
router.put('/:id/reject', protect, authorize('faculty'), rejectActivity);

module.exports = router;