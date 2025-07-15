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

        // SECURITY: Validate cart data structure and content
        if (!cartData || typeof cartData !== 'object') {
            console.log("Invalid cart data provided");
            return res.status(400).json({ success: false, message: "Invalid cart data" });
        }

        // Enhanced cart validation with business logic
        let validatedCartData = {};
        const maxItemsPerProduct = parseInt(process.env.MAX_CART_QUANTITY_PER_ITEM) || 50;
        const maxTotalItems = parseInt(process.env.MAX_TOTAL_CART_ITEMS) || 200;
        let totalItems = 0;

        for (const [itemId, quantity] of Object.entries(cartData)) {
            // Enhanced item ID validation (MongoDB ObjectId)
            if (!itemId || typeof itemId !== 'string' || !/^[0-9a-fA-F]{24}$/.test(itemId)) {
                console.warn(`🚨 SECURITY: Invalid item ID format: ${itemId}`);
                continue;
            }

            // Enhanced quantity validation
            const qty = Number(quantity);
            if (!Number.isInteger(qty) || qty < 0 || qty > maxItemsPerProduct) {
                console.warn(`🚨 SECURITY: Invalid quantity for item ${itemId}: ${quantity} (max: ${maxItemsPerProduct})`);
                continue;
            }

            // Check total cart size limit
            totalItems += qty;
            if (totalItems > maxTotalItems) {
                console.warn(`🚨 SECURITY: Cart size limit exceeded. Total items: ${totalItems}, Max: ${maxTotalItems}`);
                return res.status(400).json({
                    success: false,
                    message: `Cart size limit exceeded. Maximum ${maxTotalItems} items allowed.`
                });
            }

            if (qty > 0) {
                validatedCartData[itemId] = qty;
            }
        }

        // Additional security: Verify items exist in database
        const itemIds = Object.keys(validatedCartData);
        if (itemIds.length > 0) {
            const { default: foodModel } = await import('../models/foodModel.js');
            const existingItems = await foodModel.find({ _id: { $in: itemIds } }).select('_id');
            const existingItemIds = existingItems.map(item => item._id.toString());

            // Remove non-existent items
            const finalCartData = {};
            for (const [itemId, qty] of Object.entries(validatedCartData)) {
                if (existingItemIds.includes(itemId)) {
                    finalCartData[itemId] = qty;
                } else {
                    console.warn(`🚨 SECURITY: Attempted to add non-existent item: ${itemId}`);
                }
            }
            validatedCartData = finalCartData;
        }

        console.log("Updating cart for user ID:", userId, "with validated data:", JSON.stringify(validatedCartData));

        try {
            const user = await userModel.findByIdAndUpdate(
                userId,
                { cartData: validatedCartData },
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
