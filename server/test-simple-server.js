import express from "express";
import cors from "cors";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.SERVER_PORT || 4000;

// Middleware
app.use(express.json());
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5175', 'http://localhost:5176'],
    credentials: true
}));

// Test route
app.get("/", (req, res) => {
    res.json({ message: "Simple server is working!" });
});

app.get("/test", (req, res) => {
    res.json({ 
        message: "Test endpoint working!",
        timestamp: new Date().toISOString()
    });
});

// Start server
const server = app.listen(port, () => {
    console.log(`✅ Simple Server Started on http://localhost:${port}`);
});

server.on('error', (err) => {
    console.error('❌ Server error:', err);
});
