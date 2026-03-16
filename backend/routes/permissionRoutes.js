const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createPermission,
  getPermissions,
  updatePermissionStatus,
  getPermissionStats
} = require('../controllers/permissionController');

router.post('/', protect, authorize('student'), createPermission);
router.get('/', protect, getPermissions);
router.get('/stats', protect, authorize('faculty', 'hod'), getPermissionStats);
router.put('/:id', protect, authorize('faculty', 'hod'), updatePermissionStatus);

module.exports = router;