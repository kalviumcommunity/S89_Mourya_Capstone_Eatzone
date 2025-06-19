import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import adminModel from "../models/adminModel.js";

const adminAuthRouter = express.Router();

// Admin login endpoint
adminAuthRouter.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        // Find admin by email
        const admin = await adminModel.findOne({ email });
        if (!admin) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                adminId: admin._id,
                email: admin.email,
                role: 'admin'
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Return success response (exclude password)
        const adminData = {
            id: admin._id,
            name: admin.name,
            email: admin.email,
            role: 'admin'
        };

        res.json({
            success: true,
            message: "Login successful",
            token,
            admin: adminData
        });

    } catch (error) {
        console.error("Admin login error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

// Admin registration endpoint - SECURE VERSION (Super Admin Only)
adminAuthRouter.post("/register", async (req, res) => {
    try {
        const { name, email, password, superAdminKey } = req.body;

        // SECURITY: Require super admin key for registration
        const requiredSuperAdminKey = process.env.SUPER_ADMIN_KEY;
        if (!requiredSuperAdminKey) {
            return res.status(503).json({
                success: false,
                message: "Admin registration is disabled - SUPER_ADMIN_KEY not configured"
            });
        }

        if (!superAdminKey || superAdminKey !== requiredSuperAdminKey) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized: Invalid super admin key"
            });
        }

        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email, and password are required"
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format"
            });
        }

        // Validate password strength
        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters long"
            });
        }

        // Check if any admin already exists (only allow one admin for security)
        const adminCount = await adminModel.countDocuments();
        if (adminCount >= 1) {
            return res.status(409).json({
                success: false,
                message: "Admin account already exists. Contact system administrator."
            });
        }

        // Check if admin already exists by email
        const existingAdmin = await adminModel.findOne({ email });
        if (existingAdmin) {
            return res.status(409).json({
                success: false,
                message: "Admin with this email already exists"
            });
        }

        // Hash password with high salt rounds
        const saltRounds = 14; // Increased for better security
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create new admin
        const newAdmin = new adminModel({
            name,
            email,
            password: hashedPassword,
            role: 'admin',
            isActive: true
        });

        await newAdmin.save();

        // Log admin creation for security audit
        console.log(`🔐 SECURITY AUDIT: New admin account created - Email: ${email}, Time: ${new Date().toISOString()}`);

        res.status(201).json({
            success: true,
            message: "Admin registered successfully"
        });

    } catch (error) {
        console.error("Admin registration error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

// Verify admin token endpoint
adminAuthRouter.get("/verify", async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "No token provided"
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const admin = await adminModel.findById(decoded.adminId).select('-password');

        if (!admin) {
            return res.status(401).json({
                success: false,
                message: "Invalid token"
            });
        }

        res.json({
            success: true,
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: 'admin'
            }
        });

    } catch (error) {
        console.error("Token verification error:", error);
        res.status(401).json({
            success: false,
            message: "Invalid token"
        });
    }
});

export default adminAuthRouter;
