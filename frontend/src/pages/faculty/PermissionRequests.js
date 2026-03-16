// frontend/src/pages/faculty/PermissionRequests.js
import React, { useState, useEffect } from 'react';
import { FaCheck, FaTimes, FaForward, FaEye, FaSearch } from 'react-icons/fa';
import api from '../../api/axiosConfig';

const PermissionRequests = () => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [remarks, setRemarks] = useState({});
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    fetchPermissions();
  }, [statusFilter]);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/faculty/permission-requests?status=${statusFilter}`);
      setPermissions(response.data.permissions || []);
      setError(null);
    } catch (err) {
      setError('Failed to load permission requests');
      console.error('Fetch permissions error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (permissionId, action, remarksText = '') => {
    setActionLoading(prev => ({ ...prev, [permissionId]: true }));
    setError(null);
    setSuccess(null);

    try {
      let response;
      switch (action) {
        case 'approve':
          response = await api.put(`/faculty/approve-permission/${permissionId}`, {
            remarks: remarks[permissionId] || 'Approved by faculty'
          });
          break;
        case 'reject':
          response = await api.put(`/faculty/reject-permission/${permissionId}`, {
            reason: remarks[permissionId] || 'Rejected by faculty'
          });
          break;
        case 'forward':
          response = await api.put(`/faculty/forward-permission/${permissionId}`, {
            remarks: remarks[permissionId] || 'Forwarded to HOD'
          });
          break;
        default:
          return;
      }

      setSuccess(`Permission ${action}ed successfully`);
      fetchPermissions(); // Refresh list
      setRemarks(prev => ({ ...prev, [permissionId]: '' }));
    } catch (err) {
      setError(`Failed to ${action} permission`);
      console.error(`Action error:`, err);
    } finally {
      setActionLoading(prev => ({ ...prev, [permissionId]: false }));
    }
  };

  const handleRemarksChange = (permissionId, value) => {
    setRemarks(prev => ({ ...prev, [permissionId]: value }));
  };

  const filteredPermissions = permissions.filter(permission =>
    permission.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    permission.student?.registerNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    permission.reason?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-800">Permission Requests</h1>
        <p className="text-gray-600 mt-1">
          Review and manage student permission requests
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by student name, register number, or reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="w-full md:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="all">All</option>
            </select>
          </div>
        </div>
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

      {/* Permissions Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Range
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Document
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Remarks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPermissions.map((permission) => (
                <tr key={permission._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{permission.student?.name}</div>
                    <div className="text-sm text-gray-500">{permission.student?.registerNumber}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{permission.reason}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(permission.fromDate)} - {formatDate(permission.toDate)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      permission.status === 'approved' ? 'bg-green-100 text-green-800' :
                      permission.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {permission.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {permission.document && (
                      <a
                        href={permission.document}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-800 flex items-center"
                      >
                        <FaEye className="mr-1" /> View
                      </a>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {permission.status === 'pending' && (
                      <input
                        type="text"
                        placeholder="Add remarks..."
                        value={remarks[permission._id] || ''}
                        onChange={(e) => handleRemarksChange(permission._id, e.target.value)}
                        className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                      />
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {permission.status === 'pending' ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleAction(permission._id, 'approve')}
                          disabled={actionLoading[permission._id]}
                          className="text-green-600 hover:text-green-900 disabled:opacity-50"
                          title="Approve"
                        >
                          <FaCheck />
                        </button>
                        <button
                          onClick={() => handleAction(permission._id, 'reject')}
                          disabled={actionLoading[permission._id]}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          title="Reject"
                        >
                          <FaTimes />
                        </button>
                        <button
                          onClick={() => handleAction(permission._id, 'forward')}
                          disabled={actionLoading[permission._id]}
                          className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                          title="Forward to HOD"
                        >
                          <FaForward />
                        </button>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Completed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PermissionRequests;