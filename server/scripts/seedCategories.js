import mongoose from "mongoose";
import categoryModel from "../models/categoryModel.js";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Categories data with emojis as provided
const categoriesData = [
  {
    name: "Burgers",
    emoji: "🍔",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=400&fit=crop",
    description: "Delicious burgers with fresh ingredients",
    sortOrder: 1
  },
  {
    name: "Pizzas",
    emoji: "🍕",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=400&fit=crop",
    description: "Fresh pizzas with authentic flavors",
    sortOrder: 2
  },
  {
    name: "Biryani & Rice",
    emoji: "🍛",
    image: "https://images.unsplash.com/photo-1563379091339-03246963d96c?w=400&h=400&fit=crop",
    description: "Aromatic biryani and rice dishes",
    sortOrder: 3
  },
  {
    name: "Salads & Healthy",
    emoji: "🥗",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=400&fit=crop",
    description: "Fresh and healthy salad options",
    sortOrder: 4
  },
  {
    name: "Noodles & Pasta",
    emoji: "🍜",
    image: "https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?w=400&h=400&fit=crop",
    description: "Tasty noodles and pasta varieties",
    sortOrder: 5
  },
  {
    name: "Sandwiches & Wraps",
    emoji: "🥪",
    image: "https://images.unsplash.com/photo-1539252554453-80ab65ce3586?w=400&h=400&fit=crop",
    description: "Fresh sandwiches and wraps",
    sortOrder: 6
  },
  {
    name: "Desserts",
    emoji: "🍦",
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=400&fit=crop",
    description: "Sweet treats and desserts",
    sortOrder: 7
  },
  {
    name: "Beverages",
    emoji: "☕",
    image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=400&fit=crop",
    description: "Refreshing drinks and beverages",
    sortOrder: 8
  }
];

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
};

// Seed categories function
const seedCategories = async () => {
  try {
    console.log("Starting category seeding...");

    // Clear existing categories
    await categoryModel.deleteMany({});
    console.log("Cleared existing categories");

    // Insert new categories
    const insertedCategories = await categoryModel.insertMany(categoriesData);
    console.log(`Successfully inserted ${insertedCategories.length} categories:`);
    
    insertedCategories.forEach(category => {
      console.log(`- ${category.emoji} ${category.name}`);
    });

    console.log("\nCategory seeding completed successfully!");
    
  } catch (error) {
    console.error("Error seeding categories:", error);
  }
};

// Main execution
const main = async () => {
  try {
    await connectDB();
    await seedCategories();
    
    console.log("\nSeeding process completed. Closing database connection...");
    await mongoose.connection.close();
    console.log("Database connection closed.");
    process.exit(0);
    
  } catch (error) {
    console.error("Error in main execution:", error);
    process.exit(1);
  }
};

// Run the script
main();
