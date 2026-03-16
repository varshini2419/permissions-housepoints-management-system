import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({ registerNumber: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.registerNumber || !formData.password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    const result = await login(formData);
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'Invalid credentials');
    }
    
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const fillDemo = (role) => {
    const demos = {
      student: { registerNumber: 'REG001', password: 'password123' },
      faculty: { registerNumber: 'faculty@example.com', password: 'password123' },
      hod: { registerNumber: 'hod@example.com', password: 'password123' }
    };
    setFormData(demos[role]);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>Welcome Back</h2>
          <p>Sign in to access your dashboard</p>
        </div>
        
        {error && (
          <div className="alert alert-error">
            <span className="alert-icon">⚠️</span>
            <span>{error}</span>
            <button className="alert-close" onClick={() => setError('')}>×</button>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Register Number / Email</label>
            <input
              type="text"
              name="registerNumber"
              className="form-control"
              placeholder="Enter your register number or email"
              value={formData.registerNumber}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              className="form-control"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>
          
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="demo-buttons">
          <button 
            onClick={() => fillDemo('student')} 
            className="demo-btn student"
            disabled={loading}
          >
            🎓 Student login
          </button>
          <button 
            onClick={() => fillDemo('faculty')} 
            className="demo-btn faculty"
            disabled={loading}
          >
            👨‍🏫 Faculty login
          </button>
          <button 
            onClick={() => fillDemo('hod')} 
            className="demo-btn hod"
            disabled={loading}
          >
            👔 HOD login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;