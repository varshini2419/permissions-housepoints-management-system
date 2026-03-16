// backend/controllers/adminController.js
const User = require('../models/User');
const Department = require('../models/Department');
const Permission = require('../models/Permission');
const Activity = require('../models/Activity');
const HousePoint = require('../models/HousePoint');
const bcrypt = require('bcryptjs');

// @desc    Add new student
// @route   POST /api/admin/students
// @access  Private (Admin only)
const addStudent = async (req, res) => {
  try {
    const {
      name,
      email,
      enrollmentNo,
      department,
      house,
      year,
      semester,
      phone,
      address,
      parentName,
      parentPhone
    } = req.body;

    // Validate required fields
    if (!name || !email || !enrollmentNo || !department || !house || !year || !semester) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { enrollmentNo }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or enrollment number already exists'
      });
    }

    // Check if department exists
    const deptExists = await Department.findById(department);
    if (!deptExists) {
      return res.status(400).json({
        success: false,
        message: 'Department not found'
      });
    }

    // Generate default password
    const defaultPassword = `${name.split(' ')[0]}@${enrollmentNo.slice(-4)}`;
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // Create student
    const student = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'student',
      registerNumber: enrollmentNo, // Changed from enrollmentNo to match schema
      department,
      house,
      year: parseInt(year),
      semester: parseInt(semester),
      phone,
      address,
      parentName,
      parentPhone,
      status: 'active',
      createdBy: req.user.id
    });

    // Remove password from response
    student.password = undefined;

    res.status(201).json({
      success: true,
      message: 'Student added successfully',
      data: {
        student,
        defaultPassword
      }
    });
  } catch (error) {
    console.error('Add student error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Add new faculty
// @route   POST /api/admin/faculty
// @access  Private (Admin only)
const addFaculty = async (req, res) => {
  try {
    const {
      name,
      email,
      employeeId,
      department,
      phone,
      qualification,
      designation,
      joiningDate
    } = req.body;

    // Validate required fields
    if (!name || !email || !employeeId || !department) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { facultyId: employeeId }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or employee ID already exists'
      });
    }

    // Check if department exists
    const deptExists = await Department.findById(department);
    if (!deptExists) {
      return res.status(400).json({
        success: false,
        message: 'Department not found'
      });
    }

    // Check if faculty already exists for this department
    const existingFaculty = await User.findOne({
      role: 'faculty',
      department
    });

    if (existingFaculty) {
      return res.status(400).json({
        success: false,
        message: 'A faculty member already exists for this department. Each department can have only one class teacher.'
      });
    }

    // Generate default password
    const defaultPassword = `Faculty@${employeeId.slice(-4)}`;
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // Create faculty
    const faculty = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'faculty',
      facultyId: employeeId, // Changed from employeeId to match schema
      department,
      phone,
      qualification,
      designation: designation || 'Class Teacher',
      joiningDate: joiningDate || Date.now(),
      status: 'active',
      createdBy: req.user.id
    });

    // Remove password from response
    faculty.password = undefined;

    res.status(201).json({
      success: true,
      message: 'Faculty added successfully',
      data: {
        faculty,
        defaultPassword
      }
    });
  } catch (error) {
    console.error('Add faculty error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Add new HOD
// @route   POST /api/admin/hod
// @access  Private (Admin only)
const addHOD = async (req, res) => {
  try {
    const {
      name,
      email,
      employeeId,
      phone,
      qualification,
      joiningDate
    } = req.body;

    // Validate required fields
    if (!name || !email || !employeeId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { facultyId: employeeId }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or employee ID already exists'
      });
    }

    // Check if HOD already exists
    const existingHOD = await User.findOne({ role: 'hod' });
    if (existingHOD) {
      return res.status(400).json({
        success: false,
        message: 'HOD already exists. Only one HOD can be created.'
      });
    }

    // Generate default password
    const defaultPassword = `HOD@${employeeId.slice(-4)}`;
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // Create HOD
    const hod = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'hod',
      facultyId: employeeId, // Changed from employeeId to match schema
      phone,
      qualification,
      joiningDate: joiningDate || Date.now(),
      status: 'active',
      createdBy: req.user.id
    });

    // Remove password from response
    hod.password = undefined;

    res.status(201).json({
      success: true,
      message: 'HOD added successfully',
      data: {
        hod,
        defaultPassword
      }
    });
  } catch (error) {
    console.error('Add HOD error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create new department
// @route   POST /api/admin/departments
// @access  Private (Admin only)
const createDepartment = async (req, res) => {
  try {
    const { departmentName, branch, description } = req.body; // Changed from name to departmentName

    // Validate required fields
    if (!departmentName || !branch) {
      return res.status(400).json({
        success: false,
        message: 'Please provide department name and branch'
      });
    }

    // Check if department already exists
    const existingDept = await Department.findOne({
      departmentName // Changed from name to departmentName
    });

    if (existingDept) {
      return res.status(400).json({
        success: false,
        message: 'Department with this name already exists'
      });
    }

    // Create department
    const department = await Department.create({
      departmentName, // Changed from name to departmentName
      branch,
      description,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: department
    });
  } catch (error) {
    console.error('Create department error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Reset user password
// @route   PUT /api/admin/users/:id/reset-password
// @access  Private (Admin only)
const resetUserPassword = async (req, res) => {
  try {
    const userId = req.params.id;
    const { newPassword } = req.body;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate new password if not provided
    let password = newPassword;
    if (!password) {
      if (user.role === 'student') {
        password = `${user.name.split(' ')[0]}@${user.registerNumber?.slice(-4) || '1234'}`;
      } else if (user.role === 'faculty') {
        password = `Faculty@${user.facultyId?.slice(-4) || '1234'}`;
      } else if (user.role === 'hod') {
        password = `HOD@${user.facultyId?.slice(-4) || '1234'}`;
      } else {
        password = 'Admin@123';
      }
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user
    user.password = hashedPassword;
    user.passwordChangedAt = Date.now();
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully',
      data: {
        userId: user._id,
        name: user.name,
        role: user.role,
        newPassword: password
      }
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    View system reports
// @route   GET /api/admin/reports
// @access  Private (Admin only)
const viewSystemReports = async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;

    const dateRange = {};
    if (fromDate || toDate) {
      dateRange.$gte = fromDate ? new Date(fromDate) : new Date(0);
      dateRange.$lte = toDate ? new Date(toDate) : new Date();
    }

    // Get overall statistics
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalFaculty = await User.countDocuments({ role: 'faculty' });
    const totalHOD = await User.countDocuments({ role: 'hod' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });

    // Get department-wise distribution
    const deptDistribution = await User.aggregate([
      { $match: { role: 'student' } },
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'departments',
          localField: '_id',
          foreignField: '_id',
          as: 'deptInfo'
        }
      },
      {
        $project: {
          department: { $arrayElemAt: ['$deptInfo.departmentName', 0] },
          count: 1
        }
      }
    ]);

    // Get house-wise distribution
    const houseDistribution = await User.aggregate([
      { $match: { role: 'student' } },
      {
        $group: {
          _id: '$house',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get permissions statistics
    const permissionsStats = await Permission.aggregate([
      {
        $match: fromDate || toDate ? { createdAt: dateRange } : {}
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get activities statistics
    const activitiesStats = await Activity.aggregate([
      {
        $match: fromDate || toDate ? { createdAt: dateRange } : {}
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get points statistics
    const pointsStats = await HousePoint.aggregate([
      {
        $match: fromDate || toDate ? { awardedAt: dateRange } : {}
      },
      {
        $group: {
          _id: null,
          totalPoints: { $sum: '$totalPoints' },
          averagePoints: { $avg: '$totalPoints' },
          maxPoints: { $max: '$totalPoints' },
          minPoints: { $min: '$totalPoints' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalStudents,
          totalFaculty,
          totalHOD,
          totalAdmins,
          totalUsers: totalStudents + totalFaculty + totalHOD + totalAdmins
        },
        distribution: {
          departments: deptDistribution,
          houses: houseDistribution
        },
        permissions: permissionsStats,
        activities: activitiesStats,
        points: pointsStats[0] || {
          totalPoints: 0,
          averagePoints: 0,
          maxPoints: 0,
          minPoints: 0,
          count: 0
        }
      }
    });
  } catch (error) {
    console.error('View system reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from deleting themselves
    if (userId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    // Delete related data based on role
    if (user.role === 'student') {
      await Permission.deleteMany({ studentId: userId });
      await Activity.deleteMany({ studentId: userId });
      await HousePoint.deleteMany({ studentId: userId });
    }

    // Delete user
    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User and related data deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private (Admin only)
const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const updates = req.body;

    // Remove fields that shouldn't be updated directly
    delete updates.password;
    delete updates.role;
    delete updates._id;
    delete updates.createdAt;

    // Find and update user
    const user = await User.findByIdAndUpdate(
      userId,
      { ...updates, updatedBy: req.user.id },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all users with filtering
// @route   GET /api/admin/users
// @access  Private (Admin only)
const getAllUsers = async (req, res) => {
  try {
    const { role, department, status, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (role) query.role = role;
    if (department) query.department = department;
    if (status) query.status = status;
    
    const users = await User.find(query)
      .select('-password')
      .populate('department', 'departmentName')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await User.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: {
        users,
        totalPages: Math.ceil(total / parseInt(limit)),
        currentPage: parseInt(page),
        total
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Export all functions
module.exports = {
  addStudent,
  addFaculty,
  addHOD,
  createDepartment,
  resetUserPassword,
  viewSystemReports,
  deleteUser,
  updateUser,
  getAllUsers
};