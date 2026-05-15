const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["student", "faculty", "hod", "admin"],
      default: "student",
    },

    registerNumber: {
      type: String,
      unique: true,
      sparse: true,
    },

    department: String,
    branch: String,
    section: String,
  },
  { timestamps: true }
);

// ====================
// PASSWORD COMPARE (FIXED)
// ====================
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);