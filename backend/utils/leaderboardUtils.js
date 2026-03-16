// backend/utils/leaderboardUtils.js
const HousePoint = require('../models/HousePoint');
const User = require('../models/User');

/**
 * Utility functions for leaderboard and ranking calculations
 */

/**
 * Get department-wise leaderboard
 * @param {string} department - Department name (CSIT-A, CSIT-B, CSD)
 * @param {object} options - Additional options (limit, year, etc.)
 * @returns {Promise<object>} Department leaderboard data
 */
const getDepartmentLeaderboard = async (department, options = {}) => {
  try {
    const { limit = 50, year, semester, house } = options;

    if (!department) {
      throw new Error('Department is required');
    }

    // Build match query for students
    const studentMatch = { 
      role: 'student',
      department 
    };
    
    if (year) studentMatch.year = parseInt(year);
    if (semester) studentMatch.semester = parseInt(semester);
    if (house) studentMatch.house = house;

    // Get all students in the department
    const students = await User.find(studentMatch)
      .select('_id name registerNumber house year semester')
      .lean();

    if (students.length === 0) {
      return {
        success: true,
        data: {
          department,
          totalStudents: 0,
          leaderboard: [],
          statistics: {
            averagePoints: 0,
            totalPoints: 0,
            topScore: 0,
            participationRate: 0
          }
        }
      };
    }

    const studentIds = students.map(s => s._id);

    // Get house points for these students
    const housePoints = await HousePoint.find({
      studentId: { $in: studentIds }
    }).lean();

    // Create a map of student points
    const pointsMap = new Map();
    housePoints.forEach(hp => {
      pointsMap.set(hp.studentId.toString(), hp.totalPoints || 0);
    });

    // Build leaderboard with ranks
    let leaderboard = students.map(student => ({
      ...student,
      totalPoints: pointsMap.get(student._id.toString()) || 0,
      activitiesCount: 0,
      rank: 0
    }));

    // Sort by total points descending
    leaderboard.sort((a, b) => b.totalPoints - a.totalPoints);

    // Assign ranks (handle ties)
    let currentRank = 1;
    let previousPoints = null;
    
    leaderboard = leaderboard.map((student, index) => {
      if (student.totalPoints !== previousPoints) {
        currentRank = index + 1;
      }
      previousPoints = student.totalPoints;
      return { ...student, rank: currentRank };
    });

    // Calculate statistics
    const totalPoints = leaderboard.reduce((sum, s) => sum + s.totalPoints, 0);
    const studentsWithPoints = leaderboard.filter(s => s.totalPoints > 0).length;

    const statistics = {
      averagePoints: students.length > 0 ? (totalPoints / students.length).toFixed(2) : 0,
      totalPoints,
      topScore: leaderboard[0]?.totalPoints || 0,
      participationRate: students.length > 0 
        ? ((studentsWithPoints / students.length) * 100).toFixed(2) 
        : 0,
      studentsWithPoints,
      totalStudents: students.length
    };

    // Apply limit
    if (limit > 0) {
      leaderboard = leaderboard.slice(0, limit);
    }

    return {
      success: true,
      data: {
        department,
        filters: { year, semester, house },
        generatedAt: new Date().toISOString(),
        statistics,
        leaderboard
      }
    };
  } catch (error) {
    console.error('Get department leaderboard error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get top students across all departments
 * @param {number} limit - Number of top students to return
 * @param {object} filters - Optional filters (department, year, house)
 * @returns {Promise<object>} Top students data
 */
const getTopStudents = async (limit = 10, filters = {}) => {
  try {
    const { department, year, house } = filters;

    // Build pipeline for aggregation
    const pipeline = [
      // Lookup student details
      {
        $lookup: {
          from: 'users',
          localField: 'studentId',
          foreignField: '_id',
          as: 'student'
        }
      },
      { $unwind: '$student' },
      
      // Filter by student role
      { $match: { 'student.role': 'student' } }
    ];

    // Apply additional filters
    if (department) {
      pipeline.push({ $match: { 'student.department': department } });
    }
    if (year) {
      pipeline.push({ $match: { 'student.year': parseInt(year) } });
    }
    if (house) {
      pipeline.push({ $match: { 'student.house': house } });
    }

    // Group by student and calculate total points
    pipeline.push(
      {
        $group: {
          _id: '$studentId',
          totalPoints: { $sum: '$totalPoints' },
          activitiesCount: { $sum: { $size: '$activities' } },
          student: { $first: '$student' }
        }
      },
      {
        $project: {
          _id: 1,
          totalPoints: 1,
          activitiesCount: 1,
          'student.name': 1,
          'student.registerNumber': 1,
          'student.department': 1,
          'student.house': 1,
          'student.year': 1,
          'student.semester': 1
        }
      },
      { $sort: { totalPoints: -1 } },
      { $limit: parseInt(limit) }
    );

    const topStudents = await HousePoint.aggregate(pipeline);

    // Calculate additional statistics
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalPoints = topStudents.reduce((sum, s) => sum + s.totalPoints, 0);

    return {
      success: true,
      data: {
        limit,
        filters,
        generatedAt: new Date().toISOString(),
        statistics: {
          totalStudents,
          totalPointsInTop: totalPoints,
          averagePointsInTop: topStudents.length > 0 
            ? (totalPoints / topStudents.length).toFixed(2) 
            : 0
        },
        topStudents
      }
    };
  } catch (error) {
    console.error('Get top students error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Calculate rank of a specific student
 * @param {string} studentId - Student's ID
 * @returns {Promise<object>} Student rank information
 */
const calculateStudentRank = async (studentId) => {
  try {
    if (!studentId) {
      throw new Error('Student ID is required');
    }

    // Get student details
    const student = await User.findById(studentId)
      .select('name registerNumber department house year semester');

    if (!student) {
      throw new Error('Student not found');
    }

    // Get student's house points
    const studentPoints = await HousePoint.findOne({ studentId });
    const totalPoints = studentPoints?.totalPoints || 0;

    // Get all students in same department for department rank
    const deptStudents = await User.find({
      role: 'student',
      department: student.department
    }).select('_id');

    const deptStudentIds = deptStudents.map(s => s._id);

    // Get points for all department students
    const deptPoints = await HousePoint.find({
      studentId: { $in: deptStudentIds }
    }).select('studentId totalPoints').lean();

    // Calculate department rank
    const deptRankings = deptPoints
      .map(p => ({
        studentId: p.studentId,
        points: p.totalPoints || 0
      }))
      .sort((a, b) => b.points - a.points);

    let deptRank = 1;
    for (let i = 0; i < deptRankings.length; i++) {
      if (deptRankings[i].studentId.toString() === studentId) {
        deptRank = i + 1;
        break;
      }
    }

    // Calculate overall rank across all students
    const allPoints = await HousePoint.aggregate([
      {
        $group: {
          _id: '$studentId',
          totalPoints: { $sum: '$totalPoints' }
        }
      },
      { $sort: { totalPoints: -1 } }
    ]);

    let overallRank = 1;
    for (let i = 0; i < allPoints.length; i++) {
      if (allPoints[i]._id.toString() === studentId) {
        overallRank = i + 1;
        break;
      }
    }

    // Calculate house rank (within same house)
    const houseStudents = await User.find({
      role: 'student',
      house: student.house
    }).select('_id');

    const houseStudentIds = houseStudents.map(s => s._id);

    const housePoints = await HousePoint.find({
      studentId: { $in: houseStudentIds }
    }).select('studentId totalPoints').lean();

    const houseRankings = housePoints
      .map(p => ({
        studentId: p.studentId,
        points: p.totalPoints || 0
      }))
      .sort((a, b) => b.points - a.points);

    let houseRank = 1;
    for (let i = 0; i < houseRankings.length; i++) {
      if (houseRankings[i].studentId.toString() === studentId) {
        houseRank = i + 1;
        break;
      }
    }

    // Calculate year rank (within same year)
    const yearStudents = await User.find({
      role: 'student',
      year: student.year
    }).select('_id');

    const yearStudentIds = yearStudents.map(s => s._id);

    const yearPoints = await HousePoint.find({
      studentId: { $in: yearStudentIds }
    }).select('studentId totalPoints').lean();

    const yearRankings = yearPoints
      .map(p => ({
        studentId: p.studentId,
        points: p.totalPoints || 0
      }))
      .sort((a, b) => b.points - a.points);

    let yearRank = 1;
    for (let i = 0; i < yearRankings.length; i++) {
      if (yearRankings[i].studentId.toString() === studentId) {
        yearRank = i + 1;
        break;
      }
    }

    // Get percentile
    const totalStudents = await User.countDocuments({ role: 'student' });
    const percentile = ((totalStudents - overallRank + 1) / totalStudents * 100).toFixed(2);

    return {
      success: true,
      data: {
        student: {
          id: student._id,
          name: student.name,
          registerNumber: student.registerNumber,
          department: student.department,
          house: student.house,
          year: student.year
        },
        totalPoints,
        ranks: {
          overall: {
            rank: overallRank,
            outOf: totalStudents,
            percentile: parseFloat(percentile)
          },
          department: {
            rank: deptRank,
            outOf: deptStudents.length
          },
          house: {
            rank: houseRank,
            outOf: houseStudents.length
          },
          year: {
            rank: yearRank,
            outOf: yearStudents.length
          }
        }
      }
    };
  } catch (error) {
    console.error('Calculate student rank error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get house-wise leaderboard
 * @param {object} options - Filter options
 * @returns {Promise<object>} House leaderboard
 */
const getHouseLeaderboard = async (options = {}) => {
  try {
    const { department, year } = options;

    // Build match pipeline
    const matchStage = { role: 'student' };
    if (department) matchStage.department = department;
    if (year) matchStage.year = parseInt(year);

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
      { $match: matchStage },
      {
        $group: {
          _id: '$student.house',
          totalPoints: { $sum: '$totalPoints' },
          studentCount: { $sum: 1 },
          averagePoints: { $avg: '$totalPoints' },
          maxPoints: { $max: '$totalPoints' },
          minPoints: { $min: '$totalPoints' }
        }
      },
      {
        $project: {
          house: '$_id',
          totalPoints: 1,
          studentCount: 1,
          averagePoints: { $round: ['$averagePoints', 2] },
          maxPoints: 1,
          minPoints: 1
        }
      },
      { $sort: { totalPoints: -1 } }
    ]);

    // Calculate total points across all houses
    const totalPoints = houseLeaderboard.reduce((sum, h) => sum + h.totalPoints, 0);
    
    // Add percentage contribution
    const leaderboardWithPercentage = houseLeaderboard.map(house => ({
      ...house,
      percentage: totalPoints > 0 ? ((house.totalPoints / totalPoints) * 100).toFixed(2) : 0
    }));

    return {
      success: true,
      data: {
        generatedAt: new Date().toISOString(),
        filters: { department, year },
        totalPoints,
        houses: leaderboardWithPercentage
      }
    };
  } catch (error) {
    console.error('Get house leaderboard error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get year-wise leaderboard
 * @param {object} options - Filter options
 * @returns {Promise<object>} Year leaderboard
 */
const getYearLeaderboard = async (options = {}) => {
  try {
    const { department, house } = options;

    // Build match pipeline
    const matchStage = { role: 'student' };
    if (department) matchStage.department = department;
    if (house) matchStage.house = house;

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
      { $match: matchStage },
      {
        $group: {
          _id: '$student.year',
          totalPoints: { $sum: '$totalPoints' },
          studentCount: { $sum: 1 },
          averagePoints: { $avg: '$totalPoints' }
        }
      },
      {
        $project: {
          year: '$_id',
          totalPoints: 1,
          studentCount: 1,
          averagePoints: { $round: ['$averagePoints', 2] }
        }
      },
      { $sort: { year: 1 } }
    ]);

    return {
      success: true,
      data: {
        generatedAt: new Date().toISOString(),
        filters: { department, house },
        years: yearLeaderboard
      }
    };
  } catch (error) {
    console.error('Get year leaderboard error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get leaderboard by activity type
 * @param {string} activityType - Type of activity
 * @param {number} limit - Number of top students
 * @returns {Promise<object>} Activity type leaderboard
 */
const getActivityTypeLeaderboard = async (activityType, limit = 10) => {
  try {
    if (!activityType) {
      throw new Error('Activity type is required');
    }

    const leaderboard = await HousePoint.aggregate([
      { $unwind: '$activities' },
      { $match: { 'activities.activityType': activityType } },
      {
        $group: {
          _id: '$studentId',
          totalPoints: { $sum: '$activities.points' },
          activitiesCount: { $sum: 1 }
        }
      },
      { $sort: { totalPoints: -1 } },
      { $limit: parseInt(limit) },
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
          'student.department': 1,
          'student.house': 1,
          'student.year': 1
        }
      }
    ]);

    return {
      success: true,
      data: {
        activityType,
        generatedAt: new Date().toISOString(),
        leaderboard
      }
    };
  } catch (error) {
    console.error('Get activity type leaderboard error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get leaderboard statistics summary
 * @returns {Promise<object>} Leaderboard statistics
 */
const getLeaderboardStatistics = async () => {
  try {
    // Total students with points
    const studentsWithPoints = await HousePoint.countDocuments();
    
    // Total points awarded
    const totalPointsResult = await HousePoint.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$totalPoints' }
        }
      }
    ]);
    const totalPoints = totalPointsResult[0]?.total || 0;

    // Average points per student
    const totalStudents = await User.countDocuments({ role: 'student' });
    const averagePoints = totalStudents > 0 ? (totalPoints / totalStudents).toFixed(2) : 0;

    // Highest points
    const highestPoints = await HousePoint.findOne()
      .sort({ totalPoints: -1 })
      .populate('studentId', 'name registerNumber');

    // Points distribution
    const distribution = await HousePoint.aggregate([
      {
        $bucket: {
          groupBy: '$totalPoints',
          boundaries: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
          default: '100+',
          output: {
            count: { $sum: 1 }
          }
        }
      }
    ]);

    return {
      success: true,
      data: {
        totalStudents,
        studentsWithPoints,
        totalPoints,
        averagePoints,
        highestPoints: highestPoints ? {
          student: highestPoints.studentId,
          points: highestPoints.totalPoints
        } : null,
        distribution
      }
    };
  } catch (error) {
    console.error('Get leaderboard statistics error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  getDepartmentLeaderboard,
  getTopStudents,
  calculateStudentRank,
  getHouseLeaderboard,
  getYearLeaderboard,
  getActivityTypeLeaderboard,
  getLeaderboardStatistics
};