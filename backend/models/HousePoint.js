const mongoose = require('mongoose');

const activityHistorySchema = new mongoose.Schema({
  activityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activity',
    default: null
  },
  activityTitle: {
    type: String,
    required: true
  },
  points: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  approvedBy: {
    type: String,
    required: true
  }
});

const housePointSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  studentName: {
    type: String,
    required: true
  },
  registerNumber: {
    type: String,
    required: true,
    unique: true
  },
  department: {
    type: String,
    required: true
  },
  branch: {
    type: String,
    required: true,
    default: 'Computer Science'
  },
  section: {
    type: String,
    required: true,
    default: 'A'
  },
  totalPoints: {
    type: Number,
    default: 0
  },
  activityHistory: {
    type: [activityHistorySchema],
    default: []
  }
}, {
  timestamps: true // This automatically adds createdAt and updatedAt
});

// Remove any pre-save hooks that might be causing issues
// Let mongoose handle timestamps automatically

module.exports = mongoose.model('HousePoint', housePointSchema);