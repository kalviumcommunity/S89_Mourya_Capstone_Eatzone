import mongoose from 'mongoose';
import foodModel from '../models/foodModel.js';

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect('mongodb+srv://kadalimouryas89:18011801@cluster0.cbk0vyf.mongodb.net/eatzone');
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

// Sample discounted food items
const sampleDiscountedFoods = [
    {
        name: "Margherita Pizza",
        description: "Fresh tomatoes, mozzarella cheese, and basil on a crispy crust",
        originalPrice: 299,
        discountPercentage: 25,
        price: 224, // 25% off
        discountAmount: 75,
        category: "Pizza",
        image: "pizza_margherita.jpg",
        isOnSale: true,
        discountLabel: "MEGA SALE",
        isPopular: true,
        isFeatured: false,
        tags: ["Bestseller", "Vegetarian"]
    },
    {
        name: "Chicken Biryani",
        description: "Aromatic basmati rice with tender chicken pieces and exotic spices",
        originalPrice: 399,
        discountPercentage: 30,
        price: 279, // 30% off
        discountAmount: 120,
        category: "Main Course",
        image: "chicken_biryani.jpg",
        isOnSale: true,
        discountLabel: "LIMITED TIME",
        isPopular: true,
        isFeatured: true,
        tags: ["Spicy", "Non-Veg", "Popular"]
    },
    {
        name: "Chocolate Brownie",
        description: "Rich, fudgy chocolate brownie with vanilla ice cream",
        originalPrice: 149,
        discountPercentage: 20,
        price: 119, // 20% off
        discountAmount: 30,
        category: "Dessert",
        image: "chocolate_brownie.jpg",
        isOnSale: true,
        discountLabel: "SWEET DEAL",
        isPopular: false,
        isFeatured: true,
        tags: ["Sweet", "Dessert"]
    },
    {
        name: "Paneer Butter Masala",
        description: "Creamy tomato-based curry with soft paneer cubes",
        originalPrice: 249,
        discountPercentage: 15,
        price: 212, // 15% off
        discountAmount: 37,
        category: "Main Course",
        image: "paneer_butter_masala.jpg",
        isOnSale: true,
        discountLabel: "CHEF'S SPECIAL",
        isPopular: true,
        isFeatured: false,
        tags: ["Vegetarian", "Creamy", "Popular"]
    },
    {
        name: "Caesar Salad",
        description: "Fresh romaine lettuce with parmesan cheese and croutons",
        originalPrice: 199,
        discountPercentage: 10,
        price: 179, // 10% off
        discountAmount: 20,
        category: "Salad",
        image: "caesar_salad.jpg",
        isOnSale: true,
        discountLabel: "HEALTHY CHOICE",
        isPopular: false,
        isFeatured: false,
        tags: ["Healthy", "Fresh", "Light"]
    },
    {
        name: "Chicken Tikka Roll",
        description: "Grilled chicken tikka wrapped in soft naan with mint chutney",
        originalPrice: 179,
        discountPercentage: 35,
        price: 116, // 35% off
        discountAmount: 63,
        category: "Rolls",
        image: "chicken_tikka_roll.jpg",
        isOnSale: true,
        discountLabel: "FLASH SALE",
        isPopular: true,
        isFeatured: true,
        tags: ["Spicy", "Non-Veg", "Street Food"]
    },
    {
        name: "Masala Dosa",
        description: "Crispy rice crepe filled with spiced potato curry, served with sambar and chutney",
        originalPrice: 129,
        discountPercentage: 20,
        price: 103, // 20% off
        discountAmount: 26,
        category: "Main Course",
        image: "masala_dosa.jpg",
        isOnSale: true,
        discountLabel: "SOUTH SPECIAL",
        isPopular: true,
        isFeatured: false,
        tags: ["South Indian", "Vegetarian", "Crispy"]
    },
    {
        name: "Chicken Sandwich",
        description: "Grilled chicken breast with lettuce, tomato, and mayo in toasted bread",
        originalPrice: 159,
        discountPercentage: 25,
        price: 119, // 25% off
        discountAmount: 40,
        category: "Sandwich",
        image: "chicken_sandwich.jpg",
        isOnSale: true,
        discountLabel: "QUICK BITE",
        isPopular: false,
        isFeatured: false,
        tags: ["Quick", "Non-Veg", "Toasted"]
    }
];

// Add sample foods to database
const addSampleFoods = async () => {
    try {
        console.log('🍽️ Adding sample discounted food items...');
        
        for (const foodData of sampleDiscountedFoods) {
            const existingFood = await foodModel.findOne({ name: foodData.name });
            if (!existingFood) {
                const food = new foodModel(foodData);
                await food.save();
                console.log(`✅ Added: ${foodData.name} (${foodData.discountPercentage}% off)`);
            } else {
                console.log(`⚠️ Skipped: ${foodData.name} (already exists)`);
            }
        }
        
        console.log('🎉 Sample discounted food items added successfully!');
    } catch (error) {
        console.error('❌ Error adding sample foods:', error);
    }
};

// Main function
const main = async () => {
    await connectDB();
    await addSampleFoods();
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
};

// Run the script
main().catch(error => {
    console.error('❌ Script error:', error);
    process.exit(1);
});
