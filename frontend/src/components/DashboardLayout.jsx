import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FaBars, 
  FaTachometerAlt, 
  FaUsers, 
  FaClipboardList, 
  FaCalendarAlt, 
  FaSignOutAlt,
  FaGraduationCap,
  FaChalkboardTeacher,
  FaUserTie,
  FaCog,
  FaBell,
  FaStar
} from 'react-icons/fa';

const DashboardLayout = ({ children, title }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const getMenuItems = () => {
    switch (user?.role) {
      case 'student':
        return [
          { icon: <FaTachometerAlt />, label: 'Dashboard', path: '/student/dashboard' },
          { icon: <FaCalendarAlt />, label: 'Permissions', path: '/student/permissions' },
          { icon: <FaClipboardList />, label: 'Activities', path: '/student/activities' }
        ];
      
      case 'faculty':
        return [
          { icon: <FaTachometerAlt />, label: 'Dashboard', path: '/faculty/dashboard' },
          { icon: <FaUsers />, label: 'Students', path: '/faculty/students' },
          { icon: <FaCalendarAlt />, label: 'Permissions', path: '/faculty/permissions' },
          { icon: <FaStar />, label: 'House Points', path: '/faculty/housepoints' }
        ];
      
      case 'hod':
        return [
          { icon: <FaTachometerAlt />, label: 'Dashboard', path: '/hod/dashboard' },
          { icon: <FaCalendarAlt />, label: 'Permissions', path: '/hod/permissions' } // Added Permissions back
        ];
      
      case 'admin':
        return [
          { icon: <FaTachometerAlt />, label: 'Dashboard', path: '/admin/dashboard' },
          { icon: <FaUsers />, label: 'Users', path: '/admin/users' },
          { icon: <FaGraduationCap />, label: 'Students', path: '/admin/students' },
          { icon: <FaChalkboardTeacher />, label: 'Faculty', path: '/admin/faculty' },
          { icon: <FaUserTie />, label: 'HODs', path: '/admin/hods' },
          { icon: <FaCog />, label: 'Settings', path: '/admin/settings' }
        ];
      
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <div className="app">
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <h2>Campus HMS</h2>
          <p>{user?.role?.toUpperCase()}</p>
        </div>
        
        <nav className="sidebar-nav">
          <ul>
            {menuItems.map((item, index) => (
              <li key={`menu-${index}`}>
                <a 
                  href={item.path}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(item.path);
                    setSidebarOpen(false);
                  }}
                  className={location.pathname === item.path ? 'active' : ''}
                >
                  <span className="menu-icon">{item.icon}</span>
                  <span className="menu-label">{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="main-content">
        <nav className="navbar">
          <div className="navbar-left">
            <button className="menu-toggle" onClick={toggleSidebar}>
              <FaBars />
            </button>
            <div className="navbar-title">
              <h1>{title}</h1>
            </div>
          </div>
          
          <div className="navbar-right">
            <button className="notification-btn">
              <FaBell />
              <span className="notification-badge">3</span>
            </button>
            
            <div className="user-info">
              <div className="user-name">{user?.name}</div>
              <div className="user-role">{user?.role}</div>
            </div>
            
            <button className="logout-btn" onClick={handleLogout}>
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          </div>
        </nav>

        <div className="dashboard-content">
          {children}
        </div>
      </div>

      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>
      )}
    </div>
  );
};

export default DashboardLayout;