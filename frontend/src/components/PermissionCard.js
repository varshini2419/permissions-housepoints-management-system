// frontend/src/components/PermissionCard.js
import React from 'react';
import { FaCalendar, FaUser, FaIdCard, FaBuilding, FaFileAlt } from 'react-icons/fa';
import '../styles/global.css';
const PermissionCard = ({ 
  permission,
  showActions = false,
  onApprove,
  onReject,
  onForward
}) => {
  const {
    studentName,
    registerNumber,
    department,
    reason,
    fromDate,
    toDate,
    status,
    permissionType,
    document
  } = permission;

  // Status color mapping
  const getStatusStyles = (status) => {
    switch(status?.toLowerCase()) {
      case 'pending':
        return { bg: '#fef3c7', color: '#b45309' };
      case 'approved':
        return { bg: '#dcfce7', color: '#15803d' };
      case 'rejected':
        return { bg: '#fee2e2', color: '#b91c1c' };
      default:
        return { bg: '#fef3c7', color: '#b45309' };
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

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      {/* Header with status */}
      <div className="card-header" style={{ backgroundColor: statusStyles.bg, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `3px solid ${statusStyles.color}` }}>
        <span className="font-semibold capitalize" style={{ color: statusStyles.color }}>{permissionType} Permission</span>
        <span className="badge" style={{ backgroundColor: '#ffffff', color: statusStyles.color }}>
          {status}
        </span>
      </div>

      {/* Body */}
      <div className="card-body">
        {/* Student Info */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', color: '#64748b', fontSize: '0.875rem' }}>
            <FaUser style={{ marginRight: '8px', color: '#2563eb' }} />
            <span style={{ fontWeight: 500 }}>{studentName}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', color: '#64748b', fontSize: '0.875rem' }}>
            <FaIdCard style={{ marginRight: '8px', color: '#2563eb' }} />
            <span>{registerNumber}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', color: '#64748b', fontSize: '0.875rem' }}>
            <FaBuilding style={{ marginRight: '8px', color: '#2563eb' }} />
            <span>{department}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', color: '#64748b', fontSize: '0.875rem' }}>
            <FaCalendar style={{ marginRight: '8px', color: '#2563eb' }} />
            <span>{formatDate(fromDate)} - {formatDate(toDate)}</span>
          </div>
        </div>

        {/* Reason */}
        <div style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', color: '#64748b' }}>
            <FaFileAlt style={{ marginRight: '8px', marginTop: '4px', color: '#2563eb', flexShrink: 0 }} />
            <p style={{ fontSize: '0.875rem', color: '#404f61', margin: 0 }}>{reason}</p>
          </div>
        </div>

        {/* Document Link */}
        {document && (
          <div style={{ marginBottom: '12px' }}>
            <a 
              href={document} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: '#2563eb', textDecoration: 'hover', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <FaFileAlt />
              View Document
            </a>
          </div>
        )}

        {/* Action Buttons for Faculty */}
        {showActions && status?.toLowerCase() === 'pending' && (
          <div style={{ display: 'flex', gap: '8px', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
            <button
              onClick={() => onApprove(permission._id)}
              className="btn btn-success"
              style={{ flex: 1 }}
            >
              Approve
            </button>
            <button
              onClick={() => onForward(permission._id)}
              className="btn btn-primary"
              style={{ flex: 1 }}
            >
              Forward to HOD
            </button>
            <button
              onClick={() => onReject(permission._id)}
              className="btn btn-danger"
              style={{ flex: 1 }}
            >
              Reject
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PermissionCard;