import express from 'express';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';

const router = express.Router();

// Test authentication endpoint to simulate Google OAuth callback
router.get('/test-auth', async (req, res) => {
  try {
    // Check if test user already exists
    let testUser = await userModel.findOne({ email: 'test@example.com' });

    if (!testUser) {
      // Create a new test user in the database
      testUser = new userModel({
        name: 'Test User',
        email: 'test@example.com',
        googleId: 'test_google_id_123',
        profileImage: 'https://ui-avatars.com/api/?name=T&background=random&color=fff&size=256'
      });

      testUser = await testUser.save();
      console.log('Created new test user:', testUser);
    } else {
      console.log('Using existing test user:', testUser);
    }

    // Generate JWT token
    const token = jwt.sign({ id: testUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    // Build redirect URL with all user data (same as Google OAuth callback)
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const redirectUrl = new URL(`${frontendUrl}/auth/success`);

    // Add query parameters
    redirectUrl.searchParams.append("token", token);
    redirectUrl.searchParams.append("id", testUser._id.toString());
    redirectUrl.searchParams.append("name", testUser.name);
    redirectUrl.searchParams.append("email", testUser.email);
    redirectUrl.searchParams.append("googleId", testUser.googleId);
    redirectUrl.searchParams.append("picture", testUser.profileImage);

    const finalRedirectUrl = redirectUrl.toString();
    console.log("Test auth redirecting to:", finalRedirectUrl);

    // Redirect to frontend with token and user data
    res.redirect(finalRedirectUrl);
  } catch (error) {
    console.error("Error during test authentication:", error);
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    res.redirect(`${frontendUrl}?authError=true&message=Test authentication error`);
  }
});

// Production environment check
router.get('/env-check', (req, res) => {
  res.json({
    environment: process.env.NODE_ENV || 'development',
    frontendUrl: process.env.FRONTEND_URL,
    serverUrl: process.env.SERVER_URL,
    googleClientId: process.env.GOOGLE_CLIENT_ID ? 'configured' : 'not configured',
    mongoUri: process.env.MONGODB_URI ? 'configured' : 'not configured',
    timestamp: new Date().toISOString()
  });
});

export default router;
