const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["student", "faculty", "hod", "admin"],
      default: "student",
    },
    registerNumber: { type: String, unique: true, sparse: true },
    department: String,
    branch: String,
    section: String,
  },
  { timestamps: true }
);

// ✅ Correct password compare (bcrypt)
userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", userSchema);