// frontend/src/components/Sidebar.js
import React from 'react';
import '../styles/global.css';
import '../styles/Sidebar.css';

import { NavLink } from 'react-router-dom';
import {
  FaHome,
  FaFileAlt,
  FaCalendarPlus,
  FaHistory,
  FaTrophy,
  FaUsers,
  FaCheckCircle,
  FaUserGraduate,
  FaChartBar,
  FaCog,
  FaUserPlus,
  FaKey,
  FaUniversity
} from 'react-icons/fa';

const Sidebar = ({ userRole = 'student', isOpen = true }) => {
  // Menu items based on user role
  const menuItems = {
    student: [
      { path: '/student/dashboard', name: 'Dashboard', icon: FaHome },
      { path: '/student/apply-permission', name: 'Apply Permission', icon: FaCalendarPlus },
      { path: '/student/submit-activity', name: 'Submit Activity', icon: FaFileAlt },
      { path: '/student/activity-history', name: 'Activity History', icon: FaHistory },
      { path: '/student/house-points', name: 'House Points', icon: FaTrophy }
    ],
    faculty: [
      { path: '/faculty/dashboard', name: 'Dashboard', icon: FaHome },
      { path: '/faculty/permission-requests', name: 'Permission Requests', icon: FaFileAlt },
      { path: '/faculty/activity-approvals', name: 'Activity Approvals', icon: FaCheckCircle },
      { path: '/faculty/assign-points', name: 'Assign Points', icon: FaTrophy }
    ],
    hod: [
      { path: '/hod/dashboard', name: 'Dashboard', icon: FaHome },
      { path: '/hod/department-overview', name: 'Department Overview', icon: FaUniversity },
      { path: '/hod/permission-approvals', name: 'Permission Approvals', icon: FaCheckCircle },
      { path: '/hod/leaderboard', name: 'Leaderboard', icon: FaChartBar },
      { path: '/hod/reports', name: 'Reports', icon: FaFileAlt }
    ],
    admin: [
      { path: '/admin/dashboard', name: 'Dashboard', icon: FaHome },
      { path: '/admin/manage-students', name: 'Manage Students', icon: FaUserGraduate },
      { path: '/admin/manage-faculty', name: 'Manage Faculty', icon: FaUsers },
      { path: '/admin/manage-departments', name: 'Manage Departments', icon: FaUniversity },
      { path: '/admin/reset-passwords', name: 'Reset Passwords', icon: FaKey },
      { path: '/admin/settings', name: 'Settings', icon: FaCog }
    ]
  };

  const items = menuItems[userRole] || menuItems.student;

  return (
    <aside className={`sidebar ${isOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <div className="sidebar-content">
        {items.map((item, index) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={index}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-item ${isActive ? 'sidebar-item-active' : ''}`
              }
            >
              <Icon className="sidebar-item-icon" />
              {isOpen && <span className="sidebar-item-text">{item.name}</span>}
            </NavLink>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;