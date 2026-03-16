// frontend/src/pages/hod/Leaderboard.js
import React, { useState, useEffect } from 'react';
import { FaTrophy, FaMedal, FaFilter, FaSearch, FaCrown } from 'react-icons/fa';
import api from '../../api/axiosConfig';

const Leaderboard = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [houseFilter, setHouseFilter] = useState('all');

  useEffect(() => {
    fetchLeaderboard();
  }, [departmentFilter, houseFilter]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (departmentFilter !== 'all') params.append('department', departmentFilter);
      if (houseFilter !== 'all') params.append('house', houseFilter);
      
      const response = await api.get(`/hod/leaderboard?${params.toString()}`);
      setStudents(response.data.individual || []);
      setError(null);
    } catch (err) {
      setError('Failed to load leaderboard');
      console.error('Leaderboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (index) => {
    if (index === 0) return <FaCrown className="text-yellow-500 text-2xl" />;
    if (index === 1) return <FaMedal className="text-gray-400 text-2xl" />;
    if (index === 2) return <FaMedal className="text-orange-500 text-2xl" />;
    return <span className="w-6 text-center font-bold text-gray-500">#{index + 1}</span>;
  };

  const getRowStyle = (index) => {
    if (index === 0) return 'bg-yellow-50 border-yellow-200';
    if (index === 1) return 'bg-gray-50 border-gray-200';
    if (index === 2) return 'bg-orange-50 border-orange-200';
    return 'border-gray-200';
  };

  const filteredStudents = students.filter(student =>
    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.registerNumber?.toLowerCase().includes(searchTerm.toLowerCase())
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
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <FaTrophy className="text-yellow-500 mr-2" />
          Student Leaderboard
        </h1>
        <p className="text-gray-600 mt-1">
          Top performing students based on house points
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <div className="relative">
            <FaFilter className="absolute left-3 top-3 text-gray-400" />
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
            >
              <option value="all">All Departments</option>
              <option value="CSIT-A">CSIT-A</option>
              <option value="CSIT-B">CSIT-B</option>
              <option value="CSD">CSD</option>
            </select>
          </div>
          <div className="relative">
            <FaFilter className="absolute left-3 top-3 text-gray-400" />
            <select
              value={houseFilter}
              onChange={(e) => setHouseFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
            >
              <option value="all">All Houses</option>
              <option value="Red">Red House</option>
              <option value="Blue">Blue House</option>
              <option value="Green">Green House</option>
              <option value="Yellow">Yellow House</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
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
              {filteredStudents.map((student, index) => (
                <tr key={student.id || index} className={`hover:bg-gray-50 border-l-4 ${getRowStyle(index)}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getRankIcon(index)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{student.name}</div>
                    <div className="text-sm text-gray-500">{student.registerNumber}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                      {student.department}
                    </span>
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
                    <span className={`text-2xl font-bold ${
                      index === 0 ? 'text-yellow-600' :
                      index === 1 ? 'text-gray-600' :
                      index === 2 ? 'text-orange-600' :
                      'text-purple-600'
                    }`}>
                      {student.totalPoints}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary Statistics */}
        <div className="bg-gray-50 px-6 py-4 border-t">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Total Students</p>
              <p className="text-xl font-bold text-gray-800">{filteredStudents.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Points</p>
              <p className="text-xl font-bold text-gray-800">
                {filteredStudents.reduce((sum, s) => sum + (s.totalPoints || 0), 0)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Average Points</p>
              <p className="text-xl font-bold text-gray-800">
                {filteredStudents.length > 0 
                  ? (filteredStudents.reduce((sum, s) => sum + (s.totalPoints || 0), 0) / filteredStudents.length).toFixed(1)
                  : 0}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;