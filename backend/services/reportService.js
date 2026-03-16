// backend/services/reportService.js
const User = require('../models/User');
const Activity = require('../models/Activity');
const Permission = require('../models/Permission');
const HousePoint = require('../models/HousePoint');
const Department = require('../models/Department');

/**
 * Report Service Module
 * Handles all report generation for the Campus Permission & House Point Management System
 */

/**
 * Generate comprehensive department report
 * @param {string} departmentId - Department ID or name
 * @param {object} options - Report options (date range, etc.)
 * @returns {Promise<object>} Department report data
 */
const generateDepartmentReport = async (departmentId, options = {}) => {
  try {
    const { fromDate, toDate, includeDetails = false } = options;

    // Find department
    const department = await Department.findById(departmentId);
    if (!department) {
      throw new Error('Department not found');
    }

    // Date range filter
    const dateFilter = {};
    if (fromDate || toDate) {
      dateFilter.$gte = fromDate ? new Date(fromDate) : new Date(0);
      dateFilter.$lte = toDate ? new Date(toDate) : new Date();
    }

    // Get all students in department
    const students = await User.find({
      role: 'student',
      department: department.departmentName // Assuming department name is used
    }).select('_id name registerNumber house year semester');

    const studentIds = students.map(s => s._id);

    // Student statistics
    const totalStudents = students.length;
    
    // Year-wise distribution
    const yearDistribution = students.reduce((acc, student) => {
      acc[student.year] = (acc[student.year] || 0) + 1;
      return acc;
    }, {});

    // House-wise distribution
    const houseDistribution = students.reduce((acc, student) => {
      acc[student.house] = (acc[student.house] || 0) + 1;
      return acc;
    }, {});

    // Activity statistics
    const activityStats = await Activity.aggregate([
      {
        $match: {
          studentId: { $in: studentIds },
          ...(fromDate || toDate ? { date: dateFilter } : {})
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalPoints: { $sum: '$points' }
        }
      }
    ]);

    // Activity type distribution
    const activityTypeDistribution = await Activity.aggregate([
      {
        $match: {
          studentId: { $in: studentIds },
          status: 'approved',
          ...(fromDate || toDate ? { date: dateFilter } : {})
        }
      },
      {
        $group: {
          _id: '$activityType',
          count: { $sum: 1 },
          totalPoints: { $sum: '$points' }
        }
      }
    ]);

    // Permission statistics
    const permissionStats = await Permission.aggregate([
      {
        $match: {
          studentId: { $in: studentIds },
          ...(fromDate || toDate ? { createdAt: dateFilter } : {})
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Permission type distribution
    const permissionTypeDistribution = await Permission.aggregate([
      {
        $match: {
          studentId: { $in: studentIds },
          ...(fromDate || toDate ? { createdAt: dateFilter } : {})
        }
      },
      {
        $group: {
          _id: '$permissionType',
          count: { $sum: 1 }
        }
      }
    ]);

    // House points statistics
    const pointsStats = await HousePoint.aggregate([
      {
        $match: {
          studentId: { $in: studentIds },
          ...(fromDate || toDate ? { awardedAt: dateFilter } : {})
        }
      },
      {
        $group: {
          _id: null,
          totalPoints: { $sum: '$points' },
          averagePoints: { $avg: '$points' },
          maxPoints: { $max: '$points' },
          minPoints: { $min: '$points' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Points by category
    const pointsByCategory = await HousePoint.aggregate([
      {
        $match: {
          studentId: { $in: studentIds },
          ...(fromDate || toDate ? { awardedAt: dateFilter } : {})
        }
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$points' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Top performing students
    const topStudents = await HousePoint.aggregate([
      {
        $match: {
          studentId: { $in: studentIds },
          ...(fromDate || toDate ? { awardedAt: dateFilter } : {})
        }
      },
      {
        $group: {
          _id: '$studentId',
          totalPoints: { $sum: '$points' },
          activitiesCount: { $sum: 1 }
        }
      },
      { $sort: { totalPoints: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'student'
        }
      },
      { $unwind: '$student' },
      {
        $project: {
          _id: 1,
          totalPoints: 1,
          activitiesCount: 1,
          'student.name': 1,
          'student.registerNumber': 1,
          'student.house': 1,
          'student.year': 1
        }
      }
    ]);

    // Monthly trends
    const monthlyTrends = await HousePoint.aggregate([
      {
        $match: {
          studentId: { $in: studentIds },
          ...(fromDate || toDate ? { awardedAt: dateFilter } : {})
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$awardedAt' },
            month: { $month: '$awardedAt' }
          },
          totalPoints: { $sum: '$points' },
          activitiesCount: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    // Build report
    const report = {
      department: {
        id: department._id,
        name: department.departmentName,
        branch: department.branch,
        classTeacher: department.classTeacher,
        totalStudents
      },
      reportPeriod: {
        from: fromDate || 'All time',
        to: toDate || 'Present'
      },
      summary: {
        students: {
          total: totalStudents,
          yearDistribution,
          houseDistribution
        },
        activities: {
          total: activityStats.reduce((sum, stat) => sum + stat.count, 0),
          approved: activityStats.find(s => s._id === 'approved')?.count || 0,
          pending: activityStats.find(s => s._id === 'pending')?.count || 0,
          rejected: activityStats.find(s => s._id === 'rejected')?.count || 0,
          totalPoints: activityStats.find(s => s._id === 'approved')?.totalPoints || 0
        },
        permissions: {
          total: permissionStats.reduce((sum, stat) => sum + stat.count, 0),
          approved: permissionStats.find(s => s._id === 'approved')?.count || 0,
          pending: permissionStats.find(s => s._id === 'pending')?.count || 0,
          rejected: permissionStats.find(s => s._id === 'rejected')?.count || 0
        },
        housePoints: {
          total: pointsStats[0]?.totalPoints || 0,
          average: pointsStats[0]?.averagePoints || 0,
          max: pointsStats[0]?.maxPoints || 0,
          min: pointsStats[0]?.minPoints || 0,
          transactions: pointsStats[0]?.count || 0
        }
      },
      distributions: {
        activityTypes: activityTypeDistribution,
        permissionTypes: permissionTypeDistribution,
        pointsByCategory
      },
      topPerformers: topStudents,
      trends: {
        monthly: monthlyTrends
      }
    };

    // Add detailed data if requested
    if (includeDetails) {
      const recentActivities = await Activity.find({
        studentId: { $in: studentIds }
      })
        .populate('studentId', 'name registerNumber house')
        .sort({ createdAt: -1 })
        .limit(50);

      const recentPermissions = await Permission.find({
        studentId: { $in: studentIds }
      })
        .populate('studentId', 'name registerNumber')
        .sort({ createdAt: -1 })
        .limit(50);

      report.details = {
        recentActivities,
        recentPermissions
      };
    }

    return {
      success: true,
      data: report
    };
  } catch (error) {
    console.error('Generate department report error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Generate student performance report
 * @param {string} studentId - Student ID
 * @param {object} options - Report options
 * @returns {Promise<object>} Student performance report
 */
const generateStudentPerformanceReport = async (studentId, options = {}) => {
  try {
    const { fromDate, toDate } = options;

    // Find student
    const student = await User.findById(studentId)
      .select('-password')
      .populate('department', 'name');

    if (!student) {
      throw new Error('Student not found');
    }

    // Date range filter
    const dateFilter = {};
    if (fromDate || toDate) {
      dateFilter.$gte = fromDate ? new Date(fromDate) : new Date(0);
      dateFilter.$lte = toDate ? new Date(toDate) : new Date();
    }

    // Get all activities
    const activities = await Activity.find({
      studentId,
      ...(fromDate || toDate ? { date: dateFilter } : {})
    })
      .populate('approvedBy', 'name')
      .sort({ date: -1 });

    // Activity statistics
    const activityStats = {
      total: activities.length,
      approved: activities.filter(a => a.status === 'approved').length,
      pending: activities.filter(a => a.status === 'pending').length,
      rejected: activities.filter(a => a.status === 'rejected').length,
      totalPoints: activities.reduce((sum, a) => sum + (a.points || 0), 0)
    };

    // Activity type breakdown
    const activityTypeBreakdown = activities.reduce((acc, activity) => {
      if (activity.status === 'approved') {
        acc[activity.activityType] = (acc[activity.activityType] || 0) + activity.points;
      }
      return acc;
    }, {});

    // Get all permissions
    const permissions = await Permission.find({
      studentId,
      ...(fromDate || toDate ? { createdAt: dateFilter } : {})
    })
      .populate('approvedByTeacher', 'name')
      .populate('approvedByHOD', 'name')
      .sort({ createdAt: -1 });

    // Permission statistics
    const permissionStats = {
      total: permissions.length,
      approved: permissions.filter(p => p.status === 'approved').length,
      pending: permissions.filter(p => p.status === 'pending').length,
      rejected: permissions.filter(p => p.status === 'rejected').length
    };

    // Get house points
    const housePoints = await HousePoint.findOne({ studentId })
      .populate('activities.activityId', 'title activityType')
      .populate('activities.awardedBy', 'name');

    // Monthly performance
    const monthlyPerformance = await Activity.aggregate([
      {
        $match: {
          studentId,
          status: 'approved',
          ...(fromDate || toDate ? { date: dateFilter } : {})
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          points: { $sum: '$points' },
          activities: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } }
    ]);

    // Build report
    const report = {
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
      reportPeriod: {
        from: fromDate || 'All time',
        to: toDate || 'Present'
      },
      summary: {
        activities: activityStats,
        permissions: permissionStats,
        totalHousePoints: housePoints?.totalPoints || 0,
        houseRank: housePoints?.houseRank || null
      },
      breakdowns: {
        activityTypes: activityTypeBreakdown,
        pointsByCategory: housePoints?.pointsByCategory || {},
        monthlyPerformance
      },
      recentActivities: activities.slice(0, 10),
      recentPermissions: permissions.slice(0, 10),
      pointsHistory: housePoints?.pointsHistory?.slice(0, 20) || []
    };

    return {
      success: true,
      data: report
    };
  } catch (error) {
    console.error('Generate student performance report error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Generate permission report
 * @param {string} department - Department name (optional)
 * @param {object} options - Report options
 * @returns {Promise<object>} Permission report
 */
const generatePermissionReport = async (department = null, options = {}) => {
  try {
    const { fromDate, toDate, status } = options;

    // Build query
    const query = {};
    if (department) query.department = department;
    if (status) query.status = status;

    const dateFilter = {};
    if (fromDate || toDate) {
      dateFilter.$gte = fromDate ? new Date(fromDate) : new Date(0);
      dateFilter.$lte = toDate ? new Date(toDate) : new Date();
      query.createdAt = dateFilter;
    }

    // Overall statistics
    const overallStats = await Permission.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Department-wise statistics (if no specific department)
    let departmentStats = [];
    if (!department) {
      departmentStats = await Permission.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$department',
            total: { $sum: 1 },
            approved: {
              $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
            },
            pending: {
              $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
            },
            rejected: {
              $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
            }
          }
        }
      ]);
    }

    // Permission type distribution
    const typeDistribution = await Permission.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$permissionType',
          count: { $sum: 1 }
        }
      }
    ]);

    // Monthly trends
    const monthlyTrends = await Permission.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          total: { $sum: 1 },
          approved: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
          }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    // Average approval time
    const approvalTime = await Permission.aggregate([
      {
        $match: {
          ...query,
          status: 'approved',
          teacherApprovalDate: { $exists: true },
          hodApprovalDate: { $exists: true }
        }
      },
      {
        $project: {
          approvalTime: {
            $divide: [
              { $subtract: ['$hodApprovalDate', '$createdAt'] },
              1000 * 60 * 60 // Hours
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          averageHours: { $avg: '$approvalTime' },
          minHours: { $min: '$approvalTime' },
          maxHours: { $max: '$approvalTime' }
        }
      }
    ]);

    // Recent permissions
    const recentPermissions = await Permission.find(query)
      .populate('studentId', 'name registerNumber')
      .sort({ createdAt: -1 })
      .limit(50);

    // Build report
    const report = {
      reportPeriod: {
        from: fromDate || 'All time',
        to: toDate || 'Present'
      },
      filters: {
        department: department || 'All Departments',
        status: status || 'All Statuses'
      },
      summary: {
        total: overallStats.reduce((sum, stat) => sum + stat.count, 0),
        byStatus: overallStats
      },
      distributions: {
        byDepartment: departmentStats,
        byType: typeDistribution
      },
      trends: {
        monthly: monthlyTrends
      },
      performance: {
        averageApprovalTimeHours: approvalTime[0]?.averageHours || 0,
        minApprovalTimeHours: approvalTime[0]?.minHours || 0,
        maxApprovalTimeHours: approvalTime[0]?.maxHours || 0
      },
      recent: recentPermissions
    };

    return {
      success: true,
      data: report
    };
  } catch (error) {
    console.error('Generate permission report error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Generate leaderboard report
 * @param {object} options - Leaderboard options
 * @returns {Promise<object>} Leaderboard report
 */
const generateLeaderboard = async (options = {}) => {
  try {
    const { department, house, year, limit = 50 } = options;

    // Build match query for students
    const studentMatch = { role: 'student' };
    if (department) studentMatch.department = department;
    if (house) studentMatch.house = house;
    if (year) studentMatch.year = parseInt(year);

    // Get top students by house points
    const individualLeaderboard = await HousePoint.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'studentId',
          foreignField: '_id',
          as: 'student'
        }
      },
      { $unwind: '$student' },
      { $match: studentMatch },
      {
        $project: {
          studentId: 1,
          totalPoints: 1,
          'student.name': 1,
          'student.registerNumber': 1,
          'student.department': 1,
          'student.house': 1,
          'student.year': 1,
          activitiesCount: { $size: '$activities' }
        }
      },
      { $sort: { totalPoints: -1 } },
      { $limit: parseInt(limit) }
    ]);

    // Get house-wise leaderboard
    const houseLeaderboard = await HousePoint.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'studentId',
          foreignField: '_id',
          as: 'student'
        }
      },
      { $unwind: '$student' },
      {
        $match: department ? { 'student.department': department } : {}
      },
      {
        $group: {
          _id: '$student.house',
          totalPoints: { $sum: '$totalPoints' },
          studentCount: { $sum: 1 },
          averagePoints: { $avg: '$totalPoints' },
          topScore: { $max: '$totalPoints' }
        }
      },
      { $sort: { totalPoints: -1 } }
    ]);

    // Get department-wise leaderboard
    const departmentLeaderboard = await HousePoint.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'studentId',
          foreignField: '_id',
          as: 'student'
        }
      },
      { $unwind: '$student' },
      {
        $group: {
          _id: '$student.department',
          totalPoints: { $sum: '$totalPoints' },
          studentCount: { $sum: 1 },
          averagePoints: { $avg: '$totalPoints' }
        }
      },
      { $sort: { totalPoints: -1 } }
    ]);

    // Get year-wise leaderboard
    const yearLeaderboard = await HousePoint.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'studentId',
          foreignField: '_id',
          as: 'student'
        }
      },
      { $unwind: '$student' },
      {
        $group: {
          _id: '$student.year',
          totalPoints: { $sum: '$totalPoints' },
          studentCount: { $sum: 1 },
          averagePoints: { $avg: '$totalPoints' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get activity type leaderboard
    const activityTypeLeaderboard = await Activity.aggregate([
      {
        $match: { status: 'approved' }
      },
      {
        $group: {
          _id: '$activityType',
          totalPoints: { $sum: '$points' },
          activitiesCount: { $sum: 1 },
          studentsCount: { $addToSet: '$studentId' }
        }
      },
      {
        $project: {
          _id: 1,
          totalPoints: 1,
          activitiesCount: 1,
          studentsCount: { $size: '$studentsCount' },
          averagePoints: { $divide: ['$totalPoints', '$activitiesCount'] }
        }
      },
      { $sort: { totalPoints: -1 } }
    ]);

    // Get top performing students by category
    const topByCategory = await HousePoint.aggregate([
      { $unwind: '$activities' },
      {
        $group: {
          _id: {
            category: '$activities.activityType',
            student: '$studentId'
          },
          points: { $sum: '$activities.points' }
        }
      },
      { $sort: { points: -1 } },
      {
        $group: {
          _id: '$_id.category',
          topStudents: {
            $push: {
              student: '$_id.student',
              points: '$points'
            }
          }
        }
      },
      {
        $project: {
          topStudents: { $slice: ['$topStudents', 5] }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'topStudents.student',
          foreignField: '_id',
          as: 'studentDetails'
        }
      }
    ]);

    // Build report
    const report = {
      generatedAt: new Date().toISOString(),
      filters: {
        department: department || 'All Departments',
        house: house || 'All Houses',
        year: year || 'All Years'
      },
      leaderboards: {
        individual: individualLeaderboard,
        byHouse: houseLeaderboard,
        byDepartment: departmentLeaderboard,
        byYear: yearLeaderboard,
        byActivityType: activityTypeLeaderboard
      },
      statistics: {
        totalStudents: individualLeaderboard.length,
        totalPoints: individualLeaderboard.reduce((sum, s) => sum + s.totalPoints, 0),
        averagePoints: individualLeaderboard.reduce((sum, s) => sum + s.totalPoints, 0) / individualLeaderboard.length || 0,
        topScore: individualLeaderboard[0]?.totalPoints || 0
      }
    };

    return {
      success: true,
      data: report
    };
  } catch (error) {
    console.error('Generate leaderboard error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Generate system-wide analytics report
 * @param {object} options - Report options
 * @returns {Promise<object>} System analytics report
 */
const generateSystemAnalyticsReport = async (options = {}) => {
  try {
    const { fromDate, toDate } = options;

    const dateFilter = {};
    if (fromDate || toDate) {
      dateFilter.$gte = fromDate ? new Date(fromDate) : new Date(0);
      dateFilter.$lte = toDate ? new Date(toDate) : new Date();
    }

    // User statistics
    const userStats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
          active: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          }
        }
      }
    ]);

    // Department statistics
    const deptStats = await Department.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'departmentName',
          foreignField: 'department',
          as: 'students'
        }
      },
      {
        $project: {
          name: '$departmentName',
          studentCount: { $size: '$students' },
          classTeacher: 1
        }
      }
    ]);

    // Activity trends
    const activityTrends = await Activity.aggregate([
      {
        $match: fromDate || toDate ? { date: dateFilter } : {}
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            week: { $week: '$date' }
          },
          total: { $sum: 1 },
          approved: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
          },
          points: { $sum: '$points' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1, '_id.week': -1 } },
      { $limit: 52 }
    ]);

    // Permission trends
    const permissionTrends = await Permission.aggregate([
      {
        $match: fromDate || toDate ? { createdAt: dateFilter } : {}
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            week: { $week: '$createdAt' }
          },
          total: { $sum: 1 },
          approved: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
          }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1, '_id.week': -1 } },
      { $limit: 52 }
    ]);

    // System health metrics
    const systemHealth = {
      totalUsers: userStats.reduce((sum, stat) => sum + stat.count, 0),
      activeUsers: userStats.reduce((sum, stat) => sum + stat.active, 0),
      userDistribution: userStats,
      departments: deptStats,
      activityMetrics: {
        total: activityTrends.reduce((sum, t) => sum + t.total, 0),
        approved: activityTrends.reduce((sum, t) => sum + t.approved, 0),
        totalPoints: activityTrends.reduce((sum, t) => sum + t.points, 0)
      },
      permissionMetrics: {
        total: permissionTrends.reduce((sum, t) => sum + t.total, 0),
        approved: permissionTrends.reduce((sum, t) => sum + t.approved, 0)
      }
    };

    return {
      success: true,
      data: {
        generatedAt: new Date().toISOString(),
        period: {
          from: fromDate || 'All time',
          to: toDate || 'Present'
        },
        systemHealth,
        trends: {
          activities: activityTrends,
          permissions: permissionTrends
        }
      }
    };
  } catch (error) {
    console.error('Generate system analytics error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  generateDepartmentReport,
  generateStudentPerformanceReport,
  generatePermissionReport,
  generateLeaderboard,
  generateSystemAnalyticsReport
};