// frontend/src/pages/hod/Reports.js
import React, { useState, useEffect } from 'react';
import { 
  FaFilePdf, 
  FaFileExcel, 
  FaDownload, 
  FaChartBar,
  FaChartPie,
  FaChartLine,
  FaCalendarAlt,
  FaFilter,
  FaBuilding,
  FaUserGraduate,
  FaFileAlt,
  FaCheckCircle
} from 'react-icons/fa';
import api from '../../api/axiosConfig';

const Reports = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedReport, setSelectedReport] = useState('department');
  const [selectedDepartment, setSelectedDepartment] = useState('CSIT-A');
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });
  const [reportData, setReportData] = useState(null);

  const reportTypes = [
    { id: 'department', name: 'Department House Points', icon: FaBuilding },
    { id: 'student', name: 'Student Performance', icon: FaUserGraduate },
    { id: 'activity', name: 'Activity Submissions', icon: FaFileAlt },
    { id: 'permission', name: 'Permission Requests', icon: FaCheckCircle }
  ];

  const departments = ['CSIT-A', 'CSIT-B', 'CSD'];

  useEffect(() => {
    if (selectedReport === 'department') {
      fetchDepartmentReport();
    }
  }, [selectedReport, selectedDepartment, dateRange]);

  const fetchDepartmentReport = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/hod/reports/department/${selectedDepartment}`, {
        params: {
          fromDate: dateRange.from,
          toDate: dateRange.to
        }
      });
      setReportData(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load report');
      console.error('Report error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    try {
      const response = await api.get(`/hod/reports/export/${selectedReport}`, {
        params: {
          department: selectedDepartment,
          fromDate: dateRange.from,
          toDate: dateRange.to,
          format
        },
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report-${selectedReport}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError('Failed to export report');
      console.error('Export error:', err);
    }
  };

  const renderDepartmentReport = () => {
    if (!reportData) return null;

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow p-6 text-white">
            <FaBuilding className="text-3xl mb-2 opacity-75" />
            <h3 className="text-lg font-semibold mb-1">Total Students</h3>
            <p className="text-3xl font-bold">{reportData.summary?.students?.total || 0}</p>
          </div>
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
            <FaFileAlt className="text-3xl mb-2 opacity-75" />
            <h3 className="text-lg font-semibold mb-1">Total Activities</h3>
            <p className="text-3xl font-bold">{reportData.summary?.activities?.total || 0}</p>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow p-6 text-white">
            <FaCheckCircle className="text-3xl mb-2 opacity-75" />
            <h3 className="text-lg font-semibold mb-1">Approved Activities</h3>
            <p className="text-3xl font-bold">{reportData.summary?.activities?.approved || 0}</p>
          </div>
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg shadow p-6 text-white">
            <FaChartBar className="text-3xl mb-2 opacity-75" />
            <h3 className="text-lg font-semibold mb-1">Total Points</h3>
            <p className="text-3xl font-bold">{reportData.summary?.housePoints?.total || 0}</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Activity Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Activity Distribution by Type</h3>
            <div className="space-y-3">
              {reportData.distributions?.activityTypes?.map((item) => (
                <div key={item._id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize">{item._id}</span>
                    <span className="font-semibold">{item.count}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full" 
                      style={{ width: `${(item.count / reportData.summary?.activities?.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Points by Category */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Points by Category</h3>
            <div className="space-y-3">
              {reportData.distributions?.pointsByCategory?.map((item) => (
                <div key={item._id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize">{item._id}</span>
                    <span className="font-semibold">{item.total}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${(item.total / reportData.summary?.housePoints?.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Top Performing Students</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Rank</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Student</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Register No</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">House</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Activities</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Total Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reportData.topPerformers?.map((student, index) => (
                  <tr key={student._id}>
                    <td className="px-4 py-2">#{index + 1}</td>
                    <td className="px-4 py-2 font-medium">{student.student?.name}</td>
                    <td className="px-4 py-2 text-gray-600">{student.student?.registerNumber}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        student.student?.house === 'Red' ? 'bg-red-100 text-red-800' :
                        student.student?.house === 'Blue' ? 'bg-blue-100 text-blue-800' :
                        student.student?.house === 'Green' ? 'bg-green-100 text-green-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {student.student?.house}
                      </span>
                    </td>
                    <td className="px-4 py-2">{student.activitiesCount}</td>
                    <td className="px-4 py-2 font-bold text-purple-600">{student.totalPoints}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

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
          <FaChartBar className="text-purple-600 mr-2" />
          Reports & Analytics
        </h1>
        <p className="text-gray-600 mt-1">
          Generate and export department reports
        </p>
      </div>

      {/* Report Controls */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Report Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Report Type
            </label>
            <select
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {reportTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>

          {/* Department (for department report) */}
          {selectedReport === 'department' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          )}

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From Date
            </label>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To Date
            </label>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Export Buttons */}
        <div className="flex justify-end space-x-3 mt-4">
          <button
            onClick={() => handleExport('pdf')}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
          >
            <FaFilePdf className="mr-2" /> Export PDF
          </button>
          <button
            onClick={() => handleExport('excel')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
          >
            <FaFileExcel className="mr-2" /> Export Excel
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Report Content */}
      {selectedReport === 'department' && renderDepartmentReport()}
      {selectedReport !== 'department' && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <FaChartBar className="text-6xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600">Report Coming Soon</h3>
          <p className="text-gray-500 mt-2">
            This report type is under development
          </p>
        </div>
      )}
    </div>
  );
};

export default Reports;