import React, { useState, useEffect } from 'react';
import { permissionAPI, uploadAPI } from '../services/api';
import DashboardLayout from './DashboardLayout';
import { 
  FaFileAlt, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaClock,
  FaUpload,
  FaFilePdf,
  FaEye
} from 'react-icons/fa';

const StudentPermissions = () => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    reason: '',
    date: '',
    document: ''
  });

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      const response = await permissionAPI.getAll();
      if (response.data.success) {
        setPermissions(response.data.data);
      }
    } catch (error) {
      setError('Failed to load permissions');
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

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a PDF or Word document');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    const uploadData = new FormData();
    uploadData.append('document', file);
    
    try {
      setSubmitting(true);
      const response = await uploadAPI.uploadDocument(uploadData);
      if (response.data.success) {
        setFormData(prev => ({
          ...prev,
          document: response.data.data.url
        }));
        setSuccess('File uploaded successfully');
      }
    } catch (error) {
      setError(error.message || 'Failed to upload file');
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
      const response = await permissionAPI.create(formData);
      if (response.data.success) {
        setSuccess('Permission request submitted successfully');
        setFormData({ reason: '', date: '', document: '' });
        setShowForm(false);
        fetchPermissions();
      }
    } catch (error) {
      setError(error.message || 'Failed to submit permission');
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
      <DashboardLayout title="My Permissions">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading permissions...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="My Permissions">
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

      {/* Header with New Permission Button */}
      <div className="content-card" style={{ marginBottom: '20px' }}>
        <div className="flex justify-between items-center">
          <h2 style={{ marginBottom: 0 }}>
            <FaFileAlt /> Permission Requests
          </h2>
          <button 
            className="btn btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancel' : '+ New Permission'}
          </button>
        </div>
      </div>

      {/* New Permission Form */}
      {showForm && (
        <div className="content-card" style={{ marginBottom: '20px' }}>
          <h3>Request New Permission</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Reason for Permission</label>
              <textarea
                name="reason"
                className="form-control"
                rows="4"
                value={formData.reason}
                onChange={handleInputChange}
                required
                placeholder="Explain why you need permission..."
              />
            </div>

            <div className="form-group">
              <label>Date Required</label>
              <input
                type="date"
                name="date"
                className="form-control"
                value={formData.date}
                onChange={handleInputChange}
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="form-group">
              <label>Permission Letter (PDF, DOC)</label>
              <div className="file-upload">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="btn btn-primary" style={{ cursor: 'pointer' }}>
                  <FaUpload /> Choose File
                </label>
                {formData.document && (
                  <span style={{ marginLeft: '10px' }}>
                    <FaFilePdf /> File uploaded
                  </span>
                )}
              </div>
            </div>

            {formData.document && (
              <div className="form-group">
                <a 
                  href={`http://localhost:5000${formData.document}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-sm"
                >
                  <FaEye /> View Uploaded File
                </a>
              </div>
            )}

            <button 
              type="submit" 
              className="btn btn-success"
              disabled={submitting || !formData.document}
            >
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </form>
        </div>
      )}

      {/* Permissions List */}
      <div className="content-card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Document</th>
                <th>Remarks</th>
                <th>Submitted On</th>
              </tr>
            </thead>
            <tbody>
              {permissions.map((permission) => (
                <tr key={permission._id}>
                  <td>{new Date(permission.date).toLocaleDateString()}</td>
                  <td>{permission.reason}</td>
                  <td>
                    <span className={`status-badge status-${permission.status}`}>
                      {getStatusIcon(permission.status)} {permission.status}
                    </span>
                  </td>
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
                  <td>{permission.remarks || '-'}</td>
                  <td>{new Date(permission.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {permissions.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                    <FaFileAlt style={{ fontSize: '48px', color: '#ccc', marginBottom: '16px' }} />
                    <p>No permission requests found</p>
                    <button 
                      className="btn btn-primary"
                      onClick={() => setShowForm(true)}
                    >
                      Request Permission
                    </button>
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

export default StudentPermissions;