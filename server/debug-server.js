import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import 'dotenv/config';

console.log('🚀 Starting debug server...');
console.log('📊 Environment check:');
console.log('- Node version:', process.version);
console.log('- MongoDB URI:', process.env.MONGODB_URI ? 'Found' : 'Missing');
console.log('- Port:', process.env.SERVER_PORT || 4000);

const app = express();
const port = process.env.SERVER_PORT || 4000;

// Middleware
app.use(express.json());
app.use(cors());

// Test route
app.get('/test', (req, res) => {
    res.json({ 
        message: 'Debug server is working!', 
        timestamp: new Date().toISOString(),
        env: {
            nodeEnv: process.env.NODE_ENV || 'development',
            mongoUri: process.env.MONGODB_URI ? 'Connected' : 'Missing'
        }
    });
});

// Simple food list route with mock data
app.get('/api/food/list', async (req, res) => {
    try {
        console.log('📋 Food list requested');
        
        if (mongoose.connection.readyState === 1) {
            // Connected to MongoDB - try to fetch real data
            const foodModel = mongoose.model('food', new mongoose.Schema({
                name: String,
                description: String,
                price: Number,
                category: String,
                image: String
            }));
            
            const foods = await foodModel.find({});
            console.log(`Found ${foods.length} food items in database`);
            
            res.json({
                success: true,
                data: foods,
                source: 'database'
            });
        } else {
            // Not connected - return mock data
            console.log('Database not connected, returning mock data');
            const mockData = [
                {
                    _id: "mock1",
                    name: "Test Food Item",
                    description: "This is a test item",
                    price: 100,
                    category: "Test",
                    image: "test.png"
                }
            ];
            
            res.json({
                success: true,
                data: mockData,
                source: 'mock'
            });
        }
    } catch (error) {
        console.error('Error in food list:', error);
        res.json({
            success: false,
            message: error.message
        });
    }
});

// Connect to MongoDB
const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            console.log('⚠️ MongoDB URI not found in environment variables');
            return false;
        }
        
        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB connected successfully');
        return true;
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        return false;
    }
};

// Start server
const startServer = async () => {
    try {
        // Try to connect to database (but don't fail if it doesn't work)
        await connectDB();
        
        const server = app.listen(port, () => {
            console.log(`✅ Debug server started on http://localhost:${port}`);
            console.log(`🧪 Test endpoint: http://localhost:${port}/test`);
            console.log(`📋 Food list: http://localhost:${port}/api/food/list`);
        });

        server.on('error', (err) => {
            console.error('❌ Server error:', err);
            if (err.code === 'EADDRINUSE') {
                console.log(`💡 Port ${port} is already in use. Try a different port or kill the existing process.`);
            }
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error);
    }
};

startServer();
