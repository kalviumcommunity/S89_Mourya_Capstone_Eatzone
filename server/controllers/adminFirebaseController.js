import foodModel from "../models/foodModel.js";
import orderModel from "../models/orderModel.js";
import adminModel from "../models/adminModel.js";
import fs from 'fs';

// Add food item with admin association
const addFoodWithAdmin = async (req, res) => {
    try {
        const { firebaseUID } = req.body;
        
        if (!firebaseUID) {
            return res.status(400).json({
                success: false,
                message: "Firebase UID is required"
            });
        }

        // Find admin by Firebase UID
        const admin = await adminModel.findOne({ firebaseUID });
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin not found"
            });
        }

        let image_filename = req.file ? req.file.filename : null;
        
        const food = new foodModel({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            category: req.body.category,
            image: image_filename,
            adminId: admin._id,
            firebaseUID: firebaseUID
        });

        await food.save();
        
        res.json({
            success: true,
            message: "Food Added Successfully",
            data: food
        });
    } catch (error) {
        console.error("Error adding food with admin:", error);
        res.status(500).json({
            success: false,
            message: "Error adding food item",
            error: error.message
        });
    }
};

// Update food item with admin verification
const updateFoodWithAdmin = async (req, res) => {
    try {
        const { id, firebaseUID, name, description, price, category } = req.body;

        if (!firebaseUID) {
            return res.status(400).json({
                success: false,
                message: "Firebase UID is required"
            });
        }

        // Find admin by Firebase UID
        const admin = await adminModel.findOne({ firebaseUID });
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin not found"
            });
        }

        // Find the existing food item and verify ownership
        const existingFood = await foodModel.findOne({ 
            _id: id, 
            firebaseUID: firebaseUID 
        });
        
        if (!existingFood) {
            return res.status(404).json({
                success: false,
                message: "Food item not found or you don't have permission to edit it"
            });
        }

        // Prepare update data
        const updateData = {
            name: name.trim(),
            description: description ? description.trim() : existingFood.description,
            price: Number(price),
            category: category.trim(),
            image: existingFood.image
        };

        // Handle image update if new image is provided
        if (req.file && req.file.filename) {
            // Delete old image file
            if (existingFood.image) {
                try {
                    fs.unlinkSync(`uploads/${existingFood.image}`);
                } catch (err) {
                    console.log("Could not delete old image:", err.message);
                }
            }
            updateData.image = req.file.filename;
        }

        // Update the food item
        const updatedFood = await foodModel.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: "Food item updated successfully",
            data: updatedFood
        });

    } catch (error) {
        console.error("Error updating food with admin:", error);
        res.status(500).json({
            success: false,
            message: "Error updating food item",
            error: error.message
        });
    }
};

// Remove food item with admin verification
const removeFoodWithAdmin = async (req, res) => {
    try {
        const { id, firebaseUID } = req.body;

        if (!firebaseUID) {
            return res.status(400).json({
                success: false,
                message: "Firebase UID is required"
            });
        }

        // Find the food item and verify ownership
        const food = await foodModel.findOne({ 
            _id: id, 
            firebaseUID: firebaseUID 
        });
        
        if (!food) {
            return res.status(404).json({
                success: false,
                message: "Food item not found or you don't have permission to delete it"
            });
        }

        // Delete image file
        if (food.image) {
            try {
                fs.unlinkSync(`uploads/${food.image}`);
            } catch (err) {
                console.log("Could not delete image:", err.message);
            }
        }

        // Delete the food item
        await foodModel.findByIdAndDelete(id);

        res.json({
            success: true,
            message: "Food item removed successfully"
        });

    } catch (error) {
        console.error("Error removing food with admin:", error);
        res.status(500).json({
            success: false,
            message: "Error removing food item",
            error: error.message
        });
    }
};

// Update order status with admin verification
const updateOrderStatus = async (req, res) => {
    try {
        const { orderId, status, firebaseUID } = req.body;

        if (!firebaseUID) {
            return res.status(400).json({
                success: false,
                message: "Firebase UID is required"
            });
        }

        // Find admin by Firebase UID
        const admin = await adminModel.findOne({ firebaseUID });
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin not found"
            });
        }

        // Update order status
        const updatedOrder = await orderModel.findByIdAndUpdate(
            orderId,
            { 
                status,
                adminId: admin._id,
                firebaseUID: firebaseUID
            },
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        res.json({
            success: true,
            message: "Order status updated successfully",
            data: updatedOrder
        });

    } catch (error) {
        console.error("Error updating order status:", error);
        res.status(500).json({
            success: false,
            message: "Error updating order status",
            error: error.message
        });
    }
};

export { 
    addFoodWithAdmin, 
    updateFoodWithAdmin, 
    removeFoodWithAdmin, 
    updateOrderStatus 
};
