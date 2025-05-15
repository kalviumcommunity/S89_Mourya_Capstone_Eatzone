import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import passport from "passport";

// Function to create a JWT token
const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// Login user (Implementation needed)
const loginUser = async (req, res) => {
    const {email,password} = req.body;
    try {
        const user = await userModel.findOne({email});

        if (!user){
            return res.json({success:false,message:"User Doesn't exist"})
        }

        const isMatch = await bcrypt.compare(password,user.password);

        if (!isMatch){
            return res.json({success:false,message:"Invalid credentials"})
        }

        const token = createToken(user._id);
        res.json({success:true,token,user:{name:user.name,email:user.email}})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
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
            return res.json({ success: false, message: "Please enter a valid email" });
        }

        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password (at least 8 characters)" });
        }

        // Hash the user password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = new userModel({
            name: name,
            email: email,
            password: hashedPassword
        });

        const user = await newUser.save();

        // Generate JWT token
        const token = createToken(user._id);
        res.json({ success: true, token });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Error" });
    }
};

// Google Authentication
const googleAuth = passport.authenticate('google', {
    session: false,
    scope: ['profile', 'email'],
    prompt: 'select_account' // Force Google to always show the account selection screen
});

// Google Authentication Callback
const googleAuthCallback = (req, res) => {
    // This function will be called after successful Google authentication
    // The user object will be available in req.user (set by Passport)
    try {
        const user = req.user;
        if (!user) {
            return res.json({ success: false, message: "Authentication failed" });
        }

        // Generate JWT token
        const token = createToken(user._id);

        // Build redirect URL with all user data
        const redirectUrl = new URL(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/success`);

        // Add query parameters
        redirectUrl.searchParams.append('token', token);
        redirectUrl.searchParams.append('name', user.name);
        redirectUrl.searchParams.append('email', user.email);
        redirectUrl.searchParams.append('googleId', user.googleId || '');

        // Add profile image if available
        if (user.profileImage) {
            redirectUrl.searchParams.append('picture', user.profileImage);
        }

        // Redirect to frontend with token and user data
        res.redirect(redirectUrl.toString());
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: "Error during authentication" });
    }
};

export { loginUser, registerUser, googleAuth, googleAuthCallback };