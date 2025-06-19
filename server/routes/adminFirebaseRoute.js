import express from "express";
import adminModel from "../models/adminModel.js";
import foodModel from "../models/foodModel.js";
import orderModel from "../models/orderModel.js";
import multer from "multer";
import {
    addFoodWithAdmin,
    updateFoodWithAdmin,
    removeFoodWithAdmin,
    updateOrderStatus
} from "../controllers/adminFirebaseController.js";

const adminFirebaseRouter = express.Router();

// Image Storage Engine for food items
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads");
    },
    filename: (req, file, cb) => {
        const filename = `${Date.now()}${file.originalname}`;
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

// Register admin with Firebase UID
adminFirebaseRouter.post("/register", async (req, res) => {
    const { firebaseUID, name, email } = req.body;

    try {
        // Check if admin already exists
        const existingAdmin = await adminModel.findOne({ firebaseUID });

        if (existingAdmin) {
            return res.status(200).json({ 
                success: true,
                message: "Admin already registered",
                admin: existingAdmin
            });
        }

        // Create new admin
        const newAdmin = new adminModel({
            firebaseUID,
            name,
            email,
            lastLogin: new Date()
        });

        await newAdmin.save();

        res.status(201).json({
            success: true,
            message: "Admin registered successfully",
            admin: newAdmin
        });
    } catch (error) {
        console.error("Admin registration error:", error);
        res.status(500).json({
            success: false,
            message: "Registration failed",
            error: error.message
        });
    }
});

// Get admin data by Firebase UID
adminFirebaseRouter.get("/data/:uid", async (req, res) => {
    const { uid } = req.params;

    try {
        // Find admin by Firebase UID
        const admin = await adminModel.findOne({ firebaseUID: uid });

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin not found"
            });
        }

        // Update last login
        admin.lastLogin = new Date();
        await admin.save();

        // Fetch admin's data
        const foodItems = await foodModel.find({ firebaseUID: uid }).sort({ createdAt: -1 });
        const orders = await orderModel.find({ firebaseUID: uid }).sort({ createdAt: -1 });

        // Calculate statistics
        const totalFoodItems = foodItems.length;
        const totalOrders = orders.length;
        const totalRevenue = orders.reduce((sum, order) => sum + (order.amount || 0), 0);
        const pendingOrders = orders.filter(order => order.status === "Food processing").length;

        res.json({
            success: true,
            admin,
            foodItems,
            orders,
            statistics: {
                totalFoodItems,
                totalOrders,
                totalRevenue,
                pendingOrders
            }
        });
    } catch (error) {
        console.error("Error fetching admin data:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch admin data",
            error: error.message
        });
    }
});

// Get paginated food items for admin
adminFirebaseRouter.get("/food-items/:uid", async (req, res) => {
    const { uid } = req.params;
    const { page = 1, limit = 10 } = req.query;

    try {
        const skip = (page - 1) * limit;
        const foodItems = await foodModel
            .find({ firebaseUID: uid })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await foodModel.countDocuments({ firebaseUID: uid });

        res.json({
            success: true,
            foodItems,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                hasNext: page * limit < total,
                hasPrev: page > 1
            }
        });
    } catch (error) {
        console.error("Error fetching food items:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch food items",
            error: error.message
        });
    }
});

// Get paginated orders for admin
adminFirebaseRouter.get("/orders/:uid", async (req, res) => {
    const { uid } = req.params;
    const { page = 1, limit = 10 } = req.query;

    try {
        const skip = (page - 1) * limit;
        const orders = await orderModel
            .find({ firebaseUID: uid })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await orderModel.countDocuments({ firebaseUID: uid });

        res.json({
            success: true,
            orders,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                hasNext: page * limit < total,
                hasPrev: page > 1
            }
        });
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch orders",
            error: error.message
        });
    }
});

// CRUD Operations for Food Items
adminFirebaseRouter.post("/food/add", upload.single("image"), addFoodWithAdmin);
adminFirebaseRouter.post("/food/update", upload.single("image"), updateFoodWithAdmin);
adminFirebaseRouter.post("/food/remove", removeFoodWithAdmin);

// Order Management
adminFirebaseRouter.post("/order/update-status", updateOrderStatus);

export default adminFirebaseRouter;
