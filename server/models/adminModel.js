import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false }, // Optional for Google auth
    googleId: { type: String, sparse: true }, // For Google authentication
    firebaseUID: { type: String, required: true, unique: true }, // Firebase UID for authentication
    profileImage: { type: String }, // Profile image URL
    role: { type: String, default: 'admin' }, // Admin role
    isActive: { type: Boolean, default: true }, // Account status
    lastLogin: { type: Date }, // Track last login
    permissions: {
        type: [String],
        default: ['dashboard', 'orders', 'food_items', 'analytics', 'delivery_partners', 'feedback']
    }
}, {
    minimize: false,
    timestamps: true // Add createdAt and updatedAt
});

const adminModel = mongoose.models.admin || mongoose.model("admin", adminSchema);
export default adminModel;
