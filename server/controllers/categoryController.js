import categoryModel from "../models/categoryModel.js";
import fs from 'fs';

// Add new category
const addCategory = async (req, res) => {
    try {
        console.log("=== ADD CATEGORY REQUEST ===");
        console.log("Request body:", req.body);
        console.log("Request file:", req.file);

        const { name, description, order } = req.body;

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
                message: "Category image is required"
            });
        }

        // Check if category name already exists
        const existingCategory = await categoryModel.findOne({ 
            name: { $regex: new RegExp(`^${name}$`, 'i') } 
        });

        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: "Category with this name already exists"
            });
        }

        // Prepare category data
        const categoryData = {
            name: name.trim(),
            description: description ? description.trim() : '',
            image: image_filename,
            order: order ? Number(order) : 0
        };

        // Add admin association if provided
        if (req.body.adminId) {
            categoryData.adminId = req.body.adminId;
        }
        if (req.body.firebaseUID) {
            categoryData.firebaseUID = req.body.firebaseUID;
        }

        const category = new categoryModel(categoryData);
        await category.save();

        console.log("✅ Category saved successfully:", category.name);
        res.json({
            success: true,
            message: "Category Added Successfully",
            data: category
        });

    } catch (error) {
        console.error("❌ Error adding category:", error);
        res.status(500).json({
            success: false,
            message: "Error adding category",
            error: error.message
        });
    }
};

// Get all categories
const listCategories = async (req, res) => {
    try {
        const categories = await categoryModel.find({ isActive: true }).sort({ order: 1, name: 1 });
        res.json({ success: true, data: categories });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error fetching categories" });
    }
};

// Get all categories (including inactive for admin)
const listAllCategories = async (req, res) => {
    try {
        const categories = await categoryModel.find({}).sort({ order: 1, name: 1 });
        res.json({ success: true, data: categories });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error fetching categories" });
    }
};

// Remove category
const removeCategory = async (req, res) => {
    try {
        const category = await categoryModel.findById(req.body.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        // Only try to delete local file if it's not a Cloudinary URL
        if (category.image && !category.image.startsWith('http')) {
            fs.unlink(`uploads/${category.image}`, () => {});
        }

        await categoryModel.findByIdAndDelete(req.body.id);
        res.json({ success: true, message: "Category Removed Successfully" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error removing category" });
    }
};

// Update category
const updateCategory = async (req, res) => {
    try {
        console.log("=== UPDATE CATEGORY REQUEST ===");
        console.log("Request body:", req.body);
        console.log("Request file:", req.file);

        const { id, name, description, order, isActive } = req.body;

        // Basic validation
        if (!id) {
            return res.status(400).json({ success: false, message: "Category ID is required" });
        }

        if (!name) {
            return res.status(400).json({ success: false, message: "Category name is required" });
        }

        // Find the existing category
        const existingCategory = await categoryModel.findById(id);
        if (!existingCategory) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        // Check if name already exists (excluding current category)
        const duplicateCategory = await categoryModel.findOne({ 
            name: { $regex: new RegExp(`^${name}$`, 'i') },
            _id: { $ne: id }
        });

        if (duplicateCategory) {
            return res.status(400).json({
                success: false,
                message: "Category with this name already exists"
            });
        }

        // Prepare update data
        const updateData = {
            name: name.trim(),
            description: description ? description.trim() : '',
            order: order ? Number(order) : 0,
            isActive: isActive !== undefined ? isActive === 'true' : true
        };

        // Handle image update if new image is provided
        if (req.file && req.file.filename) {
            // Delete old image file only if it's not a Cloudinary URL
            if (existingCategory.image && !existingCategory.image.startsWith('http')) {
                try {
                    fs.unlinkSync(`uploads/${existingCategory.image}`);
                } catch (err) {
                    console.log("⚠️ Could not delete old image:", err.message);
                }
            }
            updateData.image = req.file.filename;
        } else if (req.body.image && req.body.image !== existingCategory.image) {
            // Delete old local image file if it exists and new image is Cloudinary URL
            if (existingCategory.image && !existingCategory.image.startsWith('http')) {
                try {
                    fs.unlinkSync(`uploads/${existingCategory.image}`);
                } catch (err) {
                    console.log("⚠️ Could not delete old image:", err.message);
                }
            }
            updateData.image = req.body.image;
        }

        // Update the category
        const updatedCategory = await categoryModel.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        console.log("✅ Category updated successfully:", updatedCategory.name);
        res.json({
            success: true,
            message: "Category updated successfully",
            data: updatedCategory
        });

    } catch (error) {
        console.error("❌ Error updating category:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error: " + error.message
        });
    }
};

export { addCategory, listCategories, listAllCategories, removeCategory, updateCategory };
