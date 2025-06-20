import express from "express"
import { loginUser, registerUser, googleAuth, googleAuthCallback } from "../controllers/userController.js"
import { getUserProfile, updateUserProfile } from "../controllers/profileController.js"
import passport from "../config/passport.js"

const userRouter = express.Router()

// Regular authentication routes

// login register
userRouter.post("/register", registerUser)
userRouter.post("/login", loginUser)




// Google OAuth routes
userRouter.get("/auth/google", googleAuth)
userRouter.get("/auth/google/callback",
    (req, res, next) => {
        passport.authenticate('google', {
            session: false,
            failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}?authError=true&message=Google authentication failed`
        }, (err, user, info) => {
            if (err) {
                console.error('Passport authentication error:', err);
                return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}?authError=true&message=Authentication error`);
            }
            if (!user) {
                console.error('No user returned from passport:', info);
                return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}?authError=true&message=User not found`);
            }
            req.user = user;
            next();
        })(req, res, next);
    },
    googleAuthCallback
)

// Profile routes
userRouter.get("/profile", getUserProfile)
userRouter.put("/profile/update", updateUserProfile)

export default userRouter;