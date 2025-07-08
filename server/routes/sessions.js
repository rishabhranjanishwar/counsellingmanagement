const express = require("express")
const multer = require("multer")
const path = require("path")
const Session = require("../models/Session")
const Appointment = require("../models/Appointment")
const auth = require("../middleware/auth")
const router = express.Router()

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/sessions/")
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)

    if (mimetype && extname) {
      return cb(null, true)
    } else {
      cb(new Error("Invalid file type"))
    }
  },
})

// Create session record
router.post("/", auth, async (req, res) => {
  try {
    if (req.user.role !== "counsellor") {
      return res.status(403).json({ message: "Access denied" })
    }

    const { appointmentId, summary, interventions, progress, nextSessionDate, followUpNotes } = req.body

    const appointment = await Appointment.findById(appointmentId)
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" })
    }

    if (appointment.counsellor.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Access denied" })
    }

    const session = new Session({
      appointment: appointmentId,
      client: appointment.client,
      counsellor: req.user.userId,
      sessionDate: new Date(),
      summary,
      interventions: interventions || [],
      progress,
      nextSessionDate,
      followUpNotes,
      isFollowUpRequired: progress === "Follow-Up Required",
    })

    await session.save()

    // Update appointment status
    appointment.status = "completed"
    await appointment.save()

    await session.populate(["client", "counsellor", "appointment"])
    res.status(201).json(session)
  } catch (error) {
    console.error("Session creation error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get sessions based on user role
router.get("/", auth, async (req, res) => {
  try {
    const query = {}

    if (req.user.role === "client") {
      query.client = req.user.userId
    } else if (req.user.role === "counsellor") {
      query.counsellor = req.user.userId
    }
    // Admin can see all sessions

    const sessions = await Session.find(query)
      .populate("client", "name email registrationNumber department")
      .populate("counsellor", "name email")
      .populate("appointment", "category description")
      .sort({ sessionDate: -1 })

    res.json(sessions)
  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
})

// Get client session history
router.get("/client/:clientId", auth, async (req, res) => {
  try {
    if (req.user.role !== "counsellor" && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" })
    }

    const sessions = await Session.find({ client: req.params.clientId })
      .populate("counsellor", "name email")
      .populate("appointment", "category description")
      .sort({ sessionDate: -1 })

    res.json(sessions)
  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
})

// Upload session attachment
router.post("/:sessionId/upload", [auth, upload.single("file")], async (req, res) => {
  try {
    if (req.user.role !== "counsellor") {
      return res.status(403).json({ message: "Access denied" })
    }

    const session = await Session.findById(req.params.sessionId)
    if (!session) {
      return res.status(404).json({ message: "Session not found" })
    }

    if (session.counsellor.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Access denied" })
    }

    const attachment = {
      filename: req.file.originalname,
      path: req.file.path,
      uploadDate: new Date(),
    }

    session.attachments.push(attachment)
    await session.save()

    res.json({ message: "File uploaded successfully", attachment })
  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
