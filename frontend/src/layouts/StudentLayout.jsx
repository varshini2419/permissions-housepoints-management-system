// frontend/src/layouts/StudentLayout.js
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import '../styles/global.css';
import '../styles/StudentLayout.css';

const StudentLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user } = useAuth();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="layout-container">
      <Navbar toggleSidebar={toggleSidebar} />
      
      <div className="layout-wrapper">
        <Sidebar 
          userRole="student" 
          isOpen={sidebarOpen}
        />
        
        <main className={`layout-main ${sidebarOpen ? 'sidebar-wide' : 'sidebar-narrow'}`}>
          <div className="layout-content">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;