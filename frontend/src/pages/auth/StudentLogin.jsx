import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const StudentLogin = () => {
  const [loginType, setLoginType] = useState("student");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    let credentials = {};

    if (loginType === "student") {
      credentials = { registerNumber: identifier.trim(), password };
    }

    if (loginType === "faculty") {
      credentials = { facultyId: identifier.trim(), password };
    }

    if (loginType === "hod") {
      credentials = { hodId: identifier.trim(), password };
    }

    const result = await login(credentials);

    if (result.success) {
      if (loginType === "student") navigate("/student/dashboard");
      if (loginType === "faculty") navigate("/faculty/dashboard");
      if (loginType === "hod") navigate("/hod/dashboard");
    } else {
      setError(result.error || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold mb-2">Welcome Back</h1>
        <p className="mb-6 text-gray-600">Sign in to access your dashboard</p>

        {error && (
          <div className="mb-4 bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label className="block mb-2 font-medium">
            {loginType === "student"
              ? "Register Number"
              : loginType === "faculty"
              ? "Faculty ID"
              : "HOD ID"}
          </label>

          <input
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="w-full border px-3 py-2 rounded mb-4"
            placeholder={
              loginType === "student"
                ? "24B91A0701"
                : loginType === "faculty"
                ? "facsrkr"
                : "hod2026"
            }
            required
          />

          <label className="block mb-2 font-medium">Password</label>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border px-3 py-2 rounded mb-5"
            placeholder="Password"
            required
          />

          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700"
          >
            Sign In
          </button>
        </form>

        <div className="grid grid-cols-3 gap-3 mt-6">
          <button
            type="button"
            onClick={() => {
              setLoginType("student");
              setIdentifier("");
              setPassword("");
              setError("");
            }}
            className={`py-2 rounded ${
              loginType === "student" ? "bg-purple-600 text-white" : "bg-gray-100"
            }`}
          >
            🎓 Student
          </button>

          <button
            type="button"
            onClick={() => {
              setLoginType("faculty");
              setIdentifier("");
              setPassword("");
              setError("");
            }}
            className={`py-2 rounded ${
              loginType === "faculty" ? "bg-purple-600 text-white" : "bg-gray-100"
            }`}
          >
            👨‍🏫 Faculty
          </button>

          <button
            type="button"
            onClick={() => {
              setLoginType("hod");
              setIdentifier("");
              setPassword("");
              setError("");
            }}
            className={`py-2 rounded ${
              loginType === "hod" ? "bg-purple-600 text-white" : "bg-gray-100"
            }`}
          >
            🏫 HOD
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentLogin;