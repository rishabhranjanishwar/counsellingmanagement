const express = require("express")
const { body, validationResult } = require("express-validator")
const User = require("../models/User")
const auth = require("../middleware/auth")
const router = express.Router()

// Complete user profile
router.put(
  "/profile",
  [
    auth,
    body("registrationNumber").optional().isLength({ min: 1 }),
    body("gender").isIn(["Male", "Female", "Other"]),
    body("mobileNumber").isMobilePhone(),
    body("residenceType").isIn(["Hosteller", "Day Scholar"]),
    body("department").isLength({ min: 1 }),
    body("emergencyContact.name").isLength({ min: 1 }),
    body("emergencyContact.phone").isMobilePhone(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const user = await User.findById(req.user.userId)
      if (!user) {
        return res.status(404).json({ message: "User not found" })
      }

      // Update profile fields
      Object.keys(req.body).forEach((key) => {
        if (key !== "role" && key !== "googleId" && key !== "email") {
          user[key] = req.body[key]
        }
      })

      user.isProfileComplete = true
      await user.save()

      res.json({ message: "Profile updated successfully", user })
    } catch (error) {
      console.error("Profile update error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// Get all counsellors (for admin)
router.get("/counsellors", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" })
    }

    const counsellors = await User.find({ role: "counsellor" }).select("-googleId").sort({ name: 1 })

    res.json(counsellors)
  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
})

// Update user role (admin only)
router.put("/:userId/role", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" })
    }

    const { role } = req.body
    if (!["client", "counsellor", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" })
    }

    const user = await User.findById(req.params.userId)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    user.role = role
    await user.save()

    res.json({ message: "Role updated successfully", user })
  } catch (error) {
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
