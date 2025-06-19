import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

import foodRouter from "./routes/foodRoute.js";
import userRouter from "./routes/userRoute.js";
import cartRouter from "./routes/cartRoute.js";
import adminRouter from "./routes/adminRoute.js";
import restaurantRouter from "./routes/restaurantRoute.js";
import orderRouter from "./routes/orderRoute.js";
import chatbotRoute from "./routes/chatbotRoute.js";
import adminAuthRouter from "./routes/adminAuthRoute.js";

const app = express();
const port = process.env.SERVER_PORT || 4000;

// Middleware
app.use(express.json());

// Request logging middleware
app.use((req, _res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Configure CORS
app.use(cors({
    origin: function(origin, callback) {
        const allowedOrigins = [
            process.env.FRONTEND_URL || 'http://localhost:5173',
            'http://localhost:5173',  // Client app (fixed port)
            process.env.ADMIN_URL || 'http://localhost:5175',
            'http://localhost:5175'   // Admin panel (fixed port)
        ];

        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.warn(`CORS blocked request from origin: ${origin}`);
            callback(new Error(`Not allowed by CORS. Allowed origins: ${allowedOrigins.join(', ')}`));
        }
    },
    credentials: true
}));

// Connect to database
connectDB();

// API endpoints
app.use("/api/food", foodRouter);
app.use("/images", express.static('uploads'));
app.use("/api/user", userRouter);
app.use("/api/admin", adminRouter);
app.use("/api/restaurant", restaurantRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api/chatbot", chatbotRoute);
app.use("/api/admin/auth", adminAuthRouter);

// Global error handling middleware
app.use((err, req, res, _next) => {
    console.error('🚨 Global error handler:', err);

    // Don't log sensitive information
    const errorResponse = {
        success: false,
        message: process.env.NODE_ENV === 'production'
            ? 'An error occurred'
            : err.message,
        timestamp: new Date().toISOString()
    };

    // Log error details for debugging (not sent to client)
    console.error('Error details:', {
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        ip: req.ip
    });

    res.status(err.status || 500).json(errorResponse);
});

// Root endpoint
app.get("/",(_req,res)=>{
    console.log("Root endpoint hit!");
    res.send("🍽️ Eatzone API Server - Working!")
})

// Comprehensive health check endpoint
app.get("/health", (_req, res) => {
    console.log("Health check endpoint hit!");

    const healthStatus = {
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: "1.0.0",
        services: {
            database: process.env.MONGODB_URI ? "configured" : "not configured",
            geminiAPI: process.env.GEMINI_API_KEY ? "configured" : "not configured",
            stripeAPI: process.env.STRIPE_SECRET_KEY ? "configured" : "not configured",
            googleOAuth: process.env.GOOGLE_CLIENT_ID ? "configured" : "not configured"
        },
        endpoints: {
            food: "/api/food/list",
            user: "/api/user/register",
            admin: "/api/admin/login",
            restaurant: "/api/restaurant/list",
            orders: "/api/order/list",
            chatbot: "/api/chatbot/chat"
        }
    };

    res.json(healthStatus);
});

// Simple test endpoint
app.get("/test", (_req, res) => {
    console.log("Test endpoint hit!");
    res.json({
        message: "🍽️ Eatzone Server is working!",
        timestamp: new Date().toISOString(),
        status: "success"
    });
});

// 404 handler for undefined routes (must be last)
app.use((_req, res) => {
    res.status(404).json({
        success: false,
        message: "API endpoint not found",
        availableEndpoints: [
            "GET /",
            "GET /test",
            "GET /health",
            "GET /api/food/list",
            "GET /api/restaurant/list",
            "POST /api/restaurant/add",
            "POST /api/user/register",
            "POST /api/user/login",
            "POST /api/order/place",
            "POST /api/chatbot/chat"
        ]
    });
});





// Start server
const server = app.listen(port, () => {
    console.log(`✅ Eatzone Server Started on http://localhost:${port}`);
    console.log(`🌐 Server is listening on all interfaces (0.0.0.0:${port})`);
    console.log(`👨‍💼 Admin URL: ${process.env.ADMIN_URL || 'http://localhost:5175'}`);
    console.log(`🖥️  Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});

server.on('error', (err) => {
    console.error('❌ Server error:', err);
});

process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        console.log('✅ Server closed successfully');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('\n🛑 SIGINT received. Shutting down gracefully...');
    server.close(() => {
        console.log('✅ Server closed successfully');
        process.exit(0);
    });
});

// Test if server is actually working
setTimeout(() => {
    console.log('🔍 Server health check completed. All systems ready!');
}, 2000);
