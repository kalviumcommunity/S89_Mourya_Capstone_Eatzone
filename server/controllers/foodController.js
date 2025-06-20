import foodModel from "../models/foodModel.js";
import fs from 'fs';
import path from 'path';

// Ensure uploads directory exists
const uploadsDir = 'uploads';
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Created uploads directory');
}


//add food item

const addFood = async(req,res) =>{
    try {
        console.log("=== ADD FOOD REQUEST ===");
        console.log("Request body:", req.body);
        console.log("Request file:", req.file);

        // Check if image is provided (either file upload or Cloudinary URL)
        let image_filename;

        if (req.file) {
            // Traditional file upload (for backward compatibility)
            image_filename = req.file.filename;
        } else if (req.body.image) {
            // Cloudinary URL from admin upload
            image_filename = req.body.image;
        } else {
            return res.status(400).json({
                success: false,
                message: "Food image is required"
            });
        }

        // Prepare food data
        const foodData = {
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            category: req.body.category,
            image: image_filename
        };

        // Handle discount fields if provided
        if (req.body.discountPercentage && req.body.discountPercentage > 0) {
            foodData.originalPrice = req.body.price;
            foodData.discountPercentage = Number(req.body.discountPercentage);
            foodData.isOnSale = true;
            // Calculate discounted price
            const discountAmount = (req.body.price * req.body.discountPercentage) / 100;
            foodData.price = req.body.price - discountAmount;
            foodData.discountAmount = discountAmount;
        }

        // Handle other optional fields
        if (req.body.discountLabel) foodData.discountLabel = req.body.discountLabel;
        if (req.body.saleStartDate) foodData.saleStartDate = new Date(req.body.saleStartDate);
        if (req.body.saleEndDate) foodData.saleEndDate = new Date(req.body.saleEndDate);
        if (req.body.isPopular) foodData.isPopular = req.body.isPopular === 'true';
        if (req.body.isFeatured) foodData.isFeatured = req.body.isFeatured === 'true';
        if (req.body.tags) {
            foodData.tags = typeof req.body.tags === 'string' ?
                req.body.tags.split(',').map(tag => tag.trim()) :
                req.body.tags;
        }

        // Add restaurant association if provided
        if (req.body.restaurantId && req.body.restaurantId.trim() !== '') {
            foodData.restaurantId = req.body.restaurantId;
            console.log("✅ Food item will be associated with restaurant:", req.body.restaurantId);
        } else {
            console.log("ℹ️ Food item will be added as general item (no restaurant association)");
        }

        // Add admin association if provided
        if (req.body.adminId) {
            foodData.adminId = req.body.adminId;
        }
        if (req.body.firebaseUID) {
            foodData.firebaseUID = req.body.firebaseUID;
        }

        const food = new foodModel(foodData);
        await food.save();

        console.log("✅ Food item saved successfully:", food.name);
        res.json({
            success: true,
            message: "Food Added Successfully",
            data: food
        });
    } catch (error) {
        console.error("❌ Error adding food:", error);
        res.status(500).json({
            success: false,
            message: "Error adding food item",
            error: error.message
        });
    }
}

//get food list
const listFood = async (req, res) => {
    try {
        const foods = await foodModel.find({});
        res.json({success:true,data:foods})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
    }
}

//remove food item
const removeFood = async (req,res) => {
    try {
        const food = await foodModel.findById(req.body.id);

        // Only try to delete local file if it's not a Cloudinary URL
        if (food.image && !food.image.startsWith('http')) {
            fs.unlink(`uploads/${food.image}`, () => {});
        }
        // Note: Cloudinary image deletion should be handled separately for security

        await foodModel.findByIdAndDelete(req.body.id);
        res.json({success:true,message:"Food Removed"})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
    }
}

//clear all food items
const clearAllFood = async (req, res) => {
    try {
        await foodModel.deleteMany({});
        res.json({success:true,message:"All food items cleared successfully"})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error clearing food items"})
    }
}

