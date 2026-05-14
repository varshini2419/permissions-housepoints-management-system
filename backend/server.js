const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

// Import models
const User = require('./models/User');

// Import routes
const authRoutes = require('./routes/authRoutes');
const permissionRoutes = require('./routes/permissionRoutes');
const activityRoutes = require('./routes/activityRoutes');
const housePointRoutes = require('./routes/housePointRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

// Middleware
app.use(express.json());
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/housepoints', housePointRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Test route
app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

// Connect to MongoDB and create users
const PORT = process.env.PORT || 5000;

mongoose.connect('mongodb://localhost:27017/campus-permission-system')
  .then(async () => {
    console.log('✅ MongoDB connected');
    
    // Clear existing users
    await User.deleteMany({});
    console.log('🗑️ Cleared existing users');
    
    // Hash passwords manually
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    
    // Create users with pre-hashed passwords
    const users = [
      {
        name: 'Student One',
        email: 'student1@example.com',
        password: hashedPassword,
        role: 'student',
        registerNumber: 'REG001',
        department: 'Computer Science',
        branch: 'Computer Science',
        section: 'A'
      },
      {
        name: 'Faculty One',
        email: 'faculty@example.com',
        password: hashedPassword,
        role: 'faculty',
        department: 'Computer Science'
      },
      {
        name: 'HOD One',
        email: 'hod@example.com',
        password: hashedPassword,
        role: 'hod',
        department: 'Computer Science'
      }
    ];

    for (const userData of users) {
      const user = new User(userData);
      await user.save();
      console.log(`✅ Created: ${user.name} (${user.role})`);
    }

    // Verify users
    const count = await User.countDocuments();
    console.log(`📊 Total users in database: ${count}`);

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT} (without DB)`);
    });
  });

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message });
});