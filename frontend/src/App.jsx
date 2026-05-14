import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import StudentDashboard from './components/StudentDashboard';
import StudentPermissions from './components/StudentPermissions';
import StudentActivities from './components/StudentActivities';
import FacultyDashboard from './components/FacultyDashboard';
import FacultyStudents from './components/FacultyStudents';
import FacultyPermissions from './components/FacultyPermissions';
import FacultyHousePoints from './components/FacultyHousePoints';
import HODDashboard from './components/HODDashboard';
import HODPermissions from './components/HODPermissions';
import './styles/global.css';

// Loading component
const LoadingSpinner = () => (
  <div className="loading-spinner">
    <div className="spinner"></div>
    <p>Loading...</p>
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    const dashboardPath = `/${user?.role}/dashboard`;
    return <Navigate to={dashboardPath} replace />;
  }

  return children;
};

// Role-based redirect component
const RoleRedirect = () => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <Navigate to={`/${user.role}/dashboard`} replace />;
};

// Admin Dashboard Fallback
const AdminDashboardFallback = () => (
  <div className="dashboard-container">
    <nav className="dashboard-nav">
      <h1>Admin Dashboard</h1>
      <div className="nav-user">
        <span>Admin User</span>
        <button className="logout-btn" onClick={() => {
          localStorage.clear();
          window.location.href = '/login';
        }}>Logout</button>
      </div>
    </nav>
    <div className="dashboard-content">
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Users</h3>
          <div className="stat-value">156</div>
        </div>
        <div className="stat-card">
          <h3>Students</h3>
          <div className="stat-value">120</div>
        </div>
        <div className="stat-card">
          <h3>Faculty</h3>
          <div className="stat-value">28</div>
        </div>
        <div className="stat-card">
          <h3>HODs</h3>
          <div className="stat-value">8</div>
        </div>
      </div>
      <div className="content-card">
        <h2>Admin Panel</h2>
        <p>Admin dashboard is being configured. Basic stats are shown above.</p>
      </div>
    </div>
  </div>
);

function AppContent() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<RoleRedirect />} />

      {/* Student Routes */}
      <Route
        path="/student/dashboard"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/permissions"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentPermissions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/activities"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentActivities />
          </ProtectedRoute>
        }
      />

      {/* Faculty Routes */}
      <Route
        path="/faculty/dashboard"
        element={
          <ProtectedRoute allowedRoles={['faculty']}>
            <FacultyDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/faculty/students"
        element={
          <ProtectedRoute allowedRoles={['faculty']}>
            <FacultyStudents />
          </ProtectedRoute>
        }
      />
      <Route
        path="/faculty/permissions"
        element={
          <ProtectedRoute allowedRoles={['faculty']}>
            <FacultyPermissions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/faculty/housepoints"
        element={
          <ProtectedRoute allowedRoles={['faculty']}>
            <FacultyHousePoints />
          </ProtectedRoute>
        }
      />

      {/* HOD Routes */}
      <Route
        path="/hod/dashboard"
        element={
          <ProtectedRoute allowedRoles={['hod']}>
            <HODDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hod/permissions"
        element={
          <ProtectedRoute allowedRoles={['hod']}>
            <HODPermissions />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboardFallback />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <div className="content-card">
              <h2>User Management</h2>
              <p>Coming Soon...</p>
            </div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/students"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <div className="content-card">
              <h2>Student Management</h2>
              <p>Coming Soon...</p>
            </div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/faculty"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <div className="content-card">
              <h2>Faculty Management</h2>
              <p>Coming Soon...</p>
            </div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/hods"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <div className="content-card">
              <h2>HOD Management</h2>
              <p>Coming Soon...</p>
            </div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <div className="content-card">
              <h2>System Settings</h2>
              <p>Coming Soon...</p>
            </div>
          </ProtectedRoute>
        }
      />

      {/* Catch all */}
      <Route path="*" element={<RoleRedirect />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;