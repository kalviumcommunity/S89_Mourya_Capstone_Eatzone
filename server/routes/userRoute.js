import express from "express"
import { loginUser, registerUser, googleAuth, googleAuthCallback } from "../controllers/userController.js"
import { getUserProfile, updateUserProfile } from "../controllers/profileController.js"
import passport from "../config/passport.js"

const userRouter = express.Router()

// Regular authentication routes

//
userRouter.post("/register", registerUser)
userRouter.post("/login", loginUser)


// Google OAuth routes
userRouter.get("/auth/google", googleAuth)
userRouter.get("/auth/google/callback",
    passport.authenticate('google', {
        session: false,
        failureRedirect: process.env.FRONTEND_URL || 'http://localhost:3000'
    }),
    googleAuthCallback
)

// Profile routes
userRouter.get("/profile", getUserProfile)
userRouter.put("/profile/update", updateUserProfile)

export default userRouter;