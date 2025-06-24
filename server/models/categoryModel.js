import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true, 
        unique: true,
        trim: true 
    },
    description: { 
        type: String, 
        default: '' 
    },
    image: { 
        type: String, 
        required: true 
    },
    isActive: { 
        type: Boolean, 
        default: true 
    },
    order: { 
        type: Number, 
        default: 0 
    }, // For ordering categories in display
    adminId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'admin' 
    }, // Associate with admin who created it
    firebaseUID: { 
        type: String 
    } // Store admin's Firebase UID for quick queries
}, {
    timestamps: true // Add createdAt and updatedAt
});

// Index for better performance
categorySchema.index({ name: 1 });
categorySchema.index({ isActive: 1 });
categorySchema.index({ order: 1 });

const categoryModel = mongoose.models.category || mongoose.model("category", categorySchema);

export default categoryModel;
