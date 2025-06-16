import express from "express"
import { addFood,listFood,removeFood, clearAllFood, updateFood } from "../controllers/foodController.js"
import multer from "multer"

const foodRouter = express.Router();

//Image Storage Engine

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log("Multer destination called");
        cb(null, "uploads");
    },
    filename: (req, file, cb) => {
        console.log("Multer filename called for:", file.originalname);
        const filename = `${Date.now()}${file.originalname}`;
        console.log("Generated filename:", filename);
        cb(null, filename);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        console.log("Multer fileFilter called for:", file.mimetype);
        // Accept images only
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
// Middleware to log all food route requests
foodRouter.use((req, res, next) => {
    console.log(`Food route: ${req.method} ${req.path}`);
    console.log("Headers:", req.headers);
    next();
});

// Food Routes
foodRouter.post("/add", upload.single("image"), addFood);
foodRouter.get("/list", listFood);
foodRouter.post("/remove", removeFood);
foodRouter.post("/clear-all", clearAllFood);
foodRouter.post("/update", upload.single("image"), updateFood);

// Test endpoint for update route
foodRouter.get("/test-update", (req, res) => {
    res.json({
        success: true,
        message: "Update route is accessible",
        timestamp: new Date().toISOString()
    });
});
//





export default foodRouter;