// frontend/src/components/Leaderboard.js
import React from 'react';
import { FaTrophy, FaMedal, FaUserGraduate } from 'react-icons/fa';
import '../styles/global.css';
const Leaderboard = ({ students = [], title = "Top Performers" }) => {
  // Medal colors for top 3
  const medalColors = [
    'text-yellow-500', // Gold
    'text-gray-400',   // Silver
    'text-amber-600'   // Bronze
  ];

  // Badge backgrounds for top 3
  const badgeBackgrounds = [
    'bg-yellow-100 border-yellow-300', // Gold
    'bg-gray-100 border-gray-300',     // Silver
    'bg-amber-100 border-amber-300'    // Bronze
  ];

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4">
        <h2 className="text-xl font-bold text-white flex items-center">
          <FaTrophy className="mr-2" />
          {title}
        </h2>
      </div>

      {/* Leaderboard List */}
      <div className="p-4">
        {students.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No data available</p>
        ) : (
          <div className="space-y-2">
            {students.map((student, index) => (
              <div
                key={student.id || index}
                className={`flex items-center p-3 rounded-lg border ${
                  index < 3
                    ? badgeBackgrounds[index] + ' border'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                {/* Rank */}
                <div className="w-12 text-center">
                  {index < 3 ? (
                    <FaMedal className={`text-2xl ${medalColors[index]} mx-auto`} />
                  ) : (
                    <span className="text-lg font-bold text-gray-500">
                      #{index + 1}
                    </span>
                  )}
                </div>

                {/* Student Info */}
                <div className="flex-1 ml-3">
                  <div className="flex items-center">
                    <FaUserGraduate className="text-gray-400 mr-2" />
                    <span className="font-semibold text-gray-800">
                      {student.name}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {student.department} • {student.registerNumber}
                  </div>
                </div>

                {/* Points */}
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">
                    {student.totalPoints}
                  </div>
                  <div className="text-xs text-gray-500">points</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer with statistics */}
      {students.length > 0 && (
        <div className="bg-gray-50 px-6 py-3 border-t">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Total Students: {students.length}</span>
            <span>Total Points: {students.reduce((sum, s) => sum + (s.totalPoints || 0), 0)}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;