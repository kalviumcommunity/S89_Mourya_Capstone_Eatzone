import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import passport from "passport";

// Function to create a JWT token
const createToken = (id) => {
  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is not defined in environment variables");
    throw new Error("JWT_SECRET is not defined");
  }

  try {
    const token = jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    return token;
  } catch (error) {
    console.error("Error creating token:", error);
    throw error;
  }
};

// Login user
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({
        success: false,
        message:
          "No account found with this email. Please register first or use Google Sign-In.",
      });
    }

    // Check if this is a Google account (no password)
    if (user.googleId && !user.password) {
      return res.json({
        success: false,
        message:
          "This email is registered with Google. Please use Google Sign-In.",
      });
    }

    // Check if user has a password (regular account)
    if (!user.password) {
      return res.json({
        success: false,
        message: "Please use Google Sign-In or reset your password.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({ success: false, message: "Invalid email or password" });
    }

    // Create token
    const token = createToken(user._id);

    // Return user data without sensitive information
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      profileImage: user.profileImage,
    };

    res.json({ success: true, token, user: userData });
  } catch (error) {
    console.error("Login error occurred");
    res.json({ success: false, message: "An error occurred during login" });
  }
};

// Register user
const registerUser = async (req, res) => {
  const { name, password, email } = req.body;
  try {
    // Check if user already exists
    const exists = await userModel.findOne({ email });
    if (exists) {
      return res.json({ success: false, message: "User already exists" });
    }

    // Validate email format & strong password
    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please enter a valid email",
      });
    }

    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Please enter a strong password (at least 8 characters)",
      });
    }

    // Hash the user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new users
    const newUser = new userModel({
      name: name,
      email: email,
      password: hashedPassword,
    });

    const user = await newUser.save();

    // Generate JWT token
    const token = createToken(user._id);

    // Return user data without sensitive information
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
    };

    res.json({ success: true, token, user: userData });
  } catch (error) {
    console.error("Registration error occurred");
    res.json({
      success: false,
      message: "An error occurred during registration",
    });
  }
};

// Google Authentication
const googleAuth = passport.authenticate("google", {
  session: false,
  scope: ["profile", "email"],
  prompt: "select_account", // Force Google to always show the account selection screen
});

// Google Authentication Callback
const googleAuthCallback = (req, res) => {
  // This function will be called after successful Google authentication
  // The user object will be available in req.user (set by Passport)
  try {
    const user = req.user;
    if (!user) {
      console.error("Authentication failed - no user object");
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      return res.redirect(`${frontendUrl}?authError=true&message=Authentication failed`);
    }

    console.log("Google authentication successful for user:", user.email);

    // Generate JWT Token
    const token = createToken(user._id);

    // Build redirect URL with all user data
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const redirectUrl = new URL(`${frontendUrl}/auth/success`);

    // Add query parameters
    redirectUrl.searchParams.append("token", token);
    redirectUrl.searchParams.append("id", user._id.toString());
    redirectUrl.searchParams.append("name", user.name);
    redirectUrl.searchParams.append("email", user.email);
    redirectUrl.searchParams.append("googleId", user.googleId || "");

    // Add profile image if available
    if (user.profileImage) {
      redirectUrl.searchParams.append("picture", user.profileImage);
    }

    const finalRedirectUrl = redirectUrl.toString();
    console.log("Redirecting to:", finalRedirectUrl);

    // Redirect to frontend with token and user data
    res.redirect(finalRedirectUrl);
  } catch (error) {
    console.error("Error during Google authentication callback:", error);

    // Redirect to frontend with error
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    res.redirect(`${frontendUrl}?authError=true&message=Authentication error occurred`);
  }
};

export { loginUser, registerUser, googleAuth, googleAuthCallback };
