const GoogleStrategy = require("passport-google-oauth20").Strategy
const User = require("../models/User")

module.exports = (passport) => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/api/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if email domain is allowed
          const email = profile.emails[0].value
          const domain = email.split("@")[1]

          if (domain !== process.env.ALLOWED_DOMAIN) {
            return done(null, false, { message: "Only SRMAP domain emails are allowed" })
          }

          // Check if user already exists
          let user = await User.findOne({ googleId: profile.id })

          if (user) {
            return done(null, user)
          }

          // Create new user
          user = new User({
            googleId: profile.id,
            email: email,
            name: profile.displayName,
            avatar: profile.photos[0].value,
            role: "client", // Default role
            isProfileComplete: false,
          })

          await user.save()
          return done(null, user)
        } catch (error) {
          return done(error, null)
        }
      },
    ),
  )

  passport.serializeUser((user, done) => {
    done(null, user.id)
  })

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id)
      done(null, user)
    } catch (error) {
      done(error, null)
    }
  })
}
