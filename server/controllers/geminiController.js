import { GoogleGenerativeAI } from "@google/generative-ai";
import orderModel from "../models/orderModel.js";
import foodModel from "../models/foodModel.js";
import dotenv from "dotenv";
dotenv.config();

// Input sanitization function to prevent prompt injection
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';

  // Remove potentially dangerous patterns
  const sanitized = input
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/\${.*?}/g, '') // Remove template literals
    .replace(/eval\s*\(/gi, '') // Remove eval calls
    .replace(/function\s*\(/gi, '') // Remove function declarations
    .trim();

  // Limit length to prevent excessive input
  return sanitized.substring(0, 500);
};

// Validate API key exists
if (!process.env.GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY is not configured");
  throw new Error("Missing GEMINI_API_KEY environment variable");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Eatzone Application Knowledge Base
const EATZONE_KNOWLEDGE = {
  appInfo: {
    name: "Eatzone",
    type: "Food delivery app",
    deliveryFee: "₹50",
    contact: "contact@eatzone.com",
    phone: "+91 9876554321",
    currency: "INR (₹)"
  },
  features: {
    navigation: ["Home", "Cart", "Orders", "Profile"],
    authentication: "Google OAuth login",
    payment: "Online payment in INR",
    orderTracking: "Real-time order status",
    categories: ["Salad", "Rolls", "Deserts", "Sandwich", "Cake", "Pure Veg", "Pasta", "Noodles"]
  },
  commonIssues: {
    refund: "Email contact@eatzone.com with order screenshot",
    orderDelay: "Call +91 9876554321 for order status",
    payment: "Check payment method or contact support",
    login: "Use Google account to sign in",
    cart: "Items saved automatically when logged in"
  },
  quickResponses: {
    greeting: "Hi! How can I help with Eatzone today?",
    thanks: "You're welcome! Enjoy your meal!",
    goodbye: "Thanks for using Eatzone! Order again soon!",
    help: "I can help with orders, menu, or support issues."
  }
};

export const chatWithBot = async (req, res) => {
  console.log("=== CHATBOT REQUEST START ===");
  console.log("Headers:", req.headers.authorization ? "Token present" : "No token");

  const { message, chatMode } = req.body || {};

  // Sanitize user input to prevent prompt injection
  const sanitizedMessage = sanitizeInput(message);

  // Get userId from auth middleware (req.body.userId is set by authMiddleware)
  const userId = req.body.userId || req.userId || "guest";
  console.log("Chatbot - User ID:", userId);
  console.log("Chat mode:", chatMode);
  // Don't log the actual message for security reasons

  if (!sanitizedMessage) {
    console.log("ERROR: No message provided or invalid message");
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    const userMessage = sanitizedMessage.toLowerCase().trim();

    // Quick responses for common queries
    if (userMessage.includes('hello') || userMessage.includes('hi')) {
      return res.json({ reply: EATZONE_KNOWLEDGE.quickResponses.greeting });
    }
    if (userMessage.includes('thank') || userMessage.includes('thanks')) {
      return res.json({ reply: EATZONE_KNOWLEDGE.quickResponses.thanks });
    }
    if (userMessage.includes('bye') || userMessage.includes('goodbye')) {
      return res.json({ reply: EATZONE_KNOWLEDGE.quickResponses.goodbye });
    }

    // Fetch data for AI processing with enhanced error handling
    let allFoodItems = [];
    try {
      allFoodItems = await foodModel.find({});
    } catch (dbError) {
      console.error("Database error fetching food items:", dbError);
      allFoodItems = [];
    }

    // Fetch user's recent orders using the authenticated user ID
    let recentOrders = [];
    if (userId && userId !== "guest") {
      console.log("Fetching orders for authenticated user:", userId);
      try {
        recentOrders = await orderModel.find({ userId }).sort({ date: -1 }).limit(3);
        console.log("Found orders:", recentOrders.length);
      } catch (dbError) {
        console.error("Database error fetching orders:", dbError);
        recentOrders = [];
      }
    }

    // Process order history
    const pastFoodNames = recentOrders.length > 0 ?
      recentOrders.flatMap(order => order.items.map(item => item.name || "Unknown")).slice(0, 3).join(", ") :
      "No past orders";

    console.log("Past food names:", pastFoodNames);

    // Create menu for recommendations (limit to popular items)
    const popularItems = allFoodItems.slice(0, 20).map(item =>
      `${item.name}|₹${item.price}|${item.category}`
    ).join('\n');

    let prompt;
    let maxWords;

    if (chatMode === 'support') {
      maxWords = 8;
      prompt = `
        You are Eatzone support assistant. STRICT RULES:
        - Answer ONLY about Eatzone app issues
        - Maximum ${maxWords} words
        - Use exact phrases from SOLUTIONS below

        USER QUERY: "${sanitizedMessage}"
        USER'S RECENT ORDERS: ${pastFoodNames}

        EATZONE APP INFO:
        - Food delivery app with ₹2 delivery fee
        - Google login, INR payments, order tracking
        - Categories: ${EATZONE_KNOWLEDGE.features.categories.join(', ')}

        SOLUTIONS:
        - Refund: "Email contact@eatzone.com with order screenshot"
        - Order delay: "Call +91 9876554321 for status"
        - Payment issue: "Check payment method or contact support"
        - Login problem: "Use Google account to sign in"
        - Cart issue: "Items saved when logged in"
        - General help: "Call +91 9876554321"

        RESPOND IN MAXIMUM ${maxWords} WORDS ONLY.
      `;
    } else if (chatMode === 'recommendations') {
      maxWords = 12;
      prompt = `
        You are Eatzone food recommender. STRICT RULES:
        - Recommend ONLY from menu below
        - Maximum ${maxWords} words
        - Format: "ITEM:[Name]|PRICE:₹[Price]|CATEGORY:[Category]"
        - Maximum 2 items only

        USER REQUEST: "${sanitizedMessage}"
        USER'S RECENT ORDERS: ${pastFoodNames}

        EATZONE MENU (ONLY recommend from these):
        ${popularItems}

        RESPOND WITH ITEM FORMAT OR MAXIMUM ${maxWords} WORDS.
      `;
    } else {
      maxWords = 6;
      prompt = `
        You are Eatzone assistant. STRICT RULES:
        - Answer ONLY about Eatzone food delivery app
        - Maximum ${maxWords} words
        - If not about Eatzone, say "I help with Eatzone only"

        USER: "${sanitizedMessage}"
        RECENT ORDERS: ${pastFoodNames}

        EATZONE INFO:
        - Food delivery app, ₹2 delivery fee
        - Contact: contact@eatzone.com, +91 9876554321
        - Features: Google login, INR payments, order tracking

        RESPOND IN MAXIMUM ${maxWords} WORDS ONLY.
      `;
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        maxOutputTokens: 50,
        temperature: 0.3,
      }
    });

    const result = await model.generateContent(prompt);
    let response = result.response.text().trim();

    console.log("Original response:", response);

    // Process response based on chat mode
    if (chatMode === 'support') {
      // For support, prioritize exact solutions
      const lowerMessage = userMessage;
      if (lowerMessage.includes('refund')) {
        response = EATZONE_KNOWLEDGE.commonIssues.refund;
      } else if (lowerMessage.includes('delay') || lowerMessage.includes('late')) {
        response = EATZONE_KNOWLEDGE.commonIssues.orderDelay;
      } else if (lowerMessage.includes('payment') || lowerMessage.includes('pay')) {
        response = EATZONE_KNOWLEDGE.commonIssues.payment;
      } else if (lowerMessage.includes('login') || lowerMessage.includes('sign')) {
        response = EATZONE_KNOWLEDGE.commonIssues.login;
      } else if (lowerMessage.includes('order') && (lowerMessage.includes('status') || lowerMessage.includes('help') || lowerMessage.includes('recent'))) {
        // Handle order status queries
        if (recentOrders.length > 0) {
          const latestOrder = recentOrders[0];
          response = `Latest order: ${latestOrder.status}. Call +91 9876554321 for details.`;
        } else {
          response = "No recent orders found. Call +91 9876554321.";
        }
      } else {
        // Truncate AI response
        const words = response.split(' ').slice(0, maxWords);
        response = words.join(' ');
        if (!response.endsWith('.') && !response.endsWith('!')) response += '.';
      }
    } else if (chatMode === 'recommendations') {
      // Keep ITEM format or truncate
      const itemMatches = response.match(/ITEM:[^|]+\|PRICE:[^|]+\|CATEGORY:[^|\s]+/g);
      if (itemMatches && itemMatches.length > 0) {
        response = itemMatches.slice(0, 2).join(' ');
      } else {
        const words = response.split(' ').slice(0, maxWords);
        response = words.join(' ');
        if (!response.endsWith('.') && !response.endsWith('!')) response += '.';
      }
    } else {
      // Default: strict word limit
      const words = response.split(' ').slice(0, maxWords);
      response = words.join(' ');
      if (!response.endsWith('.') && !response.endsWith('!')) response += '.';
    }

    // Final safety check - if response is still too long, use fallback
    if (response.length > 60 && !response.includes('ITEM:')) {
      response = chatMode === 'support' ? "Contact +91 9876554321 for help." :
                 chatMode === 'recommendations' ? "Check our menu for tasty options!" :
                 "I help with Eatzone only.";
    }

    console.log("Final response:", response);
    res.json({ reply: response });
  } catch (err) {
    console.error("Chatbot error:", err);
    const fallbackResponse = chatMode === 'support' ? "Contact support: +91 9876554321" :
                            chatMode === 'recommendations' ? "Check our delicious menu!" :
                            "Sorry, please try again.";
    res.json({ reply: fallbackResponse });
  }
};
