// frontend/src/pages/student/HousePoints.js
import React, { useState, useEffect } from 'react';
import { FaTrophy, FaMedal, FaStar, FaCalendar, FaFilter } from 'react-icons/fa';
import api from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';
import ProgressBar from '../../components/ProgressBar';

const HousePoints = () => {
  const [pointsData, setPointsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeFilter, setTimeFilter] = useState('all');
  const { user } = useAuth();

  useEffect(() => {
    fetchHousePoints();
  }, []);

  const fetchHousePoints = async () => {
    try {
      setLoading(true);
      const response = await api.get('/student/housepoints');
      setPointsData(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load house points data');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getMedalColor = (index) => {
    switch (index) {
      case 0: return 'text-yellow-500'; // Gold
      case 1: return 'text-gray-400';   // Silver
      case 2: return 'text-amber-600';  // Bronze
      default: return 'text-blue-500';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'sports': return '⚽';
      case 'cultural': return '🎭';
      case 'academic': return '📚';
      case 'volunteer': return '🤝';
      case 'workshop': return '🔧';
      case 'seminar': return '🎤';
      case 'competition': return '🏆';
      default: return '📝';
    }
  };

  const filterActivitiesByTime = (activities) => {
    if (timeFilter === 'all' || !activities) return activities;
    
    const now = new Date();
    const filterDate = new Date();
    
    switch (timeFilter) {
      case 'month':
        filterDate.setMonth(now.getMonth() - 1);
        break;
      case 'semester':
        filterDate.setMonth(now.getMonth() - 6);
        break;
      case 'year':
        filterDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return activities;
    }
    
    return activities.filter(activity => new Date(activity.date) >= filterDate);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  const filteredActivities = filterActivitiesByTime(pointsData?.recentPoints || []);
  const totalPoints = pointsData?.totalPoints || 0;
  const pointsByCategory = pointsData?.pointsByCategory || [];
  const monthlyPoints = pointsData?.monthlyPoints || [];

  // Calculate next milestone
  const nextMilestone = Math.ceil(totalPoints / 10) * 10;
  const pointsToNextMilestone = nextMilestone - totalPoints;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <FaTrophy className="text-yellow-500 mr-2" />
          House Points Dashboard
        </h1>
        <p className="text-gray-600 mt-1">
          Track your house points and achievements
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg shadow p-6 text-white transform hover:scale-105 transition-transform">
          <FaTrophy className="text-4xl mb-2 opacity-75" />
          <h3 className="text-lg font-semibold mb-1">Total House Points</h3>
          <p className="text-4xl font-bold">{totalPoints}</p>
          <p className="text-sm opacity-75 mt-2">Lifetime achievement</p>
        </div>
        
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white transform hover:scale-105 transition-transform">
          <FaMedal className="text-4xl mb-2 opacity-75" />
          <h3 className="text-lg font-semibold mb-1">Activities Completed</h3>
          <p className="text-4xl font-bold">{pointsData?.activitiesCount || 0}</p>
          <p className="text-sm opacity-75 mt-2">Approved activities</p>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow p-6 text-white transform hover:scale-105 transition-transform">
          <FaStar className="text-4xl mb-2 opacity-75" />
          <h3 className="text-lg font-semibold mb-1">Average Points</h3>
          <p className="text-4xl font-bold">{pointsData?.averagePointsPerActivity || 0}</p>
          <p className="text-sm opacity-75 mt-2">Per activity</p>
        </div>
      </div>

      {/* Progress Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Progress to Next Milestone</h2>
        <ProgressBar 
          totalPoints={totalPoints}
          maxPoints={nextMilestone}
          label={`${totalPoints} / ${nextMilestone} points`}
          color="bg-yellow-500"
        />
        <p className="text-sm text-gray-600 mt-2">
          {pointsToNextMilestone} more points to reach {nextMilestone} points!
        </p>
      </div>

      {/* Points Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Points by Category */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FaStar className="text-yellow-500 mr-2" />
            Points by Category
          </h2>
          <div className="space-y-4">
            {pointsByCategory.length > 0 ? (
              pointsByCategory.map((category) => (
                <div key={category._id} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center">
                      <span className="mr-2">{getCategoryIcon(category._id)}</span>
                      <span className="capitalize">{category._id}</span>
                    </span>
                    <span className="font-semibold">{category.total} points</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(category.total / totalPoints) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500">{category.count} activities</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No points earned yet</p>
            )}
          </div>
        </div>

        {/* Monthly Performance */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FaCalendar className="text-blue-500 mr-2" />
            Monthly Performance
          </h2>
          <div className="space-y-3">
            {monthlyPoints.length > 0 ? (
              monthlyPoints.map((month, index) => {
                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                const monthName = monthNames[month._id.month - 1];
                const year = month._id.year;
                
                return (
                  <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                    <span className="font-medium">{monthName} {year}</span>
                    <span className="text-lg font-bold text-yellow-600">{month.total} pts</span>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 text-center py-4">No monthly data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Points History */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recent Points Earned</h2>
          <div className="flex items-center">
            <FaFilter className="text-gray-400 mr-2" />
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="border rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="all">All Time</option>
              <option value="month">Last Month</option>
              <option value="semester">Last 6 Months</option>
              <option value="year">Last Year</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Activity</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Points</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Awarded By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredActivities.length > 0 ? (
                filteredActivities.map((point, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="font-medium">{point.activityTitle || 'Activity'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        {point.activityType || point.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(point.date || point.awardedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-yellow-600 flex items-center">
                        <FaTrophy className="mr-1 text-sm" /> +{point.points}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {point.awardedBy?.name || 'Faculty'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                    No points earned in this period
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Achievement Badges */}
      {totalPoints >= 50 && (
        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg shadow p-6 border border-yellow-200">
          <h2 className="text-xl font-semibold mb-3 flex items-center">
            <FaStar className="text-yellow-500 mr-2" />
            Achievements Unlocked
          </h2>
          <div className="flex flex-wrap gap-3">
            {totalPoints >= 50 && (
              <div className="bg-yellow-500 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center">
                <FaTrophy className="mr-2" /> Bronze Achiever
              </div>
            )}
            {totalPoints >= 100 && (
              <div className="bg-gray-400 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center">
                <FaMedal className="mr-2" /> Silver Achiever
              </div>
            )}
            {totalPoints >= 200 && (
              <div className="bg-yellow-600 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center">
                <FaStar className="mr-2" /> Gold Achiever
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HousePoints;