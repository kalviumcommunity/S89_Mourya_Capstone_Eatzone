import express from "express";
import 'dotenv/config';

const app = express();
const port = 4000;

app.use(express.json());

// Simple test endpoint
app.get("/", (req, res) => {
  res.json({ message: "Server is running" });
});

// Test profile endpoint
app.get("/api/profile", (req, res) => {
  const authHeader = req.headers.authorization;
  console.log("Authorization header:", authHeader);
  
  res.json({
    success: true,
    user: {
      id: "test-id",
      name: "Test User",
      email: "test@example.com",
      profileImage: null
    }
  });
});

app.listen(port, () => {
  console.log(`Test server running on http://localhost:${port}`);
});
