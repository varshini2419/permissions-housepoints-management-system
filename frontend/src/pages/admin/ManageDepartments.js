// frontend/src/pages/admin/ManageDepartments.js
import React, { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaTimes, FaEdit } from 'react-icons/fa';
import api from '../../api/axiosConfig';
import '../../styles/global.css';

const ManageDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    departmentName: '',
    branch: '',
    classTeacher: '',
    description: ''
  });

  const departmentOptions = ['CSIT-A', 'CSIT-B', 'CSD'];
  const branchOptions = ['Computer Science', 'Information Technology', 'Computer Science and Design'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [deptsRes, facultyRes] = await Promise.all([
        api.get('/admin/departments'),
        api.get('/admin/users?role=faculty')
      ]);
      setDepartments(deptsRes.data || []);
      setFaculty(facultyRes.data.users || []);
      setError(null);
    } catch (err) {
      setError('Failed to load data');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddDepartment = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/create-department', formData);
      setShowAddModal(false);
      resetForm();
      fetchData();
    } catch (err) {
      setError('Failed to add department');
      console.error('Add department error:', err);
    }
  };

  const handleEditDepartment = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admin/update-department/${selectedDept._id}`, formData);
      setShowEditModal(false);
      resetForm();
      fetchData();
    } catch (err) {
      setError('Failed to update department');
      console.error('Update department error:', err);
    }
  };

  const openEditModal = (dept) => {
    setSelectedDept(dept);
    setFormData({
      departmentName: dept.departmentName || '',
      branch: dept.branch || '',
      classTeacher: dept.classTeacher?._id || '',
      description: dept.description || ''
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      departmentName: '',
      branch: '',
      classTeacher: '',
      description: ''
    });
    setSelectedDept(null);
  };

  const filteredDepartments = departments.filter(dept =>
    dept.departmentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.branch?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Manage Departments</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-purple-700"
          >
            <FaPlus className="mr-2" /> Add Department
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="relative">
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search departments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDepartments.map((dept) => (
          <div key={dept._id} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="bg-purple-600 px-4 py-3">
              <h3 className="text-lg font-semibold text-white">{dept.departmentName}</h3>
            </div>
            <div className="p-4">
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Branch:</span> {dept.branch}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Class Teacher:</span>{' '}
                  {dept.classTeacher?.name || 'Not assigned'}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Total Students:</span> {dept.totalStudents || 0}
                </p>
                {dept.description && (
                  <p className="text-sm text-gray-600 mt-2">{dept.description}</p>
                )}
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => openEditModal(dept)}
                  className="text-purple-600 hover:text-purple-800"
                >
                  <FaEdit />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Department Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Add New Department</h2>
                <button onClick={() => setShowAddModal(false)}>
                  <FaTimes className="text-gray-500 hover:text-gray-700" />
                </button>
              </div>

              <form onSubmit={handleAddDepartment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department Name *
                  </label>
                  <select
                    name="departmentName"
                    value={formData.departmentName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select Department</option>
                    {departmentOptions.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Branch *
                  </label>
                  <select
                    name="branch"
                    value={formData.branch}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select Branch</option>
                    {branchOptions.map(branch => (
                      <option key={branch} value={branch}>{branch}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Class Teacher
                  </label>
                  <select
                    name="classTeacher"
                    value={formData.classTeacher}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Select Class Teacher</option>
                    {faculty.map(f => (
                      <option key={f._id} value={f._id}>
                        {f.name} ({f.facultyId})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Add Department
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageDepartments;