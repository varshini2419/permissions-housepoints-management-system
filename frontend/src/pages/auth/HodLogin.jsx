import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const HodLogin = () => {
  const [hodId, setHodId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await login({ hodId, password });

      if (result.success) {
        navigate("/hod/dashboard", { replace: true });
      } else {
        setError(result.error || "Login failed. Please check your credentials.");
      }
    } catch (err) {
      setError(err?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-600 py-12 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl">
        
        {/* Header */}
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            HOD Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your HOD ID and password
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* HOD ID */}
          <input
            type="text"
            placeholder="HOD ID (e.g., hod2026)"
            value={hodId}
            onChange={(e) => setHodId(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
            <button
              type="button"
              className="absolute right-2 top-2 text-sm"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

      </div>
    </div>
  );
};

export default HodLogin;