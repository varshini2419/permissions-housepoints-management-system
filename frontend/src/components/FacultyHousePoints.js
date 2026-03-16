import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI, housePointAPI, activityAPI } from '../services/api';
import DashboardLayout from './DashboardLayout';
import { 
  FaStar, 
  FaTrophy, 
  FaCheckCircle, 
  FaClock,
  FaEye,
  FaPlusCircle,
  FaMinusCircle,
  FaUsers,
  FaGraduationCap,
  FaHistory,
  FaFilter,
  FaSearch,
  FaSpinner
} from 'react-icons/fa';

const FacultyHousePoints = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [housePoints, setHousePoints] = useState([]);
  const [pendingActivities, setPendingActivities] = useState([]);
  const [summary, setSummary] = useState({
    totalPoints: 0,
    totalStudents: 0,
    totalStudentsInDept: 0,
    averagePoints: 0,
    maxPoints: 0,
    minPoints: 0
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDeductForm, setShowDeductForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSection, setSelectedSection] = useState('all');
  const [pointsForm, setPointsForm] = useState({
    studentId: '',
    studentName: '',
    points: 0,
    reason: '',
    activityId: '',
    type: 'add'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch all required data in parallel
      const [dashboardRes, pointsRes, summaryRes, activitiesRes] = await Promise.all([
        dashboardAPI.getFacultyDashboard().catch(err => ({ data: { success: false, data: { students: [] } } })),
        housePointAPI.getDepartmentPoints().catch(err => ({ data: { success: false, data: [] } })),
        housePointAPI.getPointsSummary().catch(err => ({ data: { success: false, data: {} } })),
        activityAPI.getAll({ status: 'pending' }).catch(err => ({ data: { success: false, data: [] } }))
      ]);
      
      if (dashboardRes.data.success) {
        setStudents(dashboardRes.data.data.students || []);
      }
      
      if (pointsRes.data.success) {
        setHousePoints(pointsRes.data.data || []);
      }
      
      if (summaryRes.data.success) {
        setSummary(summaryRes.data.data);
      }
      
      if (activitiesRes.data.success) {
        setPendingActivities(activitiesRes.data.data || []);
      }
    } catch (error) {
      console.error('Fetch data error:', error);
      setError('Failed to load data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPoints = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!pointsForm.studentId) {
      setError('Please select a student');
      return;
    }

    if (pointsForm.points <= 0 || pointsForm.points > 100) {
      setError('Points must be between 1 and 100');
      return;
    }

    if (!pointsForm.reason.trim()) {
      setError('Please provide a reason');
      return;
    }

    try {
      setSubmitting(true);
      const response = await housePointAPI.addPoints({
        studentId: pointsForm.studentId,
        points: pointsForm.points,
        reason: pointsForm.reason,
        activityId: pointsForm.activityId || null
      });
      
      if (response.data.success) {
        setSuccess(`✅ Successfully added ${pointsForm.points} points to ${pointsForm.studentName}`);
        setShowAddForm(false);
        resetForm();
        fetchData();
      }
    } catch (error) {
      console.error('Add points error:', error);
      setError(error.message || 'Failed to add points');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeductPoints = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!pointsForm.studentId) {
      setError('Please select a student');
      return;
    }

    if (pointsForm.points <= 0 || pointsForm.points > 100) {
      setError('Points must be between 1 and 100');
      return;
    }

    if (!pointsForm.reason.trim()) {
      setError('Please provide a reason for deduction');
      return;
    }

    // Check if student has enough points
    const studentCurrentPoints = getStudentPoints(pointsForm.studentId);
    if (studentCurrentPoints < pointsForm.points) {
      setError(`Student only has ${studentCurrentPoints} points. Cannot deduct ${pointsForm.points}.`);
      return;
    }

    try {
      setSubmitting(true);
      const response = await housePointAPI.deductPoints({
        studentId: pointsForm.studentId,
        points: pointsForm.points,
        reason: pointsForm.reason
      });
      
      if (response.data.success) {
        setSuccess(`✅ Successfully deducted ${pointsForm.points} points from ${pointsForm.studentName}`);
        setShowDeductForm(false);
        resetForm();
        fetchData();
      }
    } catch (error) {
      console.error('Deduct points error:', error);
      setError(error.message || 'Failed to deduct points');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproveActivity = async (activityId, points) => {
    if (!points || points <= 0) {
      alert('Please enter valid points');
      return;
    }

    try {
      setSubmitting(true);
      await activityAPI.approve(activityId, {
        housePoints: points,
        remarks: `Approved by ${user.name}`
      });
      setSuccess('Activity approved and points awarded!');
      fetchData();
    } catch (error) {
      setError('Failed to approve activity');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setPointsForm({
      studentId: '',
      studentName: '',
      points: 0,
      reason: '',
      activityId: '',
      type: 'add'
    });
  };

  const getStudentPoints = (studentId) => {
    const student = housePoints.find(hp => hp.studentId === studentId);
    return student?.totalPoints || 0;
  };

  const getStudentPointsHistory = (studentId) => {
    const student = housePoints.find(hp => hp.studentId === studentId);
    return student?.activityHistory || [];
  };

  const getStudentPendingActivities = (studentId) => {
    return pendingActivities.filter(activity => 
      activity.studentId === studentId || activity.studentId?._id === studentId
    );
  };

  const filteredStudents = (housePoints || []).filter(student => {
    const matchesSearch = 
      student.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.registerNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSection = selectedSection === 'all' || student.section === selectedSection;
    
    return matchesSearch && matchesSection;
  });

  const sections = [...new Set((housePoints || []).map(s => s.section).filter(Boolean))];

  if (loading) {
    return (
      <DashboardLayout title="House Points Management">
        <div className="loading-spinner">
          <FaSpinner className="spinner" />
          <p>Loading house points data...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={`House Points - ${user?.department}`}>
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

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dbeafe', color: '#2563eb' }}>
            <FaUsers />
          </div>
          <h3>Total Students</h3>
          <div className="stat-value">{summary.totalStudentsInDept || 0}</div>
          <div className="stat-desc">in {user?.department}</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef9c3', color: '#eab308' }}>
            <FaTrophy />
          </div>
          <h3>Total Points</h3>
          <div className="stat-value">{summary.totalPoints || 0}</div>
          <div className="stat-desc">across all students</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dcfce7', color: '#22c55e' }}>
            <FaStar />
          </div>
          <h3>Average Points</h3>
          <div className="stat-value">{summary.averagePoints || 0}</div>
          <div className="stat-desc">per student</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fee2e2', color: '#ef4444' }}>
            <FaClock />
          </div>
          <h3>Pending Activities</h3>
          <div className="stat-value">{pendingActivities.length}</div>
          <div className="stat-desc">awaiting points</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="content-card" style={{ marginBottom: '20px' }}>
        <div className="flex justify-between items-center">
          <h2 style={{ marginBottom: 0 }}>
            <FaStar /> House Points Management
          </h2>
          <div className="flex gap-2">
            <button 
              className="btn btn-success"
              onClick={() => {
                resetForm();
                setShowAddForm(!showAddForm);
                setShowDeductForm(false);
              }}
              disabled={submitting}
            >
              <FaPlusCircle /> {showAddForm ? 'Cancel' : 'Add Points'}
            </button>
            <button 
              className="btn btn-danger"
              onClick={() => {
                resetForm();
                setShowDeductForm(!showDeductForm);
                setShowAddForm(false);
              }}
              disabled={submitting}
            >
              <FaMinusCircle /> {showDeductForm ? 'Cancel' : 'Deduct Points'}
            </button>
          </div>
        </div>
      </div>

      {/* Add Points Form */}
      {showAddForm && (
        <div className="content-card" style={{ marginBottom: '20px', borderLeft: '4px solid #22c55e' }}>
          <h3 style={{ color: '#22c55e' }}>➕ Add House Points</h3>
          <form onSubmit={handleAddPoints}>
            <div className="form-group">
              <label>Select Student</label>
              <select
                className="form-control"
                value={pointsForm.studentId}
                onChange={(e) => {
                  const student = housePoints.find(s => s.studentId === e.target.value);
                  setPointsForm({
                    ...pointsForm,
                    studentId: e.target.value,
                    studentName: student?.studentName || ''
                  });
                }}
                required
                disabled={submitting}
              >
                <option value="">-- Select Student --</option>
                {housePoints.map(student => (
                  <option key={student.studentId} value={student.studentId}>
                    {student.studentName} ({student.registerNumber}) - Current: {student.totalPoints} pts
                  </option>
                ))}
              </select>
            </div>

            {pointsForm.studentId && (
              <div className="form-group">
                <label>Or Link to Pending Activity</label>
                <select
                  className="form-control"
                  value={pointsForm.activityId}
                  onChange={(e) => {
                    const activityId = e.target.value;
                    if (activityId) {
                      const activity = pendingActivities.find(a => a._id === activityId);
                      setPointsForm({
                        ...pointsForm,
                        activityId,
                        reason: activity?.activityTitle || ''
                      });
                    }
                  }}
                  disabled={submitting}
                >
                  <option value="">-- Direct Points Addition --</option>
                  {getStudentPendingActivities(pointsForm.studentId).map(activity => (
                    <option key={activity._id} value={activity._id}>
                      {activity.activityTitle} - {new Date(activity.date).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group">
              <label>Points to Add (1-100)</label>
              <input
                type="number"
                min="1"
                max="100"
                className="form-control"
                value={pointsForm.points}
                onChange={(e) => setPointsForm({...pointsForm, points: parseInt(e.target.value)})}
                required
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label>Reason for Adding Points</label>
              <textarea
                className="form-control"
                rows="3"
                value={pointsForm.reason}
                onChange={(e) => setPointsForm({...pointsForm, reason: e.target.value})}
                placeholder="e.g., Excellent performance, Winning competition, etc."
                required
                disabled={submitting}
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-success"
              disabled={submitting}
            >
              {submitting ? <FaSpinner className="spinner-small" /> : <FaPlusCircle />} 
              {submitting ? 'Processing...' : 'Award Points'}
            </button>
          </form>
        </div>
      )}

      {/* Deduct Points Form */}
      {showDeductForm && (
        <div className="content-card" style={{ marginBottom: '20px', borderLeft: '4px solid #ef4444' }}>
          <h3 style={{ color: '#ef4444' }}>➖ Deduct House Points</h3>
          <form onSubmit={handleDeductPoints}>
            <div className="form-group">
              <label>Select Student</label>
              <select
                className="form-control"
                value={pointsForm.studentId}
                onChange={(e) => {
                  const student = housePoints.find(s => s.studentId === e.target.value);
                  setPointsForm({
                    ...pointsForm,
                    studentId: e.target.value,
                    studentName: student?.studentName || ''
                  });
                }}
                required
                disabled={submitting}
              >
                <option value="">-- Select Student --</option>
                {housePoints.map(student => (
                  <option key={student.studentId} value={student.studentId}>
                    {student.studentName} ({student.registerNumber}) - Current: {student.totalPoints} pts
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Points to Deduct (1-100)</label>
              <input
                type="number"
                min="1"
                max="100"
                className="form-control"
                value={pointsForm.points}
                onChange={(e) => setPointsForm({...pointsForm, points: parseInt(e.target.value)})}
                required
                disabled={submitting}
              />
            </div>

            <div className="form-group">
              <label>Reason for Deduction</label>
              <textarea
                className="form-control"
                rows="3"
                value={pointsForm.reason}
                onChange={(e) => setPointsForm({...pointsForm, reason: e.target.value})}
                placeholder="e.g., Misconduct, Rule violation, Late submission, etc."
                required
                disabled={submitting}
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-danger"
              disabled={submitting}
            >
              {submitting ? <FaSpinner className="spinner-small" /> : <FaMinusCircle />} 
              {submitting ? 'Processing...' : 'Deduct Points'}
            </button>
          </form>
        </div>
      )}

      {/* Search and Filter */}
      <div className="content-card" style={{ marginBottom: '20px' }}>
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="search-box" style={{ position: 'relative' }}>
              <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
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

      {/* Leaderboard */}
      <div className="content-card">
        <h2>
          <FaTrophy /> Department Leaderboard
        </h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Student Name</th>
                <th>Register Number</th>
                <th>Section</th>
                <th>Total Points</th>
                <th>Activities</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student, index) => {
                const activityCount = student.activityHistory?.length || 0;
                
                return (
                  <tr key={student.studentId}>
                    <td>
                      <strong>#{index + 1}</strong>
                    </td>
                    <td>{student.studentName}</td>
                    <td>{student.registerNumber}</td>
                    <td>{student.section || 'A'}</td>
                    <td>
                      <span style={{ 
                        fontWeight: 'bold', 
                        fontSize: '1.1rem',
                        color: student.totalPoints > 50 ? '#22c55e' : student.totalPoints > 20 ? '#eab308' : '#64748b' 
                      }}>
                        {student.totalPoints} pts
                      </span>
                    </td>
                    <td>{activityCount}</td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => {
                            setPointsForm({
                              studentId: student.studentId,
                              studentName: student.studentName,
                              points: 0,
                              reason: '',
                              activityId: '',
                              type: 'add'
                            });
                            setShowAddForm(true);
                            setShowDeductForm(false);
                          }}
                          disabled={submitting}
                        >
                          <FaPlusCircle /> Add
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => {
                            setPointsForm({
                              studentId: student.studentId,
                              studentName: student.studentName,
                              points: 0,
                              reason: '',
                              activityId: '',
                              type: 'deduct'
                            });
                            setShowDeductForm(true);
                            setShowAddForm(false);
                          }}
                          disabled={submitting || student.totalPoints === 0}
                        >
                          <FaMinusCircle /> Deduct
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>
                    <FaUsers style={{ fontSize: '48px', color: '#ccc', marginBottom: '16px' }} />
                    <p>No students found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pending Activities Section */}
      {pendingActivities.length > 0 && (
        <div className="content-card">
          <h2>
            <FaClock /> Pending Activities Awaiting Points
          </h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Activity</th>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingActivities.map(activity => (
                  <tr key={activity._id}>
                    <td>{activity.studentName || activity.studentId?.name}</td>
                    <td>{activity.activityTitle}</td>
                    <td>{new Date(activity.date).toLocaleDateString()}</td>
                    <td>{activity.description.substring(0, 50)}...</td>
                    <td>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min="1"
                          max="100"
                          placeholder="Points"
                          style={{ width: '80px', padding: '4px', borderRadius: '4px', border: '1px solid #ddd' }}
                          id={`points-${activity._id}`}
                          disabled={submitting}
                        />
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => {
                            const points = document.getElementById(`points-${activity._id}`).value;
                            if (points) {
                              handleApproveActivity(activity._id, parseInt(points));
                            } else {
                              alert('Please enter points');
                            }
                          }}
                          disabled={submitting}
                        >
                          {submitting ? <FaSpinner className="spinner-small" /> : 'Approve'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Points History */}
      <div className="content-card">
        <h2>
          <FaHistory /> Recent Points Activity
        </h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Student</th>
                <th>Activity/Reason</th>
                <th>Points</th>
                <th>Type</th>
                <th>Awarded By</th>
              </tr>
            </thead>
            <tbody>
              {housePoints
                .flatMap(hp => 
                  (hp.activityHistory || []).map(activity => ({
                    ...activity,
                    studentName: hp.studentName,
                    studentReg: hp.registerNumber
                  }))
                )
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 20)
                .map((item, index) => (
                  <tr key={index}>
                    <td>{new Date(item.date).toLocaleDateString()}</td>
                    <td>{item.studentName} ({item.studentReg})</td>
                    <td>{item.activityTitle || item.reason || 'Points awarded'}</td>
                    <td>
                      <span style={{ 
                        color: item.points > 0 ? '#22c55e' : '#ef4444',
                        fontWeight: 'bold'
                      }}>
                        {item.points > 0 ? '+' : ''}{item.points}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${item.points > 0 ? 'status-approved' : 'status-rejected'}`}>
                        {item.points > 0 ? 'Added' : 'Deducted'}
                      </span>
                    </td>
                    <td>{item.approvedBy || user?.name}</td>
                  </tr>
                ))}
              {housePoints.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '24px' }}>
                    No points activity yet
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

export default FacultyHousePoints;


