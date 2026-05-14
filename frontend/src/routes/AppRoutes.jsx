// frontend/src/routes/AppRoutes.js
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Import Layouts
import StudentLayout from '../layouts/StudentLayout';
import FacultyLayout from '../layouts/FacultyLayout';
import HodLayout from '../layouts/HodLayout';
import AdminLayout from '../layouts/AdminLayout';

// Import Auth Pages
import StudentLogin from '../pages/auth/StudentLogin';
import FacultyLogin from '../pages/auth/FacultyLogin';
import HodLogin from '../pages/auth/HodLogin';
import AdminLogin from '../pages/auth/AdminLogin';

// Import Student Pages
import StudentDashboard from '../pages/student/StudentDashboard';
import ApplyPermission from '../pages/student/ApplyPermission';
import SubmitActivity from '../pages/student/SubmitActivity';
import ActivityHistory from '../pages/student/ActivityHistory';
import HousePoints from '../pages/student/HousePoints';

// Import Faculty Pages
import FacultyDashboard from '../pages/faculty/FacultyDashboard';
import PermissionRequests from '../pages/faculty/PermissionRequests';
import ActivityApprovals from '../pages/faculty/ActivityApprovals';
import AssignPoints from '../pages/faculty/AssignPoints';

// Import HOD Pages
import HodDashboard from '../pages/hod/HodDashboard';
import DepartmentOverview from '../pages/hod/DepartmentOverview';
import HodPermissionApprovals from '../pages/hod/PermissionApprovals';
import HodLeaderboard from '../pages/hod/Leaderboard';
import Reports from '../pages/hod/Reports';

// Import Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import ManageStudents from '../pages/admin/ManageStudents';
import ManageFaculty from '../pages/admin/ManageFaculty';
import ManageDepartments from '../pages/admin/ManageDepartments';
import ResetPasswords from '../pages/admin/ResetPasswords';

// Import Common Pages
import Home from '../pages/common/Home';
import NotFound from '../pages/common/NotFound';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, hasRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !hasRole(allowedRoles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

const AppRoutes = () => {
  const { isAuthenticated, role } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      
      {/* Auth Routes */}
      <Route path="/login/student" element={
        !isAuthenticated ? <StudentLogin /> : <Navigate to={`/${role}/dashboard`} replace />
      } />
      <Route path="/login/faculty" element={
        !isAuthenticated ? <FacultyLogin /> : <Navigate to={`/${role}/dashboard`} replace />
      } />
      <Route path="/login/hod" element={
        !isAuthenticated ? <HodLogin /> : <Navigate to={`/${role}/dashboard`} replace />
      } />
      <Route path="/login/admin" element={
        !isAuthenticated ? <AdminLogin /> : <Navigate to={`/${role}/dashboard`} replace />
      } />

      {/* Protected Student Routes */}
      <Route path="/student" element={
        <ProtectedRoute allowedRoles={['student']}>
          <StudentLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="apply-permission" element={<ApplyPermission />} />
        <Route path="submit-activity" element={<SubmitActivity />} />
        <Route path="activity-history" element={<ActivityHistory />} />
        <Route path="house-points" element={<HousePoints />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* Protected Faculty Routes */}
      <Route path="/faculty" element={
        <ProtectedRoute allowedRoles={['faculty']}>
          <FacultyLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<FacultyDashboard />} />
        <Route path="permission-requests" element={<PermissionRequests />} />
        <Route path="activity-approvals" element={<ActivityApprovals />} />
        <Route path="assign-points" element={<AssignPoints />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* Protected HOD Routes */}
      <Route path="/hod" element={
        <ProtectedRoute allowedRoles={['hod']}>
          <HodLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<HodDashboard />} />
        <Route path="departments" element={<DepartmentOverview />} />
        <Route path="permissions" element={<HodPermissionApprovals />} />
        <Route path="leaderboard" element={<HodLeaderboard />} />
        <Route path="reports" element={<Reports />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* Protected Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="manage-students" element={<ManageStudents />} />
        <Route path="manage-faculty" element={<ManageFaculty />} />
        <Route path="manage-departments" element={<ManageDepartments />} />
        <Route path="reset-passwords" element={<ResetPasswords />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* Unauthorized Page */}
      <Route path="/unauthorized" element={
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
            <h1 className="text-6xl font-bold text-red-600 mb-4">403</h1>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-6">
              You don't have permission to access this page.
            </p>
            <button
              onClick={() => window.history.back()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      } />

      {/* 404 Not Found */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;