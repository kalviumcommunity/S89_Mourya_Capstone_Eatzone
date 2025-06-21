import categoryModel from "../models/categoryModel.js";
import fs from 'fs';

// Add category
const addCategory = async (req, res) => {
    try {
        console.log("=== ADD CATEGORY REQUEST ===");
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
                message: "Category image is required"
            });
        }

        // Check if category with same name already exists
        const existingCategory = await categoryModel.findOne({ 
            name: { $regex: new RegExp(`^${req.body.name}$`, 'i') } 
        });

        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: "Category with this name already exists"
            });
        }

        // Prepare category data
        const categoryData = {
            name: req.body.name,
            emoji: req.body.emoji,
            image: image_filename,
            description: req.body.description || "",
            sortOrder: req.body.sortOrder || 0
        };

        console.log("Category data to save:", categoryData);

        const category = new categoryModel(categoryData);
        await category.save();

        console.log("Category saved successfully:", category);

        res.json({
            success: true,
            message: "Category Added",
            data: category
        });

    } catch (error) {
        console.error("Error adding category:", error);
        res.status(500).json({
            success: false,
            message: "Error adding category",
            error: error.message
        });
    }
};

// List all categories
const listCategories = async (req, res) => {
    try {
        const categories = await categoryModel.find({ isActive: true }).sort({ sortOrder: 1, name: 1 });
        res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching categories",
            error: error.message
        });
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

        // Check if the image is a local file (not Cloudinary URL)
        if (category.image && !category.image.startsWith('http')) {
            try {
                fs.unlinkSync(`uploads/${category.image}`);
            } catch (err) {
                console.log("Error deleting image file:", err.message);
            }
        }

        await categoryModel.findByIdAndDelete(req.body.id);
        
        res.json({
            success: true,
            message: "Category Removed"
        });

    } catch (error) {
        console.error("Error removing category:", error);
        res.status(500).json({
            success: false,
            message: "Error removing category",
            error: error.message
        });
    }
};

// Update category
const updateCategory = async (req, res) => {
    try {
        console.log("=== UPDATE CATEGORY REQUEST ===");
        console.log("Request body:", req.body);
        console.log("Request file:", req.file);

        const categoryId = req.body.id;
        
        if (!categoryId) {
            return res.status(400).json({
                success: false,
                message: "Category ID is required"
            });
        }

        const existingCategory = await categoryModel.findById(categoryId);
        
        if (!existingCategory) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        // Check if another category with same name exists (excluding current category)
        if (req.body.name && req.body.name !== existingCategory.name) {
            const duplicateCategory = await categoryModel.findOne({ 
                name: { $regex: new RegExp(`^${req.body.name}$`, 'i') },
                _id: { $ne: categoryId }
            });

            if (duplicateCategory) {
                return res.status(400).json({
                    success: false,
                    message: "Category with this name already exists"
                });
            }
        }

        // Prepare update data
        const updateData = {
            name: req.body.name || existingCategory.name,
            emoji: req.body.emoji || existingCategory.emoji,
            description: req.body.description !== undefined ? req.body.description : existingCategory.description,
            sortOrder: req.body.sortOrder !== undefined ? req.body.sortOrder : existingCategory.sortOrder
        };

        // Handle image update
        if (req.file) {
            // New file uploaded
            updateData.image = req.file.filename;
            
            // Delete old image if it's a local file
            if (existingCategory.image && !existingCategory.image.startsWith('http')) {
                try {
                    fs.unlinkSync(`uploads/${existingCategory.image}`);
                } catch (err) {
                    console.log("Error deleting old image file:", err.message);
                }
            }
        } else if (req.body.image) {
            // Cloudinary URL provided
            updateData.image = req.body.image;
            
            // Delete old image if it's a local file
            if (existingCategory.image && !existingCategory.image.startsWith('http')) {
                try {
                    fs.unlinkSync(`uploads/${existingCategory.image}`);
                } catch (err) {
                    console.log("Error deleting old image file:", err.message);
                }
            }
        } else {
            // Keep existing image
            updateData.image = existingCategory.image;
        }

        console.log("Update data:", updateData);

        const updatedCategory = await categoryModel.findByIdAndUpdate(
            categoryId,
            updateData,
            { new: true, runValidators: true }
        );

        console.log("Category updated successfully:", updatedCategory);

        res.json({
            success: true,
            message: "Category Updated",
            data: updatedCategory
        });

    } catch (error) {
        console.error("Error updating category:", error);
        res.status(500).json({
            success: false,
            message: "Error updating category",
            error: error.message
        });
    }
};

export { addCategory, listCategories, removeCategory, updateCategory };
