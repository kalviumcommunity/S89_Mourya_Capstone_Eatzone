import { GoogleGenerativeAI } from "@google/generative-ai";
import orderModel from "../models/orderModel.js";
import foodModel from "../models/foodModel.js";
import restaurantModel from "../models/restaurantModel.js";
import dotenv from "dotenv";

dotenv.config();

// Static food data as fallback (from assets.js structure)
const STATIC_FOOD_LIST = [
    { _id: "1", name: "Greek salad", price: 150, description: "Fresh vegetables with olive oil", category: "Salad" },
    { _id: "2", name: "Veg salad", price: 120, description: "Mixed vegetable salad", category: "Salad" },
    { _id: "3", name: "Chicken Salad", price: 200, description: "Grilled chicken with fresh greens", category: "Salad" },
    { _id: "4", name: "Lasagna Rolls", price: 180, description: "Delicious pasta rolls", category: "Rolls" },
    { _id: "5", name: "Peri Peri Rolls", price: 160, description: "Spicy peri peri chicken rolls", category: "Rolls" },
    { _id: "6", name: "Chicken Rolls", price: 190, description: "Tender chicken wrapped in soft bread", category: "Rolls" },
    { _id: "7", name: "Veg Rolls", price: 140, description: "Fresh vegetable rolls", category: "Rolls" },
    { _id: "8", name: "Vanilla Ice Cream", price: 80, description: "Creamy vanilla ice cream", category: "Dessert" },
    { _id: "9", name: "Chocolate Cake", price: 250, description: "Rich chocolate cake", category: "Cake" },
    { _id: "10", name: "Chicken Sandwich", price: 170, description: "Grilled chicken sandwich", category: "Sandwich" },
    { _id: "11", name: "Vegan Sandwich", price: 150, description: "Plant-based sandwich", category: "Sandwich" },
    { _id: "12", name: "Cheese Pasta", price: 220, description: "Creamy cheese pasta", category: "Pasta" },
    { _id: "13", name: "Chicken Pasta", price: 280, description: "Pasta with grilled chicken", category: "Pasta" },
    { _id: "14", name: "Veg Noodles", price: 160, description: "Stir-fried vegetable noodles", category: "Noodles" },
    { _id: "15", name: "Chicken Pizza", price: 350, description: "Wood-fired chicken pizza", category: "Pizza" }
];

// Menu categories (from assets.js structure)
const MENU_CATEGORIES = [
    "Rolls", "Salad", "Dessert", "Sandwich", "Cake", "Veg", "MainC", "Appetizer",
    "Pizza", "Sushi", "Sashimi", "Soup", "Tacos", "Burritos", "Pasta", "Noodles"
];

// Input sanitizer
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<script.*?>.*?<\/script>/gi, '')
    .replace(/[<>]/g, '')
    .replace(/[\x00-\x1F\x7F]/g, '')
    .substring(0, 500)
    .trim();
};

// API key validation
const isApiKeyValid = process.env.GEMINI_API_KEY;
let genAI = isApiKeyValid ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

const EATZONE_KNOWLEDGE = {
  quickResponses: {
    greeting: "Hi! Welcome to Eatzone! 🍽️ How can I help you today?",
    thanks: "You're welcome! Enjoy your delicious meal! 😊",
    goodbye: "Thanks for choosing Eatzone! Order again soon! 🚀",
  },
  commonIssues: {
    refund: "For refunds, email contact@eatzone.com with your order screenshot. Refunds take 3-5 business days.",
    orderDelay: "Call +91 9876554321 for order status. Normal delivery time is 30-45 minutes.",
    payment: "We accept all major cards, UPI, and digital wallets. Contact support if payment fails.",
    login: "Sign in with your Google account for easy access and order tracking.",
    cart: "Your cart items are saved when you're logged in. Add items and checkout easily!"
  },
  appInfo: {
    deliveryTime: "We deliver fresh food in 30-45 minutes",
    deliveryFee: "Free delivery on orders above ₹299",
    minimumOrder: "Minimum order value is ₹99",
    workingHours: "We're open 24/7 for your convenience",
    paymentMethods: "Cards, UPI, Net Banking, Digital Wallets accepted",
    customerSupport: "24/7 support at +91 9876554321"
  },
  orderingProcess: [
    "1. Browse our menu and select items",
    "2. Add items to cart with + button",
    "3. Go to cart and review your order",
    "4. Proceed to checkout",
    "5. Enter delivery address",
    "6. Choose payment method",
    "7. Place order and track delivery"
  ]
};

