// frontend/src/layouts/FacultyLayout.js
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import '../styles/global.css';
import '../styles/StudentLayout.css';

const FacultyLayout = () => {
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
          userRole="faculty" 
          isOpen={sidebarOpen}
        />
        
        <main className={`layout-main ${sidebarOpen ? 'sidebar-wide' : 'sidebar-narrow'}`}>
          <div className="layout-content">
            {/* Welcome message for faculty */}
            <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <h2 className="text-lg font-semibold text-blue-800">
                Faculty Dashboard
              </h2>
              <p className="text-blue-600">
                Welcome, {user?.name || 'Faculty'}. Review and manage student permissions and activities.
              </p>
            </div>
            
            {/* Child routes */}
            <Outlet />
          </div>
        </main>
      </div>

      {/* Faculty Footer */}
      <footer className={`bg-white border-t py-4 transition-all duration-300 ${
        sidebarOpen ? 'ml-64' : 'ml-20'
      }`}>
        <div className="container mx-auto px-6">
          <p className="text-center text-gray-600 text-sm">
            Campus Permission & House Point System | Faculty Panel
          </p>
        </div>
      </footer>
    </div>
  );
};

export default FacultyLayout;