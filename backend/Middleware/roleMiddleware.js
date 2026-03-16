// backend/middleware/roleMiddleware.js

/**
 * Middleware to authorize users based on their roles
 * @param {...string} roles - Allowed roles
 * @returns {Function} Express middleware
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    // Check if user exists (should be set by auth middleware)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. Please login first.'
      });
    }

    // Check if user role is in allowed roles
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${roles.join(', ')}. Your role: ${req.user.role}`,
        requiredRoles: roles,
        userRole: req.user.role
      });
    }

    // User is authorized, proceed to next middleware/controller
    next();
  };
};

/**
 * Middleware to check if user is a student
 */
const isStudent = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized. Please login first.'
    });
  }

  if (req.user.role !== 'student') {
    return res.status(403).json({
      success: false,
      message: 'This route is only accessible to students.'
    });
  }

  next();
};

/**
 * Middleware to check if user is a faculty member
 */
const isFaculty = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized. Please login first.'
    });
  }

  if (req.user.role !== 'faculty') {
    return res.status(403).json({
      success: false,
      message: 'This route is only accessible to faculty members.'
    });
  }

  next();
};

/**
 * Middleware to check if user is HOD
 */
const isHOD = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized. Please login first.'
    });
  }

  if (req.user.role !== 'hod') {
    return res.status(403).json({
      success: false,
      message: 'This route is only accessible to Head of Department.'
    });
  }

  next();
};

/**
 * Middleware to check if user is admin
 */
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized. Please login first.'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'This route is only accessible to administrators.'
    });
  }

  next();
};

/**
 * Middleware to check if user has permission to access student data
 * Students can only access their own data
 * Faculty can access their department's students
 * HOD can access all students
 * Admin can access all students
 */
const canAccessStudentData = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized. Please login first.'
    });
  }

  const targetStudentId = req.params.studentId || req.params.id || req.body.studentId;

  // If no specific student ID is being accessed, proceed with role-based access
  if (!targetStudentId) {
    return next();
  }

  // Admin can access any student
  if (req.user.role === 'admin') {
    return next();
  }

  // HOD can access any student
  if (req.user.role === 'hod') {
    return next();
  }

  // Faculty can only access students in their department
  if (req.user.role === 'faculty') {
    // The department check will be handled in the controller
    // This middleware just passes through, and controller will verify department
    return next();
  }

  // Students can only access their own data
  if (req.user.role === 'student') {
    if (req.user.id !== targetStudentId) {
      return res.status(403).json({
        success: false,
        message: 'You can only access your own data.'
      });
    }
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Access denied.'
  });
};

/**
 * Middleware to check department access
 * Ensures faculty can only access their own department
 */
const checkDepartmentAccess = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized. Please login first.'
    });
  }

  const targetDepartmentId = req.params.departmentId || req.body.departmentId;

  // If no specific department is being accessed, proceed
  if (!targetDepartmentId) {
    return next();
  }

  // Admin and HOD can access any department
  if (req.user.role === 'admin' || req.user.role === 'hod') {
    return next();
  }

  // Faculty can only access their own department
  if (req.user.role === 'faculty') {
    if (req.user.department && req.user.department._id.toString() !== targetDepartmentId) {
      return res.status(403).json({
        success: false,
        message: 'You can only access your own department data.'
      });
    }
    return next();
  }

  // Students should not be accessing department-level routes
  return res.status(403).json({
    success: false,
    message: 'Access denied.'
  });
};

/**
 * Middleware to check if user has permission to approve permissions
 */
const canApprovePermission = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized. Please login first.'
    });
  }

  const allowedRoles = ['faculty', 'hod', 'admin'];
  
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to approve permissions.'
    });
  }

  next();
};

/**
 * Middleware to check if user has permission to assign house points
 */
const canAssignHousePoints = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized. Please login first.'
    });
  }

  // Only faculty and admin can assign house points (HOD cannot per requirements)
  if (req.user.role !== 'faculty' && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to assign house points.'
    });
  }

  next();
};

module.exports = {
  authorize,
  isStudent,
  isFaculty,
  isHOD,
  isAdmin,
  canAccessStudentData,
  checkDepartmentAccess,
  canApprovePermission,
  canAssignHousePoints
};