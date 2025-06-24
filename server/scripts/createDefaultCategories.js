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

// Default categories with placeholder images
const defaultCategories = [
    {
        name: "Rolls",
        description: "Delicious rolls with various fillings",
        image: "https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/categories/rolls.jpg",
        order: 1,
        isActive: true
    },
    {
        name: "Salad",
        description: "Fresh and healthy salads",
        image: "https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/categories/salad.jpg",
        order: 2,
        isActive: true
    },
    {
        name: "Deserts",
        description: "Sweet treats and desserts",
        image: "https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/categories/desserts.jpg",
        order: 3,
        isActive: true
    },
    {
        name: "Sandwich",
        description: "Tasty sandwiches for every taste",
        image: "https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/categories/sandwich.jpg",
        order: 4,
        isActive: true
    },
    {
        name: "Cake",
        description: "Delicious cakes for special occasions",
        image: "https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/categories/cake.jpg",
        order: 5,
        isActive: true
    },
    {
        name: "Veg",
        description: "Pure vegetarian dishes",
        image: "https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/categories/veg.jpg",
        order: 6,
        isActive: true
    },
    {
        name: "Pizza",
        description: "Hot and cheesy pizzas",
        image: "https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/categories/pizza.jpg",
        order: 7,
        isActive: true
    },
    {
        name: "Pasta",
        description: "Italian pasta dishes",
        image: "https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/categories/pasta.jpg",
        order: 8,
        isActive: true
    },
    {
        name: "Noodles",
        description: "Asian noodle dishes",
        image: "https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/categories/noodles.jpg",
        order: 9,
        isActive: true
    },
    {
        name: "Main Course",
        description: "Hearty main course dishes",
        image: "https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/categories/main-course.jpg",
        order: 10,
        isActive: true
    },
    {
        name: "Appetizer",
        description: "Starters and appetizers",
        image: "https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/categories/appetizer.jpg",
        order: 11,
        isActive: true
    },
    {
        name: "Sushi",
        description: "Fresh sushi and Japanese cuisine",
        image: "https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/categories/sushi.jpg",
        order: 12,
        isActive: true
    }
];

const createDefaultCategories = async () => {
    try {
        console.log("🔄 Creating default categories...");

        // Check if categories already exist
        const existingCategories = await categoryModel.find({});
        if (existingCategories.length > 0) {
            console.log(`ℹ️  Found ${existingCategories.length} existing categories. Skipping creation.`);
            return;
        }

        // Create categories
        const createdCategories = await categoryModel.insertMany(defaultCategories);
        console.log(`✅ Successfully created ${createdCategories.length} default categories:`);
        
        createdCategories.forEach(category => {
            console.log(`   - ${category.name} (Order: ${category.order})`);
        });

    } catch (error) {
        console.error("❌ Error creating default categories:", error);
        throw error;
    }
};

const main = async () => {
    try {
        await connectDB();
        await createDefaultCategories();
        console.log("🎉 Default categories setup completed successfully!");
    } catch (error) {
        console.error("❌ Setup failed:", error);
    } finally {
        await mongoose.connection.close();
        console.log("🔌 Database connection closed");
        process.exit(0);
    }
};

// Run the script
main();
