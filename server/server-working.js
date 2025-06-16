import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import adminRouter from "./routes/adminRouteFixed.js";
import userRouter from "./routes/userRoute.js";
import foodRouter from "./routes/foodRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import chatbotRoute from "./routes/chatbotRoute.js";
import passport from "./config/passport.js";
import 'dotenv/config';

const app = express();
const port = process.env.SERVER_PORT || 4000; // Use standard port 4000

// Middleware
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Configure CORS
app.use(cors({
    origin: function(origin, callback) {
        const allowedOrigins = [
            process.env.FRONTEND_URL || 'http://localhost:5173',
            'http://localhost:5173',
            'http://localhost:5174',
            'http://localhost:5175'  // Admin panel
        ];

        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

// Initialize Passport
app.use(passport.initialize());

// Connect to database
connectDB();

// API endpoints
app.use("/api/food", foodRouter);
app.use("/images", express.static('uploads'));
app.use("/api/user", userRouter);
app.use("/api/admin", adminRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api/chatbot", chatbotRoute);

// Test routes
app.get("/", (req, res) => {
    console.log("Root endpoint hit!");
    res.send("API Working - Eatzone Server");
});

app.get("/test", (req, res) => {
    console.log("Test endpoint hit!");
    res.json({ 
        message: "Server is working!", 
        timestamp: new Date().toISOString(),
        environment: {
            nodeEnv: process.env.NODE_ENV || 'development',
            port: port,
            adminUrl: process.env.ADMIN_URL || 'http://localhost:5175',
            frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173'
        }
    });
});

// Start server
const server = app.listen(port, () => {
    console.log(`✅ Eatzone Server Started on http://localhost:${port}`);
    console.log(`🌐 Server is listening on all interfaces (0.0.0.0:${port})`);
    console.log(`👨‍💼 Admin URL: ${process.env.ADMIN_URL || 'http://localhost:5175'}`);
    console.log(`🖥️  Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Available endpoints:`);
    console.log(`   - GET  http://localhost:${port}/`);
    console.log(`   - GET  http://localhost:${port}/test`);
    console.log(`   - POST http://localhost:${port}/api/admin/register`);
    console.log(`   - POST http://localhost:${port}/api/admin/login`);
    console.log(`   - GET  http://localhost:${port}/api/admin/auth/google`);
    console.log(`   - GET  http://localhost:${port}/api/user/auth/google`);
    console.log(`   - GET  http://localhost:${port}/api/food/list`);
    console.log(`   - POST http://localhost:${port}/api/user/register`);
    console.log(`   - POST http://localhost:${port}/api/user/login`);
});

server.on('error', (err) => {
    console.error('❌ Server error:', err);
});

// Test server after startup
setTimeout(() => {
    console.log('🚀 Server should be ready now!');
}, 2000);
