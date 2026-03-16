// frontend/src/pages/admin/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../../styles/global.css';

import { 
  FaUsers, 
  FaChalkboardTeacher, 
  FaBuilding, 
  FaFileAlt, 
  FaKey,
  FaUserGraduate,
  FaChartBar,
  FaCalendarCheck
} from 'react-icons/fa';
import api from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/reports');
      setStats(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load dashboard statistics');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Students',
      value: stats?.summary?.totalStudents || 0,
      icon: FaUsers,
      iconBg: '#dbeafe',
      iconColor: '#1e40af',
      link: '/admin/manage-students'
    },
    {
      title: 'Total Faculty',
      value: stats?.summary?.totalFaculty || 0,
      icon: FaChalkboardTeacher,
      iconBg: '#dcfce7',
      iconColor: '#15803d',
      link: '/admin/manage-faculty'
    },
    {
      title: 'Total Departments',
      value: stats?.distribution?.departments?.length || 3,
      icon: FaBuilding,
      iconBg: '#f3e8ff',
      iconColor: '#6b21a8',
      link: '/admin/manage-departments'
    },
    {
      title: 'Activities Submitted',
      value: stats?.activities?.reduce((acc, curr) => acc + curr.count, 0) || 0,
      icon: FaFileAlt,
      iconBg: '#fef3c7',
      iconColor: '#b45309',
      link: '#'
    },
    {
      title: 'Permissions Requested',
      value: stats?.permissions?.reduce((acc, curr) => acc + curr.count, 0) || 0,
      icon: FaCalendarCheck,
      iconBg: '#fee2e2',
      iconColor: '#b91c1c',
      link: '#'
    }
  ];

  const quickActions = [
    {
      title: 'Manage Students',
      description: 'Add, edit, or remove student accounts',
      icon: FaUserGraduate,
      iconBg: '#dbeafe',
      iconColor: '#1e40af',
      link: '/admin/manage-students'
    },
    {
      title: 'Manage Faculty',
      description: 'Manage faculty members and class teachers',
      icon: FaChalkboardTeacher,
      iconBg: '#dcfce7',
      iconColor: '#15803d',
      link: '/admin/manage-faculty'
    },
    {
      title: 'Manage Departments',
      description: 'Configure departments and class teachers',
      icon: FaBuilding,
      iconBg: '#f3e8ff',
      iconColor: '#6b21a8',
      link: '/admin/manage-departments'
    },
    {
      title: 'Reset Passwords',
      description: 'Reset user passwords and manage credentials',
      icon: FaKey,
      iconBg: '#fee2e2',
      iconColor: '#b91c1c',
      link: '/admin/reset-passwords'
    }
  ];

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '400px' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Welcome Header */}
      <div className="card">
        <div className="card-body">
          <h1 className="h2 mb-2">Welcome back, {user?.name}!</h1>
          <p className="text-secondary">Here's what's happening with your system today.</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Link
              key={index}
              to={card.link}
              style={{ textDecoration: 'none' }}
            >
              <div className="stat-card">
                <div className="stat-card-header">
                  <div 
                    className="stat-card-icon"
                    style={{ color: card.iconColor }}
                  >
                    <Icon style={{ fontSize: '28px' }} />
                  </div>
                </div>
                <div className="stat-card-body">
                  <div className="stat-card-value">{card.value}</div>
                  <div className="stat-card-label">{card.title}</div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Link
              key={index}
              to={action.link}
              style={{ textDecoration: 'none' }}
            >
              <div className="card" style={{ cursor: 'pointer' }}>
                <div className="card-body">
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '8px',
                      backgroundColor: action.iconBg,
                      color: action.iconColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '12px',
                      fontSize: '24px'
                    }}
                  >
                    <Icon />
                  </div>
                  <h3 className="font-semibold mb-1">{action.title}</h3>
                  <p className="text-secondary text-sm">{action.description}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="card mt-6">
        <div className="card-header">
          <h2 className="h3 m-0">Recent Activity</h2>
        </div>
        <div className="card-body">
          {stats?.recent && stats.recent.length > 0 ? (
            <div>
              {stats.recent.map((activity, index) => (
                <div 
                  key={index} 
                  className="flex-between py-4"
                  style={{
                    borderBottom: index < stats.recent.length - 1 ? '1px solid #e2e8f0' : 'none'
                  }}
                >
                  <div>
                    <p className="font-semibold">{activity.title || 'Activity'}</p>
                    <p className="text-secondary text-sm">
                      {activity.student?.name || 'Unknown'} • {new Date(activity.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div
                    className="badge"
                    style={{
                      backgroundColor: 
                        activity.status === 'approved' ? '#dcfce7' :
                        activity.status === 'pending' ? '#fef3c7' :
                        '#fee2e2',
                      color:
                        activity.status === 'approved' ? '#15803d' :
                        activity.status === 'pending' ? '#b45309' :
                        '#b91c1c'
                    }}
                  >
                    {activity.status}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-secondary text-center py-8">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;