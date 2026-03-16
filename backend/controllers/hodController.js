// backend/controllers/hodController.js
const User = require('../models/User');
const Permission = require('../models/Permission');
const Activity = require('../models/Activity');
const HousePoint = require('../models/HousePoint');
const Department = require('../models/Department');

// @desc    Get overview of all departments
// @route   GET /api/hod/departments-overview
// @access  Private (HOD only)
const getAllDepartmentsOverview = async (req, res) => {
  try {
    const hodId = req.user.id;

    // Get HOD details
    const hod = await User.findById(hodId);
    if (!hod) {
      return res.status(404).json({
        success: false,
        message: 'HOD not found'
      });
    }

    // Get all departments
    const departments = await Department.find();

    // Get overview for each department
    const overview = await Promise.all(
      departments.map(async (dept) => {
        // Student count
        const studentCount = await User.countDocuments({
          role: 'student',
          department: dept._id
        });

        // Faculty count
        const facultyCount = await User.countDocuments({
          role: 'faculty',
          department: dept._id
        });

        // Pending permissions
        const pendingPermissions = await Permission.countDocuments({
          department: dept._id,
          status: 'pending'
        });

        // Total house points for department
        const students = await User.find({
          role: 'student',
          department: dept._id
        }).select('_id');

        const studentIds = students.map(s => s._id);
        
        const totalPoints = await HousePoint.aggregate([
          { $match: { student: { $in: studentIds } } },
          { $group: { _id: null, total: { $sum: '$points' } } }
        ]);

        // Recent activities
        const recentActivities = await Activity.find({
          department: dept._id,
          status: 'approved'
        })
        .sort({ approvedAt: -1 })
        .limit(5)
        .populate('student', 'name')
        .select('title awardedPoints approvedAt');

        return {
          department: {
            id: dept._id,
            name: dept.name,
            code: dept.code
          },
          stats: {
            studentCount,
            facultyCount,
            pendingPermissions,
            totalHousePoints: totalPoints.length > 0 ? totalPoints[0].total : 0
          },
          recentActivities
        };
      })
    );

    // Get overall system stats
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalFaculty = await User.countDocuments({ role: 'faculty' });
    const totalPermissions = await Permission.countDocuments();
    const totalActivities = await Activity.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        departments: overview,
        overall: {
          totalStudents,
          totalFaculty,
          totalPermissions,
          totalActivities
        }
      }
    });
  } catch (error) {
    console.error('Get departments overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    View all permission requests across departments
// @route   GET /api/hod/permissions
// @access  Private (HOD only)
const viewAllPermissionRequests = async (req, res) => {
  try {
    const { 
      department, 
      status, 
      fromDate, 
      toDate, 
      page = 1, 
      limit = 10 
    } = req.query;

    // Build query
    const query = { currentLevel: 'hod' };
    
    if (department) query.department = department;
    if (status) query.status = status;
    
    if (fromDate || toDate) {
      query.createdAt = {};
      if (fromDate) query.createdAt.$gte = new Date(fromDate);
      if (toDate) query.createdAt.$lte = new Date(toDate);
    }

    // Get permissions with pagination
    const permissions = await Permission.find(query)
      .populate('student', 'name enrollmentNo year semester house')
      .populate('approvedBy.faculty', 'name')
      .populate('department', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get total count
    const total = await Permission.countDocuments(query);

    // Get counts by status
    const statusCounts = await Permission.aggregate([
      { $match: { currentLevel: 'hod' } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Get counts by department
    const deptCounts = await Permission.aggregate([
      { $match: { currentLevel: 'hod' } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $lookup: {
          from: 'departments',
          localField: '_id',
          foreignField: '_id',
          as: 'deptInfo'
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        permissions,
        statusCounts,
        deptCounts,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      }
    });
  } catch (error) {
    console.error('View all permissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Final approve permission
// @route   PUT /api/hod/permission/:id/approve
// @access  Private (HOD only)
const approvePermissionFinal = async (req, res) => {
  try {
    const hodId = req.user.id;
    const permissionId = req.params.id;
    const { remarks } = req.body;

    // Get HOD details
    const hod = await User.findById(hodId);
    if (!hod) {
      return res.status(404).json({
        success: false,
        message: 'HOD not found'
      });
    }

    // Find permission
    const permission = await Permission.findById(permissionId)
      .populate('student', 'name email');

    if (!permission) {
      return res.status(404).json({
        success: false,
        message: 'Permission request not found'
      });
    }

    // Verify permission is at HOD level
    if (permission.currentLevel !== 'hod') {
      return res.status(400).json({
        success: false,
        message: 'This permission is not at HOD approval stage'
      });
    }

    // Update permission
    permission.status = 'approved';
    permission.currentLevel = 'completed';
    permission.approvedBy.hod = hodId;
    permission.hodRemarks = remarks || 'Approved by HOD';
    permission.hodActionAt = Date.now();

    await permission.save();

    // TODO: Send notification to student and faculty

    res.status(200).json({
      success: true,
      message: 'Permission approved successfully',
      data: permission
    });
  } catch (error) {
    console.error('Approve permission final error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Final reject permission
// @route   PUT /api/hod/permission/:id/reject
// @access  Private (HOD only)
const rejectPermissionFinal = async (req, res) => {
  try {
    const hodId = req.user.id;
    const permissionId = req.params.id;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide rejection reason'
      });
    }

    // Get HOD details
    const hod = await User.findById(hodId);
    if (!hod) {
      return res.status(404).json({
        success: false,
        message: 'HOD not found'
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

    // Verify permission is at HOD level
    if (permission.currentLevel !== 'hod') {
      return res.status(400).json({
        success: false,
        message: 'This permission is not at HOD approval stage'
      });
    }

    // Update permission
    permission.status = 'rejected';
    permission.currentLevel = 'completed';
    permission.approvedBy.hod = hodId;
    permission.hodRemarks = reason;
    permission.hodActionAt = Date.now();

    await permission.save();

    // TODO: Send notification to student and faculty

    res.status(200).json({
      success: true,
      message: 'Permission rejected',
      data: permission
    });
  } catch (error) {
    console.error('Reject permission final error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    View leaderboard across departments
// @route   GET /api/hod/leaderboard
// @access  Private (HOD only)
const viewLeaderboard = async (req, res) => {
  try {
    const { department, house, year, limit = 20 } = req.query;

    // Build match query for students
    const matchQuery = { role: 'student' };
    if (department) matchQuery.department = department;
    if (house) matchQuery.house = house;
    if (year) matchQuery.year = year;

    // Get top students by house points
    const leaderboard = await User.aggregate([
      { $match: matchQuery },
      {
        $lookup: {
          from: 'housepoints',
          localField: '_id',
          foreignField: 'student',
          as: 'points'
        }
      },
      {
        $addFields: {
          totalPoints: { $sum: '$points.points' }
        }
      },
      {
        $project: {
          name: 1,
          email: 1,
          enrollmentNo: 1,
          department: 1,
          house: 1,
          year: 1,
          semester: 1,
          totalPoints: 1,
          profileImage: 1
        }
      },
      { $sort: { totalPoints: -1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'departments',
          localField: 'department',
          foreignField: '_id',
          as: 'deptInfo'
        }
      },
      {
        $addFields: {
          departmentName: { $arrayElemAt: ['$deptInfo.name', 0] }
        }
      },
      {
        $project: {
          deptInfo: 0
        }
      }
    ]);

    // Get house-wise totals
    const houseTotals = await HousePoint.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'student',
          foreignField: '_id',
          as: 'studentInfo'
        }
      },
      { $unwind: '$studentInfo' },
      {
        $group: {
          _id: '$studentInfo.house',
          totalPoints: { $sum: '$points' },
          studentCount: { $addToSet: '$student' }
        }
      },
      {
        $project: {
          house: '$_id',
          totalPoints: 1,
          studentCount: { $size: '$studentCount' },
          averagePoints: { $divide: ['$totalPoints', { $size: '$studentCount' }] }
        }
      },
      { $sort: { totalPoints: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        individual: leaderboard,
        houseWise: houseTotals
      }
    });
  } catch (error) {
    console.error('View leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    View student performance details
// @route   GET /api/hod/student/:id/performance
// @access  Private (HOD only)
const viewStudentPerformance = async (req, res) => {
  try {
    const studentId = req.params.id;

    // Get student details
    const student = await User.findById(studentId)
      .select('-password')
      .populate('department', 'name');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Get all permissions
    const permissions = await Permission.find({ student: studentId })
      .sort({ createdAt: -1 });

    // Get all activities
    const activities = await Activity.find({ student: studentId })
      .sort({ createdAt: -1 });

    // Get house points history
    const housePoints = await HousePoint.find({ student: studentId })
      .populate('awardedBy', 'name')
      .populate('activity', 'title')
      .sort({ awardedAt: -1 });

    // Calculate statistics
    const totalPoints = housePoints.reduce((sum, item) => sum + item.points, 0);
    
    const approvedPermissions = permissions.filter(p => p.status === 'approved').length;
    const rejectedPermissions = permissions.filter(p => p.status === 'rejected').length;
    const pendingPermissions = permissions.filter(p => p.status === 'pending').length;

    const approvedActivities = activities.filter(a => a.status === 'approved').length;
    const rejectedActivities = activities.filter(a => a.status === 'rejected').length;
    const pendingActivities = activities.filter(a => a.status === 'pending').length;

    // Points by category
    const pointsByCategory = await HousePoint.aggregate([
      { $match: { student: studentId } },
      { $group: { 
        _id: '$category',
        total: { $sum: '$points' },
        count: { $sum: 1 }
      }}
    ]);

    // Monthly performance
    const monthlyPoints = await HousePoint.aggregate([
      { $match: { student: studentId } },
      {
        $group: {
          _id: {
            year: { $year: '$awardedAt' },
            month: { $month: '$awardedAt' }
          },
          total: { $sum: '$points' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 6 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        student,
        stats: {
          totalPoints,
          permissions: {
            total: permissions.length,
            approved: approvedPermissions,
            rejected: rejectedPermissions,
            pending: pendingPermissions
          },
          activities: {
            total: activities.length,
            approved: approvedActivities,
            rejected: rejectedActivities,
            pending: pendingActivities
          }
        },
        pointsByCategory,
        monthlyPoints,
        recentPermissions: permissions.slice(0, 5),
        recentActivities: activities.slice(0, 5),
        housePointsHistory: housePoints.slice(0, 10)
      }
    });
  } catch (error) {
    console.error('View student performance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Generate department report
// @route   GET /api/hod/reports/department
// @access  Private (HOD only)
const generateDepartmentReport = async (req, res) => {
  try {
    const { departmentId, fromDate, toDate, format = 'summary' } = req.query;

    if (!departmentId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide department ID'
      });
    }

    const dateRange = {};
    if (fromDate || toDate) {
      dateRange.$gte = fromDate ? new Date(fromDate) : new Date(0);
      dateRange.$lte = toDate ? new Date(toDate) : new Date();
    }

    // Get department info
    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    // Get students in department
    const students = await User.find({
      role: 'student',
      department: departmentId
    }).select('_id name enrollmentNo house year semester');

    const studentIds = students.map(s => s._id);

    // Get permissions data
    const permissions = await Permission.find({
      student: { $in: studentIds },
      ...(fromDate || toDate ? { createdAt: dateRange } : {})
    }).populate('student', 'name enrollmentNo');

    // Get activities data
    const activities = await Activity.find({
      student: { $in: studentIds },
      ...(fromDate || toDate ? { date: dateRange } : {})
    }).populate('student', 'name enrollmentNo');

    // Get house points data
    const housePoints = await HousePoint.find({
      student: { $in: studentIds },
      ...(fromDate || toDate ? { awardedAt: dateRange } : {})
    }).populate('student', 'name enrollmentNo house');

    // Calculate summary statistics
    const totalPermissions = permissions.length;
    const approvedPermissions = permissions.filter(p => p.status === 'approved').length;
    const rejectedPermissions = permissions.filter(p => p.status === 'rejected').length;
    const pendingPermissions = permissions.filter(p => p.status === 'pending').length;

    const totalActivities = activities.length;
    const approvedActivities = activities.filter(a => a.status === 'approved').length;
    const totalPoints = housePoints.reduce((sum, p) => sum + p.points, 0);

    // House-wise distribution
    const housePointsDistribution = await HousePoint.aggregate([
      { $match: { student: { $in: studentIds } } },
      {
        $lookup: {
          from: 'users',
          localField: 'student',
          foreignField: '_id',
          as: 'studentInfo'
        }
      },
      { $unwind: '$studentInfo' },
      {
        $group: {
          _id: '$studentInfo.house',
          totalPoints: { $sum: '$points' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Top performers
    const topPerformers = await User.aggregate([
      { $match: { _id: { $in: studentIds } } },
      {
        $lookup: {
          from: 'housepoints',
          localField: '_id',
          foreignField: 'student',
          as: 'points'
        }
      },
      {
        $addFields: {
          totalPoints: { $sum: '$points.points' }
        }
      },
      { $sort: { totalPoints: -1 } },
      { $limit: 10 },
      {
        $project: {
          name: 1,
          enrollmentNo: 1,
          house: 1,
          year: 1,
          totalPoints: 1
        }
      }
    ]);

    // Format response based on requested format
    let reportData = {
      department: {
        name: department.name,
        code: department.code
      },
      period: {
        from: fromDate || 'All time',
        to: toDate || 'Present'
      },
      summary: {
        totalStudents: students.length,
        totalPermissions,
        approvedPermissions,
        rejectedPermissions,
        pendingPermissions,
        totalActivities,
        approvedActivities,
        totalPoints
      },
      housePointsDistribution,
      topPerformers
    };

    if (format === 'detailed') {
      reportData = {
        ...reportData,
        permissions: permissions.slice(0, 50),
        activities: activities.slice(0, 50),
        housePoints: housePoints.slice(0, 50)
      };
    }

    res.status(200).json({
      success: true,
      data: reportData
    });
  } catch (error) {
    console.error('Generate department report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  getAllDepartmentsOverview,
  viewAllPermissionRequests,
  approvePermissionFinal,
  rejectPermissionFinal,
  viewLeaderboard,
  viewStudentPerformance,
  generateDepartmentReport
};