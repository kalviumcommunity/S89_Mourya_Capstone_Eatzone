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

const sampleRestaurants = [
    {
        name: "Spice Garden",
        description: "Authentic Indian cuisine with traditional flavors and modern presentation",
        image: "restaurant_spice_garden.jpg",
        address: "123 Main Street, Food District, City",
        phone: "+91 9876543210",
        email: "contact@spicegarden.com",
        rating: 4.5,
        deliveryTime: "30-45 mins",
        deliveryFee: 0,
        minimumOrder: 200,
        cuisineTypes: ["Indian", "North Indian", "Vegetarian"],
        isActive: true,
        firebaseUID: "admin-uid"
    },
    {
        name: "Pizza Corner",
        description: "Wood-fired pizzas with fresh ingredients and authentic Italian taste",
        image: "restaurant_pizza_corner.jpg",
        address: "456 Food Street, Downtown, City",
        phone: "+91 9876543211",
        email: "hello@pizzacorner.com",
        rating: 4.3,
        deliveryTime: "25-35 mins",
        deliveryFee: 30,
        minimumOrder: 300,
        cuisineTypes: ["Italian", "Pizza", "Continental"],
        isActive: true,
        firebaseUID: "admin-uid"
    },
    {
        name: "Burger Hub",
        description: "Gourmet burgers and fast food favorites made with premium ingredients",
        image: "restaurant_burger_hub.jpg",
        address: "789 Burger Lane, Food Court, City",
        phone: "+91 9876543212",
        email: "info@burgerhub.com",
        rating: 4.2,
        deliveryTime: "20-30 mins",
        deliveryFee: 25,
        minimumOrder: 150,
        cuisineTypes: ["American", "Fast Food", "Burgers"],
        isActive: true,
        firebaseUID: "admin-uid"
    },
    {
        name: "Sushi Express",
        description: "Fresh sushi and Japanese delicacies prepared by expert chefs",
        image: "restaurant_sushi_express.jpg",
        address: "321 Sushi Street, Japan Town, City",
        phone: "+91 9876543213",
        email: "orders@sushiexpress.com",
        rating: 4.7,
        deliveryTime: "35-50 mins",
        deliveryFee: 50,
        minimumOrder: 400,
        cuisineTypes: ["Japanese", "Sushi", "Asian"],
        isActive: true,
        firebaseUID: "admin-uid"
    },
    {
        name: "Taco Fiesta",
        description: "Vibrant Mexican flavors with authentic tacos, burritos and more",
        image: "restaurant_taco_fiesta.jpg",
        address: "654 Mexican Avenue, Spice District, City",
        phone: "+91 9876543214",
        email: "hola@tacofiesta.com",
        rating: 4.4,
        deliveryTime: "25-40 mins",
        deliveryFee: 35,
        minimumOrder: 250,
        cuisineTypes: ["Mexican", "Tex-Mex", "Spicy"],
        isActive: true,
        firebaseUID: "admin-uid"
    }
];

const addSampleRestaurants = async () => {
    try {
        await connectDB();
        
        console.log("Adding sample restaurants...");
        
        // Clear existing restaurants (optional)
        // await restaurantModel.deleteMany({});
        
        const restaurants = await restaurantModel.insertMany(sampleRestaurants);
        console.log(`✅ Added ${restaurants.length} sample restaurants`);
        
        // Add some sample food items for each restaurant
        const sampleFoodItems = [];
        
        restaurants.forEach((restaurant, index) => {
            const restaurantFoods = [
                {
                    name: `Special ${restaurant.name} Dish 1`,
                    description: `Signature dish from ${restaurant.name}`,
                    price: 250 + (index * 50),
                    image: `food_${restaurant.name.toLowerCase().replace(/\s+/g, '_')}_1.jpg`,
                    category: "Main Course",
                    restaurantId: restaurant._id,
                    firebaseUID: "admin-uid"
                },
                {
                    name: `${restaurant.name} Special 2`,
                    description: `Popular item from ${restaurant.name}`,
                    price: 180 + (index * 30),
                    image: `food_${restaurant.name.toLowerCase().replace(/\s+/g, '_')}_2.jpg`,
                    category: "Appetizer",
                    restaurantId: restaurant._id,
                    firebaseUID: "admin-uid"
                },
                {
                    name: `${restaurant.name} Dessert`,
                    description: `Sweet ending from ${restaurant.name}`,
                    price: 120 + (index * 20),
                    image: `food_${restaurant.name.toLowerCase().replace(/\s+/g, '_')}_dessert.jpg`,
                    category: "Dessert",
                    restaurantId: restaurant._id,
                    firebaseUID: "admin-uid"
                }
            ];
            
            sampleFoodItems.push(...restaurantFoods);
        });
        
        const foodItems = await foodModel.insertMany(sampleFoodItems);
        console.log(`✅ Added ${foodItems.length} sample food items`);
        
        console.log("✅ Sample data added successfully!");
        console.log("\nRestaurants added:");
        restaurants.forEach((restaurant, index) => {
            console.log(`${index + 1}. ${restaurant.name} - ${restaurant.cuisineTypes.join(', ')}`);
        });
        
        process.exit(0);
    } catch (error) {
        console.error("❌ Error adding sample data:", error);
        process.exit(1);
    }
};

// Run the script
addSampleRestaurants();
