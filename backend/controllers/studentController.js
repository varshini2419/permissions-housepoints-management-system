// backend/controllers/studentController.js
const User = require('../models/User');
const Permission = require('../models/Permission');
const Activity = require('../models/Activity');
const HousePoint = require('../models/HousePoint');

// @desc    Get student dashboard data
// @route   GET /api/student/dashboard
// @access  Private (Student only)
const getStudentDashboard = async (req, res) => {
  try {
    const studentId = req.user.id;

    // Get student details
    const student = await User.findById(studentId).select('-password');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Get pending permissions count (using studentId field from Permission schema)
    const pendingPermissions = await Permission.countDocuments({
      studentId,
      status: 'pending'
    });

    // Get recent permissions (last 5)
    const recentPermissions = await Permission.find({ studentId })
      .sort({ createdAt: -1 })
      .limit(5);

    // Get recent activities (last 5) using studentId
    const recentActivities = await Activity.find({ studentId })
      .sort({ createdAt: -1 })
      .limit(5);

    const totalActivities = await Activity.countDocuments({ studentId });
    const approvedActivities = await Activity.countDocuments({
      studentId,
      status: 'approved'
    });

    // Get total house points using aggregated HousePoint schema (one doc per student)
    const housePointDoc = await HousePoint.findOne({ studentId });
    const totalPoints = housePointDoc?.totalPoints || 0;

    // Simple month points approximation (could be refined using Activity dates)
    const monthTotal = totalPoints;

    res.status(200).json({
      success: true,
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        registerNumber: student.registerNumber,
        department: student.department,
        house: student.house,
        year: student.year,
        semester: student.semester
      },
      stats: {
        totalPoints,
        monthPoints: monthTotal,
        pendingPermissions,
        totalActivities,
        approvedActivities
      },
      recentPermissions,
      recentActivities
    });
  } catch (error) {
    console.error('Get student dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Apply for permission
// @route   POST /api/student/permission/apply
// @access  Private (Student only)
const applyPermission = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { title, description, fromDate, toDate, permissionType } = req.body;

    // Validate input
    if (!title || !description || !fromDate || !toDate || !permissionType) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if student exists
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Check for existing pending permission
    const existingPermission = await Permission.findOne({
      student: studentId,
      status: 'pending',
      permissionType
    });

    if (existingPermission) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending permission request of this type'
      });
    }

    // Handle file upload if any
    const letterUrl = req.file ? `/uploads/permission_letters/${req.file.filename}` : null;

    // Create permission request
    const permission = await Permission.create({
      student: studentId,
      title,
      description,
      fromDate,
      toDate,
      permissionType,
      letterUrl,
      status: 'pending',
      currentLevel: 'faculty',
      department: student.department
    });

    res.status(201).json({
      success: true,
      message: 'Permission request submitted successfully',
      data: permission
    });
  } catch (error) {
    console.error('Apply permission error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Submit activity for house points
// @route   POST /api/student/activity/submit
// @access  Private (Student only)
const submitActivity = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { title, description, activityType, date } = req.body;

    // Validate input
    if (!title || !description || !activityType || !date) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if student exists
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Handle proof file upload
    const proofUrl = req.file ? `/uploads/activity_proofs/${req.file.filename}` : null;

    if (!proofUrl) {
      return res.status(400).json({
        success: false,
        message: 'Please upload proof document'
      });
    }

    // Create activity submission
    const activity = await Activity.create({
      student: studentId,
      title,
      description,
      activityType,
      date: new Date(date),
      proofUrl,
      status: 'pending',
      department: student.department
    });

    res.status(201).json({
      success: true,
      message: 'Activity submitted successfully',
      data: activity
    });
  } catch (error) {
    console.error('Submit activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get student activity history
// @route   GET /api/student/activities
// @access  Private (Student only)
const getActivityHistory = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { status, type, page = 1, limit = 10 } = req.query;

    const query = { studentId };

    if (status) query.status = status;
    if (type) query.activityType = type;

    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);

    const [items, total] = await Promise.all([
      Activity.find(query)
        .sort({ createdAt: -1 })
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize),
      Activity.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: {
        docs: items,
        totalDocs: total,
        limit: pageSize,
        page: pageNumber,
        totalPages: Math.ceil(total / pageSize)
      }
    });
  } catch (error) {
    console.error('Get activity history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get student house points
// @route   GET /api/student/house-points
// @access  Private (Student only)
const getHousePoints = async (req, res) => {
  try {
    const studentId = req.user.id;

    // Using aggregated HousePoint schema: single doc per student with activities array
    const housePointDoc = await HousePoint.findOne({ studentId })
      .populate('activities.activityId', 'title activityType date')
      .populate('activities.awardedBy', 'name');

    if (!housePointDoc) {
      return res.status(200).json({
        success: true,
        totalPoints: 0,
        pointsByCategory: [],
        monthlyPoints: [],
        recentPoints: []
      });
    }

    const totalPoints = housePointDoc.totalPoints || 0;

    // Build recent points list from activities array (latest first)
    const recentPoints = [...(housePointDoc.activities || [])]
      .sort((a, b) => {
        const dateA = a.activityId?.date || housePointDoc.createdAt;
        const dateB = b.activityId?.date || housePointDoc.createdAt;
        return new Date(dateB) - new Date(dateA);
      })
      .slice(0, 10)
      .map(entry => ({
        activityTitle: entry.activityId?.title || 'Activity',
        activityType: entry.activityId?.activityType,
        date: entry.activityId?.date,
        points: entry.points,
        awardedBy: entry.awardedBy
      }));

    // Points by category
    const categoryMap = new Map();
    (housePointDoc.activities || []).forEach(entry => {
      const category = entry.activityId?.activityType || 'other';
      const prev = categoryMap.get(category) || { total: 0, count: 0 };
      categoryMap.set(category, {
        total: prev.total + (entry.points || 0),
        count: prev.count + 1
      });
    });

    const pointsByCategory = Array.from(categoryMap.entries()).map(
      ([key, value]) => ({
        _id: key,
        total: value.total,
        count: value.count
      })
    );

    // Monthly points from activities' dates
    const monthlyMap = new Map();
    (housePointDoc.activities || []).forEach(entry => {
      const date = entry.activityId?.date;
      if (!date) return;
      const d = new Date(date);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      const prev = monthlyMap.get(key) || { year: d.getFullYear(), month: d.getMonth() + 1, total: 0 };
      prev.total += entry.points || 0;
      monthlyMap.set(key, prev);
    });

    const monthlyPoints = Array.from(monthlyMap.values())
      .sort((a, b) => (b.year - a.year) || (b.month - a.month))
      .slice(0, 6)
      .map(item => ({
        _id: { year: item.year, month: item.month },
        total: item.total
      }));

    res.status(200).json({
      success: true,
      totalPoints,
      pointsByCategory,
      monthlyPoints,
      recentPoints
    });
  } catch (error) {
    console.error('Get house points error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Track permission status
// @route   GET /api/student/permission/:id/status
// @access  Private (Student only)
const trackPermissionStatus = async (req, res) => {
  try {
    const studentId = req.user.id;
    const permissionId = req.params.id;

    const permission = await Permission.findOne({
      _id: permissionId,
      student: studentId
    })
    .populate('student', 'name enrollmentNo')
    .populate('approvedBy.faculty', 'name')
    .populate('approvedBy.hod', 'name');

    if (!permission) {
      return res.status(404).json({
        success: false,
        message: 'Permission request not found'
      });
    }

    // Calculate current level and next steps
    let currentStage = 'Faculty Approval';
    let nextStage = 'HOD Approval';
    let estimatedTime = '2-3 working days';

    if (permission.status === 'approved') {
      currentStage = 'Approved';
      nextStage = 'Complete';
      estimatedTime = 'Approved';
    } else if (permission.status === 'rejected') {
      currentStage = 'Rejected';
      nextStage = 'N/A';
      estimatedTime = 'N/A';
    } else if (permission.currentLevel === 'hod') {
      currentStage = 'HOD Approval';
      nextStage = 'Final Approval';
    }

    res.status(200).json({
      success: true,
      data: {
        permission,
        tracking: {
          currentStage,
          nextStage,
          estimatedTime,
          submittedOn: permission.createdAt,
          lastUpdated: permission.updatedAt,
          facultyAction: permission.approvedBy?.faculty ? {
            by: permission.approvedBy.faculty.name,
            at: permission.facultyActionAt,
            remarks: permission.facultyRemarks
          } : null,
          hodAction: permission.approvedBy?.hod ? {
            by: permission.approvedBy.hod.name,
            at: permission.hodActionAt,
            remarks: permission.hodRemarks
          } : null
        }
      }
    });
  } catch (error) {
    console.error('Track permission status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  getStudentDashboard,
  applyPermission,
  submitActivity,
  getActivityHistory,
  getHousePoints,
  trackPermissionStatus
};