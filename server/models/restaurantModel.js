import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String },
    email: { type: String },
    rating: { type: Number, default: 4.0, min: 0, max: 5 },
    deliveryTime: { type: String, default: "30-45 mins" },
    deliveryFee: { type: Number, default: 0 },
    minimumOrder: { type: Number, default: 0 },
    cuisineTypes: [{ type: String }], // e.g., ["Indian", "Chinese", "Italian"]
    isActive: { type: Boolean, default: true },
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'admin' },
    firebaseUID: { type: String } // Store admin's Firebase UID for quick queries
}, {
    timestamps: true
});

const restaurantModel = mongoose.models.restaurant || mongoose.model("restaurant", restaurantSchema);

export default restaurantModel;
