const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getMyHousePoints,
  getMyRank,
  getLeaderboard,
  getDepartmentHousePoints,
  getStudentHousePoints,
  addPoints,
  deductPoints,
  getPointsHistory,
  getPointsSummary
} = require('../controllers/housePointController');

// Student routes
router.get('/my-points', protect, authorize('student'), getMyHousePoints);
router.get('/my-rank', protect, authorize('student'), getMyRank);

// Public/Shared routes
router.get('/leaderboard', protect, getLeaderboard);

// Faculty/HOD routes
router.get('/department', protect, authorize('faculty', 'hod'), getDepartmentHousePoints);
router.get('/student/:studentId', protect, authorize('faculty', 'hod'), getStudentHousePoints);
router.get('/history/:studentId', protect, authorize('faculty', 'hod'), getPointsHistory);
router.get('/summary', protect, authorize('faculty', 'hod'), getPointsSummary);

// Faculty only routes
router.post('/add', protect, authorize('faculty'), addPoints);
router.post('/deduct', protect, authorize('faculty'), deductPoints);

module.exports = router;