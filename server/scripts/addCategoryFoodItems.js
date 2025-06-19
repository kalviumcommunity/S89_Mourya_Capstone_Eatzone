import mongoose from 'mongoose';
import foodModel from '../models/foodModel.js';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("DB Connected");
    } catch (error) {
        console.error("DB Connection Error:", error);
        process.exit(1);
    }
};

const addCategoryFoodItems = async () => {
    try {
        await connectDB();
        
        console.log("Adding food items for new categories...");
        
        // Define food items for new categories
        const newCategoryFoodItems = [
            // Main Course
            {
                name: "Grilled Chicken Breast",
                description: "Tender grilled chicken breast with herbs and spices",
                price: 350,
                category: "Main Course",
                image: "grilled_chicken.jpg"
            },
            {
                name: "Beef Steak",
                description: "Juicy beef steak cooked to perfection",
                price: 450,
                category: "Main Course",
                image: "beef_steak.jpg"
            },
            {
                name: "Fish Curry",
                description: "Spicy fish curry with coconut milk",
                price: 320,
                category: "Main Course",
                image: "fish_curry.jpg"
            },
            
            // Appetizer
            {
                name: "Chicken Wings",
                description: "Crispy chicken wings with buffalo sauce",
                price: 220,
                category: "Appetizer",
                image: "chicken_wings.jpg"
            },
            {
                name: "Mozzarella Sticks",
                description: "Fried mozzarella sticks with marinara sauce",
                price: 180,
                category: "Appetizer",
                image: "mozzarella_sticks.jpg"
            },
            {
                name: "Spring Rolls",
                description: "Crispy vegetable spring rolls",
                price: 150,
                category: "Appetizer",
                image: "spring_rolls.jpg"
            },
            
            // Pizza
            {
                name: "Margherita Pizza",
                description: "Classic pizza with tomato, mozzarella, and basil",
                price: 280,
                category: "Pizza",
                image: "margherita_pizza.jpg"
            },
            {
                name: "Pepperoni Pizza",
                description: "Pizza topped with spicy pepperoni",
                price: 350,
                category: "Pizza",
                image: "pepperoni_pizza.jpg"
            },
            {
                name: "Veggie Supreme Pizza",
                description: "Pizza loaded with fresh vegetables",
                price: 320,
                category: "Pizza",
                image: "veggie_pizza.jpg"
            },
            
            // Sushi
            {
                name: "California Roll",
                description: "Crab, avocado, and cucumber sushi roll",
                price: 300,
                category: "Sushi",
                image: "california_roll.jpg"
            },
            {
                name: "Salmon Roll",
                description: "Fresh salmon sushi roll",
                price: 350,
                category: "Sushi",
                image: "salmon_roll.jpg"
            },
            {
                name: "Tuna Roll",
                description: "Fresh tuna sushi roll",
                price: 380,
                category: "Sushi",
                image: "tuna_roll.jpg"
            },
            
            // Sashimi
            {
                name: "Salmon Sashimi",
                description: "Fresh salmon slices",
                price: 400,
                category: "Sashimi",
                image: "salmon_sashimi.jpg"
            },
            {
                name: "Tuna Sashimi",
                description: "Fresh tuna slices",
                price: 450,
                category: "Sashimi",
                image: "tuna_sashimi.jpg"
            },
            
            // Soup
            {
                name: "Tomato Soup",
                description: "Creamy tomato soup with herbs",
                price: 120,
                category: "Soup",
                image: "tomato_soup.jpg"
            },
            {
                name: "Chicken Soup",
                description: "Hearty chicken soup with vegetables",
                price: 150,
                category: "Soup",
                image: "chicken_soup.jpg"
            },
            {
                name: "Miso Soup",
                description: "Traditional Japanese miso soup",
                price: 100,
                category: "Soup",
                image: "miso_soup.jpg"
            },
            
            // Tacos
            {
                name: "Chicken Tacos",
                description: "Grilled chicken tacos with salsa",
                price: 200,
                category: "Tacos",
                image: "chicken_tacos.jpg"
            },
            {
                name: "Beef Tacos",
                description: "Spiced beef tacos with cheese",
                price: 220,
                category: "Tacos",
                image: "beef_tacos.jpg"
            },
            {
                name: "Fish Tacos",
                description: "Grilled fish tacos with lime",
                price: 240,
                category: "Tacos",
                image: "fish_tacos.jpg"
            },
            
            // Burritos
            {
                name: "Chicken Burrito",
                description: "Grilled chicken burrito with rice and beans",
                price: 250,
                category: "Burritos",
                image: "chicken_burrito.jpg"
            },
            {
                name: "Beef Burrito",
                description: "Spiced beef burrito with cheese",
                price: 280,
                category: "Burritos",
                image: "beef_burrito.jpg"
            },
            {
                name: "Veggie Burrito",
                description: "Vegetarian burrito with black beans",
                price: 220,
                category: "Burritos",
                image: "veggie_burrito.jpg"
            },
            
            // Dessert (different from Deserts)
            {
                name: "Chocolate Brownie",
                description: "Rich chocolate brownie with nuts",
                price: 150,
                category: "Dessert",
                image: "chocolate_brownie.jpg"
            },
            {
                name: "Cheesecake",
                description: "Creamy New York style cheesecake",
                price: 180,
                category: "Dessert",
                image: "cheesecake.jpg"
            },
            {
                name: "Apple Pie",
                description: "Classic apple pie with cinnamon",
                price: 160,
                category: "Dessert",
                image: "apple_pie.jpg"
            }
        ];
        
        let totalItemsAdded = 0;
        
        // Add food items
        for (const item of newCategoryFoodItems) {
            const foodItem = new foodModel({
                ...item,
                firebaseUID: "admin-uid" // Default admin UID
            });
            
            await foodItem.save();
            console.log(`✅ Added: ${item.name} (${item.category}) - ₹${item.price}`);
            totalItemsAdded++;
        }
        
        console.log(`\n🎉 Successfully added ${totalItemsAdded} food items for new categories!`);
        
        // Show summary by category
        console.log("\n📊 Summary by Category:");
        const categories = [...new Set(newCategoryFoodItems.map(item => item.category))];
        for (const category of categories) {
            const itemCount = await foodModel.countDocuments({ category });
            console.log(`${category}: ${itemCount} items`);
        }
        
        process.exit(0);
    } catch (error) {
        console.error("❌ Error adding food items:", error);
        process.exit(1);
    }
};

// Run the script
addCategoryFoodItems();
