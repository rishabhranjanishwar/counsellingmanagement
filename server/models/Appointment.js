const mongoose = require("mongoose")

const appointmentSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    counsellor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Academic Stress",
        "Family Issues",
        "Anxiety",
        "Depression",
        "Peer Conflict",
        "Relationship Issues",
        "Career Guidance",
        "Personal Development",
        "Other",
      ],
    },
    description: {
      type: String,
      required: true,
    },
    preferredDate: {
      type: Date,
      required: true,
    },
    preferredTime: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "completed", "cancelled"],
      default: "pending",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    notes: String,
    scheduledDate: Date,
    scheduledTime: String,
  },
  {
    timestamps: true,
  },
)

module.exports = mongoose.model("Appointment", appointmentSchema)
