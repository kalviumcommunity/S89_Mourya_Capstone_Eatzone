import express from "express";
import { newChatWithBot } from "../controllers/newChatbotController.js";
import authMiddleware from "../middleware/auth.js";

// Enhanced input validation middleware with security checks
const validateChatInput = (req, res, next) => {
  const { message, chatMode } = req.body;

  // Validate message
  if (!message || typeof message !== 'string') {
    return res.status(400).json({
      error: "Message is required and must be a string"
    });
  }

  // Validate message length (reduced for security)
  if (message.length > 500) {
    return res.status(400).json({
      error: "Message too long. Maximum 500 characters allowed."
    });
  }

  // Check for potentially malicious patterns - more targeted detection
  const dangerousPatterns = [
    /javascript:\s*[^a-zA-Z]/gi, // More specific javascript: protocol detection
    /on\w+\s*=\s*['"]/gi, // Event handlers with quotes
    /\${[^}]*eval/gi, // Template literals with eval
    /eval\s*\(\s*['"]/gi, // Eval with string parameters
    /<script[^>]*>/gi, // Script tags
    /document\s*\.\s*(write|cookie|location)/gi, // Specific dangerous document methods
    /window\s*\.\s*(location|open)/gi // Specific dangerous window methods
  ];

  // More sophisticated detection - require multiple suspicious patterns or specific contexts
  const suspiciousMatches = dangerousPatterns.filter(pattern => pattern.test(message));
  const hasDangerousContent = suspiciousMatches.length > 1 ||
    message.toLowerCase().includes('<script') ||
    /javascript:\s*[^a-zA-Z]/.test(message);

  if (hasDangerousContent) {
    return res.status(400).json({
      error: "Message contains potentially harmful content"
    });
  }

  // Validate chat mode if provided
  if (chatMode && !['support', 'recommendation', 'feedback'].includes(chatMode)) {
    return res.status(400).json({
      error: "Invalid chat mode. Must be 'support', 'recommendation', or 'feedback'"
    });
  }

  // Basic sanitization - detailed sanitization handled in controller
  req.body.message = message.trim();

  next();
};

const router = express.Router();

// Optional auth middleware - works for both authenticated and guest users
const optionalAuth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (token) {
      // If token exists, use auth middleware
      authMiddleware(req, res, (err) => {
        if (err) {
          // If auth fails, continue as guest instead of blocking
          console.warn("Auth failed, continuing as guest:", err.message);
          req.body.userId = "guest";
          next();
        } else {
          next();
        }
      });
    } else {
      // If no token, continue as guest
      req.body.userId = "guest";
      next();
    }
  } catch (error) {
    console.error("Error in optionalAuth middleware:", error);
    req.body.userId = "guest";
    next();
  }
};

router.post("/chat", validateChatInput, optionalAuth, newChatWithBot);

// Health check endpoint
router.get("/health", (_req, res) => {
  res.json({
    status: "healthy",
    service: "Eatzone Chatbot API",
    timestamp: new Date().toISOString(),
    version: "1.0.0"
  });
});

// Test endpoint to verify new implementation
router.get("/test", (_req, res) => {
  res.json({
    message: "New chatbot implementation is working!",
    timestamp: new Date().toISOString(),
    endpoints: {
      chat: "POST /api/chatbot/chat",
      health: "GET /api/chatbot/health",
      test: "GET /api/chatbot/test"
    }
  });
});

export default router;
