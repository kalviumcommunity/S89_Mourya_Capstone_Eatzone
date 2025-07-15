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

async function testUserCartFlow() {
  let connection;
  try {
    // Connect to the database
    connection = await connectDB();

    // Find the Google OAuth user
    const user = await userModel.findOne({ email: 'mouryakadali5@gmail.com' });
    if (!user) {
      console.log('Google OAuth user not found.');
      return;
    }

    console.log('Found Google OAuth user:', user.name, user.email);
    console.log('Current cart data:', user.cartData);

    // Get some real food items from the database
    const foodItems = await foodModel.find({}).limit(2).select('_id name');
    console.log('Available food items:', foodItems.map(item => ({ id: item._id.toString(), name: item.name })));

    if (foodItems.length === 0) {
      console.log('No food items found in database.');
      return;
    }

    // Generate a JWT token for the user
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    console.log('Generated token for user');

    const baseURL = 'http://localhost:4000';

    // Step 1: Add some items to cart (simulate user adding items)
    console.log('\n--- Step 1: Add Items to Cart ---');
    const cartData = {};
    foodItems.forEach((item, index) => {
      cartData[item._id.toString()] = index + 1;
    });
    
    console.log('Adding cart data:', cartData);
    
    try {
      const response = await axios.post(`${baseURL}/api/cart/add`, { cartData }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Add to cart response:', response.data);
    } catch (error) {
      console.error('Add to cart error:', error.response?.data || error.message);
      return;
    }

    // Step 2: Verify cart was saved
    console.log('\n--- Step 2: Verify Cart Was Saved ---');
    try {
      const response = await axios.post(`${baseURL}/api/cart/get`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Get cart response:', response.data);
    } catch (error) {
      console.error('Get cart error:', error.response?.data || error.message);
      return;
    }

    // Step 3: Simulate logout (clear cart in frontend, but keep in database)
    console.log('\n--- Step 3: Simulate Logout (Cart Should Remain in Database) ---');
    // In real app, frontend would clear local cart state but database keeps the data
    console.log('User logs out - frontend cart cleared, but database cart remains');

    // Step 4: Simulate login again (should load cart from database)
    console.log('\n--- Step 4: Simulate Login Again (Should Load Cart from Database) ---');
    try {
      const response = await axios.post(`${baseURL}/api/cart/get`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Cart after re-login:', response.data);
      
      if (response.data.success && Object.keys(response.data.cartData || {}).length > 0) {
        console.log('✅ SUCCESS: Cart data persisted after logout/login!');
      } else {
        console.log('❌ FAILURE: Cart data was not persisted!');
      }
    } catch (error) {
      console.error('Get cart after re-login error:', error.response?.data || error.message);
    }

    // Step 5: Test adding more items to existing cart
    console.log('\n--- Step 5: Add More Items to Existing Cart ---');
    const updatedCartData = { ...cartData };
    if (foodItems.length > 0) {
      updatedCartData[foodItems[0]._id.toString()] = (updatedCartData[foodItems[0]._id.toString()] || 0) + 2;
    }
    
    try {
      const response = await axios.post(`${baseURL}/api/cart/add`, { cartData: updatedCartData }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Updated cart response:', response.data);
    } catch (error) {
      console.error('Update cart error:', error.response?.data || error.message);
    }

    // Step 6: Final verification
    console.log('\n--- Step 6: Final Cart Verification ---');
    try {
      const response = await axios.post(`${baseURL}/api/cart/get`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Final cart state:', response.data);
    } catch (error) {
      console.error('Final cart check error:', error.response?.data || error.message);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('\nDisconnected from MongoDB');
    }
  }
}

// Run the test
testUserCartFlow();
