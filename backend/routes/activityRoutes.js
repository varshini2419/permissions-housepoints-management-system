const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createActivity,
  getActivities,
  approveActivity,
  rejectActivity,
  getActivityStats
} = require('../controllers/activityController');

router.post('/', protect, authorize('student'), createActivity);
router.get('/', protect, getActivities);
router.get('/stats', protect, getActivityStats);
router.put('/:id/approve', protect, authorize('faculty'), approveActivity);
router.put('/:id/reject', protect, authorize('faculty'), rejectActivity);

module.exports = router;