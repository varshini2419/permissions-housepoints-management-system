// frontend/src/components/Navbar.js (updated with toggle)
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserCircle, FaSignOutAlt, FaBars } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import '../styles/global.css';
import '../styles/Navbar.css';

const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <button
          onClick={toggleSidebar}
          className="navbar-toggle"
          aria-label="Toggle sidebar"
        >
          <FaBars className="navbar-toggle-icon" />
        </button>
        
        <div className="navbar-brand">
          <span className="navbar-brand-icon">CPS</span>
          <h1 className="navbar-title">Campus Permission System</h1>
        </div>
      </div>

      <div className="navbar-menu">
        <div className="navbar-user">
          <FaUserCircle className="navbar-user-icon" />
          <span className="navbar-user-name">
            {user?.name || 'User'} ({user?.role})
          </span>
        </div>
        
        <button
          onClick={handleLogout}
          className="navbar-logout-btn"
          title="Logout"
        >
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;