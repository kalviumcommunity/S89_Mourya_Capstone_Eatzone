import mongoose from 'mongoose';
import restaurantModel from '../models/restaurantModel.js';
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

const addFoodItemsToRestaurants = async () => {
    try {
        await connectDB();
        
        console.log("Adding food items to specific restaurants...");
        
        // Get all restaurants
        const restaurants = await restaurantModel.find();
        console.log(`Found ${restaurants.length} restaurants`);
        
        // Define food items for each restaurant type
        const restaurantFoodItems = {
            "Spice Garden": [
                {
                    name: "Butter Chicken",
                    description: "Creamy tomato-based curry with tender chicken pieces",
                    price: 320,
                    category: "Main Course",
                    image: "butter_chicken.jpg"
                },
                {
                    name: "Paneer Tikka",
                    description: "Grilled cottage cheese marinated in spices",
                    price: 280,
                    category: "Appetizer",
                    image: "paneer_tikka.jpg"
                },
                {
                    name: "Biryani",
                    description: "Aromatic basmati rice with spiced meat/vegetables",
                    price: 350,
                    category: "Main Course",
                    image: "biryani.jpg"
                },
                {
                    name: "Gulab Jamun",
                    description: "Sweet milk dumplings in sugar syrup",
                    price: 120,
                    category: "Dessert",
                    image: "gulab_jamun.jpg"
                }
            ],
            "Pizza Corner": [
                {
                    name: "Margherita Pizza",
                    description: "Classic pizza with tomato sauce, mozzarella, and basil",
                    price: 250,
                    category: "Pizza",
                    image: "margherita_pizza.jpg"
                },
                {
                    name: "Pepperoni Pizza",
                    description: "Spicy pepperoni with mozzarella cheese",
                    price: 320,
                    category: "Pizza",
                    image: "pepperoni_pizza.jpg"
                },
                {
                    name: "Garlic Bread",
                    description: "Crispy bread with garlic butter and herbs",
                    price: 150,
                    category: "Appetizer",
                    image: "garlic_bread.jpg"
                },
                {
                    name: "Tiramisu",
                    description: "Classic Italian coffee-flavored dessert",
                    price: 180,
                    category: "Dessert",
                    image: "tiramisu.jpg"
                }
            ],
            "Burger Hub": [
                {
                    name: "Classic Burger",
                    description: "Beef patty with lettuce, tomato, and special sauce",
                    price: 220,
                    category: "Burgers",
                    image: "classic_burger.jpg"
                },
                {
                    name: "Chicken Burger",
                    description: "Grilled chicken breast with fresh vegetables",
                    price: 200,
                    category: "Burgers",
                    image: "chicken_burger.jpg"
                },
                {
                    name: "French Fries",
                    description: "Crispy golden fries with seasoning",
                    price: 120,
                    category: "Sides",
                    image: "french_fries.jpg"
                },
                {
                    name: "Chocolate Shake",
                    description: "Rich chocolate milkshake with whipped cream",
                    price: 150,
                    category: "Beverages",
                    image: "chocolate_shake.jpg"
                }
            ],
            "Sushi Express": [
                {
                    name: "California Roll",
                    description: "Crab, avocado, and cucumber roll",
                    price: 280,
                    category: "Sushi",
                    image: "california_roll.jpg"
                },
                {
                    name: "Salmon Sashimi",
                    description: "Fresh salmon slices served with wasabi",
                    price: 350,
                    category: "Sashimi",
                    image: "salmon_sashimi.jpg"
                },
                {
                    name: "Miso Soup",
                    description: "Traditional Japanese soup with tofu and seaweed",
                    price: 120,
                    category: "Soup",
                    image: "miso_soup.jpg"
                },
                {
                    name: "Mochi Ice Cream",
                    description: "Sweet rice cake filled with ice cream",
                    price: 160,
                    category: "Dessert",
                    image: "mochi_ice_cream.jpg"
                }
            ],
            "Taco Fiesta": [
                {
                    name: "Chicken Tacos",
                    description: "Grilled chicken with salsa and vegetables",
                    price: 180,
                    category: "Tacos",
                    image: "chicken_tacos.jpg"
                },
                {
                    name: "Beef Burrito",
                    description: "Spiced beef with rice, beans, and cheese",
                    price: 220,
                    category: "Burritos",
                    image: "beef_burrito.jpg"
                },
                {
                    name: "Nachos",
                    description: "Crispy tortilla chips with cheese and jalapeños",
                    price: 150,
                    category: "Appetizer",
                    image: "nachos.jpg"
                },
                {
                    name: "Churros",
                    description: "Fried dough pastry with cinnamon sugar",
                    price: 130,
                    category: "Dessert",
                    image: "churros.jpg"
                }
            ]
        };
        
        let totalItemsAdded = 0;
        
        // Add food items to each restaurant
        for (const restaurant of restaurants) {
            const foodItems = restaurantFoodItems[restaurant.name];
            
            if (foodItems) {
                console.log(`\n📍 Adding food items to ${restaurant.name}...`);
                
                for (const item of foodItems) {
                    const foodItem = new foodModel({
                        ...item,
                        restaurantId: restaurant._id,
                        firebaseUID: restaurant.firebaseUID || "admin-uid"
                    });
                    
                    await foodItem.save();
                    console.log(`  ✅ Added: ${item.name} - ₹${item.price}`);
                    totalItemsAdded++;
                }
            } else {
                console.log(`⚠️ No predefined items for ${restaurant.name}`);
            }
        }
        
        console.log(`\n🎉 Successfully added ${totalItemsAdded} food items to restaurants!`);
        
        // Show summary
        console.log("\n📊 Summary:");
        for (const restaurant of restaurants) {
            const itemCount = await foodModel.countDocuments({ restaurantId: restaurant._id });
            console.log(`${restaurant.name}: ${itemCount} items`);
        }
        
        process.exit(0);
    } catch (error) {
        console.error("❌ Error adding food items:", error);
        process.exit(1);
    }
};

// Run the script
addFoodItemsToRestaurants();
