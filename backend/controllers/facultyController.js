// backend/controllers/facultyController.js
const User = require('../models/User');
const Permission = require('../models/Permission');
const Activity = require('../models/Activity');
const HousePoint = require('../models/HousePoint');

// @desc    Get all students in faculty's department
// @route   GET /api/faculty/students
// @access  Private (Faculty only)
const getDepartmentStudents = async (req, res) => {
  try {
    const facultyId = req.user.id;
    const { year, semester, page = 1, limit = 20 } = req.query;

    // Get faculty details with department
    const faculty = await User.findById(facultyId);
    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Faculty not found'
      });
    }

    // Build query for students in same department
    const query = { 
      role: 'student',
      department: faculty.department 
    };

    if (year) query.year = year;
    if (semester) query.semester = semester;

    // Get students with pagination
    const students = await User.find(query)
      .select('-password')
      .populate('department', 'name')
      .sort({ name: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get total count
    const total = await User.countDocuments(query);

    // Get additional stats for each student
    const studentsWithStats = await Promise.all(
      students.map(async (student) => {
        const pendingPermissions = await Permission.countDocuments({
          student: student._id,
          status: 'pending'
        });

        const totalPoints = await HousePoint.aggregate([
          { $match: { student: student._id } },
          { $group: { _id: null, total: { $sum: '$points' } } }
        ]);

        return {
          ...student.toObject(),
          stats: {
            pendingPermissions,
            totalPoints: totalPoints.length > 0 ? totalPoints[0].total : 0
          }
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        students: studentsWithStats,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      }
    });
  } catch (error) {
    console.error('Get department students error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    View permission requests for faculty's department
// @route   GET /api/faculty/permissions
// @access  Private (Faculty only)
const viewPermissionRequests = async (req, res) => {
  try {
    const facultyId = req.user.id;
    const { status, fromDate, toDate, page = 1, limit = 10 } = req.query;

    // Get faculty details
    const faculty = await User.findById(facultyId);
    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Faculty not found'
      });
    }

    // Build query
    const query = { 
      department: faculty.department,
      currentLevel: 'faculty'
    };

    if (status) query.status = status;
    if (fromDate || toDate) {
      query.createdAt = {};
      if (fromDate) query.createdAt.$gte = new Date(fromDate);
      if (toDate) query.createdAt.$lte = new Date(toDate);
    }

    // Get permissions with pagination
    const permissions = await Permission.find(query)
      .populate('student', 'name enrollmentNo year semester house')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get total count
    const total = await Permission.countDocuments(query);

    // Get counts by status
    const statusCounts = await Permission.aggregate([
      { $match: { department: faculty.department } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        permissions,
        statusCounts,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      }
    });
  } catch (error) {
    console.error('View permission requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Approve permission (forward to HOD)
// @route   PUT /api/faculty/permission/:id/approve
// @access  Private (Faculty only)
const approvePermission = async (req, res) => {
  try {
    const facultyId = req.user.id;
    const permissionId = req.params.id;
    const { remarks } = req.body;

    // Get faculty details
    const faculty = await User.findById(facultyId);
    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Faculty not found'
      });
    }

    // Find permission
    const permission = await Permission.findById(permissionId)
      .populate('student', 'name department');

    if (!permission) {
      return res.status(404).json({
        success: false,
        message: 'Permission request not found'
      });
    }

    // Verify faculty owns this department
    if (permission.department.toString() !== faculty.department.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to approve permissions for this department'
      });
    }

    // Verify permission is at faculty level
    if (permission.currentLevel !== 'faculty') {
      return res.status(400).json({
        success: false,
        message: 'This permission is not at faculty approval stage'
      });
    }

    // Update permission
    permission.status = 'pending';
    permission.currentLevel = 'hod';
    permission.approvedBy.faculty = facultyId;
    permission.facultyRemarks = remarks || 'Approved by faculty';
    permission.facultyActionAt = Date.now();

    await permission.save();

    // TODO: Send notification to HOD

    res.status(200).json({
      success: true,
      message: 'Permission approved and forwarded to HOD',
      data: permission
    });
  } catch (error) {
    console.error('Approve permission error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Reject permission
// @route   PUT /api/faculty/permission/:id/reject
// @access  Private (Faculty only)
const rejectPermission = async (req, res) => {
  try {
    const facultyId = req.user.id;
    const permissionId = req.params.id;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide rejection reason'
      });
    }

    // Get faculty details
    const faculty = await User.findById(facultyId);
    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Faculty not found'
      });
    }

    // Find permission
    const permission = await Permission.findById(permissionId);

    if (!permission) {
      return res.status(404).json({
        success: false,
        message: 'Permission request not found'
      });
    }

    // Verify faculty owns this department
    if (permission.department.toString() !== faculty.department.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to reject permissions for this department'
      });
    }

    // Verify permission is at faculty level
    if (permission.currentLevel !== 'faculty') {
      return res.status(400).json({
        success: false,
        message: 'This permission is not at faculty approval stage'
      });
    }

    // Update permission
    permission.status = 'rejected';
    permission.currentLevel = 'faculty';
    permission.approvedBy.faculty = facultyId;
    permission.facultyRemarks = reason;
    permission.facultyActionAt = Date.now();

    await permission.save();

    // TODO: Send notification to student

    res.status(200).json({
      success: true,
      message: 'Permission rejected',
      data: permission
    });
  } catch (error) {
    console.error('Reject permission error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Forward permission to HOD (alternative to approve)
// @route   PUT /api/faculty/permission/:id/forward
// @access  Private (Faculty only)
const forwardPermissionToHOD = async (req, res) => {
  try {
    const facultyId = req.user.id;
    const permissionId = req.params.id;
    const { remarks } = req.body;

    // Get faculty details
    const faculty = await User.findById(facultyId);
    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Faculty not found'
      });
    }

    // Find permission
    const permission = await Permission.findById(permissionId);

    if (!permission) {
      return res.status(404).json({
        success: false,
        message: 'Permission request not found'
      });
    }

    // Verify faculty owns this department
    if (permission.department.toString() !== faculty.department.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to forward permissions for this department'
      });
    }

    // Verify permission is at faculty level
    if (permission.currentLevel !== 'faculty') {
      return res.status(400).json({
        success: false,
        message: 'This permission is not at faculty approval stage'
      });
    }

    // Forward to HOD
    permission.currentLevel = 'hod';
    permission.approvedBy.faculty = facultyId;
    permission.facultyRemarks = remarks || 'Forwarded to HOD for final approval';
    permission.facultyActionAt = Date.now();

    await permission.save();

    res.status(200).json({
      success: true,
      message: 'Permission forwarded to HOD',
      data: permission
    });
  } catch (error) {
    console.error('Forward permission error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    View activity submissions for faculty's department
// @route   GET /api/faculty/activities
// @access  Private (Faculty only)
const viewActivitySubmissions = async (req, res) => {
  try {
    const facultyId = req.user.id;
    const { status, type, fromDate, toDate, page = 1, limit = 10 } = req.query;

    // Get faculty details
    const faculty = await User.findById(facultyId);
    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Faculty not found'
      });
    }

    // Build query
    const query = { 
      department: faculty.department,
      status: status || 'pending'
    };

    if (type) query.activityType = type;
    if (fromDate || toDate) {
      query.date = {};
      if (fromDate) query.date.$gte = new Date(fromDate);
      if (toDate) query.date.$lte = new Date(toDate);
    }

    // Get activities with pagination
    const activities = await Activity.find(query)
      .populate('student', 'name enrollmentNo year semester house')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get total count
    const total = await Activity.countDocuments(query);

    // Get counts by status
    const statusCounts = await Activity.aggregate([
      { $match: { department: faculty.department } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        activities,
        statusCounts,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      }
    });
  } catch (error) {
    console.error('View activity submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Approve activity and assign house points
// @route   PUT /api/faculty/activity/:id/approve
// @access  Private (Faculty only)
const approveActivity = async (req, res) => {
  try {
    const facultyId = req.user.id;
    const activityId = req.params.id;
    const { points, remarks } = req.body;

    if (!points) {
      return res.status(400).json({
        success: false,
        message: 'Please assign points for this activity'
      });
    }

    // Get faculty details
    const faculty = await User.findById(facultyId);
    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Faculty not found'
      });
    }

    // Find activity
    const activity = await Activity.findById(activityId)
      .populate('student', 'name department house');

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity submission not found'
      });
    }

    // Verify faculty owns this department
    if (activity.department.toString() !== faculty.department.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to approve activities for this department'
      });
    }

    // Verify activity is pending
    if (activity.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'This activity has already been processed'
      });
    }

    // Update activity
    activity.status = 'approved';
    activity.approvedBy = facultyId;
    activity.approvedAt = Date.now();
    activity.facultyRemarks = remarks || 'Approved';
    activity.awardedPoints = points;

    await activity.save();

    // Create house point record
    const housePoint = await HousePoint.create({
      student: activity.student._id,
      activity: activityId,
      points,
      category: activity.activityType,
      awardedBy: facultyId,
      awardedAt: Date.now(),
      remarks: `Points awarded for ${activity.title}`
    });

    // Update student's house points total (if you have a field for it)
    await User.findByIdAndUpdate(activity.student._id, {
      $inc: { totalHousePoints: points }
    });

    res.status(200).json({
      success: true,
      message: 'Activity approved and points awarded',
      data: {
        activity,
        housePoint
      }
    });
  } catch (error) {
    console.error('Approve activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Reject activity
// @route   PUT /api/faculty/activity/:id/reject
// @access  Private (Faculty only)
const rejectActivity = async (req, res) => {
  try {
    const facultyId = req.user.id;
    const activityId = req.params.id;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide rejection reason'
      });
    }

    // Get faculty details
    const faculty = await User.findById(facultyId);
    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Faculty not found'
      });
    }

    // Find activity
    const activity = await Activity.findById(activityId);

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity submission not found'
      });
    }

    // Verify faculty owns this department
    if (activity.department.toString() !== faculty.department.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to reject activities for this department'
      });
    }

    // Verify activity is pending
    if (activity.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'This activity has already been processed'
      });
    }

    // Update activity
    activity.status = 'rejected';
    activity.approvedBy = facultyId;
    activity.approvedAt = Date.now();
    activity.facultyRemarks = reason;

    await activity.save();

    res.status(200).json({
      success: true,
      message: 'Activity rejected',
      data: activity
    });
  } catch (error) {
    console.error('Reject activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Assign house points manually
// @route   POST /api/faculty/assign-points
// @access  Private (Faculty only)
const assignHousePoints = async (req, res) => {
  try {
    const facultyId = req.user.id;
    const { studentId, points, category, reason, activityId } = req.body;

    if (!studentId || !points || !category || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Get faculty details
    const faculty = await User.findById(facultyId);
    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Faculty not found'
      });
    }

    // Check if student exists and belongs to same department
    const student = await User.findOne({
      _id: studentId,
      role: 'student',
      department: faculty.department
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found or not in your department'
      });
    }

    // Create house point record
    const housePoint = await HousePoint.create({
      student: studentId,
      activity: activityId || null,
      points,
      category,
      awardedBy: facultyId,
      awardedAt: Date.now(),
      remarks: reason,
      isManual: true
    });

    // Update student's total points
    await User.findByIdAndUpdate(studentId, {
      $inc: { totalHousePoints: points }
    });

    res.status(201).json({
      success: true,
      message: 'House points assigned successfully',
      data: housePoint
    });
  } catch (error) {
    console.error('Assign house points error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  getDepartmentStudents,
  viewPermissionRequests,
  approvePermission,
  rejectPermission,
  forwardPermissionToHOD,
  viewActivitySubmissions,
  approveActivity,
  rejectActivity,
  assignHousePoints
};