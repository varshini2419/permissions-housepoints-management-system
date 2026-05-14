// frontend/src/pages/student/ActivityHistory.js
import React, { useState, useEffect } from 'react';
import { FaSearch, FaFilter, FaEye, FaTrophy } from 'react-icons/fa';
import api from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';

const ActivityHistory = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const { user } = useAuth();

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/activities/student/${user?.id}`);
      setActivities(response.data.activities || []);
      setError(null);
    } catch (err) {
      setError('Failed to load activity history');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return '✅';
      case 'pending':
        return '⏳';
      case 'rejected':
        return '❌';
      default:
        return '📝';
    }
  };

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || activity.status === statusFilter;
    const matchesType = typeFilter === 'all' || activity.activityType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const activityTypes = ['all', 'sports', 'cultural', 'academic', 'volunteer', 'workshop', 'seminar', 'competition', 'other'];

  // Calculate statistics
  const totalActivities = activities.length;
  const approvedActivities = activities.filter(a => a.status === 'approved').length;
  const pendingActivities = activities.filter(a => a.status === 'pending').length;
  const rejectedActivities = activities.filter(a => a.status === 'rejected').length;
  const totalPoints = activities.reduce((sum, a) => sum + (a.points || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-800">Activity History</h1>
        <p className="text-gray-600 mt-1">
          Track all your activity submissions and their status
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow p-4 text-white">
          <p className="text-sm opacity-75">Total</p>
          <p className="text-2xl font-bold">{totalActivities}</p>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow p-4 text-white">
          <p className="text-sm opacity-75">Approved</p>
          <p className="text-2xl font-bold">{approvedActivities}</p>
        </div>
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg shadow p-4 text-white">
          <p className="text-sm opacity-75">Pending</p>
          <p className="text-2xl font-bold">{pendingActivities}</p>
        </div>
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg shadow p-4 text-white">
          <p className="text-sm opacity-75">Rejected</p>
          <p className="text-2xl font-bold">{rejectedActivities}</p>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow p-4 text-white">
          <p className="text-sm opacity-75">Total Points</p>
          <p className="text-2xl font-bold">{totalPoints}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search activities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="relative">
            <FaFilter className="absolute left-3 top-3 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="relative">
            <FaFilter className="absolute left-3 top-3 text-gray-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
            >
              {activityTypes.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Activities Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Activity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Points
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Proof
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredActivities.length > 0 ? (
                filteredActivities.map((activity) => (
                  <tr key={activity._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{activity.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 max-w-xs truncate">
                        {activity.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(activity.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        {activity.activityType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs rounded-full flex items-center ${getStatusColor(activity.status)}`}>
                        <span className="mr-1">{getStatusIcon(activity.status)}</span>
                        {activity.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {activity.points ? (
                        <span className="font-bold text-yellow-600 flex items-center">
                          <FaTrophy className="mr-1" /> {activity.points}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {activity.proofImage && (
                        <a
                          href={activity.proofImage}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 flex items-center"
                        >
                          <FaEye className="mr-1" /> View
                        </a>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <FaTrophy className="text-4xl text-gray-300 mb-2" />
                      <p>No activities found</p>
                      <p className="text-sm">Start submitting activities to earn house points!</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Footer */}
      {filteredActivities.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
          <p>Showing {filteredActivities.length} of {activities.length} activities</p>
        </div>
      )}
    </div>
  );
};

export default ActivityHistory;