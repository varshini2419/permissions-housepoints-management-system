const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const authRoutes = require("./routes/authRoutes");
const permissionRoutes = require("./routes/permissionRoutes");
const activityRoutes = require("./routes/activityRoutes");
const housePointRoutes = require("./routes/housePointRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();

const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map(origin => origin.trim())
  : ["http://localhost:5173"];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("CORS not allowed: " + origin));
  },
  credentials: true
}));

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ success: true, message: "Backend is running" });
});

app.get("/api/test", (req, res) => {
  res.json({ success: true, message: "Server is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/permissions", permissionRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/housepoints", housePointRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error("Server error:", err.message);
  res.status(500).json({ success: false, message: err.message });
});

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
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

  const User = require("./models/User");

app.get("/api/debug/student/:reg", async (req, res) => {
  const user = await User.findOne({ registerNumber: req.params.reg });
  if (!user) return res.json({ found: false });

  res.json({
    found: true,
    role: user.role,
    registerNumber: user.registerNumber,
    email: user.email,
    passwordStored: user.password,
    isBcrypt: user.password.startsWith("$2"),
  });
});