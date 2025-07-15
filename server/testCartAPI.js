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

async function testCartAPI() {
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

    // Generate a JWT token for the user
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    console.log('Generated token for user');

    const baseURL = 'http://localhost:4000';

    // Test 1: Get cart data
    console.log('\n--- Test 1: Get Cart Data ---');
    try {
      const response = await axios.post(`${baseURL}/api/cart/get`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Get cart response:', response.data);
    } catch (error) {
      console.error('Get cart error:', error.response?.data || error.message);
    }

    // Test 2: Update cart data
    console.log('\n--- Test 2: Update Cart Data ---');
    const testCartData = {
      '507f1f77bcf86cd799439011': 3,
      '507f1f77bcf86cd799439012': 2
    };
    
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

    // Test 4: Clear cart
    console.log('\n--- Test 4: Clear Cart ---');
    try {
      const response = await axios.post(`${baseURL}/api/cart/clear`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Clear cart response:', response.data);
    } catch (error) {
      console.error('Clear cart error:', error.response?.data || error.message);
    }

    // Test 5: Get cart data after clear
    console.log('\n--- Test 5: Get Cart Data After Clear ---');
    try {
      const response = await axios.post(`${baseURL}/api/cart/get`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Get cart after clear response:', response.data);
    } catch (error) {
      console.error('Get cart after clear error:', error.response?.data || error.message);
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
testCartAPI();
