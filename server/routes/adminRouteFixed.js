import express from "express";
// Removed authentication-related imports - no longer needed

const adminRouter = express.Router();

// Token creation removed - no authentication required

// Test route
adminRouter.get("/test", (req, res) => {
    console.log("Admin test route hit!");
    res.json({ message: "Admin routes are working!" });
});

// Authentication routes removed - admin access is now unrestricted
// No registration or login required

// Authentication routes removed - admin access is now unrestricted

export default adminRouter;
