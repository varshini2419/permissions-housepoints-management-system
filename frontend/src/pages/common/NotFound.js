// frontend/src/pages/common/NotFound.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  FaHome, 
  FaExclamationTriangle, 
  FaArrowLeft,
  FaBug,
  FaCompass
} from 'react-icons/fa';

const NotFound = () => {
  const navigate = useNavigate();
  const { user, role, isAuthenticated } = useAuth();
  const [countdown, setCountdown] = useState(10);

  // Auto-redirect after countdown
  useEffect(() => {
    if (!isAuthenticated) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate('/login');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isAuthenticated, navigate]);

  const handleGoBack = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const dashboardPaths = {
      student: '/student/dashboard',
      faculty: '/faculty/dashboard',
      hod: '/hod/dashboard',
      admin: '/admin/dashboard'
    };

    navigate(dashboardPaths[role] || '/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-800 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all hover:scale-105 duration-300">
          {/* Header with Pattern */}
          <div className="relative h-32 bg-gradient-to-r from-yellow-400 to-orange-500">
            <div className="absolute inset-0 opacity-25">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                    <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>
            <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2">
              <div className="bg-white rounded-full p-4 shadow-lg">
                <FaExclamationTriangle className="text-6xl text-orange-500" />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="pt-16 pb-8 px-8 text-center">
            {/* 404 Text */}
            <div className="mb-6">
              <span className="text-8xl font-black text-gray-800">404</span>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Page Not Found
            </h1>

            {/* Description */}
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              The page you're looking for might have been removed, had its name changed,
              or is temporarily unavailable.
            </p>

            {/* User Context */}
            {isAuthenticated ? (
              <div className="bg-indigo-50 rounded-lg p-4 mb-6">
                <p className="text-indigo-800">
                  <span className="font-semibold">{user?.name}</span> • {role}
                </p>
              </div>
            ) : (
              <div className="bg-yellow-50 rounded-lg p-4 mb-6">
                <p className="text-yellow-800 flex items-center justify-center">
                  <FaCompass className="mr-2 animate-spin" />
                  Redirecting to login in {countdown} seconds...
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleGoBack}
                className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg"
              >
                <FaHome className="mr-2" />
                {isAuthenticated ? 'Go to Dashboard' : 'Go to Login'}
              </button>
              
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center justify-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors shadow-md hover:shadow-lg"
              >
                <FaArrowLeft className="mr-2" />
                Go Back
              </button>
            </div>

            {/* Help Links */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-3">Try these helpful links:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {isAuthenticated ? (
                  <>
                    <a href={`/${role}/dashboard`} className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline">
                      Dashboard
                    </a>
                    <span className="text-gray-300">•</span>
                    <a href={`/${role}/profile`} className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline">
                      Profile
                    </a>
                  </>
                ) : (
                  <>
                    <a href="/login" className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline">
                      Login
                    </a>
                    <span className="text-gray-300">•</span>
                    <a href="/" className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline">
                      Home
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
            <div className="flex items-center justify-center text-sm text-gray-600">
              <FaBug className="mr-2 text-gray-400" />
              If you believe this is an error, please contact your system administrator.
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="mt-8 text-center text-white opacity-75 text-sm">
          <p>© {new Date().getFullYear()} Campus Permission & House Point System</p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;