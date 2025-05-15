import 'dotenv/config';
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

// Test user email - replace with an actual user email from your database
const TEST_USER_EMAIL = 'test@example.com';

// Test cart data
const testCartData = {
  '1': 2,  // Item ID 1, quantity 2
  '2': 1   // Item ID 2, quantity 1
};

async function testCartOperations() {
  let connection;
  try {
    // Connect to the database
    connection = await connectDB();

    // Find a user
    const user = await userModel.findOne({ email: TEST_USER_EMAIL });

    if (!user) {
      console.log(`No user found with email ${TEST_USER_EMAIL}`);
      console.log('Creating a test user...');

      const newUser = new userModel({
        name: 'Test User',
        email: TEST_USER_EMAIL,
        password: 'password123',
        cartData: {}
      });

      await newUser.save();
      console.log('Test user created successfully');

      // Use the newly created user
      return testCartOperations();
    }

    console.log('Found user:', user.name, user.email);
    console.log('Current cart data:', user.cartData);

    // Update cart data
    console.log('Updating cart data...');
    user.cartData = testCartData;
    await user.save();

    // Verify the update
    const updatedUser = await userModel.findOne({ email: TEST_USER_EMAIL });
    console.log('Updated cart data:', updatedUser.cartData);

    if (JSON.stringify(updatedUser.cartData) === JSON.stringify(testCartData)) {
      console.log('Cart data updated successfully!');
    } else {
      console.log('Cart data update failed!');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (mongoose.connection.readyState === 1) {
      // Close the database connection if it's open
      await mongoose.connection.close();
      console.log('Disconnected from MongoDB');
    }
  }
}

// Run the test
testCartOperations();