// 🔥 Smart keyword-based recommendation with comprehensive food data
const getKeywordRecommendations = async (text) => {
  const keywords = ['chicken', 'ice cream', 'cake', 'pasta', 'veg', 'salad', 'roll', 'sandwich', 'pizza', 'noodles', 'dessert'];
  const found = keywords.find(kw => text.toLowerCase().includes(kw));
  if (!found) return null;

  try {
    // Try to get from database first
    let foodItems = await foodModel.find({
      $or: [
        { name: { $regex: found, $options: 'i' } },
        { category: { $regex: found, $options: 'i' } }
      ]
    }).limit(3);

    // If no database results, use static data as fallback
    if (foodItems.length === 0) {
      foodItems = STATIC_FOOD_LIST.filter(item =>
        item.name.toLowerCase().includes(found) ||
        item.category.toLowerCase().includes(found)
      ).slice(0, 3);
    }

    if (foodItems.length === 0) return null;

    return foodItems.map(item =>
      `${item.name} - ₹${item.price} (${item.category})`
    ).join(', ');
  } catch (error) {
    console.error('Error fetching food recommendations:', error);
    // Fallback to static data
    const staticItems = STATIC_FOOD_LIST.filter(item =>
      item.name.toLowerCase().includes(found) ||
      item.category.toLowerCase().includes(found)
    ).slice(0, 3);

    return staticItems.length > 0 ?
      staticItems.map(item => `${item.name} - ₹${item.price} (${item.category})`).join(', ') :
      null;
  }
};

// ✅ ENHANCED INTENT DETECTOR
const detectChatMode = (message) => {
  const lower = message.toLowerCase();

  // Food recommendation keywords
  const foodKeywords = ['chicken', 'cake', 'pasta', 'veg', 'salad', 'roll', 'sandwich', 'pizza', 'noodles', 'dessert', 'ice cream'];
  const recommendKeywords = ['recommend', 'suggest', 'what should', 'best', 'popular', 'good', 'tasty', 'delicious', 'menu', 'food'];

  // Support keywords
  const supportKeywords = ['refund', 'late', 'delay', 'payment', 'pay', 'login', 'problem', 'issue', 'help', 'support', 'cancel', 'order status'];

  // Ordering process keywords
  const orderingKeywords = ['how to order', 'place order', 'checkout', 'cart', 'delivery', 'address', 'payment method'];

  // Check for food recommendations
  if (recommendKeywords.some(k => lower.includes(k)) || foodKeywords.some(k => lower.includes(k))) {
    return 'recommendations';
  }

  // Check for support issues
  if (supportKeywords.some(k => lower.includes(k))) {
    return 'support';
  }

  // Check for ordering process
  if (orderingKeywords.some(k => lower.includes(k))) {
    return 'ordering';
  }

  return 'general';
};

