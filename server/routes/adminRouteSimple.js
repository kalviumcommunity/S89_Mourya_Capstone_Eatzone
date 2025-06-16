import express from "express";

const adminRouter = express.Router();

// Test route
adminRouter.get("/test", (req, res) => {
    res.json({ message: "Admin routes are working!" });
});

// Simple login test route
adminRouter.post("/login", (req, res) => {
    res.json({ success: false, message: "Admin login endpoint working" });
});

export default adminRouter;
