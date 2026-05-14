// frontend/src/layouts/HodLayout.js
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import '../styles/global.css';
import '../styles/HodLayout.css';

const HodLayout = () => {
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
          userRole="hod" 
          isOpen={sidebarOpen}
        />
        
        <main className={`layout-main ${sidebarOpen ? 'sidebar-wide' : 'sidebar-narrow'}`}>
          <div className="layout-content">
            {/* HOD Welcome Header */}
            <div className="mb-6 bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
              <h2 className="text-lg font-semibold text-purple-800">
                Head of Department Dashboard
              </h2>
              <p className="text-purple-600">
                Welcome, {user?.name || 'HOD'}. Monitor all departments and performance.
              </p>
            </div>

            {/* HOD Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-sm text-gray-500">Total Students</h3>
                <p className="text-2xl font-bold">324</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-sm text-gray-500">Pending Permissions</h3>
                <p className="text-2xl font-bold text-yellow-600">12</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-sm text-gray-500">Total Activities</h3>
                <p className="text-2xl font-bold">45</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-sm text-gray-500">House Points</h3>
                <p className="text-2xl font-bold text-green-600">1,245</p>
              </div>
            </div>
            
            {/* Child routes */}
            <Outlet />
          </div>
        </main>
      </div>

      {/* HOD Footer */}
      <footer className={`bg-white border-t py-4 transition-all duration-300 ${
        sidebarOpen ? 'ml-64' : 'ml-20'
      }`}>
        <div className="container mx-auto px-6">
          <p className="text-center text-gray-600 text-sm">
            Campus Permission & House Point System | Head of Department Panel
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HodLayout;