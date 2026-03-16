const User = require('../models/User');
const Permission = require('../models/Permission');
const Activity = require('../models/Activity');
const HousePoint = require('../models/HousePoint');

const getStudentDashboard = async (req, res) => {
  try {
    const permissions = await Permission.find({ studentId: req.user._id })
      .sort({ createdAt: -1 });

    const activities = await Activity.find({ studentId: req.user._id })
      .sort({ createdAt: -1 });

    const housePoints = await HousePoint.findOne({ studentId: req.user._id });

    res.json({
      success: true,
      data: {
        user: {
          name: req.user.name,
          registerNumber: req.user.registerNumber,
          department: req.user.department,
          branch: req.user.branch,
          section: req.user.section
        },
        permissions,
        activities,
        housePoints: housePoints || { totalPoints: 0, activityHistory: [] }
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

const getFacultyDashboard = async (req, res) => {
  try {
    const students = await User.find({ 
      role: 'student', 
      department: req.user.department 
    }).select('name registerNumber branch section');

    const pendingPermissions = await Permission.find({ 
      department: req.user.department, 
      status: 'pending' 
    }).sort({ createdAt: -1 });

    const pendingActivities = await Activity.find({ 
      department: req.user.department, 
      status: 'pending' 
    }).sort({ createdAt: -1 });

    const stats = {
      totalStudents: students.length,
      pendingPermissions: pendingPermissions.length,
      pendingActivities: pendingActivities.length,
      totalHousePoints: 0
    };

    res.json({
      success: true,
      data: {
        students,
        pendingPermissions,
        pendingActivities,
        stats
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

const getHODDashboard = async (req, res) => {
  try {
    const departments = await User.distinct('department', { role: 'student' });

    const pendingPermissions = await Permission.find({ status: 'pending' })
      .sort({ createdAt: -1 })
      .populate('studentId', 'name registerNumber');

    const leaderboard = await HousePoint.find()
      .sort({ totalPoints: -1 })
      .limit(10)
      .select('studentName registerNumber department totalPoints');

    res.json({
      success: true,
      data: {
        departments,
        pendingPermissions,
        leaderboard
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

module.exports = {
  getStudentDashboard,
  getFacultyDashboard,
  getHODDashboard
};