const HousePoint = require('../models/HousePoint');
const User = require('../models/User');
const Activity = require('../models/Activity');

// @desc    Get house points for current student
// @route   GET /api/housepoints/my-points
// @access  Private (Student only)
const getMyHousePoints = async (req, res) => {
  try {
    const housePoint = await HousePoint.findOne({ studentId: req.user._id });

    if (!housePoint) {
      return res.json({
        success: true,
        data: {
          totalPoints: 0,
          activityHistory: []
        }
      });
    }

    res.json({
      success: true,
      data: housePoint
    });
  } catch (error) {
    console.error('Get my house points error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Get student rank
// @route   GET /api/housepoints/my-rank
// @access  Private (Student only)
const getMyRank = async (req, res) => {
  try {
    const housePoint = await HousePoint.findOne({ studentId: req.user._id });

    if (!housePoint) {
      return res.json({
        success: true,
        data: {
          rank: null,
          totalPoints: 0,
          message: 'No points earned yet'
        }
      });
    }

    // Count students with more points
    const rank = await HousePoint.countDocuments({
      totalPoints: { $gt: housePoint.totalPoints }
    }) + 1;

    // Get total students
    const totalStudents = await HousePoint.countDocuments();

    res.json({
      success: true,
      data: {
        rank,
        totalStudents,
        totalPoints: housePoint.totalPoints,
        percentile: totalStudents > 0 ? ((totalStudents - rank) / totalStudents * 100).toFixed(1) : 0
      }
    });
  } catch (error) {
    console.error('Get my rank error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Get leaderboard
// @route   GET /api/housepoints/leaderboard
// @access  Private
const getLeaderboard = async (req, res) => {
  try {
    const { department, limit = 50 } = req.query;

    let query = {};
    if (department) {
      query.department = department;
    }

    const leaderboard = await HousePoint.find(query)
      .sort({ totalPoints: -1 })
      .limit(parseInt(limit))
      .select('studentName registerNumber department branch section totalPoints activityHistory');

    // Get department totals
    const departmentTotals = await HousePoint.aggregate([
      {
        $group: {
          _id: '$department',
          totalPoints: { $sum: '$totalPoints' },
          studentCount: { $sum: 1 },
          averagePoints: { $avg: '$totalPoints' }
        }
      },
      { $sort: { totalPoints: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        students: leaderboard,
        departments: departmentTotals,
        totalStudents: leaderboard.length
      }
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Get department house points
// @route   GET /api/housepoints/department
// @access  Private (Faculty/HOD)
const getDepartmentHousePoints = async (req, res) => {
  try {
    const housePoints = await HousePoint.find({ 
      department: req.user.department 
    })
    .sort({ totalPoints: -1 })
    .select('studentName registerNumber totalPoints activityHistory');

    // Get all students in department (including those with 0 points)
    const allStudents = await User.find({ 
      role: 'student', 
      department: req.user.department 
    }).select('name registerNumber branch section');

    // Combine data
    const result = allStudents.map(student => {
      const points = housePoints.find(hp => hp.registerNumber === student.registerNumber);
      return {
        studentId: student._id,
        studentName: student.name,
        registerNumber: student.registerNumber,
        branch: student.branch,
        section: student.section,
        totalPoints: points?.totalPoints || 0,
        activityHistory: points?.activityHistory || []
      };
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get department house points error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Get student house points by ID
// @route   GET /api/housepoints/student/:studentId
// @access  Private (Faculty/HOD)
const getStudentHousePoints = async (req, res) => {
  try {
    const housePoint = await HousePoint.findOne({ studentId: req.params.studentId });

    if (!housePoint) {
      // Return empty data if no points
      const student = await User.findById(req.params.studentId).select('name registerNumber department branch section');
      return res.json({
        success: true,
        data: {
          ...student.toObject(),
          totalPoints: 0,
          activityHistory: []
        }
      });
    }

    res.json({
      success: true,
      data: housePoint
    });
  } catch (error) {
    console.error('Get student house points error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Add points to student
// @route   POST /api/housepoints/add
// @access  Private (Faculty only)
const addPoints = async (req, res) => {
  try {
    const { studentId, points, reason, activityId } = req.body;

    if (!studentId || !points || !reason) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide studentId, points, and reason' 
      });
    }

    if (points <= 0 || points > 100) {
      return res.status(400).json({ 
        success: false, 
        message: 'Points must be between 1 and 100' 
      });
    }

    // Get student details
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student not found' 
      });
    }

    // Check if faculty is from same department
    if (student.department !== req.user.department) {
      return res.status(403).json({ 
        success: false, 
        message: 'You can only award points to students in your department' 
      });
    }

    // Find or create house point record
    let housePoint = await HousePoint.findOne({ studentId });

    if (!housePoint) {
      housePoint = new HousePoint({
        studentId,
        studentName: student.name,
        registerNumber: student.registerNumber,
        department: student.department,
        branch: student.branch,
        section: student.section,
        totalPoints: points,
        activityHistory: [{
          activityId: activityId || null,
          activityTitle: reason,
          points: points,
          date: new Date(),
          approvedBy: req.user.name
        }]
      });
    } else {
      housePoint.totalPoints += points;
      housePoint.activityHistory.push({
        activityId: activityId || null,
        activityTitle: reason,
        points: points,
        date: new Date(),
        approvedBy: req.user.name
      });
    }

    await housePoint.save();

    // If this is from an activity, update the activity status
    if (activityId) {
      await Activity.findByIdAndUpdate(activityId, {
        status: 'approved',
        housePoints: points,
        approvedBy: req.user._id,
        remarks: reason
      });
    }

    res.json({
      success: true,
      message: `Successfully added ${points} points to ${student.name}`,
      data: housePoint
    });
  } catch (error) {
    console.error('Add points error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Deduct points from student
// @route   POST /api/housepoints/deduct
// @access  Private (Faculty only)
const deductPoints = async (req, res) => {
  try {
    const { studentId, points, reason } = req.body;

    if (!studentId || !points || !reason) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide studentId, points, and reason' 
      });
    }

    if (points <= 0 || points > 100) {
      return res.status(400).json({ 
        success: false, 
        message: 'Points must be between 1 and 100' 
      });
    }

    // Get student details
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student not found' 
      });
    }

    // Check if faculty is from same department
    if (student.department !== req.user.department) {
      return res.status(403).json({ 
        success: false, 
        message: 'You can only deduct points from students in your department' 
      });
    }

    // Find house point record
    let housePoint = await HousePoint.findOne({ studentId });

    if (!housePoint) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student has no points to deduct' 
      });
    }

    // Check if student has enough points
    if (housePoint.totalPoints < points) {
      return res.status(400).json({ 
        success: false, 
        message: `Student only has ${housePoint.totalPoints} points. Cannot deduct ${points}.` 
      });
    }

    // Deduct points
    housePoint.totalPoints -= points;
    housePoint.activityHistory.push({
      activityId: null,
      activityTitle: `DEDUCTION: ${reason}`,
      points: -points,
      date: new Date(),
      approvedBy: req.user.name
    });

    await housePoint.save();

    res.json({
      success: true,
      message: `Successfully deducted ${points} points from ${student.name}`,
      data: housePoint
    });
  } catch (error) {
    console.error('Deduct points error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Get points history for a student
// @route   GET /api/housepoints/history/:studentId
// @access  Private (Faculty/HOD)
const getPointsHistory = async (req, res) => {
  try {
    const housePoint = await HousePoint.findOne({ studentId: req.params.studentId });

    if (!housePoint) {
      return res.json({
        success: true,
        data: []
      });
    }

    // Sort history by date (newest first)
    const history = housePoint.activityHistory.sort((a, b) => b.date - a.date);

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('Get points history error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Get points summary statistics
// @route   GET /api/housepoints/summary
// @access  Private (Faculty/HOD)
const getPointsSummary = async (req, res) => {
  try {
    const stats = await HousePoint.aggregate([
      { $match: { department: req.user.department } },
      {
        $group: {
          _id: null,
          totalPoints: { $sum: '$totalPoints' },
          totalStudents: { $sum: 1 },
          averagePoints: { $avg: '$totalPoints' },
          maxPoints: { $max: '$totalPoints' },
          minPoints: { $min: '$totalPoints' }
        }
      }
    ]);

    // Get total students in department
    const totalStudentsInDept = await User.countDocuments({ 
      role: 'student', 
      department: req.user.department 
    });

    const summary = stats[0] || {
      totalPoints: 0,
      totalStudents: 0,
      averagePoints: 0,
      maxPoints: 0,
      minPoints: 0
    };

    res.json({
      success: true,
      data: {
        ...summary,
        totalStudentsInDept,
        studentsWithPoints: summary.totalStudents,
        studentsWithoutPoints: totalStudentsInDept - summary.totalStudents
      }
    });
  } catch (error) {
    console.error('Get points summary error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

module.exports = {
  getMyHousePoints,
  getMyRank,
  getLeaderboard,
  getDepartmentHousePoints,
  getStudentHousePoints,
  addPoints,
  deductPoints,
  getPointsHistory,
  getPointsSummary
};