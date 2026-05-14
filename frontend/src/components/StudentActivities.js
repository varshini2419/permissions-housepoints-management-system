import React, { useState, useEffect } from 'react';
import { activityAPI, uploadAPI, housePointAPI } from '../services/api';
import DashboardLayout from './DashboardLayout';
import { 
  FaClipboardList, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaClock,
  FaUpload,
  FaStar,
  FaImage,
  FaTrophy,
  FaEye
} from 'react-icons/fa';

const StudentActivities = () => {
  const [activities, setActivities] = useState([]);
  const [housePoints, setHousePoints] = useState({ totalPoints: 0, activityHistory: [] });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    activityTitle: '',
    description: '',
    date: '',
    proofImage: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [activitiesRes, pointsRes] = await Promise.all([
        activityAPI.getAll(),
        housePointAPI.getMyPoints()
      ]);
      
      if (activitiesRes.data.success) {
        setActivities(activitiesRes.data.data);
      }
      
      if (pointsRes.data.success) {
        setHousePoints(pointsRes.data.data);
      }
    } catch (error) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    const uploadData = new FormData();
    uploadData.append('proofImage', file);
    
    try {
      setSubmitting(true);
      const response = await uploadAPI.uploadImage(uploadData);
      if (response.data.success) {
        setFormData(prev => ({
          ...prev,
          proofImage: response.data.data.url
        }));
        setSuccess('Image uploaded successfully');
      }
    } catch (error) {
      setError(error.message || 'Failed to upload image');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const response = await activityAPI.create(formData);
      if (response.data.success) {
        setSuccess('Activity submitted successfully');
        setFormData({ activityTitle: '', description: '', date: '', proofImage: '' });
        setShowForm(false);
        fetchData();
      }
    } catch (error) {
      setError(error.message || 'Failed to submit activity');
    } finally {
      setSubmitting(false);
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

  if (loading) {
    return (
      <DashboardLayout title="My Activities">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading activities...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="My Activities">
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
          <div className="stat-icon" style={{ background: '#fef9c3', color: '#eab308' }}>
            <FaTrophy />
          </div>
          <h3>Total House Points</h3>
          <div className="stat-value">{housePoints.totalPoints}</div>
          <div className="stat-desc">
            {housePoints.activityHistory?.length || 0} activities approved
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dbeafe', color: '#2563eb' }}>
            <FaClipboardList />
          </div>
          <h3>Total Activities</h3>
          <div className="stat-value">{activities.length}</div>
          <div className="stat-desc">
            {activities.filter(a => a.status === 'pending').length} pending
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dcfce7', color: '#22c55e' }}>
            <FaCheckCircle />
          </div>
          <h3>Approved</h3>
          <div className="stat-value">{activities.filter(a => a.status === 'approved').length}</div>
          <div className="stat-desc">activities approved</div>
        </div>
      </div>

      {/* Header with New Activity Button */}
      <div className="content-card" style={{ marginBottom: '20px' }}>
        <div className="flex justify-between items-center">
          <h2 style={{ marginBottom: 0 }}>
            <FaClipboardList /> Activity Submissions
          </h2>
          <button 
            className="btn btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancel' : '+ New Activity'}
          </button>
        </div>
      </div>

      {/* New Activity Form */}
      {showForm && (
        <div className="content-card" style={{ marginBottom: '20px' }}>
          <h3>Submit New Activity</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Activity Title</label>
              <input
                type="text"
                name="activityTitle"
                className="form-control"
                value={formData.activityTitle}
                onChange={handleInputChange}
                required
                placeholder="Enter activity title"
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                className="form-control"
                rows="4"
                value={formData.description}
                onChange={handleInputChange}
                required
                placeholder="Describe your activity..."
              />
            </div>

            <div className="form-group">
              <label>Activity Date</label>
              <input
                type="date"
                name="date"
                className="form-control"
                value={formData.date}
                onChange={handleInputChange}
                required
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="form-group">
              <label>Proof Image</label>
              <div className="file-upload">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="btn btn-primary" style={{ cursor: 'pointer' }}>
                  <FaUpload /> Choose Image
                </label>
                {formData.proofImage && (
                  <span style={{ marginLeft: '10px' }}>
                    <FaImage /> Image uploaded
                  </span>
                )}
              </div>
            </div>

            {formData.proofImage && (
              <div className="form-group">
                <a 
                  href={`http://localhost:5000${formData.proofImage}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-sm"
                >
                  <FaEye /> View Uploaded Image
                </a>
              </div>
            )}

            <button 
              type="submit" 
              className="btn btn-success"
              disabled={submitting || !formData.proofImage}
            >
              {submitting ? 'Submitting...' : 'Submit Activity'}
            </button>
          </form>
        </div>
      )}

      {/* Activities List */}
      <div className="content-card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Activity</th>
                <th>Description</th>
                <th>Points</th>
                <th>Status</th>
                <th>Proof</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((activity) => (
                <tr key={activity._id}>
                  <td>{new Date(activity.date).toLocaleDateString()}</td>
                  <td>{activity.activityTitle}</td>
                  <td>{activity.description.substring(0, 50)}...</td>
                  <td>
                    {activity.housePoints > 0 ? (
                      <span className="text-success">
                        <FaStar /> +{activity.housePoints}
                      </span>
                    ) : '-'}
                  </td>
                  <td>
                    <span className={`status-badge status-${activity.status}`}>
                      {getStatusIcon(activity.status)} {activity.status}
                    </span>
                  </td>
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
                  <td>{activity.remarks || '-'}</td>
                </tr>
              ))}
              {activities.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                    <FaClipboardList style={{ fontSize: '48px', color: '#ccc', marginBottom: '16px' }} />
                    <p>No activities found</p>
                    <button 
                      className="btn btn-primary"
                      onClick={() => setShowForm(true)}
                    >
                      Submit Activity
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Activity History with Points */}
        {housePoints.activityHistory?.length > 0 && (
          <div style={{ marginTop: '30px' }}>
            <h3>Points History</h3>
            <div className="leaderboard">
              {housePoints.activityHistory.map((item, index) => (
                <div key={index} className="leaderboard-item">
                  <div className="leaderboard-rank">{index + 1}</div>
                  <div className="leaderboard-info">
                    <div className="leaderboard-name">{item.activityTitle}</div>
                    <div className="leaderboard-details">
                      {new Date(item.date).toLocaleDateString()} • Approved by {item.approvedBy}
                    </div>
                  </div>
                  <div className="leaderboard-points">+{item.points} pts</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentActivities;