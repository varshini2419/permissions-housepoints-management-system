// frontend/src/components/ActivityCard.js
import React, { useState } from 'react';
import { FaCalendar, FaUser, FaTrophy, FaImage, FaCheck, FaTimes } from 'react-icons/fa';
import '../styles/global.css';
const ActivityCard = ({ 
  activity,
  showActions = false,
  onApprove,
  onReject,
  onAssignPoints
}) => {
  const [points, setPoints] = useState(activity.points || 10);
  const [showPointsInput, setShowPointsInput] = useState(false);

  const {
    studentName,
    registerNumber,
    title,
    description,
    date,
    proofImage,
    status,
    points: earnedPoints,
    activityType
  } = activity;

  // Status color mapping
  const getStatusStyles = (status) => {
    switch(status?.toLowerCase()) {
      case 'pending':
        return { bg: '#fef3c7', color: '#b45309', icon: '#facc15' };
      case 'approved':
        return { bg: '#dcfce7', color: '#15803d', icon: '#22c55e' };
      case 'rejected':
        return { bg: '#fee2e2', color: '#b91c1c', icon: '#ef4444' };
      default:
        return { bg: '#fef3c7', color: '#b45309', icon: '#facc15' };
    }
  };

  const statusStyles = getStatusStyles(status);

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleApprove = () => {
    if (showPointsInput) {
      onAssignPoints(activity._id, points);
      setShowPointsInput(false);
    } else {
      setShowPointsInput(true);
    }
  };

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      {/* Header */}
      <div className="card-header" style={{ backgroundColor: statusStyles.bg, borderBottom: `3px solid ${statusStyles.color}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div>
            <h3 className="font-semibold" style={{ margin: 0, color: statusStyles.color }}>{title}</h3>
            <p className="text-xs mt-1" style={{ margin: 0, color: statusStyles.color }}>{activityType}</p>
          </div>
          <span className="badge" style={{ backgroundColor: '#ffffff', color: statusStyles.color }}>
            {status}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="card-body">
        {/* Student Info */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', fontSize: '0.875rem', color: '#64748b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaUser style={{ color: '#2563eb' }} />
            <span>{studentName} ({registerNumber})</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaCalendar style={{ color: '#2563eb' }} />
            <span>{formatDate(date)}</span>
          </div>
        </div>

        {/* Description */}
        <p style={{ color: '#404f61', fontSize: '0.875rem', marginBottom: '12px' }}>{description}</p>

        {/* Proof Image */}
        {proofImage && (
          <div style={{ marginBottom: '12px' }}>
            <a 
              href={proofImage} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: '#2563eb', textDecoration: 'hover', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <FaImage />
              View Proof Image
            </a>
          </div>
        )}

        {/* Points Display */}
        {(earnedPoints > 0 || status === 'approved') && (
          <div style={{ display: 'flex', alignItems: 'center', marginTop: '8px', padding: '8px', backgroundColor: '#dbeafe', borderRadius: '6px' }}>
            <FaTrophy style={{ color: '#b45309', marginRight: '8px' }} />
            <span style={{ fontWeight: 600, color: '#1e40af' }}>
              Points Earned: {earnedPoints}
            </span>
          </div>
        )}

        {/* Action Buttons for Faculty */}
        {showActions && status?.toLowerCase() === 'pending' && (
          <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
            {showPointsInput && (
              <div style={{ marginBottom: '12px' }}>
                <label className="form-label" style={{ marginBottom: '6px' }}>
                  Assign Points:
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={points}
                  onChange={(e) => setPoints(parseInt(e.target.value) || 0)}
                  className="form-input"
                />
              </div>
            )}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleApprove}
                className="btn btn-success"
                style={{ flex: 1 }}
              >
                <FaCheck />
                {showPointsInput ? 'Confirm Points' : 'Approve'}
              </button>
              <button
                onClick={() => onReject(activity._id)}
                className="btn btn-danger"
                style={{ flex: 1 }}
              >
                <FaTimes />
                Reject
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityCard;