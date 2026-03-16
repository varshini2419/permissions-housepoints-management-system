// frontend/src/pages/faculty/AssignPoints.js
import React, { useState, useEffect } from 'react';
import { FaCheck, FaSearch, FaTrophy, FaMedal, FaStar } from 'react-icons/fa';
import api from '../../api/axiosConfig';

const AssignPoints = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pointsMap, setPointsMap] = useState({});
  const [remarksMap, setRemarksMap] = useState({});
  const [actionLoading, setActionLoading] = useState({});

  const pointSuggestions = {
    sports: [5, 10, 15, 20, 25],
    cultural: [3, 5, 8, 10, 12],
    academic: [10, 15, 20, 25, 30],
    volunteer: [2, 5, 8, 10, 15],
    workshop: [5, 8, 10, 12, 15],
    seminar: [3, 5, 7, 10, 12],
    competition: [10, 15, 20, 25, 30],
    other: [2, 5, 8, 10]
  };

  const activityIcons = {
    sports: <FaTrophy className="text-yellow-500" />,
    cultural: <FaStar className="text-purple-500" />,
    academic: <FaMedal className="text-blue-500" />,
    default: <FaCheck className="text-green-500" />
  };

  useEffect(() => {
    fetchApprovedActivities();
  }, []);

  const fetchApprovedActivities = async () => {
    try {
      setLoading(true);
      const response = await api.get('/faculty/activity-submissions?status=approved');
      const activitiesData = response.data.activities || [];
      setActivities(activitiesData);
      
      // Initialize points from existing values
      const initialPoints = {};
      activitiesData.forEach(activity => {
        initialPoints[activity._id] = activity.points || 0;
      });
      setPointsMap(initialPoints);
      
      setError(null);
    } catch (err) {
      setError('Failed to load approved activities');
      console.error('Fetch activities error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignPoints = async (activityId) => {
    const points = pointsMap[activityId];
    if (!points || points <= 0) {
      setError('Please assign valid points');
      return;
    }

    setActionLoading(prev => ({ ...prev, [activityId]: true }));
    setError(null);
    setSuccess(null);

    try {
      await api.put(`/faculty/assign-points/${activityId}`, {
        points,
        remarks: remarksMap[activityId] || 'Points assigned'
      });
      setSuccess('Points assigned successfully');
      fetchApprovedActivities(); // Refresh list
    } catch (err) {
      setError('Failed to assign points');
      console.error('Assign points error:', err);
    } finally {
      setActionLoading(prev => ({ ...prev, [activityId]: false }));
    }
  };

  const handlePointsChange = (activityId, value) => {
    setPointsMap(prev => ({ ...prev, [activityId]: parseInt(value) || 0 }));
  };

  const handleQuickAssign = (activityId, points) => {
    setPointsMap(prev => ({ ...prev, [activityId]: points }));
  };

  const filteredActivities = activities.filter(activity =>
    activity.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.activityType?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTotalPoints = () => {
    return activities.reduce((sum, activity) => sum + (activity.points || 0), 0);
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
        <h1 className="text-2xl font-bold text-gray-800">Assign House Points</h1>
        <p className="text-gray-600 mt-1">
          Assign points to approved student activities
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">Total Activities</h3>
          <p className="text-3xl font-bold">{activities.length}</p>
        </div>
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">Total Points Assigned</h3>
          <p className="text-3xl font-bold">{getTotalPoints()}</p>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">Average Points</h3>
          <p className="text-3xl font-bold">
            {activities.length > 0 ? (getTotalPoints() / activities.length).toFixed(1) : 0}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="relative">
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search by student name, activity title, or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
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

      {/* Activities Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredActivities.map((activity) => (
          <div key={activity._id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              {/* Activity Info */}
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  {activityIcons[activity.activityType] || activityIcons.default}
                  <h3 className="text-lg font-semibold ml-2">{activity.title}</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Student:</span>
                    <span className="ml-2 font-medium">{activity.student?.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Register No:</span>
                    <span className="ml-2">{activity.student?.registerNumber}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Date:</span>
                    <span className="ml-2">{formatDate(activity.date)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Type:</span>
                    <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      {activity.activityType}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mt-2">
                  {activity.description}
                </p>

                {/* Quick Points Suggestions */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {pointSuggestions[activity.activityType]?.map((points) => (
                    <button
                      key={points}
                      onClick={() => handleQuickAssign(activity._id, points)}
                      className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition"
                    >
                      +{points}
                    </button>
                  ))}
                </div>
              </div>

              {/* Points Input and Actions */}
              <div className="mt-4 md:mt-0 md:ml-6 flex flex-col items-end">
                <div className="flex items-center space-x-3">
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Points</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={pointsMap[activity._id] || 0}
                      onChange={(e) => handlePointsChange(activity._id, e.target.value)}
                      className="w-24 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Remarks</label>
                    <input
                      type="text"
                      placeholder="Optional"
                      value={remarksMap[activity._id] || ''}
                      onChange={(e) => setRemarksMap(prev => ({ ...prev, [activity._id]: e.target.value }))}
                      className="w-48 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>

                <button
                  onClick={() => handleAssignPoints(activity._id)}
                  disabled={actionLoading[activity._id] || !pointsMap[activity._id]}
                  className="mt-3 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-300 flex items-center"
                >
                  {actionLoading[activity._id] ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Assigning...
                    </>
                  ) : (
                    <>
                      <FaCheck className="mr-2" /> Assign Points
                    </>
                  )}
                </button>

                {activity.points > 0 && (
                  <div className="mt-2 text-sm text-gray-600">
                    Previously assigned: <span className="font-bold text-green-600">{activity.points}</span> points
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredActivities.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <FaTrophy className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600">No Approved Activities</h3>
            <p className="text-gray-500 mt-2">
              There are no approved activities waiting for points assignment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignPoints;