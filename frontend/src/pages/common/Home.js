// frontend/src/pages/common/Home.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserGraduate, FaChalkboardTeacher, FaUserTie, FaUserCog } from 'react-icons/fa';
import './Home.css'; // Create this CSS file

const Home = () => {
  const navigate = useNavigate();

  const loginOptions = [
    {
      role: 'Student',
      path: '/login/student',
      icon: FaUserGraduate,
      color: '#3498db',
      description: 'Access your dashboard, submit activities, and track house points'
    },
    {
      role: 'Faculty',
      path: '/login/faculty',
      icon: FaChalkboardTeacher,
      color: '#2ecc71',
      description: 'Review permissions, approve activities, and assign points'
    },
    {
      role: 'HOD',
      path: '/login/hod',
      icon: FaUserTie,
      color: '#9b59b6',
      description: 'Monitor departments, view reports, and approve permissions'
    },
    {
      role: 'Admin',
      path: '/login/admin',
      icon: FaUserCog,
      color: '#e74c3c',
      description: 'Manage users, departments, and system settings'
    }
  ];

  return (
    <div className="home-container">
      <div className="home-content">
        <div className="home-header">
          <h1>Campus Permission & House Point System</h1>
          <p>Select your role to login and access your dashboard</p>
        </div>

        <div className="home-grid">
          {loginOptions.map((option) => {
            const Icon = option.icon;
            return (
              <div
                key={option.role}
                className="home-card"
                style={{ backgroundColor: option.color }}
                onClick={() => navigate(option.path)}
              >
                <div className="card-icon">
                  <Icon />
                </div>
                <div className="card-content">
                  <h2>{option.role} Login</h2>
                  <p>{option.description}</p>
                  <div className="card-footer">
                    <span>Click to continue →</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="home-footer">
          <p>© 2024 Campus Permission & House Point Management System. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Home;