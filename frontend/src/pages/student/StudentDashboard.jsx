// frontend/src/pages/student/StudentDashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaUser, 
  FaIdCard, 
  FaBuilding, 
  FaLayerGroup,
  FaTrophy,
  FaFileAlt,
  FaCheckCircle,
  FaClock,
  FaCalendarPlus,
  FaHistory,
  FaMedal
} from 'react-icons/fa';
import api from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';
import ProgressBar from '../../components/ProgressBar';

const StudentDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/student/dashboard');
      setDashboardData(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total House Points',
      value: dashboardData?.stats?.totalPoints || 0,
      icon: FaTrophy,
      iconBg: '#fef3c7',
      iconColor: '#b45309',
      link: '/student/house-points'
    },
    {
      title: 'Activities Submitted',
      value: dashboardData?.stats?.totalActivities || 0,
      icon: FaFileAlt,
      iconBg: '#dbeafe',
      iconColor: '#1e40af',
      link: '/student/activity-history'
    },
    {
      title: 'Approved Activities',
      value: dashboardData?.stats?.approvedActivities || 0,
      icon: FaCheckCircle,
      iconBg: '#dcfce7',
      iconColor: '#15803d',
      link: '/student/activity-history?status=approved'
    },
    {
      title: 'Pending Permissions',
      value: dashboardData?.stats?.pendingPermissions || 0,
      icon: FaClock,
      iconBg: '#ffedd5',
      iconColor: '#b45309',
      link: '/student/activity-history?type=permission'
    }
  ];

  const quickActions = [
    {
      title: 'Apply Permission',
      description: 'Request campus permission',
      icon: FaCalendarPlus,
      iconBg: '#dbeafe',
      iconColor: '#1e40af',
      link: '/student/apply-permission'
    },
    {
      title: 'Submit Activity',
      description: 'Upload activity proof',
      icon: FaFileAlt,
      iconBg: '#dcfce7',
      iconColor: '#15803d',
      link: '/student/submit-activity'
    },
    {
      title: 'Activity History',
      description: 'View your submissions',
      icon: FaHistory,
      iconBg: '#f3e8ff',
      iconColor: '#6b21a8',
      link: '/student/activity-history'
    },
    {
      title: 'House Points',
      description: 'Track your progress',
      icon: FaMedal,
      iconBg: '#fef3c7',
      iconColor: '#b45309',
      link: '/student/house-points'
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
      {/* Welcome Header with Student Info */}
      <div className="card">
        <div className="card-body">
          <h1 className="h2 mb-4">Welcome back, {user?.name}!</h1>
          
          {/* Student Details Grid */}
          <div className="grid grid-cols-4 gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px',
              backgroundColor: '#dbeafe',
              borderRadius: '8px',
              gap: '12px'
            }}>
              <div style={{ color: '#1e40af', fontSize: '20px' }}>
                <FaUser />
              </div>
              <div>
                <p className="text-sm text-secondary">Name</p>
                <p className="font-semibold">{user?.name}</p>
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px',
              backgroundColor: '#dcfce7',
              borderRadius: '8px',
              gap: '12px'
            }}>
              <div style={{ color: '#15803d', fontSize: '20px' }}>
                <FaIdCard />
              </div>
              <div>
                <p className="text-sm text-secondary">Register No</p>
                <p className="font-semibold">{user?.registerNumber}</p>
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px',
              backgroundColor: '#f3e8ff',
              borderRadius: '8px',
              gap: '12px'
            }}>
              <div style={{ color: '#6b21a8', fontSize: '20px' }}>
                <FaBuilding />
              </div>
              <div>
                <p className="text-sm text-secondary">Department</p>
                <p className="font-semibold">{user?.department}</p>
              </div>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px',
              backgroundColor: '#fef3c7',
              borderRadius: '8px',
              gap: '12px'
            }}>
              <div style={{ color: '#b45309', fontSize: '20px' }}>
                <FaLayerGroup />
              </div>
              <div>
                <p className="text-sm text-secondary">Branch/Section</p>
                <p className="font-semibold">{user?.branch} - {user?.section}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="alert alert-error">{error}</div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-4 gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
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
      <div className="grid grid-cols-2 gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        {/* Recent Permissions */}
        <div className="card">
          <div className="card-header">
            <h2 className="h3 m-0" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ color: '#b45309', fontSize: '20px' }}>
                <FaClock />
              </div>
              Recent Permission Requests
            </h2>
          </div>
          <div className="card-body">
            {dashboardData?.recentPermissions && dashboardData.recentPermissions.length > 0 ? (
              <div>
                {dashboardData.recentPermissions.map((permission, idx) => (
                  <div 
                    key={permission._id || idx} 
                    className="flex-between py-3"
                    style={{
                      borderBottom: idx < dashboardData.recentPermissions.length - 1 ? '1px solid #e2e8f0' : 'none'
                    }}
                  >
                    <div>
                      <p className="font-semibold text-sm">{permission.title}</p>
                      <p className="text-secondary text-xs">{new Date(permission.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div
                      className="badge text-xs"
                      style={{
                        backgroundColor: 
                          permission.status === 'approved' ? '#dcfce7' :
                          permission.status === 'pending' ? '#fef3c7' :
                          '#fee2e2',
                        color:
                          permission.status === 'approved' ? '#15803d' :
                          permission.status === 'pending' ? '#b45309' :
                          '#b91c1c'
                      }}
                    >
                      {permission.status}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-secondary text-center py-4">No recent permissions</p>
            )}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="card">
          <div className="card-header">
            <h2 className="h3 m-0" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ color: '#15803d', fontSize: '20px' }}>
                <FaFileAlt />
              </div>
              Recent Activities
            </h2>
          </div>
          <div className="card-body">
            {dashboardData?.recentActivities && dashboardData.recentActivities.length > 0 ? (
              <div>
                {dashboardData.recentActivities.map((activity, idx) => (
                  <div 
                    key={activity._id || idx} 
                    className="flex-between py-3"
                    style={{
                      borderBottom: idx < dashboardData.recentActivities.length - 1 ? '1px solid #e2e8f0' : 'none'
                    }}
                  >
                    <div>
                      <p className="font-semibold text-sm">{activity.title}</p>
                      <p className="text-secondary text-xs">{new Date(activity.date).toLocaleDateString()}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div
                        className="badge text-xs"
                        style={{
                          backgroundColor: 
                            activity.status === 'approved' ? '#dcfce7' :
                            activity.status === 'pending' ? '#fef3c7' :
                            '#fee2e2',
                          color:
                            activity.status === 'approved' ? '#15803d' :
                            activity.status === 'pending' ? '#b45309' :
                            '#b91c1c',
                          marginBottom: activity.points > 0 ? '4px' : '0'
                        }}
                      >
                        {activity.status}
                      </div>
                      {activity.points > 0 && (
                        <p className="text-xs font-bold" style={{ color: '#b45309', marginTop: '4px' }}>+{activity.points} pts</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-secondary text-center py-4">No recent activities</p>
            )}
          </div>
        </div>
      </div>

      {/* Points Progress */}
      {dashboardData?.stats && (
        <div className="card">
          <div className="card-header">
            <h2 className="h3 m-0">Your Progress</h2>
          </div>
          <div className="card-body">
            <ProgressBar 
              totalPoints={dashboardData.stats.totalPoints || 0}
              maxPoints={100}
              label="House Points Progress"
            />
            <div className="grid grid-cols-3 gap-4 mt-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))' }}>
              <div style={{ textAlign: 'center' }}>
                <p className="h4" style={{ color: '#1e40af', fontWeight: '700', marginBottom: '4px' }}>{dashboardData.stats.monthPoints || 0}</p>
                <p className="text-xs text-secondary">This Month</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p className="h4" style={{ color: '#15803d', fontWeight: '700', marginBottom: '4px' }}>{dashboardData.stats.approvedActivities || 0}</p>
                <p className="text-xs text-secondary">Approved</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p className="h4" style={{ color: '#6b21a8', fontWeight: '700', marginBottom: '4px' }}>{dashboardData.stats.pendingPermissions || 0}</p>
                <p className="text-xs text-secondary">Pending</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;