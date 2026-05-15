import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }

    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL;

      let endpoint = "";
      let payload = {};

      if (credentials?.registerNumber) {
        endpoint = "/api/auth/login/student";
        payload = {
          registerNumber: credentials.registerNumber.trim(),
          password: credentials.password,
        };
      } else if (credentials?.facultyId) {
        endpoint = "/api/auth/login/faculty";
        payload = {
          facultyId: credentials.facultyId.trim(),
          password: credentials.password,
        };
      } else if (credentials?.hodId) {
        endpoint = "/api/auth/login/hod";
        payload = {
          hodId: credentials.hodId.trim(),
          password: credentials.password,
        };
      } else if (credentials?.email) {
        endpoint = "/api/auth/login/hod";
        payload = {
          email: credentials.email.trim(),
          password: credentials.password,
        };
      } else {
        return { success: false, error: "Invalid login type" };
      }

      const res = await axios.post(`${API_URL}${endpoint}`, payload);

      const token = res.data?.token;
      const userData = res.data?.user;

      if (token && userData) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
        return { success: true };
      }

      return {
        success: false,
        error: res.data?.message || "Login failed",
      };
    } catch (error) {
      console.error("Login error:", error);

      return {
        success: false,
        error: error.response?.data?.message || error.message || "Login failed",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
        isStudent: user?.role === "student",
        isFaculty: user?.role === "faculty",
        isHOD: user?.role === "hod",
        isAdmin: user?.role === "admin",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};