const mongoose = require("mongoose")

const userSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    avatar: String,
    role: {
      type: String,
      enum: ["client", "counsellor", "admin"],
      default: "client",
    },
    isProfileComplete: {
      type: Boolean,
      default: false,
    },
    // Profile fields
    registrationNumber: String,
    employeeId: String,
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },
    mobileNumber: String,
    residenceType: {
      type: String,
      enum: ["Hosteller", "Day Scholar"],
    },
    address: String,
    department: String,
    school: String,
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String,
    },
    // Counsellor specific fields
    specialization: [String],
    availableSlots: [
      {
        day: String,
        startTime: String,
        endTime: String,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
)

module.exports = mongoose.model("User", userSchema)
