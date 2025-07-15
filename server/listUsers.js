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

async function listUsers() {
  let connection;
  try {
    // Connect to the database
    connection = await connectDB();

    // Find all users
    const users = await userModel.find({}).select('name email googleId cartData');
    
    console.log(`Found ${users.length} users:`);
    users.forEach((user, index) => {
      console.log(`\n${index + 1}. User: ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Google ID: ${user.googleId || 'None'}`);
      console.log(`   Cart Items: ${Object.keys(user.cartData || {}).length}`);
      if (user.cartData && Object.keys(user.cartData).length > 0) {
        console.log(`   Cart Data:`, user.cartData);
      }
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('\nDisconnected from MongoDB');
    }
  }
}

// Run the function
listUsers();
