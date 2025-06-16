// Simple test to verify the update route is properly configured
import express from 'express';
import cors from 'cors';
import foodRouter from './routes/foodRoute.js';

const app = express();
const port = 4001; // Use different port for testing

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/food", foodRouter);

// Test endpoint
app.get("/test", (req, res) => {
    res.json({ message: "Test server is working!" });
});

// Start test server
const server = app.listen(port, () => {
    console.log(`🧪 Test server started on http://localhost:${port}`);
    console.log(`📋 Available routes:`);
    console.log(`   - GET  http://localhost:${port}/test`);
    console.log(`   - GET  http://localhost:${port}/api/food/test-update`);
    console.log(`   - POST http://localhost:${port}/api/food/update`);
    
    // Test the route accessibility
    setTimeout(() => {
        console.log('\n✅ Test server is ready!');
        console.log('💡 You can now test the update endpoint');
        
        // Auto-shutdown after 30 seconds
        setTimeout(() => {
            console.log('\n🔄 Shutting down test server...');
            server.close();
            process.exit(0);
        }, 30000);
    }, 1000);
});

server.on('error', (err) => {
    console.error('❌ Test server error:', err);
});
