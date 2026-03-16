// backend/models/Department.js
const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  departmentName: { 
    type: String, 
    enum: ['CSIT-A', 'CSIT-B', 'CSD'], 
    required: true, 
    unique: true 
  },
  branch: { type: String, required: true },
  classTeacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  totalStudents: { type: Number, default: 0 }
}, { timestamps: true });

// ⚠️ NO INDEX: true ANYWHERE ABOVE!

// ✅ ALL INDEXES HERE - ONLY ONCE
// departmentSchema.index({ departmentName: 1 });
// departmentSchema.index({ branch: 1 });
// departmentSchema.index({ classTeacher: 1 });

module.exports = mongoose.model('Department', departmentSchema);