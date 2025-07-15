import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";

// Helper function to verify token and get user ID
const getUserIdFromToken = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded.id;
    } catch (error) {
        console.error("Token verification failed");
        return null;
    }
};

// Get user profile data
export const getUserProfile = async (req, res) => {
    try {
        console.log("Fetching user profile");
        console.log("Request headers:", req.headers);

        const authHeader = req.headers.authorization;
        const tokenHeader = req.headers.token;
        console.log("Authorization header:", authHeader);
        console.log("Token header:", tokenHeader);

        // Support both Authorization: Bearer <token> and token: <token> formats
        let token = null;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(" ")[1];
        } else if (tokenHeader) {
            token = tokenHeader;
        }

        console.log("Extracted token:", token ? token.substring(0, 10) + "..." : "none");

        if (!token) {
            console.log("No token provided in request");
            return res.status(401).json({ success: false, message: "No token provided" });
        }

        const userId = getUserIdFromToken(token);
        if (!userId) {
            console.log("Invalid token or token verification failed");
            return res.status(401).json({ success: false, message: "Invalid token" });
        }

        console.log("Looking up user with ID:", userId);
        const user = await userModel.findById(userId);
        console.log("User found:", user ? "Yes" : "No");

        if (!user) {
            console.log("User not found with ID:", userId);
            return res.status(404).json({ success: false, message: "User not found" });
        }

        console.log("Raw user data from database:", user);

        // Return user data without sensitive information
        const userData = {
            id: user._id,
            name: user.name,
            email: user.email,
            profileImage: user.profileImage,
            googleId: user.googleId
        };

        console.log("Processed user data to return:", userData);
        console.log("User profile fetched successfully:", userData.name);

        res.status(200).json({ success: true, data: userData, user: userData });
    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// Update user profile data
export const updateUserProfile = async (req, res) => {
    try {
        console.log("Updating user profile");
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

        const { name, profileImage } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, message: "Name is required" });
        }

        console.log("Updating user with ID:", userId);
        const updateData = { name };

        if (profileImage) {
            updateData.profileImage = profileImage;
        }

        const user = await userModel.findByIdAndUpdate(
            userId,
            updateData,
            { new: true }
        );

        if (!user) {
            console.log("User not found with ID:", userId);
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Return updated user data
        const userData = {
            id: user._id,
            name: user.name,
            email: user.email,
            profileImage: user.profileImage,
            googleId: user.googleId
        };

        console.log("User profile updated successfully:", userData.name);
        res.status(200).json({ success: true, user: userData });
    } catch (error) {
        console.error("Error updating user profile:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
