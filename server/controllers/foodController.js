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

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Food image is required"
            });
        }

        let image_filename = `${req.file.filename}`;

        // Prepare food data
        const foodData = {
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            category: req.body.category,
            image: image_filename
        };

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
        const food  =await foodModel.findById(req.body.id);
        fs.unlink(`uploads/${food.image}`,()=>{})

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

        // Handle image update if new image is provided
        if (req.file && req.file.filename) {
            console.log("📷 New image provided:", req.file.filename);
            // Delete old image file (but don't fail if it doesn't exist)
            if (existingFood.image) {
                try {
                    fs.unlinkSync(`uploads/${existingFood.image}`);
                    console.log("🗑️ Deleted old image:", existingFood.image);
                } catch (err) {
                    console.log("⚠️ Could not delete old image:", err.message);
                }
            }
            updateData.image = req.file.filename;
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

