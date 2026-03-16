// frontend/src/pages/hod/HodDashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaBuilding, 
  FaUsers, 
  FaFileAlt, 
  FaCheckCircle,
  FaTrophy,
  FaChartBar,
  FaClock,
  FaUserGraduate
} from 'react-icons/fa';
import api from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';

const HodDashboard = () => {
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
      const response = await api.get('/hod/dashboard');
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
      title: 'Total Departments',
      value: dashboardData?.departments?.length || 3,
      icon: FaBuilding,
      color: 'bg-purple-500',
      link: '/hod/department-overview'
    },
    {
      title: 'Total Students',
      value: dashboardData?.totalStudents || 0,
      icon: FaUsers,
      color: 'bg-blue-500',
      link: '/hod/department-overview'
    },
    {
      title: 'Total Activities',
      value: dashboardData?.totalActivities || 0,
      icon: FaFileAlt,
      color: 'bg-green-500',
      link: '/hod/reports'
    },
    {
      title: 'Total Permissions',
      value: dashboardData?.totalPermissions || 0,
      icon: FaCheckCircle,
      color: 'bg-yellow-500',
      link: '/hod/permission-approvals'
    }
  ];

  const quickStats = [
    {
      title: 'Pending Permissions',
      value: dashboardData?.pendingPermissions || 0,
      icon: FaClock,
      color: 'text-orange-500',
      bg: 'bg-orange-100'
    },
    {
      title: 'Approved Activities',
      value: dashboardData?.approvedActivities || 0,
      icon: FaTrophy,
      color: 'text-green-500',
      bg: 'bg-green-100'
    },
    {
      title: 'Total House Points',
      value: dashboardData?.totalHousePoints || 0,
      icon: FaChartBar,
      color: 'text-purple-500',
      bg: 'bg-purple-100'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Welcome, Dr. {user?.name}!
        </h1>
        <p className="text-gray-600 mt-1">
          Head of Department • Overview of all departments
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

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`${stat.bg} p-3 rounded-lg`}>
                  <Icon className={`${stat.color} text-xl`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Department Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        {dashboardData?.departments?.map((dept) => (
          <Link
            key={dept.id}
            to={`/hod/department-overview?dept=${dept.name}`}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-all transform hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">{dept.name}</h3>
              <FaBuilding className="text-purple-500 text-xl" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Students:</span>
                <span className="font-semibold">{dept.studentCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Activities:</span>
                <span className="font-semibold">{dept.activityCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">House Points:</span>
                <span className="font-semibold text-purple-600">{dept.totalPoints}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        {/* Top Students */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FaTrophy className="text-yellow-500 mr-2" />
            Top Performing Students
          </h2>
          <div className="space-y-3">
            {dashboardData?.topStudents?.slice(0, 5).map((student, index) => (
              <div key={student.id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                    index === 0 ? 'bg-yellow-100 text-yellow-600' :
                    index === 1 ? 'bg-gray-100 text-gray-600' :
                    index === 2 ? 'bg-orange-100 text-orange-600' :
                    'bg-gray-50 text-gray-500'
                  }`}>
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium">{student.name}</p>
                    <p className="text-sm text-gray-500">{student.department}</p>
                  </div>
                </div>
                <span className="font-bold text-purple-600">{student.points}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FaClock className="text-orange-500 mr-2" />
            Pending Approvals
          </h2>
          <div className="space-y-3">
            {dashboardData?.pendingPermissions?.slice(0, 5).map((permission) => (
              <div key={permission.id} className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="font-medium">{permission.studentName}</p>
                  <p className="text-sm text-gray-500">{permission.reason?.substring(0, 30)}...</p>
                </div>
                <Link
                  to="/hod/permission-approvals"
                  className="text-purple-600 hover:text-purple-800 text-sm"
                >
                  Review
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HodDashboard;