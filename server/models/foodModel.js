import mongoose from "mongoose";

const foodSchema = new mongoose.Schema({
    name: {type:String,required:true},
    description: {type:String,required:true},
    price: {type:Number,required:true},
    image:{type:String,required:true},
    category:{type:String,required:true},
    restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'restaurant' }, // Associate with restaurant
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'admin' }, // Associate with admin
    firebaseUID: { type: String } // Store admin's Firebase UID for quick queries
}, {
    timestamps: true // Add createdAt and updatedAt
})

const foodModel = mongoose.models.food || mongoose.model("food",foodSchema);

export default foodModel;