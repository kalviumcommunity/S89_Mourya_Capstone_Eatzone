import mongoose from "mongoose";

const foodSchema = new mongoose.Schema({
    name: {type:String,required:true},
    description: {type:String,required:true},
    price: {type:Number,required:true},
    image:{type:String,required:true},
    category:{type:String,required:true},
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'restaurant' }, // Associate with restaurant
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'admin' }, // Associate with admin
    firebaseUID: { type: String }, // Store admin's Firebase UID for quick queries

    // Discount fields
    originalPrice: { type: Number }, // Store original price if there's a discount
    discountPercentage: { type: Number, min: 0, max: 100, default: 0 }, // Discount percentage (0-100)
    discountAmount: { type: Number, min: 0, default: 0 }, // Fixed discount amount
    isOnSale: { type: Boolean, default: false }, // Whether item is on sale
    saleStartDate: { type: Date }, // Sale start date
    saleEndDate: { type: Date }, // Sale end date
    discountLabel: { type: String }, // Custom discount label like "MEGA SALE", "LIMITED TIME"

    // Additional attractive fields
    isPopular: { type: Boolean, default: false }, // Mark as popular item
    isFeatured: { type: Boolean, default: false }, // Featured item
    tags: [{ type: String }] // Tags like "Bestseller", "New", "Spicy", etc.
}, {
    timestamps: true // Add createdAt and updatedAt
})

const foodModel = mongoose.models.food || mongoose.model("food",foodSchema);

export default foodModel;