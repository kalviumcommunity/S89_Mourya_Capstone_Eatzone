import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";

// Helper function to verify token and get user ID
const getUserIdFromToken = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret_for_testing");
        return decoded.id;
    } catch (error) {
        console.error("Token verification failed");
        return null;
    }
};

// Get cart data for a user
export const getCart = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ success: false, message: "No token provided" });
        }

        const userId = getUserIdFromToken(token);
        if (!userId) {
            return res.status(401).json({ success: false, message: "Invalid token" });
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, cartData: user.cartData || {} });
    } catch (error) {
        console.error("Error getting cart:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Update cart data for a user
export const updateCart = async (req, res) => {
    try {
        console.log("Update cart request received");

        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            console.log("No token provided in request");
            return res.status(401).json({ success: false, message: "No token provided" });
        }

        const userId = getUserIdFromToken(token);
        if (!userId) {
            console.log("Invalid token or token verification failed");
            return res.status(401).json({ success: false, message: "Invalid token" });
        }

        const { cartData } = req.body;
        console.log("Cart data received:", JSON.stringify(cartData));

        if (!cartData) {
            console.log("No cart data provided in request body");
            return res.status(400).json({ success: false, message: "Cart data is required" });
        }

        console.log("Updating cart for user ID:", userId);

        try {
            const user = await userModel.findByIdAndUpdate(
                userId,
                { cartData },
                { new: true }
            );

            if (!user) {
                console.log("User not found with ID:", userId);
                return res.status(404).json({ success: false, message: "User not found" });
            }

            console.log("Cart updated successfully for user:", user.name);
            res.status(200).json({ success: true, cartData: user.cartData });
        } catch (dbError) {
            console.error("Database error when updating cart:", dbError);
            res.status(500).json({ success: false, message: "Database error", error: dbError.message });
        }
    } catch (error) {
        console.error("Error updating cart:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// Clear cart data for a user
export const clearCart = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ success: false, message: "No token provided" });
        }

        const userId = getUserIdFromToken(token);
        if (!userId) {
            return res.status(401).json({ success: false, message: "Invalid token" });
        }

        const user = await userModel.findByIdAndUpdate(
            userId,
            { cartData: {} },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, message: "Cart cleared successfully" });
    } catch (error) {
        console.error("Error clearing cart:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
