// frontend/src/pages/hod/DepartmentOverview.js
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  FaBuilding, 
  FaUsers, 
  FaTrophy, 
  FaFileAlt,
  FaSearch,
  FaUserGraduate,
  FaChartLine
} from 'react-icons/fa';
import api from '../../api/axiosConfig';

const DepartmentOverview = () => {
  const [searchParams] = useSearchParams();
  const [selectedDept, setSelectedDept] = useState(searchParams.get('dept') || 'CSIT-A');
  const [departments, setDepartments] = useState([]);
  const [departmentData, setDepartmentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const departmentOptions = ['CSIT-A', 'CSIT-B', 'CSD'];

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (selectedDept) {
      fetchDepartmentDetails(selectedDept);
    }
  }, [selectedDept]);

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/hod/departments-overview');
      setDepartments(response.data.departments || []);
    } catch (err) {
      setError('Failed to load departments');
      console.error('Fetch departments error:', err);
    }
  };

  const fetchDepartmentDetails = async (dept) => {
    try {
      setLoading(true);
      const response = await api.get(`/hod/department/${dept}`);
      setDepartmentData(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load department details');
      console.error('Fetch department details error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = departmentData?.students?.filter(student =>
    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.registerNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

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
        <h1 className="text-2xl font-bold text-gray-800">Department Overview</h1>
        <p className="text-gray-600 mt-1">
          Monitor and analyze department performance
        </p>
      </div>

      {/* Department Selector */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-64">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Department
            </label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {departmentOptions.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Students
            </label>
            <div className="relative">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or register number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Department Stats */}
      {departmentData && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow p-6 text-white">
              <FaUsers className="text-3xl mb-2 opacity-75" />
              <h3 className="text-lg font-semibold mb-1">Total Students</h3>
              <p className="text-3xl font-bold">{departmentData.stats?.totalStudents || 0}</p>
            </div>
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
              <FaFileAlt className="text-3xl mb-2 opacity-75" />
              <h3 className="text-lg font-semibold mb-1">Total Activities</h3>
              <p className="text-3xl font-bold">{departmentData.stats?.totalActivities || 0}</p>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow p-6 text-white">
              <FaTrophy className="text-3xl mb-2 opacity-75" />
              <h3 className="text-lg font-semibold mb-1">House Points</h3>
              <p className="text-3xl font-bold">{departmentData.stats?.totalPoints || 0}</p>
            </div>
            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg shadow p-6 text-white">
              <FaChartLine className="text-3xl mb-2 opacity-75" />
              <h3 className="text-lg font-semibold mb-1">Average Points</h3>
              <p className="text-3xl font-bold">{departmentData.stats?.averagePoints || 0}</p>
            </div>
          </div>

          {/* Students Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="text-xl font-semibold flex items-center">
                <FaUserGraduate className="text-purple-600 mr-2" />
                Student List
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Register No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Year/Sem
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      House
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Activities
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Points
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{student.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.registerNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.year}/{student.semester}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          student.house === 'Red' ? 'bg-red-100 text-red-800' :
                          student.house === 'Blue' ? 'bg-blue-100 text-blue-800' :
                          student.house === 'Green' ? 'bg-green-100 text-green-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {student.house}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.activitiesCount || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-bold text-purple-600">{student.totalPoints || 0}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DepartmentOverview;