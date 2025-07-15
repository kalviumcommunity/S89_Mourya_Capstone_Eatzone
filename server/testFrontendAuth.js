import 'dotenv/config';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import userModel from './models/userModel.js';

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

async function testFrontendAuthFlow() {
  let connection;
  try {
    // Connect to the database
    connection = await connectDB();

    // Find the Google OAuth user with cart data
    const user = await userModel.findOne({ email: 'mouryakadali5@gmail.com' });
    if (!user) {
      console.log('Google OAuth user not found.');
      return;
    }

    console.log('Testing authentication flow for user:', user.name, user.email);
    console.log('User cart data in database:', user.cartData);

    // Generate a JWT token (simulating what happens after Google OAuth)
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    console.log('Generated JWT token');

    const baseURL = 'http://localhost:4000';

    // Test 1: Check authentication status (what frontend should do on page load)
    console.log('\n--- Test 1: Check Authentication Status ---');
    try {
      const response = await axios.get(`${baseURL}/api/debug/auth-status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Auth status response:', JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.error('Auth status error:', error.response?.data || error.message);
      return;
    }

    // Test 2: Load cart data (what frontend should do after authentication)
    console.log('\n--- Test 2: Load Cart Data ---');
    try {
      const response = await axios.post(`${baseURL}/api/cart/get`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Cart load response:', JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.error('Cart load error:', error.response?.data || error.message);
      return;
    }

    // Test 3: Simulate adding an item to cart (what happens when user adds item)
    console.log('\n--- Test 3: Add Item to Cart ---');
    const currentCart = user.cartData || {};
    const updatedCart = { ...currentCart };
    
    // Add a new item or increase quantity of existing item
    const testItemId = '68427027a7e1f7db8bd63e9c'; // Lasanga Rolls
    updatedCart[testItemId] = (updatedCart[testItemId] || 0) + 1;
    
    try {
      const response = await axios.post(`${baseURL}/api/cart/add`, { cartData: updatedCart }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Add to cart response:', JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.error('Add to cart error:', error.response?.data || error.message);
      return;
    }

    // Test 4: Verify cart was updated
    console.log('\n--- Test 4: Verify Cart Update ---');
    try {
      const response = await axios.post(`${baseURL}/api/cart/get`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Updated cart response:', JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.error('Cart verification error:', error.response?.data || error.message);
    }

    // Test 5: Simulate logout and login (clear frontend cart, then reload from server)
    console.log('\n--- Test 5: Simulate Logout/Login Flow ---');
    console.log('Frontend would clear local cart state on logout...');
    console.log('On login, frontend should reload cart from server:');
    
    try {
      const response = await axios.post(`${baseURL}/api/cart/get`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Cart after re-login:', JSON.stringify(response.data, null, 2));
      
      if (response.data.success && Object.keys(response.data.cartData || {}).length > 0) {
        console.log('✅ SUCCESS: Cart persistence working correctly!');
        console.log('✅ Cart items count:', Object.keys(response.data.cartData).length);
      } else {
        console.log('❌ FAILURE: Cart data not persisted!');
      }
    } catch (error) {
      console.error('Re-login cart load error:', error.response?.data || error.message);
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
testFrontendAuthFlow();
