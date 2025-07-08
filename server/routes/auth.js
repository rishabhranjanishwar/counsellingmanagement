const express = require("express")
const passport = require("passport")
const jwt = require("jsonwebtoken")
const User = require("../models/User")
const router = express.Router()

// Google OAuth routes
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }))

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: `${process.env.FRONTEND_URL}/login?error=auth_failed` }),
  async (req, res) => {
    try {
      // Generate JWT token
      const token = jwt.sign(
        {
          userId: req.user._id,
          email: req.user.email,
          role: req.user.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" },
      )

      // Redirect to frontend with token
      const redirectUrl = req.user.isProfileComplete
        ? `${process.env.FRONTEND_URL}/dashboard?token=${token}`
        : `${process.env.FRONTEND_URL}/profile-setup?token=${token}`

      res.redirect(redirectUrl)
    } catch (error) {
      console.error("Auth callback error:", error)
      res.redirect(`${process.env.FRONTEND_URL}/login?error=server_error`)
    }
  },
)

// Logout route
router.post("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: "Logout failed" })
    }
    res.json({ message: "Logged out successfully" })
  })
})

// Get current user
router.get("/me", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]
    if (!token) {
      return res.status(401).json({ message: "No token provided" })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.userId).select("-googleId")

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json(user)
  } catch (error) {
    res.status(401).json({ message: "Invalid token" })
  }
})

module.exports = router
