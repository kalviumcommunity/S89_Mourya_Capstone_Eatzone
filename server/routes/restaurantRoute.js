import express from "express";
import restaurantModel from "../models/restaurantModel.js";
import foodModel from "../models/foodModel.js";
import multer from "multer";

const restaurantRouter = express.Router();

// Image Storage Engine for restaurant images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads");
    },
    filename: (req, file, cb) => {
        const filename = `restaurant_${Date.now()}${file.originalname}`;
        cb(null, filename);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Get all active restaurants
restaurantRouter.get("/list", async (req, res) => {
    try {
        const restaurants = await restaurantModel.find({ isActive: true }).sort({ createdAt: -1 });
        res.json({
            success: true,
            data: restaurants
        });
    } catch (error) {
        console.error("Error fetching restaurants:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching restaurants",
            error: error.message
        });
    }
});

// Get restaurant by ID
restaurantRouter.get("/:id", async (req, res) => {
    try {
        const restaurant = await restaurantModel.findById(req.params.id);
        
        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: "Restaurant not found"
            });
        }

        res.json({
            success: true,
            data: restaurant
        });
    } catch (error) {
        console.error("Error fetching restaurant:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching restaurant",
            error: error.message
        });
    }
});

// Get food items by restaurant ID
restaurantRouter.get("/:id/food-items", async (req, res) => {
    try {
        const { id } = req.params;
        const { category } = req.query;

        // Build query
        let query = { restaurantId: id };
        if (category && category !== "All") {
            query.category = category;
        }

        const foodItems = await foodModel.find(query).sort({ createdAt: -1 });
        
        res.json({
            success: true,
            data: foodItems
        });
    } catch (error) {
        console.error("Error fetching restaurant food items:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching food items",
            error: error.message
        });
    }
});

// Get food categories for a restaurant
restaurantRouter.get("/:id/categories", async (req, res) => {
    try {
        const { id } = req.params;
        
        const categories = await foodModel.distinct("category", { restaurantId: id });
        
        res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error("Error fetching restaurant categories:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching categories",
            error: error.message
        });
    }
});

// Add restaurant (admin only)
restaurantRouter.post("/add", upload.single("image"), async (req, res) => {
    try {
        const {
            name,
            description,
            address,
            phone,
            email,
            deliveryTime,
            deliveryFee,
            minimumOrder,
            cuisineTypes,
            firebaseUID
        } = req.body;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Restaurant image is required"
            });
        }

        const restaurant = new restaurantModel({
            name,
            description,
            address,
            phone,
            email,
            deliveryTime: deliveryTime || "30-45 mins",
            deliveryFee: deliveryFee || 0,
            minimumOrder: minimumOrder || 0,
            cuisineTypes: cuisineTypes ? JSON.parse(cuisineTypes) : [],
            image: req.file.filename,
            firebaseUID
        });

        await restaurant.save();

        res.json({
            success: true,
            message: "Restaurant added successfully",
            data: restaurant
        });
    } catch (error) {
        console.error("Error adding restaurant:", error);
        res.status(500).json({
            success: false,
            message: "Error adding restaurant",
            error: error.message
        });
    }
});

// Update restaurant (admin only)
restaurantRouter.post("/update", upload.single("image"), async (req, res) => {
    try {
        const {
            id,
            name,
            description,
            address,
            phone,
            email,
            deliveryTime,
            deliveryFee,
            minimumOrder,
            cuisineTypes,
            firebaseUID
        } = req.body;

        const updateData = {
            name,
            description,
            address,
            phone,
            email,
            deliveryTime,
            deliveryFee: Number(deliveryFee),
            minimumOrder: Number(minimumOrder),
            cuisineTypes: cuisineTypes ? JSON.parse(cuisineTypes) : []
        };

        if (req.file) {
            updateData.image = req.file.filename;
        }

        const updatedRestaurant = await restaurantModel.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedRestaurant) {
            return res.status(404).json({
                success: false,
                message: "Restaurant not found"
            });
        }

        res.json({
            success: true,
            message: "Restaurant updated successfully",
            data: updatedRestaurant
        });
    } catch (error) {
        console.error("Error updating restaurant:", error);
        res.status(500).json({
            success: false,
            message: "Error updating restaurant",
            error: error.message
        });
    }
});

// Delete restaurant (admin only)
restaurantRouter.post("/remove", async (req, res) => {
    try {
        const { id, firebaseUID } = req.body;

        // First, check if restaurant exists
        const restaurant = await restaurantModel.findById(id);

        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: "Restaurant not found"
            });
        }

        // For admin panel, allow deletion if:
        // 1. firebaseUID matches, OR
        // 2. restaurant has no firebaseUID (legacy data), OR
        // 3. firebaseUID is "admin-uid" (admin access)
        const canDelete = !restaurant.firebaseUID ||
                         restaurant.firebaseUID === firebaseUID ||
                         firebaseUID === "admin-uid";

        if (!canDelete) {
            return res.status(403).json({
                success: false,
                message: "You don't have permission to delete this restaurant"
            });
        }

        // Delete the restaurant
        await restaurantModel.findByIdAndDelete(id);

        res.json({
            success: true,
            message: "Restaurant removed successfully"
        });
    } catch (error) {
        console.error("Error removing restaurant:", error);
        res.status(500).json({
            success: false,
            message: "Error removing restaurant",
            error: error.message
        });
    }
});

export default restaurantRouter;
