const Activity = require('../models/Activity');
const HousePoint = require('../models/HousePoint');

const createActivity = async (req, res) => {
  try {
    const { activityTitle, description, date, proofImage } = req.body;

    const activity = new Activity({
      studentId: req.user._id,
      studentName: req.user.name,
      registerNumber: req.user.registerNumber,
      department: req.user.department,
      branch: req.user.branch,
      section: req.user.section,
      activityTitle,
      description,
      date,
      proofImage,
      status: 'pending'
    });

    await activity.save();

    res.status(201).json({
      success: true,
      message: 'Activity submitted successfully',
      data: activity
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

const getActivities = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'student') {
      query.studentId = req.user._id;
    } else if (req.user.role === 'faculty') {
      query.department = req.user.department;
      query.status = 'pending';
    }

    const activities = await Activity.find(query)
      .sort({ createdAt: -1 })
      .populate('studentId', 'name email registerNumber');

    res.json({
      success: true,
      data: activities
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

const approveActivity = async (req, res) => {
  try {
    const { housePoints, remarks } = req.body;
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({ 
        success: false, 
        message: 'Activity not found' 
      });
    }

    if (activity.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: `Activity already ${activity.status}` 
      });
    }

    activity.status = 'approved';
    activity.housePoints = housePoints;
    activity.approvedBy = req.user._id;
    if (remarks) activity.remarks = remarks;
    await activity.save();

    let housePoint = await HousePoint.findOne({ studentId: activity.studentId });

    if (!housePoint) {
      housePoint = new HousePoint({
        studentId: activity.studentId,
        studentName: activity.studentName,
        registerNumber: activity.registerNumber,
        department: activity.department,
        branch: activity.branch,
        section: activity.section,
        totalPoints: housePoints,
        activityHistory: [{
          activityId: activity._id,
          activityTitle: activity.activityTitle,
          points: housePoints,
          approvedBy: req.user.name
        }]
      });
    } else {
      housePoint.totalPoints += housePoints;
      housePoint.activityHistory.push({
        activityId: activity._id,
        activityTitle: activity.activityTitle,
        points: housePoints,
        approvedBy: req.user.name
      });
    }

    await housePoint.save();

    res.json({
      success: true,
      message: 'Activity approved and points assigned',
      data: activity
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

const rejectActivity = async (req, res) => {
  try {
    const { remarks } = req.body;
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({ 
        success: false, 
        message: 'Activity not found' 
      });
    }

    if (activity.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: `Activity already ${activity.status}` 
      });
    }

    activity.status = 'rejected';
    activity.approvedBy = req.user._id;
    activity.remarks = remarks;
    await activity.save();

    res.json({
      success: true,
      message: 'Activity rejected',
      data: activity
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

const getActivityStats = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'student') {
      query.studentId = req.user._id;
    } else if (req.user.role === 'faculty') {
      query.department = req.user.department;
    }

    const stats = await Activity.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          points: { $sum: '$housePoints' }
        }
      }
    ]);

    const formattedStats = {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      totalPoints: 0
    };

    stats.forEach(stat => {
      formattedStats[stat._id] = stat.count;
      formattedStats.total += stat.count;
      formattedStats.totalPoints += stat.points || 0;
    });

    res.json({
      success: true,
      data: formattedStats
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

module.exports = {
  createActivity,
  getActivities,
  approveActivity,
  rejectActivity,
  getActivityStats
};