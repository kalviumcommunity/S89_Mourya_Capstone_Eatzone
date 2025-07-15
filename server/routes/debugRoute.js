import express from "express";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

const debugRouter = express.Router();

// Debug route to check authentication and cart status
debugRouter.get("/auth-status", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    
    console.log("🔍 Debug: Auth status check");
    console.log("🔍 Token provided:", !!token);
    
    if (!token) {
      return res.json({
        success: true,
        authenticated: false,
        message: "No token provided"
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("🔍 Token decoded successfully:", decoded);
    } catch (error) {
      console.log("🔍 Token verification failed:", error.message);
      return res.json({
        success: true,
        authenticated: false,
        message: "Invalid token",
        error: error.message
      });
    }

    // Get user data
    const user = await userModel.findById(decoded.id).select('name email googleId cartData');
    if (!user) {
      console.log("🔍 User not found for ID:", decoded.id);
      return res.json({
        success: true,
        authenticated: false,
        message: "User not found"
      });
    }

    console.log("🔍 User found:", user.name, user.email);
    console.log("🔍 Cart data:", user.cartData);

    res.json({
      success: true,
      authenticated: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        googleId: user.googleId
      },
      cartData: user.cartData || {},
      cartItemCount: Object.keys(user.cartData || {}).length
    });

  } catch (error) {
    console.error("🔍 Debug route error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
});

// Debug route to list all users with cart data
debugRouter.get("/users-with-carts", async (req, res) => {
  try {
    const users = await userModel.find({}).select('name email googleId cartData');
    
    const usersWithCarts = users.filter(user => 
      user.cartData && Object.keys(user.cartData).length > 0
    );

    res.json({
      success: true,
      totalUsers: users.length,
      usersWithCarts: usersWithCarts.length,
      users: usersWithCarts.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        googleId: user.googleId,
        cartItemCount: Object.keys(user.cartData || {}).length,
        cartData: user.cartData
      }))
    });

  } catch (error) {
    console.error("🔍 Debug users route error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
});

export default debugRouter;
