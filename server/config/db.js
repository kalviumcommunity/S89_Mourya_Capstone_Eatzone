import mongoose from "mongoose";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            throw new Error('MONGODB_URI environment variable is not defined');
        }

        console.log('Connecting to MongoDB...');
        await mongoose.connect(uri);
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1); // Exit with failure
    }
}