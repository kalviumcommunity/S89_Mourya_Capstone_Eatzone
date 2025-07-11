import express from "express";
// Temporarily commented out to test
// import { loginAdmin, registerAdmin, googleAuthAdmin, googleAuthCallbackAdmin } from "../controllers/adminController.js";
// import adminAuthMiddleware from "../middleware/adminAuth.js";
// import passport from "../config/passport.js";

const adminRouter = express.Router();

// Test route (can be removed in production)
adminRouter.get("/test", (req, res) => {
    res.json({ message: "Admin routes are working!" });
});

// Authentication routes removed - admin panel now has direct access

// Google OAuth routes for admin
adminRouter.get("/auth/google", (req, res) => {
    console.log("Admin Google OAuth route hit!");
    console.log("Environment variables loaded:", {
        clientId: process.env.GOOGLE_CLIENT_ID ? "✓" : "✗",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET ? "✓" : "✗"
    });

    // Redirect to Google OAuth
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${process.env.GOOGLE_CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent('https://eatzone.onrender.com/api/admin/auth/google/callback')}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent('profile email')}&` +
        `access_type=offline&` +
        `prompt=select_account`;

    console.log("Redirecting to Google:", googleAuthUrl);
    res.redirect(googleAuthUrl);
});
// Temporarily simplified callback
adminRouter.get("/auth/google/callback", (req, res) => {
    console.log("Google callback hit!");
    console.log("Query params:", req.query);
    res.json({ message: "Google callback received", query: req.query });
});

// Authentication endpoints removed - admin panel now has direct access

export default adminRouter;
