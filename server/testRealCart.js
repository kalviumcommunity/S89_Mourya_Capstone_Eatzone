import 'dotenv/config';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import userModel from './models/userModel.js';
import foodModel from './models/foodModel.js';

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect('mongodb+srv://kadalimouryas89:18011801@cluster0.cbk0vyf.mongodb.net/eatzone');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

async function testRealCartAPI() {
  let connection;
  try {
    // Connect to the database
    connection = await connectDB();

    // Find a test user
    const user = await userModel.findOne({ email: 'test@example.com' });
    if (!user) {
      console.log('No test user found. Please run testCart.js first to create a test user.');
      return;
    }

    console.log('Found test user:', user.name, user.email);

    // Get some real food items from the database
    const foodItems = await foodModel.find({}).limit(3).select('_id name');
    console.log('Found food items:', foodItems.map(item => ({ id: item._id.toString(), name: item.name })));

    if (foodItems.length === 0) {
      console.log('No food items found in database. Cannot test cart with real items.');
      return;
    }

    // Generate a JWT token for the user
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    console.log('Generated token for user');

    const baseURL = 'http://localhost:4000';

    // Test with real food item IDs
    const testCartData = {};
    foodItems.forEach((item, index) => {
      testCartData[item._id.toString()] = index + 1; // Different quantities
    });

    console.log('Test cart data with real food IDs:', testCartData);

    // Test 1: Get current cart data
    console.log('\n--- Test 1: Get Current Cart Data ---');
    try {
      const response = await axios.post(`${baseURL}/api/cart/get`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Current cart response:', response.data);
    } catch (error) {
      console.error('Get cart error:', error.response?.data || error.message);
    }

    // Test 2: Update cart data with real food items
    console.log('\n--- Test 2: Update Cart Data with Real Food Items ---');
    try {
      const response = await axios.post(`${baseURL}/api/cart/add`, { cartData: testCartData }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Update cart response:', response.data);
    } catch (error) {
      console.error('Update cart error:', error.response?.data || error.message);
    }

    // Test 3: Get cart data again to verify update
    console.log('\n--- Test 3: Get Cart Data After Update ---');
    try {
      const response = await axios.post(`${baseURL}/api/cart/get`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Get cart after update response:', response.data);
    } catch (error) {
      console.error('Get cart after update error:', error.response?.data || error.message);
    }

    // Test 4: Add one more item to existing cart
    console.log('\n--- Test 4: Add One More Item to Existing Cart ---');
    const updatedCartData = { ...testCartData };
    if (foodItems.length > 0) {
      updatedCartData[foodItems[0]._id.toString()] = (updatedCartData[foodItems[0]._id.toString()] || 0) + 2;
    }
    
    try {
      const response = await axios.post(`${baseURL}/api/cart/add`, { cartData: updatedCartData }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Add item to cart response:', response.data);
    } catch (error) {
      console.error('Add item to cart error:', error.response?.data || error.message);
    }

    // Test 5: Final cart check
    console.log('\n--- Test 5: Final Cart Check ---');
    try {
      const response = await axios.post(`${baseURL}/api/cart/get`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Final cart response:', response.data);
    } catch (error) {
      console.error('Final cart error:', error.response?.data || error.message);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('Disconnected from MongoDB');
    }
  }
}

// Run the test
testRealCartAPI();
