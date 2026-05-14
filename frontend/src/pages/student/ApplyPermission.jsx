// frontend/src/pages/student/ApplyPermission.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUpload, FaCalendar, FaFileAlt, FaCheckCircle } from 'react-icons/fa';
import api from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';

const ApplyPermission = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    title: '',
    reason: '',
    fromDate: '',
    toDate: '',
    permissionType: 'leave'
  });
  
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const permissionTypes = [
    { value: 'leave', label: 'Leave' },
    { value: 'early_exit', label: 'Early Exit' },
    { value: 'late_entry', label: 'Late Entry' },
    { value: 'event', label: 'Event Participation' },
    { value: 'medical', label: 'Medical' },
    { value: 'other', label: 'Other' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Check file size (5MB limit)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      
      // Check file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Only PDF, JPG, and PNG files are allowed');
        return;
      }
      
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.reason);
      formDataToSend.append('fromDate', formData.fromDate);
      formDataToSend.append('toDate', formData.toDate);
      formDataToSend.append('permissionType', formData.permissionType);
      
      if (file) {
        formDataToSend.append('letter', file);
      }

      await api.post('/permissions/create', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/student/dashboard');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit permission request');
      console.error('Submit error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-lg shadow p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Apply for Permission</h1>

        {/* Success Message */}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 flex items-center">
            <FaCheckCircle className="mr-2" />
            Permission request submitted successfully! Redirecting to dashboard...
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Student Info (Read-only) */}
          <div className="bg-gray-50 p-4 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Student Name</label>
              <p className="mt-1 p-2 bg-white rounded border">{user?.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Register Number</label>
              <p className="mt-1 p-2 bg-white rounded border">{user?.registerNumber}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Department</label>
              <p className="mt-1 p-2 bg-white rounded border">{user?.department}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Branch - Section</label>
              <p className="mt-1 p-2 bg-white rounded border">{user?.branch} - {user?.section}</p>
            </div>
          </div>

          {/* Permission Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Permission Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Medical Leave, Family Function, etc."
            />
          </div>

          {/* Permission Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Permission Type *
            </label>
            <select
              name="permissionType"
              value={formData.permissionType}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {permissionTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason for Permission *
            </label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              required
              rows="4"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Please provide detailed reason for your request..."
            />
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Date *
              </label>
              <div className="relative">
                <FaCalendar className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="date"
                  name="fromDate"
                  value={formData.fromDate}
                  onChange={handleInputChange}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Date *
              </label>
              <div className="relative">
                <FaCalendar className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="date"
                  name="toDate"
                  value={formData.toDate}
                  onChange={handleInputChange}
                  required
                  min={formData.fromDate || new Date().toISOString().split('T')[0]}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload Permission Letter (PDF, JPG, PNG) *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition">
              <input
                type="file"
                id="file-upload"
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer"
              >
                <FaUpload className="mx-auto text-3xl text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">
                  {fileName ? fileName : 'Click to upload or drag and drop'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Maximum file size: 5MB
                </p>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={loading || success}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <FaFileAlt className="mr-2" /> Submit Request
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/student/dashboard')}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplyPermission;