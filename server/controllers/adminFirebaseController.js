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

        const foodData = {
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            category: req.body.category,
            image: image_filename,
            adminId: admin._id,
            firebaseUID: firebaseUID
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

        const food = new foodModel(foodData);

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

        // Handle discount fields if provided
        if (req.body.discountPercentage !== undefined) {
            const discountPercentage = Number(req.body.discountPercentage);
            if (discountPercentage > 0) {
                updateData.originalPrice = Number(price);
                updateData.discountPercentage = discountPercentage;
                updateData.isOnSale = true;
                // Calculate discounted price
                const discountAmount = (Number(price) * discountPercentage) / 100;
                updateData.price = Number(price) - discountAmount;
                updateData.discountAmount = discountAmount;
            } else {
                // Remove discount
                updateData.originalPrice = undefined;
                updateData.discountPercentage = 0;
                updateData.discountAmount = 0;
                updateData.isOnSale = false;
                updateData.price = Number(price);
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
