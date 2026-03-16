import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI } from '../services/api';
import DashboardLayout from './DashboardLayout';
import { 
  FaUsers, 
  FaClock, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaStar,
  FaCalendarAlt,
  FaClipboardList 
} from 'react-icons/fa';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await dashboardAPI.getStudentDashboard();
      if (response.data.success) {
        setDashboardData(response.data.data);
      }
    } catch (error) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStats = () => {
    if (!dashboardData) return [];
    
    const permissions = dashboardData.permissions || [];
    const activities = dashboardData.activities || [];
    const housePoints = dashboardData.housePoints || { totalPoints: 0 };

    return [
      {
        icon: <FaUsers />,
        title: 'Total Permissions',
        value: permissions.length,
        desc: `${permissions.filter(p => p.status === 'pending').length} pending`,
        iconBg: '#dbeafe',
        iconColor: '#2563eb'
      },
      {
        icon: <FaCheckCircle />,
        title: 'Approved',
        value: permissions.filter(p => p.status === 'approved').length,
        desc: 'permissions approved',
        iconBg: '#dcfce7',
        iconColor: '#22c55e'
      },
      {
        icon: <FaStar />,
        title: 'House Points',
        value: housePoints.totalPoints,
        desc: `${activities.filter(a => a.status === 'approved').length} activities`,
        iconBg: '#fef9c3',
        iconColor: '#eab308'
      },
      {
        icon: <FaClock />,
        title: 'Pending',
        value: activities.filter(a => a.status === 'pending').length,
        desc: 'activities pending',
        iconBg: '#fee2e2',
        iconColor: '#ef4444'
      }
    ];
  };

  if (loading) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </DashboardLayout>
    );
  }

  const stats = getStats();

  return (
    <DashboardLayout title={`Welcome, ${user?.name}`}>
      {error && (
        <div className="alert alert-error">
          <span className="alert-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={`stat-${index}`} className="stat-card">
            <div className="stat-icon" style={{ background: stat.iconBg, color: stat.iconColor }}>
              {stat.icon}
            </div>
            <h3>{stat.title}</h3>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-desc">
              <span>↑</span> {stat.desc}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Permissions */}
      <div className="content-card">
        <h2>
          <FaCalendarAlt /> Recent Permissions
        </h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Reason</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData?.permissions?.slice(0, 5).map(permission => (
                <tr key={permission._id}>
                  <td>{new Date(permission.date).toLocaleDateString()}</td>
                  <td>{permission.reason}</td>
                  <td>
                    <span className={`status-badge status-${permission.status}`}>
                      {permission.status}
                    </span>
                  </td>
                </tr>
              ))}
              {dashboardData?.permissions?.length === 0 && (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', padding: '24px' }}>
                    No permissions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="content-card">
        <h2>
          <FaClipboardList /> Recent Activities
        </h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Activity</th>
                <th>Points</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData?.activities?.slice(0, 5).map(activity => (
                <tr key={activity._id}>
                  <td>{new Date(activity.date).toLocaleDateString()}</td>
                  <td>{activity.activityTitle}</td>
                  <td>
                    {activity.housePoints > 0 ? (
                      <span className="text-success">+{activity.housePoints}</span>
                    ) : '-'}
                  </td>
                  <td>
                    <span className={`status-badge status-${activity.status}`}>
                      {activity.status}
                    </span>
                  </td>
                </tr>
              ))}
              {dashboardData?.activities?.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '24px' }}>
                    No activities found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;