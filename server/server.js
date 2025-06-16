import express from "express"
import cors from "cors"
import { connectDB } from "./config/db.js"
import 'dotenv/config'

import foodRouter from "./routes/foodRoute.js"
import userRouter from "./routes/userRoute.js"
import cartRouter from "./routes/cartRoute.js"
import adminRouter from "./routes/adminRouteFixed.js"
import passport from "./config/passport.js"
import orderRouter from "./routes/orderRoute.js"
import chatbotRoute from "./routes/chatbotRoute.js"
const app = express()
const port = process.env.SERVER_PORT || 4000


//app config


//middleware
app.use(express.json())

// Add request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});
// Configure CORS to allow requests from the frontend
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests from localhost on different ports
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:5173',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175'  // Admin panel
    ];

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}))
app.use(passport.initialize()) // Initialize Passport without sessions

//db connection
connectDB();

//api endpoints
//
app.use("/api/food",foodRouter)
app.use("/images",express.static('uploads'))
app.use("/api/user",userRouter)
app.use("/api/admin",adminRouter)
app.use("/api/cart",cartRouter)
app.use("/api/order",orderRouter)
app.use("/api/chatbot", chatbotRoute)
//

app.get("/",(req,res)=>{
    console.log("Root endpoint hit!");
    res.send("API Working")
})

// Simple test endpoint
app.get("/test", (req, res) => {
    console.log("Test endpoint hit!");
    res.json({ message: "Server is working!", timestamp: new Date().toISOString() });
});

const server = app.listen(port, '0.0.0.0', () => {
    console.log(`Server Started on http://localhost:${port}`)
    console.log(`Server is listening on all interfaces (0.0.0.0:${port})`)
    console.log(`Admin URL: ${process.env.ADMIN_URL || 'http://localhost:5175'}`)
    console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`)
});

server.on('error', (err) => {
    console.error('Server error:', err);
});

// Test if server is actually working
setTimeout(() => {
    console.log('Server should be ready now. Testing internal request...');
}, 2000);
