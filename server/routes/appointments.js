const express = require("express")
const { body, validationResult } = require("express-validator")
const Appointment = require("../models/Appointment")
const User = require("../models/User")
const auth = require("../middleware/auth")
const router = express.Router()

// Create new appointment
router.post(
  "/",
  [
    auth,
    body("category").isIn([
      "Academic Stress",
      "Family Issues",
      "Anxiety",
      "Depression",
      "Peer Conflict",
      "Relationship Issues",
      "Career Guidance",
      "Personal Development",
      "Other",
    ]),
    body("description").isLength({ min: 10 }),
    body("preferredDate").isISO8601(),
    body("preferredTime").matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const appointment = new Appointment({
        client: req.user.userId,
        ...req.body,
      })

      await appointment.save()
      await appointment.populate("client", "name email registrationNumber")

      res.status(201).json(appointment)
    } catch (error) {
      console.error("Appointment creation error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Get appointments based on user role
router.get("/", auth, async (req, res) => {
  try {
    const query = {}

    if (req.user.role === "client") {
      query.client = req.user.userId
    } else if (req.user.role === "counsellor") {
      query.$or = [{ counsellor: req.user.userId }, { status: "pending" }]
    }
    // Admin can see all appointments

    const appointments = await Appointment.find(query)
      .populate("client", "name email registrationNumber department")
      .populate("counsellor", "name email specialization")
      .sort({ createdAt: -1 })

    res.json(appointments)
  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
})

// Accept appointment (counsellor)
router.put("/:id/accept", auth, async (req, res) => {
  try {
    if (req.user.role !== "counsellor" && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" })
    }

    const appointment = await Appointment.findById(req.params.id)
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" })
    }

    appointment.counsellor = req.user.userId
    appointment.status = "accepted"
    appointment.scheduledDate = req.body.scheduledDate || appointment.preferredDate
    appointment.scheduledTime = req.body.scheduledTime || appointment.preferredTime

    await appointment.save()
    await appointment.populate(["client", "counsellor"])

    res.json(appointment)
  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
})

// Update appointment status
router.put("/:id/status", auth, async (req, res) => {
  try {
    const { status, notes } = req.body

    const appointment = await Appointment.findById(req.params.id)
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" })
    }

    // Check permissions
    if (req.user.role === "client" && appointment.client.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Access denied" })
    }
    if (req.user.role === "counsellor" && appointment.counsellor?.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Access denied" })
    }

    appointment.status = status
    if (notes) appointment.notes = notes

    await appointment.save()
    res.json(appointment)
  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
