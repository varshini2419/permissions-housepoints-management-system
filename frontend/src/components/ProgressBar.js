// frontend/src/components/ProgressBar.js
import React from 'react';
import { FaTrophy, FaStar, FaRocket } from 'react-icons/fa';
import '../styles/global.css';
const ProgressBar = ({ 
  totalPoints = 0,
  maxPoints = 100,
  label = "House Points",
  showIcon = true,
  showPercentage = true,
  height = "h-4",
  color = "bg-blue-600"
}) => {
  // Calculate percentage (cap at 100%)
  const percentage = Math.min((totalPoints / maxPoints) * 100, 100);
  
  // Determine color based on percentage (optional)
  const getColorClass = () => {
    if (color !== "bg-blue-600") return color;
    
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 50) return "bg-blue-500";
    if (percentage >= 25) return "bg-yellow-500";
    return "bg-red-500";
  };

  // Get icon based on percentage
  const getIcon = () => {
    if (percentage >= 80) return <FaRocket className="text-green-500" />;
    if (percentage >= 50) return <FaTrophy className="text-blue-500" />;
    return <FaStar className="text-yellow-500" />;
  };

  return (
    <div className="w-full">
      {/* Label and Value */}
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center space-x-2">
          {showIcon && getIcon()}
          <span className="text-sm font-medium text-gray-700">{label}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-semibold text-gray-900">
            {totalPoints} / {maxPoints}
          </span>
          {showPercentage && (
            <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
              {percentage.toFixed(1)}%
            </span>
          )}
        </div>
      </div>

      {/* Progress Bar Container */}
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${height}`}>
        <div
          className={`${getColorClass()} ${height} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        >
          {/* Optional animated stripe effect */}
          {percentage > 0 && percentage < 100 && (
            <div className="w-full h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
          )}
        </div>
      </div>

      {/* Milestone Markers (optional) */}
      <div className="flex justify-between mt-1 px-1">
        <span className="text-xs text-gray-500">0</span>
        <span className="text-xs text-gray-500">25</span>
        <span className="text-xs text-gray-500">50</span>
        <span className="text-xs text-gray-500">75</span>
        <span className="text-xs text-gray-500">{maxPoints}</span>
      </div>
    </div>
  );
};

// Specialized variant for house points
export const HousePointProgress = ({ totalPoints, targetPoints = 100 }) => {
  return (
    <ProgressBar
      totalPoints={totalPoints}
      maxPoints={targetPoints}
      label="House Points Progress"
      color="bg-purple-600"
    />
  );
};

// Variant for level progress
export const LevelProgress = ({ currentLevel, nextLevelPoints, currentPoints }) => {
  const pointsNeeded = nextLevelPoints - currentPoints;
  const percentage = (currentPoints / nextLevelPoints) * 100;

  return (
    <div className="space-y-2">
      <ProgressBar
        totalPoints={currentPoints}
        maxPoints={nextLevelPoints}
        label={`Level ${currentLevel} Progress`}
        color="bg-indigo-600"
        showPercentage={false}
      />
      <p className="text-xs text-gray-600 text-center">
        {pointsNeeded} points needed for next level
      </p>
    </div>
  );
};

export default ProgressBar;