import adminModel from "../models/adminModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import passport from "passport";

// Create JWT token for admin
const createToken = (id) => {
    return jwt.sign({ id, type: 'admin' }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Register admin
const registerAdmin = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        console.log("Admin registration attempt for email:", email);

        // Validate input
        if (!name || !email || !password) {
            return res.json({ success: false, message: "All fields are required" });
        }

        // Validate email format
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" });
        }

        // Check if admin already exists
        const exists = await adminModel.findOne({ email });
        if (exists) {
            console.log("Admin already exists with email:", email);
            return res.json({ success: false, message: "Admin already exists with this email" });
        }

        // Validate password strength
        if (password.length < 8) {
            console.log("Password too short for admin:", email);
            return res.json({ success: false, message: "Please enter a strong password (at least 8 characters)" });
        }

        // Hash the admin password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new admin
        const newAdmin = new adminModel({
            name: name,
            email: email,
            password: hashedPassword
        });

        const admin = await newAdmin.save();
        console.log("New admin created:", admin.name);

        // Generate JWT token
        const token = createToken(admin._id);

        // Return admin data without sensitive information
        const adminData = {
            id: admin._id,
            name: admin.name,
            email: admin.email,
            role: admin.role,
            permissions: admin.permissions
        };

        res.json({ success: true, token, admin: adminData });
    } catch (error) {
        console.error("Admin registration error:", error);
        res.json({ success: false, message: "An error occurred during registration" });
    }
};

// Login admin
const loginAdmin = async (req, res) => {
    const { email, password } = req.body;
    try {
        console.log("Admin login attempt for email:", email);

        const admin = await adminModel.findOne({ email });

        if (!admin) {
            console.log("Admin not found with email:", email);
            return res.json({
                success: false,
                message: "No admin account found with this email. Please register first or use Google Sign-In."
            });
        }

        // Check if admin account is active
        if (!admin.isActive) {
            console.log("Admin account is deactivated:", email);
            return res.json({
                success: false,
                message: "Your admin account has been deactivated. Please contact support."
            });
        }

        // Check if this is a Google account (no password)
        if (admin.googleId && !admin.password) {
            console.log("This is a Google admin account, please use Google Sign-In");
            return res.json({
                success: false,
                message: "This email is registered with Google. Please use Google Sign-In."
            });
        }

        // Check if admin has a password (regular account)
        if (!admin.password) {
            console.log("Admin has no password set:", email);
            return res.json({
                success: false,
                message: "Please use Google Sign-In or reset your password."
            });
        }

        const isMatch = await bcrypt.compare(password, admin.password);

        if (!isMatch) {
            console.log("Invalid password for admin:", email);
            return res.json({ success: false, message: "Invalid email or password" });
        }

        // Update last login
        admin.lastLogin = new Date();
        await admin.save();

        // Create token
        const token = createToken(admin._id);

        // Return admin data without sensitive information
        const adminData = {
            id: admin._id,
            name: admin.name,
            email: admin.email,
            role: admin.role,
            permissions: admin.permissions,
            profileImage: admin.profileImage
        };

        res.json({ success: true, token, admin: adminData });
    } catch (error) {
        console.error("Admin login error occurred");
        res.json({ success: false, message: "An error occurred during login" });
    }
};

// Google OAuth initiation for admin
const googleAuthAdmin = passport.authenticate('google-admin', {
    scope: ['profile', 'email']
});

// Google OAuth callback for admin
const googleAuthCallbackAdmin = async (req, res) => {
    try {
        const { user } = req;
        
        if (!user) {
            console.error("No user data received from Google OAuth");
            const adminUrl = process.env.ADMIN_URL || 'http://localhost:5175';
            return res.redirect(`${adminUrl}/login?authError=true`);
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Generate JWT token
        const token = createToken(user._id);

        // Prepare admin data
        const adminData = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            permissions: user.permissions,
            profileImage: user.profileImage
        };

        // Redirect to admin frontend with token and user data
        const adminUrl = process.env.ADMIN_URL || 'http://localhost:5175';
        const redirectUrl = new URL('/auth/success', adminUrl);
        redirectUrl.searchParams.set('token', token);
        redirectUrl.searchParams.set('admin', JSON.stringify(adminData));

        const finalRedirectUrl = redirectUrl.toString();
        console.log("Redirecting admin to:", finalRedirectUrl);

        // Redirect to admin frontend with token and admin data
        res.redirect(finalRedirectUrl);
    } catch (error) {
        console.error("Error during Google admin authentication callback:", error);

        // Redirect to admin frontend with error
        const adminUrl = process.env.ADMIN_URL || 'http://localhost:5175';
        res.redirect(`${adminUrl}/login?authError=true`);
    }
};

export { loginAdmin, registerAdmin, googleAuthAdmin, googleAuthCallbackAdmin };
