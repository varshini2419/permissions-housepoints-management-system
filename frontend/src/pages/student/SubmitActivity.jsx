// frontend/src/pages/student/SubmitActivity.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUpload, FaCalendar, FaImage, FaCheckCircle } from 'react-icons/fa';
import api from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';

const SubmitActivity = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    activityType: 'sports'
  });
  
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const activityTypes = [
    { value: 'sports', label: 'Sports' },
    { value: 'cultural', label: 'Cultural' },
    { value: 'academic', label: 'Academic' },
    { value: 'volunteer', label: 'Volunteer' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'seminar', label: 'Seminar' },
    { value: 'competition', label: 'Competition' },
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
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Only JPG and PNG images are allowed');
        return;
      }
      
      setFile(selectedFile);
      setFileName(selectedFile.name);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(selectedFile);
      
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
      formDataToSend.append('description', formData.description);
      formDataToSend.append('date', formData.date);
      formDataToSend.append('activityType', formData.activityType);
      
      if (file) {
        formDataToSend.append('proof', file);
      } else {
        setError('Please upload proof image');
        setLoading(false);
        return;
      }

      await api.post('/activities/submit', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/student/activity-history');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit activity');
      console.error('Submit error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-lg shadow p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Submit Activity</h1>

        {/* Success Message */}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 flex items-center">
            <FaCheckCircle className="mr-2" />
            Activity submitted successfully! Redirecting to history...
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
          </div>

          {/* Activity Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Activity Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="e.g., Sports Day Participation, Coding Competition, etc."
            />
          </div>

          {/* Activity Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Activity Type *
            </label>
            <select
              name="activityType"
              value={formData.activityType}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {activityTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows="4"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Describe your activity, achievements, or participation details..."
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Activity Date *
            </label>
            <div className="relative">
              <FaCalendar className="absolute left-3 top-3 text-gray-400" />
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
                max={new Date().toISOString().split('T')[0]}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {/* File Upload with Preview */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload Proof Image (JPG, PNG) *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 transition">
              {previewUrl ? (
                <div className="space-y-4">
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="max-h-48 mx-auto rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      setFileName('');
                      setPreviewUrl('');
                    }}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Remove Image
                  </button>
                </div>
              ) : (
                <>
                  <input
                    type="file"
                    id="file-upload"
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".jpg,.jpeg,.png"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer"
                  >
                    <FaImage className="mx-auto text-3xl text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Maximum file size: 5MB
                    </p>
                  </label>
                </>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={loading || success}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-green-300 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <FaUpload className="mr-2" /> Submit Activity
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

export default SubmitActivity;