export const chatWithBot = async (req, res) => {
  if (!isApiKeyValid) {
    return res.json({ reply: "🤖 Chatbot unavailable. Contact +91 9876554321." });
  }

  const rawMessage = req.body.message || '';
  const userId = req.body.userId || req.userId || "guest";
  const message = sanitizeInput(rawMessage);

  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  const detectedMode = detectChatMode(message);
  const chatMode = req.body.chatMode || detectedMode;

  let recentOrders = [];
  try {
    if (userId !== "guest") {
      recentOrders = await orderModel.find({ userId }).sort({ date: -1 }).limit(3);
    }
  } catch (err) {
    console.error("Order fetch failed:", err);
  }

  const pastFood = recentOrders.flatMap(o => o.items.map(i => i.name)).slice(0, 3).join(', ') || "No past orders";

  // Fetch comprehensive food data
  let allFoodItems = [];


  try {
    // Get food items from database
    const dbFoodItems = await foodModel.find({}).limit(50);
    allFoodItems = dbFoodItems.length > 0 ? dbFoodItems : STATIC_FOOD_LIST;

    // Get restaurant data if needed
    await restaurantModel.find({ isActive: true }).limit(10);
  } catch (error) {
    console.error('Error fetching data:', error);
    allFoodItems = STATIC_FOOD_LIST;
  }

  const formattedMenu = allFoodItems.map(item =>
    `${item.name} - ₹${item.price} (${item.category})`
  ).join(', ');

  // Process the user message and generate appropriate response

  if (chatMode === 'support') {

    prompt = `
You are a support assistant for Eatzone. STRICT RULES:
- Use only fixed solutions below
- Max ${maxWords} words

USER: "${message}"
PAST ORDERS: ${pastFood}

SOLUTIONS:
- Refund: "${EATZONE_KNOWLEDGE.commonIssues.refund}"
- Delay: "${EATZONE_KNOWLEDGE.commonIssues.orderDelay}"
- Payment: "${EATZONE_KNOWLEDGE.commonIssues.payment}"
- Login: "${EATZONE_KNOWLEDGE.commonIssues.login}"
- Cart: "${EATZONE_KNOWLEDGE.commonIssues.cart}"
- Help: "Call +91 9876554321"
    `.trim();
  } else if (chatMode === 'recommendations') {

    prompt = `
You are Eatzone's food recommender. STRICT RULES:
- Recommend only from menu below
- Format: ITEM:<name>|PRICE:₹<price>|CATEGORY:<category>
- Max ${maxWords} words, Max 2 items

USER: "${message}"
PAST ORDERS: ${pastFood}

MENU:
${formattedMenu}
    `.trim();
  } else {

    prompt = `
You are Eatzone's assistant. STRICT RULES:
- Talk only about Eatzone app
- If not relevant, say: "I help with Eatzone only"
- Max ${maxWords} words

USER: "${message}"
ORDERS: ${pastFood}
    `.trim();
  }

  try {
    let response = '';

    // Handle different chat modes with specific responses
    if (chatMode === 'support') {
      const msg = message.toLowerCase();
      if (msg.includes("refund")) {
        response = EATZONE_KNOWLEDGE.commonIssues.refund;
      } else if (msg.includes("delay") || msg.includes("late") || msg.includes("time")) {
        response = EATZONE_KNOWLEDGE.commonIssues.orderDelay;
      } else if (msg.includes("payment") || msg.includes("pay")) {
        response = EATZONE_KNOWLEDGE.commonIssues.payment;
      } else if (msg.includes("login") || msg.includes("sign")) {
        response = EATZONE_KNOWLEDGE.commonIssues.login;
      } else if (msg.includes("cart")) {
        response = EATZONE_KNOWLEDGE.commonIssues.cart;
      } else if (msg.includes("delivery fee") || msg.includes("charges")) {
        response = EATZONE_KNOWLEDGE.appInfo.deliveryFee;
      } else if (msg.includes("working hours") || msg.includes("open")) {
        response = EATZONE_KNOWLEDGE.appInfo.workingHours;
      } else if (msg.includes("minimum order")) {
        response = EATZONE_KNOWLEDGE.appInfo.minimumOrder;
      } else {
        response = `For support, call ${EATZONE_KNOWLEDGE.appInfo.customerSupport} or email contact@eatzone.com`;
      }
    } else if (chatMode === 'ordering') {
      if (message.toLowerCase().includes("how to order") || message.toLowerCase().includes("place order")) {
        response = "To order: " + EATZONE_KNOWLEDGE.orderingProcess.slice(0, 4).join(" → ");
      } else if (message.toLowerCase().includes("checkout") || message.toLowerCase().includes("payment")) {
        response = "After adding items to cart, click 'Proceed to Checkout', enter address, choose payment method, and place order!";
      } else if (message.toLowerCase().includes("delivery")) {
        response = `${EATZONE_KNOWLEDGE.appInfo.deliveryTime}. ${EATZONE_KNOWLEDGE.appInfo.deliveryFee}`;
      } else {
        response = "Browse menu → Add to cart → Checkout → Enter address → Pay → Track order!";
      }
    } else if (chatMode === 'recommendations') {
      // Try keyword-based recommendations first
      const keywordMatch = await getKeywordRecommendations(message.toLowerCase());
      if (keywordMatch) {
        response = `I recommend: ${keywordMatch}`;
      } else {
        // Provide category-based recommendations
        const msg = message.toLowerCase();
        if (msg.includes("dessert") || msg.includes("sweet")) {
          const desserts = allFoodItems.filter(item =>
            item.category.toLowerCase().includes('dessert') ||
            item.category.toLowerCase().includes('cake') ||
            item.name.toLowerCase().includes('ice cream')
          ).slice(0, 3);
          response = desserts.length > 0 ?
            `Try our desserts: ${desserts.map(item => `${item.name} (₹${item.price})`).join(', ')}` :
            "Try our Vanilla Ice Cream ₹80 or Chocolate Cake ₹250!";
        } else if (msg.includes("spicy") || msg.includes("hot")) {
          response = "For spicy food, try our Peri Peri Rolls ₹160 or Chicken Pizza ₹350!";
        } else if (msg.includes("healthy") || msg.includes("light")) {
          response = "For healthy options, try our Greek Salad ₹150 or Veg Salad ₹120!";
        } else {
          // Show popular items
          const popularItems = allFoodItems.slice(0, 3);
          response = popularItems.length > 0 ?
            `Popular items: ${popularItems.map(item => `${item.name} (₹${item.price})`).join(', ')}` :
            "Try our Chicken Rolls ₹190, Greek Salad ₹150, or Cheese Pasta ₹220!";
        }
      }
    } else {
      // General chat
      const msg = message.toLowerCase();
      if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey")) {
        response = EATZONE_KNOWLEDGE.quickResponses.greeting;
      } else if (msg.includes("thank") || msg.includes("thanks")) {
        response = EATZONE_KNOWLEDGE.quickResponses.thanks;
      } else if (msg.includes("bye") || msg.includes("goodbye")) {
        response = EATZONE_KNOWLEDGE.quickResponses.goodbye;
      } else if (msg.includes("menu") || msg.includes("food")) {
        response = `We have ${MENU_CATEGORIES.slice(0, 6).join(", ")} and more! What would you like to try?`;
      } else {
        response = "I help with Eatzone orders, menu, and support. Ask me about food recommendations, ordering help, or any issues!";
      }
    }

    // Final fallback
    if (!response || response.length < 5) {
      response =
        chatMode === 'support' ? `For help, call ${EATZONE_KNOWLEDGE.appInfo.customerSupport}` :
        chatMode === 'recommendations' ? "Try our popular Chicken Rolls ₹190 or Greek Salad ₹150!" :
        chatMode === 'ordering' ? "Browse menu → Add to cart → Checkout → Enter address → Pay!" :
        "I help with Eatzone orders and menu. How can I assist you?";
    }

    res.json({ reply: response });
  } catch (err) {
    console.error("Chatbot error:", err);
    res.json({ reply: "I'm here to help with Eatzone! Ask me about our menu, ordering, or any support issues." });
  }
};
