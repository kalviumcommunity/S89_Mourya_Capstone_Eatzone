import express from "express";
import { addCategory, listCategories, listAllCategories, removeCategory, updateCategory } from "../controllers/categoryController.js";
import multer from "multer";

const categoryRouter = express.Router();

// Image Storage Engine
const storage = multer.diskStorage({
    destination: "uploads",
    filename: (req, file, cb) => {
        return cb(null, `${Date.now()}${file.originalname}`)
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

// Category Routes
categoryRouter.post("/add", upload.single("image"), addCategory);
categoryRouter.get("/list", listCategories); // Active categories only (for client)
categoryRouter.get("/list-all", listAllCategories); // All categories (for admin)
categoryRouter.post("/remove", removeCategory);
categoryRouter.post("/update", upload.single("image"), updateCategory);

export default categoryRouter;
