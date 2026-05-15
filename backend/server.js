const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// ====================
// IMPORTS
// ====================
const User = require("./models/User");

const authRoutes = require("./routes/authRoutes");
const permissionRoutes = require("./routes/permissionRoutes");
const activityRoutes = require("./routes/activityRoutes");
const housePointRoutes = require("./routes/housePointRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

// ====================
// CORS CONFIG
// ====================
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map((o) => o.trim())
  : ["http://localhost:5173"];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("CORS not allowed: " + origin));
    },
    credentials: true,
  })
);

// ====================
// MIDDLEWARE
// ====================
app.use(express.json());

// ====================
// TEST ROUTES
// ====================
app.get("/", (req, res) => {
  res.json({ success: true, message: "Backend running" });
});

app.get("/api/test", (req, res) => {
  res.json({ success: true, message: "Server is working" });
});

// ====================
// DEBUG ROUTE (IMPORTANT)
// ====================
app.get("/api/debug/student/:reg", async (req, res) => {
  try {
    const user = await User.findOne({
      registerNumber: req.params.reg,
    });

    if (!user) {
      return res.json({ found: false });
    }

    res.json({
      found: true,
      role: user.role,
      registerNumber: user.registerNumber,
      email: user.email,
      passwordStored: user.password,
      isBcrypt: user.password.startsWith("$2"),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ====================
// ROUTES
// ====================
app.use("/api/auth", authRoutes);
app.use("/api/permissions", permissionRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/housepoints", housePointRoutes);
app.use("/api/dashboard", dashboardRoutes);

// ====================
// 404 HANDLER
// ====================
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ====================
// ERROR HANDLER
// ====================
app.use((err, req, res, next) => {
  console.error("Server error:", err.message);
  res.status(500).json({ success: false, message: err.message });
});

// ====================
// CONNECT DB
// ====================
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB error:", err);
    process.exit(1);
  });