const Permission = require('../models/Permission');

const createPermission = async (req, res) => {
  try {
    const { reason, date, document } = req.body;

    const permission = new Permission({
      studentId: req.user._id,
      studentName: req.user.name,
      registerNumber: req.user.registerNumber,
      department: req.user.department,
      branch: req.user.branch,
      section: req.user.section,
      reason,
      date,
      document,
      status: 'pending'
    });

    await permission.save();

    res.status(201).json({
      success: true,
      message: 'Permission request submitted successfully',
      data: permission
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

const getPermissions = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'student') {
      query.studentId = req.user._id;
    } else if (req.user.role === 'faculty') {
      query.department = req.user.department;
    } else if (req.user.role === 'hod') {
      query.status = 'pending';
    }

    const permissions = await Permission.find(query)
      .sort({ createdAt: -1 })
      .populate('studentId', 'name email registerNumber');

    res.json({
      success: true,
      data: permissions
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

const updatePermissionStatus = async (req, res) => {
  try {
    const { status, remarks } = req.body;
    const permission = await Permission.findById(req.params.id);

    if (!permission) {
      return res.status(404).json({ 
        success: false, 
        message: 'Permission not found' 
      });
    }

    if (permission.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: `Permission already ${permission.status}` 
      });
    }

    permission.status = status;
    permission.approvedBy = req.user._id;
    if (remarks) permission.remarks = remarks;

    await permission.save();

    res.json({
      success: true,
      message: `Permission ${status} successfully`,
      data: permission
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

const getPermissionStats = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'faculty') {
      query.department = req.user.department;
    }

    const stats = await Permission.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const formattedStats = {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0
    };

    stats.forEach(stat => {
      formattedStats[stat._id] = stat.count;
      formattedStats.total += stat.count;
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
  createPermission,
  getPermissions,
  updatePermissionStatus,
  getPermissionStats
};