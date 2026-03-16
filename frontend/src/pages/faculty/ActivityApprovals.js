// frontend/src/pages/faculty/ActivityApprovals.js
import React, { useState, useEffect } from 'react';
import { FaCheck, FaTimes, FaEye, FaSearch } from 'react-icons/fa';
import api from '../../api/axiosConfig';

const ActivityApprovals = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [pointsMap, setPointsMap] = useState({});
  const [remarksMap, setRemarksMap] = useState({});
  const [actionLoading, setActionLoading] = useState({});

  const defaultPoints = {
    sports: 15,
    cultural: 10,
    academic: 20,
    volunteer: 12,
    workshop: 10,
    seminar: 8,
    competition: 15,
    other: 5
  };

  useEffect(() => {
    fetchActivities();
  }, [statusFilter]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/faculty/activity-submissions?status=${statusFilter}`);
      const activitiesData = response.data.activities || [];
      setActivities(activitiesData);
      
      // Initialize points based on activity type
      const initialPoints = {};
      activitiesData.forEach(activity => {
        initialPoints[activity._id] = activity.points || defaultPoints[activity.activityType] || 10;
      });
      setPointsMap(initialPoints);
      
      setError(null);
    } catch (err) {
      setError('Failed to load activities');
      console.error('Fetch activities error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (activityId) => {
    setActionLoading(prev => ({ ...prev, [activityId]: true }));
    setError(null);
    setSuccess(null);

    try {
      await api.put(`/faculty/approve-activity/${activityId}`, {
        points: pointsMap[activityId],
        remarks: remarksMap[activityId] || 'Approved by faculty'
      });
      setSuccess('Activity approved successfully');
      fetchActivities(); // Refresh list
    } catch (err) {
      setError('Failed to approve activity');
      console.error('Approve error:', err);
    } finally {
      setActionLoading(prev => ({ ...prev, [activityId]: false }));
    }
  };

  const handleReject = async (activityId) => {
    setActionLoading(prev => ({ ...prev, [activityId]: true }));
    setError(null);
    setSuccess(null);

    try {
      await api.put(`/faculty/reject-activity/${activityId}`, {
        reason: remarksMap[activityId] || 'Rejected by faculty'
      });
      setSuccess('Activity rejected successfully');
      fetchActivities(); // Refresh list
    } catch (err) {
      setError('Failed to reject activity');
      console.error('Reject error:', err);
    } finally {
      setActionLoading(prev => ({ ...prev, [activityId]: false }));
    }
  };

  const handlePointsChange = (activityId, value) => {
    setPointsMap(prev => ({ ...prev, [activityId]: parseInt(value) || 0 }));
  };

  const handleRemarksChange = (activityId, value) => {
    setRemarksMap(prev => ({ ...prev, [activityId]: value }));
  };

  const filteredActivities = activities.filter(activity =>
    activity.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.student?.registerNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-800">Activity Approvals</h1>
        <p className="text-gray-600 mt-1">
          Review and approve student activity submissions
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by student name, activity title, or register number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="w-full md:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="all">All</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      {/* Activities Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Activity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Proof
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Points
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Remarks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredActivities.map((activity) => (
                <tr key={activity._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{activity.student?.name}</div>
                    <div className="text-sm text-gray-500">{activity.student?.registerNumber}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{activity.title}</div>
                    <div className="text-sm text-gray-500">{activity.description?.substring(0, 50)}...</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(activity.date)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                      {activity.activityType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {activity.proofImage && (
                      <a
                        href={activity.proofImage}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-800 flex items-center"
                      >
                        <FaEye className="mr-1" /> View
                      </a>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {activity.status === 'pending' ? (
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={pointsMap[activity._id] || defaultPoints[activity.activityType] || 10}
                        onChange={(e) => handlePointsChange(activity._id, e.target.value)}
                        className="w-20 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                      />
                    ) : (
                      <span className="font-medium">{activity.points}</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {activity.status === 'pending' && (
                      <input
                        type="text"
                        placeholder="Add remarks..."
                        value={remarksMap[activity._id] || ''}
                        onChange={(e) => handleRemarksChange(activity._id, e.target.value)}
                        className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                      />
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {activity.status === 'pending' ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApprove(activity._id)}
                          disabled={actionLoading[activity._id]}
                          className="text-green-600 hover:text-green-900 disabled:opacity-50"
                          title="Approve"
                        >
                          <FaCheck />
                        </button>
                        <button
                          onClick={() => handleReject(activity._id)}
                          disabled={actionLoading[activity._id]}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          title="Reject"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Completed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ActivityApprovals;