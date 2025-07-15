import express from "express";
import cors from "cors";

const app = express();
const port = 4001; // Use a different port to avoid conflicts

// Middleware
app.use(express.json());
app.use(cors({
    origin: ['http://localhost:5175', 'http://localhost:5173'],
    credentials: true
}));

// Request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Test routes
app.get("/", (req, res) => {
    console.log("Root endpoint hit!");
    res.json({ message: "Minimal server working!" });
});

app.get("/test", (req, res) => {
    console.log("Test endpoint hit!");
    res.json({ message: "Test endpoint working!" });
});

// Admin authentication removed - direct access enabled

// Start server
app.listen(port, () => {
    console.log(`Minimal test server started on http://localhost:${port}`);
    console.log("Test endpoints:");
    console.log(`- GET http://localhost:${port}/`);
    console.log(`- GET http://localhost:${port}/test`);
    console.log(`- POST http://localhost:${port}/api/admin/register`);
    console.log(`- POST http://localhost:${port}/api/admin/login`);
    console.log(`- GET http://localhost:${port}/api/admin/auth/google`);
});
