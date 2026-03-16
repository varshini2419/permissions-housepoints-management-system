const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'faculty', 'hod', 'admin'], default: 'student' },
  registerNumber: { type: String, unique: true, sparse: true },
  department: String,
  branch: String,
  section: String
}, { timestamps: true });

// NO PRE-SAVE HOOK - Passwords stay plain text

// Simple direct comparison
userSchema.methods.comparePassword = function(password) {
  return password === this.password;
};

module.exports = mongoose.model('User', userSchema);