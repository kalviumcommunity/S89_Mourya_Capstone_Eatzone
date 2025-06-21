import express from "express";
import { addCategory, listCategories, removeCategory, updateCategory } from "../controllers/categoryController.js";
import multer from "multer";

const categoryRouter = express.Router();

// Image Storage Engine
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log("Multer destination called for category");
        cb(null, "uploads");
    },
    filename: (req, file, cb) => {
        console.log("Multer filename called for category:", file.originalname);
        const filename = `category_${Date.now()}${file.originalname}`;
        console.log("Generated filename:", filename);
        cb(null, filename);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        console.log("File filter called:", file.mimetype);
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// Category Routes
categoryRouter.post("/add", upload.single("image"), addCategory);
categoryRouter.get("/list", listCategories);
categoryRouter.post("/remove", removeCategory);
categoryRouter.post("/update", upload.single("image"), updateCategory);

// Test endpoint
categoryRouter.get("/test", (req, res) => {
    res.json({
        success: true,
        message: "Category route is accessible",
        timestamp: new Date().toISOString()
    });
});

export default categoryRouter;
