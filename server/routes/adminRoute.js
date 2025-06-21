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

// Regular admin authentication routes (temporarily disabled)
adminRouter.post("/register", (req, res) => {
    res.json({ success: false, message: "Admin registration temporarily disabled for testing" });
});
adminRouter.post("/login", (req, res) => {
    res.json({ success: false, message: "Admin login temporarily disabled for testing" });
});

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

// Protected admin routes (temporarily disabled)
adminRouter.get("/profile", (req, res) => {
    res.json({ success: false, message: "Admin profile temporarily disabled for testing" });
});

adminRouter.post("/logout", (req, res) => {
    res.json({ success: true, message: "Admin logout temporarily disabled for testing" });
});

export default adminRouter;
