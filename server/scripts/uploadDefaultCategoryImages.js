import mongoose from "mongoose";
import categoryModel from "../models/categoryModel.js";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ Database Connected Successfully");
    } catch (error) {
        console.error("❌ Database connection failed:", error);
        process.exit(1);
    }
};

// Default category images from Cloudinary
const categoryImages = {
    'Rolls': 'https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/categories/rolls.jpg',
    'Salad': 'https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/categories/salad.jpg',
    'Deserts': 'https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/categories/desserts.jpg',
    'Sandwich': 'https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/categories/sandwich.jpg',
    'Cake': 'https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/categories/cake.jpg',
    'Veg': 'https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/categories/veg.jpg',
    'Pizza': 'https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/categories/pizza.jpg',
    'Pasta': 'https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/categories/pasta.jpg',
    'Noodles': 'https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/categories/noodles.jpg',
    'Main Course': 'https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/categories/main-course.jpg',
    'Appetizer': 'https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/categories/appetizer.jpg',
    'Sushi': 'https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/categories/sushi.jpg'
};

const updateCategoryImages = async () => {
    try {
        console.log("🔄 Updating category images with Cloudinary URLs...");

        const categories = await categoryModel.find({});
        console.log(`Found ${categories.length} categories to update`);

        let updatedCount = 0;

        for (const category of categories) {
            const cloudinaryUrl = categoryImages[category.name];
            
            if (cloudinaryUrl && !category.image.startsWith('http')) {
                console.log(`📸 Updating ${category.name} image to Cloudinary URL`);
                
                await categoryModel.findByIdAndUpdate(
                    category._id,
                    { image: cloudinaryUrl },
                    { new: true }
                );
                
                updatedCount++;
            } else if (cloudinaryUrl && category.image.startsWith('http')) {
                console.log(`✅ ${category.name} already has Cloudinary URL`);
            } else {
                console.log(`⚠️  No Cloudinary URL found for ${category.name}`);
            }
        }

        console.log(`✅ Successfully updated ${updatedCount} category images`);

        // Display final status
        const updatedCategories = await categoryModel.find({});
        console.log("\n📋 Final category status:");
        updatedCategories.forEach(cat => {
            const status = cat.image.startsWith('http') ? '✅ Cloudinary' : '⚠️  Local';
            console.log(`   ${cat.name}: ${status} - ${cat.image}`);
        });

    } catch (error) {
        console.error("❌ Error updating category images:", error);
        throw error;
    }
};

const createMissingCategories = async () => {
    try {
        console.log("🔄 Creating missing categories with Cloudinary images...");

        const existingCategories = await categoryModel.find({});
        const existingNames = existingCategories.map(cat => cat.name);

        const missingCategories = [];
        let order = existingCategories.length;

        for (const [name, imageUrl] of Object.entries(categoryImages)) {
            if (!existingNames.includes(name)) {
                missingCategories.push({
                    name,
                    description: `Delicious ${name.toLowerCase()} dishes`,
                    image: imageUrl,
                    order: order++,
                    isActive: true
                });
            }
        }

        if (missingCategories.length > 0) {
            const created = await categoryModel.insertMany(missingCategories);
            console.log(`✅ Created ${created.length} missing categories:`);
            created.forEach(cat => console.log(`   - ${cat.name}`));
        } else {
            console.log("ℹ️  All categories already exist");
        }

    } catch (error) {
        console.error("❌ Error creating missing categories:", error);
        throw error;
    }
};

const main = async () => {
    try {
        await connectDB();
        
        console.log("🚀 Starting category image update process...\n");
        
        // First, create any missing categories
        await createMissingCategories();
        
        console.log("\n" + "=".repeat(50) + "\n");
        
        // Then, update existing categories with Cloudinary URLs
        await updateCategoryImages();
        
        console.log("\n🎉 Category image update completed successfully!");
        
    } catch (error) {
        console.error("❌ Process failed:", error);
    } finally {
        await mongoose.connection.close();
        console.log("🔌 Database connection closed");
        process.exit(0);
    }
};

// Run the script
main();
