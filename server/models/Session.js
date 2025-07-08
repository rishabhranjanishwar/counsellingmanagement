const mongoose = require("mongoose")

const sessionSchema = new mongoose.Schema(
  {
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    counsellor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sessionDate: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number, // in minutes
      default: 60,
    },
    summary: {
      type: String,
      required: true,
    },
    interventions: [String],
    progress: {
      type: String,
      enum: ["Not Started", "Ongoing", "Resolved", "Follow-Up Required"],
      default: "Not Started",
    },
    nextSessionDate: Date,
    attachments: [
      {
        filename: String,
        path: String,
        uploadDate: Date,
      },
    ],
    isFollowUpRequired: {
      type: Boolean,
      default: false,
    },
    followUpNotes: String,
    confidentialityLevel: {
      type: String,
      enum: ["standard", "high", "critical"],
      default: "standard",
    },
  },
  {
    timestamps: true,
  },
)

module.exports = mongoose.model("Session", sessionSchema)
