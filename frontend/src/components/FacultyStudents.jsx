import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI, housePointAPI } from '../services/api';
import DashboardLayout from './DashboardLayout';
import { 
  FaUsers, 
  FaUserGraduate, 
  FaTrophy,
  FaSearch
} from 'react-icons/fa';

const FacultyStudents = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSection, setSelectedSection] = useState('all');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await dashboardAPI.getFacultyDashboard();
      if (response.data.success) {
        setStudents(response.data.data.students || []);
      }
    } catch (error) {
      setError('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const getStudentPoints = async (studentId) => {
    try {
      const response = await housePointAPI.getStudentPoints(studentId);
      return response.data.data.totalPoints;
    } catch (error) {
      return 0;
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.registerNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSection = selectedSection === 'all' || student.section === selectedSection;
    
    return matchesSearch && matchesSection;
  });

  const sections = [...new Set(students.map(s => s.section).filter(Boolean))];

  if (loading) {
    return (
      <DashboardLayout title="Students List">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading students...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={`Students - ${user?.department}`}>
      {error && (
        <div className="alert alert-error">
          <span className="alert-icon">⚠️</span>
          <span>{error}</span>
          <button className="alert-close" onClick={() => setError('')}>×</button>
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dbeafe', color: '#2563eb' }}>
            <FaUsers />
          </div>
          <h3>Total Students</h3>
          <div className="stat-value">{students.length}</div>
          <div className="stat-desc">in {user?.department}</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef9c3', color: '#eab308' }}>
            <FaUserGraduate />
          </div>
          <h3>Sections</h3>
          <div className="stat-value">{sections.length}</div>
          <div className="stat-desc">active sections</div>
        </div>
      </div>

      <div className="content-card" style={{ marginBottom: '20px' }}>
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="search-box">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search by name or register number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-control"
                style={{ paddingLeft: '40px' }}
              />
            </div>
          </div>
          
          {sections.length > 0 && (
            <div style={{ minWidth: '200px' }}>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="form-control"
              >
                <option value="all">All Sections</option>
                {sections.map(section => (
                  <option key={section} value={section}>Section {section}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="content-card">
        <h2>
          <FaUserGraduate /> Student List
        </h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Register Number</th>
                <th>Branch</th>
                <th>Section</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student, index) => (
                <tr key={student._id}>
                  <td>{index + 1}</td>
                  <td>{student.name}</td>
                  <td>{student.registerNumber}</td>
                  <td>{student.branch || '-'}</td>
                  <td>{student.section || '-'}</td>
                  <td>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={async () => {
                        const points = await getStudentPoints(student._id);
                        alert(`${student.name} has ${points} house points`);
                      }}
                    >
                      <FaTrophy /> View Points
                    </button>
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                    <FaUsers style={{ fontSize: '48px', color: '#ccc', marginBottom: '16px' }} />
                    <p>No students found</p>
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

export default FacultyStudents;