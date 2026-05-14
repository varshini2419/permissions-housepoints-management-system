// frontend/src/layouts/AdminLayout.js
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import '../styles/global.css';
import '../styles/AdminLayout.css';

const AdminLayout = () => {
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
          userRole="admin" 
          isOpen={sidebarOpen}
        />
        
        <main className={`layout-main ${sidebarOpen ? 'sidebar-wide' : 'sidebar-narrow'}`}>
          <div className="layout-content">
            {/* Admin Quick Actions */}
            <div className="mb-6 bg-white p-4 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
              <div className="flex flex-wrap gap-3">
                <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                  Add Student
                </button>
                <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                  Add Faculty
                </button>
                <button className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">
                  Generate Report
                </button>
                <button className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">
                  System Settings
                </button>
              </div>
            </div>
            
            {/* Child routes */}
            <Outlet />
          </div>
        </main>
      </div>

      {/* Admin Footer */}
      <footer className={`bg-white border-t py-4 transition-all duration-300 ${
        sidebarOpen ? 'ml-64' : 'ml-20'
      }`}>
        <div className="container mx-auto px-6">
          <p className="text-center text-gray-600 text-sm">
            Campus Permission & House Point System v1.0 | Admin Panel
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AdminLayout;