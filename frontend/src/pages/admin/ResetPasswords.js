// frontend/src/pages/admin/ResetPasswords.js
import React, { useState } from 'react';
import { FaSearch, FaKey, FaUser, FaEnvelope, FaIdCard } from 'react-icons/fa';
import api from '../../api/axiosConfig';
import '../../styles/global.css';

const ResetPasswords = () => {
  const [searchType, setSearchType] = useState('registerNumber');
  const [searchValue, setSearchValue] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const searchOptions = [
    { value: 'registerNumber', label: 'Register Number', icon: FaIdCard },
    { value: 'facultyId', label: 'Faculty ID', icon: FaIdCard },
    { value: 'email', label: 'Email', icon: FaEnvelope }
  ];

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchValue.trim()) {
      setError('Please enter a search value');
      return;
    }

    setSearchLoading(true);
    setError(null);
    setUser(null);
    setSuccess(null);

    try {
      const response = await api.get(`/admin/users?${searchType}=${searchValue}`);
      const users = response.data.users || [];
      
      if (users.length === 0) {
        setError('No user found with the provided information');
      } else {
        setUser(users[0]);
      }
    } catch (err) {
      setError('Failed to search for user');
      console.error('Search error:', err);
    } finally {
      setSearchLoading(false);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.put(`/admin/reset-password/${user._id}`, {
        newPassword: passwordData.newPassword
      });

      setSuccess(`Password reset successfully! New password: ${response.data.newPassword}`);
      setPasswordData({ newPassword: '', confirmPassword: '' });
      
      // Clear user after 5 seconds
      setTimeout(() => {
        setUser(null);
        setSearchValue('');
      }, 5000);
    } catch (err) {
      setError('Failed to reset password');
      console.error('Reset password error:', err);
    } finally {
      setLoading(false);
    }
  };

  const SelectedIcon = searchOptions.find(opt => opt.value === searchType)?.icon || FaSearch;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-800">Reset Passwords</h1>
        <p className="text-gray-600 mt-1">
          Search for a user and reset their password
        </p>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-64">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search By
              </label>
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {searchOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search Value
              </label>
              <div className="relative">
                <SelectedIcon className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder={`Enter ${searchOptions.find(opt => opt.value === searchType)?.label}`}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={searchLoading}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 disabled:bg-red-300 flex items-center"
            >
              {searchLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Searching...
                </>
              ) : (
                <>
                  <FaSearch className="mr-2" /> Search User
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      {/* User Details & Reset Password */}
      {user && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="bg-red-600 px-6 py-4">
            <h2 className="text-xl font-bold text-white">User Found</h2>
          </div>
          
          <div className="p-6">
            {/* User Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <FaUser className="text-red-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{user.name}</p>
                </div>
              </div>
              
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <FaEnvelope className="text-red-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>
              
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <FaIdCard className="text-red-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Role</p>
                  <p className="font-medium capitalize">{user.role}</p>
                </div>
              </div>
              
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <FaIdCard className="text-red-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">
                    {user.role === 'student' ? 'Register Number' : 'Faculty ID'}
                  </p>
                  <p className="font-medium">
                    {user.registerNumber || user.facultyId}
                  </p>
                </div>
              </div>
            </div>

            {/* Reset Password Form */}
            <form onSubmit={handleResetPassword} className="space-y-4 border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Reset Password</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password *
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                    minLength="6"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Enter new password"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                    minLength="6"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 disabled:bg-red-300 flex items-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Resetting...
                    </>
                  ) : (
                    <>
                      <FaKey className="mr-2" /> Reset Password
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResetPasswords;