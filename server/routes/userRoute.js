import express from "express"
import { loginUser, registerUser, googleAuth, googleAuthCallback } from "../controllers/userController.js"
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

export default userRouter;