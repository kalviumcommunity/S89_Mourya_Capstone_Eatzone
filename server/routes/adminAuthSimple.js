import express from "express";
import jwt from "jsonwebtoken";

const adminAuthRouter = express.Router();

// Simple admin login endpoint for testing
adminAuthRouter.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Demo credentials for testing
        if (email === "admin@eatzone.com" && password === "admin123") {
            // Create JWT token
            const token = jwt.sign(
                { 
                    adminId: "demo-admin-id",
                    email: email,
                    type: "admin"
                },
                process.env.JWT_SECRET || "your-secret-key",
                { expiresIn: "24h" }
            );
            
            res.json({
                success: true,
                message: "Login successful",
                token: token,
                admin: {
                    id: "demo-admin-id",
                    name: "Demo Admin",
                    email: email,
                    role: "admin"
                }
            });
        } else {
            res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }
    } catch (error) {
        console.error("Admin login error:", error);
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

        const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
        
        if (decoded.type !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Invalid admin token"
            });
        }

        res.json({
            success: true,
            admin: {
                id: decoded.adminId,
                name: "Demo Admin",
                email: decoded.email,
                role: "admin"
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
