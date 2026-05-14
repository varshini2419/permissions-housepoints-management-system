// frontend/src/pages/faculty/FacultyDashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaUsers, 
  FaFileAlt, 
  FaCheckCircle, 
  FaTrophy,
  FaClipboardList,
  FaCalendarCheck,
  FaMedal
} from 'react-icons/fa';
import api from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';

const FacultyDashboard = () => {
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
      const response = await api.get('/faculty/dashboard');
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
      title: 'Total Students',
      value: dashboardData?.students?.length || 0,
      icon: FaUsers,
      color: 'bg-blue-500',
      link: '/faculty/students'
    },
    {
      title: 'Pending Permissions',
      value: dashboardData?.permissions?.filter(p => p.status === 'pending')?.length || 0,
      icon: FaFileAlt,
      color: 'bg-yellow-500',
      link: '/faculty/permission-requests'
    },
    {
      title: 'Pending Activities',
      value: dashboardData?.activities?.filter(a => a.status === 'pending')?.length || 0,
      icon: FaCheckCircle,
      color: 'bg-purple-500',
      link: '/faculty/activity-approvals'
    },
    {
      title: 'Total Points Awarded',
      value: dashboardData?.totalPoints || 0,
      icon: FaTrophy,
      color: 'bg-green-500',
      link: '/faculty/assign-points'
    }
  ];

  const quickActions = [
    {
      title: 'Permission Requests',
      description: 'Review and approve student permission requests',
      icon: FaClipboardList,
      color: 'bg-blue-100 text-blue-600',
      link: '/faculty/permission-requests',
      count: dashboardData?.permissions?.filter(p => p.status === 'pending')?.length || 0
    },
    {
      title: 'Activity Approvals',
      description: 'Approve student activities and assign points',
      icon: FaCalendarCheck,
      color: 'bg-green-100 text-green-600',
      link: '/faculty/activity-approvals',
      count: dashboardData?.activities?.filter(a => a.status === 'pending')?.length || 0
    },
    {
      title: 'Assign Points',
      description: 'Manage house points for approved activities',
      icon: FaMedal,
      color: 'bg-purple-100 text-purple-600',
      link: '/faculty/assign-points',
      count: dashboardData?.activities?.filter(a => a.status === 'approved')?.length || 0
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Welcome, Prof. {user?.name}!
        </h1>
        <p className="text-gray-600 mt-1">
          Department: <span className="font-semibold text-green-600">{user?.department}</span>
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Link
              key={index}
              to={card.link}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className={`${card.color} p-3 rounded-lg`}>
                    <Icon className="text-white text-xl" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-500">{card.title}</p>
                    <p className="text-2xl font-bold text-gray-800">{card.value}</p>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Link
              key={index}
              to={action.link}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-all transform hover:-translate-y-1"
            >
              <div className="flex items-start justify-between">
                <div className={`${action.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className="text-2xl" />
                </div>
                {action.count > 0 && (
                  <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs">
                    {action.count} pending
                  </span>
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-800">{action.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{action.description}</p>
            </Link>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        {/* Recent Permissions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FaFileAlt className="text-green-600 mr-2" />
            Recent Permission Requests
          </h2>
          <div className="space-y-3">
            {dashboardData?.permissions?.slice(0, 5).map((permission) => (
              <div key={permission._id} className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="font-medium">{permission.student?.name}</p>
                  <p className="text-sm text-gray-600">{permission.reason?.substring(0, 30)}...</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  permission.status === 'approved' ? 'bg-green-100 text-green-800' :
                  permission.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {permission.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FaCheckCircle className="text-purple-600 mr-2" />
            Recent Activity Submissions
          </h2>
          <div className="space-y-3">
            {dashboardData?.activities?.slice(0, 5).map((activity) => (
              <div key={activity._id} className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="font-medium">{activity.student?.name}</p>
                  <p className="text-sm text-gray-600">{activity.title}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  activity.status === 'approved' ? 'bg-green-100 text-green-800' :
                  activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {activity.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;