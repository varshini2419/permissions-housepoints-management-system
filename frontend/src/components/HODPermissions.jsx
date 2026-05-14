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

const HODPermissions = () => {
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
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState('pending');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Get all permissions (HOD can see all departments)
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
      setSuccess('');
      setError('');
      
      const response = await permissionAPI.updateStatus(permissionId, {
        status,
        remarks: `Reviewed by HOD ${user.name}`
      });
      
      if (response.data.success) {
        setSuccess(`Permission ${status} successfully`);
        fetchData(); // Refresh data
      }
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

  // Get unique departments
  const departments = [...new Set(permissions.map(p => p.department).filter(Boolean))];

  // Filter permissions
  const filteredPermissions = permissions.filter(p => {
    // Status filter
    if (filter !== 'all' && p.status !== filter) return false;
    
    // Department filter
    if (selectedDepartment !== 'all' && p.department !== selectedDepartment) return false;
    
    return true;
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
    <DashboardLayout title={`HOD Permissions - All Departments`}>
      {error && (
        <div className="alert alert-error">
          <span className="alert-icon">⚠️</span>
          <span>{error}</span>
          <button className="alert-close" onClick={() => setError('')}>×</button>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <span className="alert-icon">✓</span>
          <span>{success}</span>
          <button className="alert-close" onClick={() => setSuccess('')}>×</button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dbeafe', color: '#2563eb' }}>
            <FaFileAlt />
          </div>
          <h3>Total Permissions</h3>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-desc">all departments</div>
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

      {/* Filter Bar */}
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
            <select
              className="form-control"
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              style={{ width: '200px' }}
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            
            <select
              className="form-control"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{ width: '150px' }}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Permissions List */}
      <div className="content-card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Student</th>
                <th>Register No</th>
                <th>Department</th>
                <th>Section</th>
                <th>Reason</th>
                <th>Document</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPermissions.map((permission) => (
                <tr key={permission._id}>
                  <td>{new Date(permission.date).toLocaleDateString()}</td>
                  <td>{permission.studentName || permission.studentId?.name}</td>
                  <td>{permission.registerNumber || permission.studentId?.registerNumber}</td>
                  <td>{permission.department}</td>
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
                  <td>
                    {permission.status === 'pending' && (
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
                    )}
                    {permission.status !== 'pending' && (
                      <span className="text-muted">Processed</span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredPermissions.length === 0 && (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '40px' }}>
                    <FaFileAlt style={{ fontSize: '48px', color: '#ccc', marginBottom: '16px' }} />
                    <p>No permissions found</p>
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

export default HODPermissions;