//update food item
const updateFood = async (req, res) => {
    try {
        console.log("=== UPDATE FOOD REQUEST ===");
        console.log("Request body:", req.body);
        console.log("Request file:", req.file);

        const { id, name, description, price, category } = req.body;

        // Basic validation
        if (!id) {
            console.log("❌ No ID provided");
            return res.status(400).json({success: false, message: "Food ID is required"});
        }

        if (!name || !price || !category) {
            console.log("❌ Missing required fields:", { name: !!name, price: !!price, category: !!category });
            return res.status(400).json({success: false, message: "Name, price, and category are required"});
        }

        // Validate price is a number
        const numericPrice = Number(price);
        if (isNaN(numericPrice) || numericPrice <= 0) {
            console.log("❌ Invalid price:", price);
            return res.status(400).json({success: false, message: "Price must be a valid positive number"});
        }

        // Find the existing food item
        console.log("🔍 Looking for food item with ID:", id);
        const existingFood = await foodModel.findById(id);
        if (!existingFood) {
            console.log("❌ Food item not found with ID:", id);
            return res.status(404).json({success: false, message: "Food item not found"});
        }

        console.log("✅ Found existing food item:", existingFood.name);

        // Prepare update data
        const updateData = {
            name: name.trim(),
            description: description ? description.trim() : (existingFood.description || ''),
            price: numericPrice,
            category: category.trim(),
            image: existingFood.image // Default to existing image
        };

        // Handle discount fields if provided
        if (req.body.discountPercentage !== undefined) {
            const discountPercentage = Number(req.body.discountPercentage);
            if (discountPercentage > 0) {
                updateData.originalPrice = numericPrice;
                updateData.discountPercentage = discountPercentage;
                updateData.isOnSale = true;
                // Calculate discounted price
                const discountAmount = (numericPrice * discountPercentage) / 100;
                updateData.price = numericPrice - discountAmount;
                updateData.discountAmount = discountAmount;
            } else {
                // Remove discount
                updateData.originalPrice = undefined;
                updateData.discountPercentage = 0;
                updateData.discountAmount = 0;
                updateData.isOnSale = false;
                updateData.price = numericPrice;
            }
        }

        // Handle other optional fields
        if (req.body.discountLabel !== undefined) updateData.discountLabel = req.body.discountLabel;
        if (req.body.saleStartDate !== undefined) updateData.saleStartDate = req.body.saleStartDate ? new Date(req.body.saleStartDate) : undefined;
        if (req.body.saleEndDate !== undefined) updateData.saleEndDate = req.body.saleEndDate ? new Date(req.body.saleEndDate) : undefined;
        if (req.body.isPopular !== undefined) updateData.isPopular = req.body.isPopular === 'true';
        if (req.body.isFeatured !== undefined) updateData.isFeatured = req.body.isFeatured === 'true';
        if (req.body.tags !== undefined) {
            updateData.tags = req.body.tags ?
                (typeof req.body.tags === 'string' ?
                    req.body.tags.split(',').map(tag => tag.trim()) :
                    req.body.tags) :
                [];
        }

        // Handle image update if new image is provided
        if (req.file && req.file.filename) {
            console.log("📷 New file image provided:", req.file.filename);
            // Delete old image file only if it's not a Cloudinary URL
            if (existingFood.image && !existingFood.image.startsWith('http')) {
                try {
                    fs.unlinkSync(`uploads/${existingFood.image}`);
                    console.log("🗑️ Deleted old local image:", existingFood.image);
                } catch (err) {
                    console.log("⚠️ Could not delete old image:", err.message);
                }
            }
            updateData.image = req.file.filename;
        } else if (req.body.image && req.body.image !== existingFood.image) {
            console.log("📷 New Cloudinary image provided:", req.body.image);
            // Delete old local image file if it exists and new image is Cloudinary URL
            if (existingFood.image && !existingFood.image.startsWith('http')) {
                try {
                    fs.unlinkSync(`uploads/${existingFood.image}`);
                    console.log("🗑️ Deleted old local image for Cloudinary replacement:", existingFood.image);
                } catch (err) {
                    console.log("⚠️ Could not delete old image:", err.message);
                }
            }
            updateData.image = req.body.image;
        } else {
            console.log("📷 No new image provided, keeping existing image");
        }

        console.log("📝 Update data:", updateData);

        // Update the food item
        const updatedFood = await foodModel.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedFood) {
            console.log("❌ Failed to update food item");
            return res.status(500).json({success: false, message: "Failed to update food item"});
        }

        console.log("✅ Food item updated successfully:", updatedFood.name);
        res.json({
            success: true,
            message: "Food item updated successfully",
            data: updatedFood
        });

    } catch (error) {
        console.error("❌ Error updating food item:", error);

        // Handle specific MongoDB errors
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: "Validation error: " + Object.values(error.errors).map(e => e.message).join(', ')
            });
        }

        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: "Invalid ID format"
            });
        }

        res.status(500).json({
            success: false,
            message: "Internal server error: " + error.message
        });
    }
}

export { addFood, listFood,removeFood, clearAllFood, updateFood };

