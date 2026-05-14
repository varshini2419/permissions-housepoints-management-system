import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI, permissionAPI } from '../services/api';
import DashboardLayout from './DashboardLayout';
import { 
  FaClock, 
  FaTrophy,
  FaBuilding,
  FaUserTie,
  FaEye
} from 'react-icons/fa';

const HODDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await dashboardAPI.getHODDashboard();
      if (response.data.success) {
        setDashboardData(response.data.data);
      }
    } catch (error) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionAction = async (permissionId, status) => {
    try {
      await permissionAPI.updateStatus(permissionId, {
        status,
        remarks: `Reviewed by HOD ${user.name}`
      });
      fetchDashboardData();
    } catch (error) {
      setError(`Failed to ${status} permission`);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="HOD Dashboard">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </DashboardLayout>
    );
  }

  const stats = [
    {
      icon: <FaBuilding />,
      title: 'Departments',
      value: dashboardData?.departments?.length || 0,
      desc: 'total departments',
      iconBg: '#dbeafe',
      iconColor: '#2563eb'
    },
    {
      icon: <FaClock />,
      title: 'Pending Permissions',
      value: dashboardData?.pendingPermissions?.length || 0,
      desc: 'awaiting review',
      iconBg: '#fef3c7',
      iconColor: '#d97706'
    },
    {
      icon: <FaTrophy />,
      title: 'Total Points',
      value: dashboardData?.leaderboard?.reduce((sum, item) => sum + item.totalPoints, 0) || 0,
      desc: 'across all departments',
      iconBg: '#fef9c3',
      iconColor: '#eab308'
    },
    {
      icon: <FaUserTie />,
      title: 'Active HODs',
      value: dashboardData?.departments?.length || 0,
      desc: 'department heads',
      iconBg: '#fee2e2',
      iconColor: '#ef4444'
    }
  ];

  return (
    <DashboardLayout title={`HOD Dashboard - ${user?.department}`}>
      {error && (
        <div className="alert alert-error">
          <span className="alert-icon">⚠️</span>
          <span>{error}</span>
          <button className="alert-close" onClick={() => setError('')}>×</button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={`stat-${index}`} className="stat-card">
            <div className="stat-icon" style={{ background: stat.iconBg, color: stat.iconColor }}>
              {stat.icon}
            </div>
            <h3>{stat.title}</h3>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-desc">{stat.desc}</div>
          </div>
        ))}
      </div>

      {/* Pending Permissions */}
      <div className="content-card">
        <h2>
          <FaClock /> Pending Permissions
        </h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Register No</th>
                <th>Department</th>
                <th>Reason</th>
                <th>Date</th>
                <th>Document</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData?.pendingPermissions?.map((permission) => (
                <tr key={permission._id}>
                  <td>{permission.studentName || permission.studentId?.name}</td>
                  <td>{permission.registerNumber || permission.studentId?.registerNumber}</td>
                  <td>{permission.department}</td>
                  <td>{permission.reason}</td>
                  <td>{new Date(permission.date).toLocaleDateString()}</td>
                  <td>
                    <a 
                      href={`http://localhost:5000${permission.document}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-primary btn-sm"
                    >
                      <FaEye /> View
                    </a>
                  </td>
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
                </tr>
              ))}
              {(!dashboardData?.pendingPermissions || dashboardData.pendingPermissions.length === 0) && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '24px' }}>
                    No pending permissions
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Leaderboard */}
      {dashboardData?.leaderboard && dashboardData.leaderboard.length > 0 && (
        <div className="content-card">
          <h2>
            <FaTrophy /> Top Performers
          </h2>
          <div className="leaderboard">
            {dashboardData.leaderboard.map((item, index) => (
              <div key={`leader-${index}`} className="leaderboard-item">
                <div className="leaderboard-rank">{index + 1}</div>
                <div className="leaderboard-info">
                  <div className="leaderboard-name">{item.studentName}</div>
                  <div className="leaderboard-details">
                    {item.registerNumber} • {item.department}
                  </div>
                </div>
                <div className="leaderboard-points">{item.totalPoints} pts</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default HODDashboard;