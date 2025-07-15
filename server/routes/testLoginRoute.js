import express from "express";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

const testLoginRouter = express.Router();

// Test login route to simulate Google OAuth for testing cart persistence
testLoginRouter.get("/login/:email", async (req, res) => {
  try {
    const { email } = req.params;
    
    console.log("🔍 Test login for email:", email);
    
    // Find user by email
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    console.log("🔍 User found:", user.name, user.email);
    console.log("🔍 User cart data:", user.cartData);

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    // Prepare user data (same format as Google OAuth callback)
    const userData = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      googleId: user.googleId,
      profileImage: user.profileImage
    };

    // Build redirect URL with token and user data (same as Google OAuth callback)
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const redirectUrl = new URL(`${frontendUrl}/auth/success`);

    // Add query parameters
    redirectUrl.searchParams.append("token", token);
    redirectUrl.searchParams.append("id", userData.id);
    redirectUrl.searchParams.append("name", userData.name);
    redirectUrl.searchParams.append("email", userData.email);
    if (userData.googleId) {
      redirectUrl.searchParams.append("googleId", userData.googleId);
    }
    if (userData.profileImage) {
      redirectUrl.searchParams.append("picture", userData.profileImage);
    }

    const finalRedirectUrl = redirectUrl.toString();
    console.log("🔗 Redirecting to:", finalRedirectUrl);

    // Redirect to frontend with token and user data
    res.redirect(finalRedirectUrl);

  } catch (error) {
    console.error("🔍 Test login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
});

// Test route to get user info and cart data
testLoginRouter.get("/user-info/:email", async (req, res) => {
  try {
    const { email } = req.params;
    
    const user = await userModel.findOne({ email }).select('name email googleId cartData profileImage');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        googleId: user.googleId,
        profileImage: user.profileImage
      },
      cartData: user.cartData || {},
      cartItemCount: Object.keys(user.cartData || {}).length
    });

  } catch (error) {
    console.error("🔍 User info error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
});

export default testLoginRouter;
