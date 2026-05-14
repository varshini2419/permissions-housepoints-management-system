import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { permissionAPI } from '../services/api';
import DashboardLayout from './DashboardLayout';
import { getApiOrigin } from '../config/apiBase';
import { 
  FaFileAlt, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaClock,
  FaEye,
  FaFilter,
  FaSyncAlt
} from 'react-icons/fa';

const FacultyPermissions = () => {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [permissionsRes, statsRes] = await Promise.all([
        permissionAPI.getAll(),
        permissionAPI.getStats()
      ]);
      
      if (permissionsRes.data.success) {
        setPermissions(permissionsRes.data.data);
      }
      
      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }
    } catch (error) {
      setError('Failed to load permissions data');
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionAction = async (permissionId, status) => {
    try {
      await permissionAPI.updateStatus(permissionId, {
        status,
        remarks: `Reviewed by ${user.name}`
      });
      fetchData();
    } catch (error) {
      setError(`Failed to ${status} permission`);
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'approved':
        return <FaCheckCircle className="text-success" />;
      case 'rejected':
        return <FaTimesCircle className="text-danger" />;
      default:
        return <FaClock className="text-warning" />;
    }
  };

  const filteredPermissions = permissions.filter(p => {
    if (filter === 'all') return true;
    return p.status === filter;
  });

  if (loading) {
    return (
      <DashboardLayout title="Permissions Management">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading permissions...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={`Permissions - ${user?.department}`}>
      {error && (
        <div className="alert alert-error">
          <span className="alert-icon">⚠️</span>
          <span>{error}</span>
          <button className="alert-close" onClick={() => setError('')}>×</button>
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dbeafe', color: '#2563eb' }}>
            <FaFileAlt />
          </div>
          <h3>Total Permissions</h3>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-desc">all time</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>
            <FaClock />
          </div>
          <h3>Pending</h3>
          <div className="stat-value">{stats.pending}</div>
          <div className="stat-desc">awaiting review</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dcfce7', color: '#22c55e' }}>
            <FaCheckCircle />
          </div>
          <h3>Approved</h3>
          <div className="stat-value">{stats.approved}</div>
          <div className="stat-desc">approved requests</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fee2e2', color: '#ef4444' }}>
            <FaTimesCircle />
          </div>
          <h3>Rejected</h3>
          <div className="stat-value">{stats.rejected}</div>
          <div className="stat-desc">rejected requests</div>
        </div>
      </div>

      <div className="content-card" style={{ marginBottom: '20px' }}>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h2 style={{ marginBottom: 0 }}>
              <FaFilter /> Permission Requests
            </h2>
            <button 
              className="btn btn-sm btn-primary"
              onClick={fetchData}
            >
              <FaSyncAlt /> Refresh
            </button>
          </div>
          <div className="flex gap-2">
            <button 
              className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilter('all')}
            >
              All ({stats.total})
            </button>
            <button 
              className={`btn btn-sm ${filter === 'pending' ? 'btn-warning' : 'btn-secondary'}`}
              onClick={() => setFilter('pending')}
            >
              Pending ({stats.pending})
            </button>
            <button 
              className={`btn btn-sm ${filter === 'approved' ? 'btn-success' : 'btn-secondary'}`}
              onClick={() => setFilter('approved')}
            >
              Approved ({stats.approved})
            </button>
            <button 
              className={`btn btn-sm ${filter === 'rejected' ? 'btn-danger' : 'btn-secondary'}`}
              onClick={() => setFilter('rejected')}
            >
              Rejected ({stats.rejected})
            </button>
          </div>
        </div>
      </div>

      <div className="content-card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Student</th>
                <th>Register No</th>
                <th>Section</th>
                <th>Reason</th>
                <th>Document</th>
                <th>Status</th>
                <th>Remarks</th>
                {filter === 'pending' && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredPermissions.map((permission) => (
                <tr key={permission._id}>
                  <td>{new Date(permission.date).toLocaleDateString()}</td>
                  <td>{permission.studentName || permission.studentId?.name}</td>
                  <td>{permission.registerNumber || permission.studentId?.registerNumber}</td>
                  <td>{permission.section}</td>
                  <td>{permission.reason.substring(0, 30)}...</td>
                  <td>
                    <a 
                      href={`${getApiOrigin()}${permission.document}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-primary btn-sm"
                    >
                      <FaEye /> View
                    </a>
                  </td>
                  <td>
                    <span className={`status-badge status-${permission.status}`}>
                      {getStatusIcon(permission.status)} {permission.status}
                    </span>
                  </td>
                  <td>{permission.remarks || '-'}</td>
                  {filter === 'pending' && (
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handlePermissionAction(permission._id, 'approved')}
                          className="btn btn-success btn-sm"
                        >
                          ✓ Approve
                        </button>
                        <button
                          onClick={() => handlePermissionAction(permission._id, 'rejected')}
                          className="btn btn-danger btn-sm"
                        >
                          ✗ Reject
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {filteredPermissions.length === 0 && (
                <tr>
                  <td colSpan={filter === 'pending' ? 9 : 8} style={{ textAlign: 'center', padding: '40px' }}>
                    <FaFileAlt style={{ fontSize: '48px', color: '#ccc', marginBottom: '16px' }} />
                    <p>No {filter !== 'all' ? filter : ''} permissions found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FacultyPermissions;