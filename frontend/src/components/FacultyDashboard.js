import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI, permissionAPI, activityAPI } from '../services/api';
import DashboardLayout from './DashboardLayout';
import { 
  FaClock, 
  FaEye,
  FaFileAlt,
  FaClipboardList,
  FaUserGraduate,
  FaTrophy
} from 'react-icons/fa';

const FacultyDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [pointsForm, setPointsForm] = useState({ housePoints: 0, remarks: '' });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await dashboardAPI.getFacultyDashboard();
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
        remarks: `Reviewed by ${user.name}`
      });
      fetchDashboardData();
    } catch (error) {
      setError(`Failed to ${status} permission`);
    }
  };

  const handleApproveActivity = async (activityId) => {
    if (pointsForm.housePoints <= 0 || pointsForm.housePoints > 100) {
      alert('Please enter valid house points (1-100)');
      return;
    }

    try {
      await activityAPI.approve(activityId, {
        housePoints: pointsForm.housePoints,
        remarks: pointsForm.remarks || `Approved by ${user.name}`
      });
      setSelectedActivity(null);
      setPointsForm({ housePoints: 0, remarks: '' });
      fetchDashboardData();
    } catch (error) {
      setError('Failed to approve activity');
    }
  };

  const handleRejectActivity = async (activityId) => {
    const remarks = prompt('Enter rejection reason:');
    if (!remarks) return;

    try {
      await activityAPI.reject(activityId, { remarks });
      fetchDashboardData();
    } catch (error) {
      setError('Failed to reject activity');
    }
  };

  const getStats = () => {
    if (!dashboardData) return [];

    const stats = dashboardData.stats || {};
    
    return [
      {
        icon: <FaUserGraduate />,
        title: 'Total Students',
        value: stats.totalStudents || 0,
        desc: 'in your department',
        iconBg: '#dbeafe',
        iconColor: '#2563eb'
      },
      {
        icon: <FaClock />,
        title: 'Pending Permissions',
        value: stats.pendingPermissions || 0,
        desc: 'awaiting review',
        iconBg: '#fef3c7',
        iconColor: '#d97706'
      },
      {
        icon: <FaClipboardList />,
        title: 'Pending Activities',
        value: stats.pendingActivities || 0,
        desc: 'awaiting approval',
        iconBg: '#fee2e2',
        iconColor: '#ef4444'
      },
      {
        icon: <FaTrophy />,
        title: 'Total Points',
        value: stats.totalHousePoints || 0,
        desc: 'awarded this month',
        iconBg: '#fef9c3',
        iconColor: '#eab308'
      }
    ];
  };

  if (loading) {
    return (
      <DashboardLayout title="Faculty Dashboard">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </DashboardLayout>
    );
  }

  const stats = getStats();

  return (
    <DashboardLayout title={`Faculty Dashboard - ${user?.department}`}>
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
          <FaFileAlt /> Pending Permission Requests
        </h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Register No</th>
                <th>Section</th>
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
                  <td>{permission.section}</td>
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

      {/* Pending Activities */}
      <div className="content-card">
        <h2>
          <FaClipboardList /> Pending Activity Approvals
        </h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Register No</th>
                <th>Activity</th>
                <th>Description</th>
                <th>Date</th>
                <th>Proof</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData?.pendingActivities?.map((activity) => (
                <tr key={activity._id}>
                  <td>{activity.studentName || activity.studentId?.name}</td>
                  <td>{activity.registerNumber || activity.studentId?.registerNumber}</td>
                  <td>{activity.activityTitle}</td>
                  <td>{activity.description.substring(0, 50)}...</td>
                  <td>{new Date(activity.date).toLocaleDateString()}</td>
                  <td>
                    <a 
                      href={`http://localhost:5000${activity.proofImage}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-primary btn-sm"
                    >
                      <FaEye /> View
                    </a>
                  </td>
                  <td>
                    {selectedActivity?._id === activity._id ? (
                      <div className="flex flex-col gap-2" style={{ minWidth: '200px' }}>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          className="form-control"
                          placeholder="Points (1-100)"
                          value={pointsForm.housePoints}
                          onChange={(e) => setPointsForm({...pointsForm, housePoints: parseInt(e.target.value)})}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApproveActivity(activity._id)}
                            className="btn btn-success btn-sm"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setSelectedActivity(null)}
                            className="btn btn-secondary btn-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedActivity(activity)}
                          className="btn btn-success btn-sm"
                        >
                          ✓ Approve
                        </button>
                        <button
                          onClick={() => handleRejectActivity(activity._id)}
                          className="btn btn-danger btn-sm"
                        >
                          ✗ Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {(!dashboardData?.pendingActivities || dashboardData.pendingActivities.length === 0) && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '24px' }}>
                    No pending activities
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

export default FacultyDashboard;