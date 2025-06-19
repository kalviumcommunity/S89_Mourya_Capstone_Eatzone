import { GoogleGenerativeAI } from "@google/generative-ai";
import orderModel from "../models/orderModel.js";
import foodModel from "../models/foodModel.js";
import dotenv from "dotenv";
dotenv.config();

// Enhanced input sanitization function to prevent prompt injection
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';

  // Remove potentially dangerous patterns with more targeted approach
  let sanitized = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:\s*[^a-zA-Z]/gi, '') // Remove javascript: protocol (but allow word "javascript")
    .replace(/on\w+\s*=\s*['"]/gi, '') // Remove event handlers with quotes
    .replace(/\${[^}]*eval[^}]*}/gi, '') // Remove template literals with eval
    .replace(/eval\s*\(\s*['"]/gi, '') // Remove eval with string parameters
    .replace(/document\s*\.\s*(write|cookie|location)/gi, '') // Remove dangerous document methods
    .replace(/window\s*\.\s*(location|open)/gi, '') // Remove dangerous window methods
    .replace(/[<>]/g, '') // Remove remaining angle brackets
    .trim();

  // Additional security: Remove excessive whitespace and control characters
  sanitized = sanitized.replace(/\s+/g, ' ').replace(/[\x00-\x1F\x7F]/g, '');

  // Limit length to prevent excessive input
  return sanitized.substring(0, 500);
};

// Validate API key exists - graceful handling
const validateApiKey = () => {
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
    console.warn("⚠️ GEMINI_API_KEY is not configured");
    console.warn("Chatbot functionality will be limited. Please set GEMINI_API_KEY environment variable");
    return false;
  }
  return true;
};

const isApiKeyValid = validateApiKey();

// Eatzone Official Support Chatbot Knowledge Base
const EATZONE_KNOWLEDGE = {
  appInfo: {
    name: "Eatzone",
    type: "Food delivery app",
    deliveryFee: "₹50",
    contact: "contact@eatzone.com",
    phone: "+91 9876554321",
    currency: "INR (₹)"
  },

  // Strict response boundaries
  offTopicResponse: "I'm here to help you with Eatzone-related support. Please let me know how I can assist with your order, payment, or delivery.",

  // Policies
  policies: {
    refund: {
      failedPayment: "Refunds for failed payments take 3–5 business days.",
      paymentDeducted: "If you paid but didn't get confirmation, please upload a screenshot of the payment.",
      noRefundAfterDelivery: "Refunds are NOT available after the food has been delivered successfully."
    },
    delivery: {
      averageTime: "Average delivery time is 30–45 minutes.",
      delayResponse: "I apologize for the delay. Your order is on the way and should arrive soon."
    }
  },

  categories: ["Salad", "Rolls", "Deserts", "Sandwich", "Cake", "Pure Veg", "Pasta", "Noodles"],
  // Mode-specific responses
  modeResponses: {
    support: {
      greeting: "Hello! I'm your Eatzone support assistant. How can I help you today?",
      orderTracking: "I can help you track your order. Please provide your order details.",
      paymentIssue: "I'm sorry to hear about the payment issue. Let me help you resolve this.",
      deliveryDelay: "I apologize for the delay. Let me check your order status."
    },
    recommendation: {
      greeting: "What are you craving today? I can recommend some delicious options from our menu!",
      spicy: "For something spicy, I'd recommend our flavorful dishes with bold spices.",
      lunch: "For lunch, our hearty options like biryani or pasta are perfect choices.",
      dinner: "For dinner, I'd suggest our filling and popular dishes."
    },
    feedback: {
      greeting: "I'd love to hear about your Eatzone experience! Please share your feedback.",
      questions: [
        "How was your recent order experience?",
        "Was the delivery on time?",
        "Any suggestions to improve?"
      ],
      thanks: "Thanks for your valuable feedback! We're always working to improve."
    }
  },
  orderingGuide: {
    howToOrder: "🛒 **How to Place an Order:**\n\n1️⃣ **Browse Menu**: Explore our delicious categories on the home page\n\n2️⃣ **Add to Cart**: Click the '+' button on items you want\n\n3️⃣ **Review Cart**: Click the cart icon to review your items\n\n4️⃣ **Checkout**: Click 'PROCEED TO CHECKOUT' button\n\n5️⃣ **Fill Details**: Enter your delivery address and contact info\n\n6️⃣ **Payment**: Complete secure payment through Stripe\n\n7️⃣ **Track Order**: Monitor your order status in 'Orders' section\n\n🚚 Your delicious food will be delivered hot and fresh!",
    afterAddingToCart: "🛒 **After Adding Items to Cart:**\n\n✅ **Items Added Successfully!** Here's what to do next:\n\n1️⃣ **Continue Shopping**: Add more items or browse other categories\n\n2️⃣ **Review Your Cart**: Click the cart icon (🛒) in the top-right corner\n\n3️⃣ **Check Items**: Verify quantities and remove unwanted items\n\n4️⃣ **Proceed to Checkout**: Click 'PROCEED TO CHECKOUT' when ready\n\n5️⃣ **Enter Address**: Fill in your delivery details\n\n6️⃣ **Make Payment**: Complete secure payment\n\n💡 **Tip**: Your cart is automatically saved when you're logged in!",
    cartManagement: "🛒 **Managing Your Cart:**\n\n➕ **Add Items**: Click '+' button on any food item\n\n➖ **Remove Items**: Click '-' button or 'X' to remove completely\n\n🔄 **Update Quantity**: Use +/- buttons to adjust amounts\n\n🗑️ **Clear Cart**: Use 'Clear Cart' button to start fresh\n\n💾 **Auto-Save**: Cart items are saved when you're logged in\n\n📱 **Access Cart**: Click the cart icon in the navigation bar anytime!",
    checkoutProcess: "💳 **Checkout Process:**\n\n1️⃣ **Review Cart**: Check all items and quantities\n\n2️⃣ **Login Required**: Sign in with Google account\n\n3️⃣ **Delivery Address**: Enter complete address details\n\n4️⃣ **Contact Info**: Provide phone number for delivery updates\n\n5️⃣ **Order Summary**: Review total amount (includes ₹50 delivery fee)\n\n6️⃣ **Secure Payment**: Pay safely through Stripe\n\n7️⃣ **Order Confirmation**: Get order ID and tracking details\n\n🎉 **Order Placed!** Track progress in 'My Orders' section!"
  }
};

// Enhanced intent detection for Eatzone queries
const detectIntent = (message) => {
  const lowerMessage = message.toLowerCase();

  // Intent patterns with priority order - EXACT matches for user queries
  const intents = {
    // Order management intents (HIGH PRIORITY - check first)
    cancelOrder: ['cancel my order', 'cancel order', 'how to cancel', 'how to vcancel', 'want to cancel', 'stop order', 'i said cancel'],
    orderStatus: ['order status', 'status', 'where is my order', 'track order', 'order update', 'my order'],
    refund: ['refund', 'money back', 'return money', 'get refund'],
    deliveryTime: ['how much time for delivery', 'how much time', 'delivery time', 'when will arrive', 'how long', 'eta'],
    payment: ['payment related', 'payment', 'payment failed', 'money deducted', 'payment issue'],
    delivery: ['delivery', 'delivery problem', 'late delivery', 'delivery issue'],

    // Ordering help - specific patterns (check afterCart BEFORE orderHelp)
    afterCart: ['how to order items after adding to cart', 'after adding to cart', 'what to do after adding', 'next step after cart'],
    orderHelp: ['how to order', 'place order', 'ordering process'],

    // Food category intents (SPECIFIC CATEGORIES)
    biryani: ['biryani', 'i need biryani', 'i want biryani', 'biriyani', 'rice'],
    pizza: ['pizza', 'i need pizza', 'i want pizza', 'pizzas'],
    burger: ['burger', 'i need burger', 'i want burger', 'burgers'],
    cake: ['cake', 'i want cake', 'cakes', 'birthday cake'],
    dessert: ['dessert', 'desserts', 'sweet', 'chocolate'],
    salad: ['salad', 'salads', 'healthy', 'green'],
    rolls: ['roll', 'rolls', 'wrap', 'wraps'],
    sandwich: ['sandwich', 'sandwiches'],
    pasta: ['pasta', 'spaghetti'],
    noodles: ['noodles', 'i need noodles', 'i want noodles'],

    // Specific food requests
    foodRequest: ['i need', 'i want', 'give me', 'show me', 'looking for'],

    // Food recommendation intents
    recommend: ['recommend me food', 'recommend', 'suggest', 'what to eat', 'food recommendation'],
    spicy: ['spicy food', 'spicy', 'hot food'],
    light: ['light', 'diet'],
    breakfast: ['breakfast', 'morning food'],

    // Feedback intents
    feedback: ['food quality feedback', 'overall rating', 'feedback', 'delivery feedback', 'experience', 'review', 'rating', 'app experience'],
    feedbackResponse: ['amazing', 'good', 'excellent', 'great', 'awesome', 'fantastic', 'wonderful', 'nice', 'bad', 'poor', 'terrible', 'horrible', 'okay', 'fine', 'average', 'not good', 'disappointing', 'satisfactory', 'outstanding', 'perfect', 'love it', 'hate it', 'best', 'worst', 'delicious', 'tasty', 'yummy', 'fresh', 'cold', 'hot', 'late', 'fast', 'slow', 'quick', 'on time', 'delayed'],

    // Menu browsing
    menu: ['food items', 'menu', 'show menu', 'what food'],

    // Standalone food items (without "i want/i need")
    standaloneFoodItem: ['dal curry', 'egg curry', 'chicken curry', 'paneer curry', 'curd rice', 'fried rice', 'chicken rice', 'mutton curry', 'fish curry', 'sambar', 'rasam', 'chapati', 'roti', 'paratha'],

    // App-related queries
    appFeatures: ['add more features', 'new features', 'app features', 'improve app', 'app suggestions', 'app feedback'],

    // General Eatzone keywords (LOWEST PRIORITY)
    eatzone: ['order', 'food', 'delivery', 'eatzone', 'dish', 'meal', 'restaurant', 'biryani', 'pizza', 'burger', 'chicken', 'veg', 'non-veg', 'eat', 'hungry', 'lunch', 'dinner', 'breakfast']
  };

  // Check for specific intents first with exact matching
  // Priority order: Check food requests first, then other intents
  const priorityOrder = ['standaloneFoodItem', 'biryani', 'pizza', 'burger', 'noodles', 'cake', 'dessert', 'salad', 'rolls', 'sandwich', 'pasta', 'foodRequest', 'appFeatures', 'cancelOrder', 'orderStatus', 'refund', 'deliveryTime', 'payment', 'delivery', 'afterCart', 'orderHelp', 'recommend', 'spicy', 'light', 'breakfast', 'feedback', 'feedbackResponse', 'menu'];

  for (const intent of priorityOrder) {
    if (intents[intent]) {
      for (const keyword of intents[intent]) {
        if (lowerMessage.includes(keyword)) {
          // Special check for foodRequest - filter out nonsensical requests
          if (intent === 'foodRequest') {
            const nonsensicalWords = ['egg cry', 'random food', 'xyz', 'abc', 'weird', 'strange'];
            if (nonsensicalWords.some(word => lowerMessage.includes(word))) {
              console.log("🎯 Detected nonsensical food request, treating as off-topic");
              return 'off_topic';
            }
          }

          console.log(`🎯 Intent "${intent}" matched keyword: "${keyword}"`);
          return intent;
        }
      }
    }
  }

  // Check for nonsensical food requests before general Eatzone detection
  if (lowerMessage.includes('i need') || lowerMessage.includes('i want')) {
    const nonsensicalWords = ['egg cry', 'random food', 'xyz', 'abc', 'weird', 'strange'];
    if (nonsensicalWords.some(word => lowerMessage.includes(word))) {
      console.log("🎯 Detected nonsensical food request");
      return 'off_topic';
    }
  }

  // Check for general food words (fruits, vegetables, common food items)
  const commonFoodWords = [
    // Fruits
    'mango', 'apple', 'banana', 'orange', 'grapes', 'strawberry', 'pineapple', 'watermelon', 'papaya', 'guava',
    // Vegetables
    'tomato', 'onion', 'potato', 'carrot', 'cabbage', 'spinach', 'broccoli', 'cauliflower', 'beans', 'peas',
    // Grains & Staples
    'wheat', 'corn', 'oats', 'quinoa', 'barley',
    // Proteins
    'paneer', 'tofu', 'eggs', 'fish', 'mutton', 'lamb',
    // Dairy
    'milk', 'cheese', 'butter', 'yogurt', 'cream',
    // Spices & Herbs
    'turmeric', 'cumin', 'coriander', 'ginger', 'garlic', 'chili', 'pepper',
    // Common dishes
    'curry', 'soup', 'stew', 'gravy', 'pickle', 'chutney',
    // Beverages
    'juice', 'smoothie', 'lassi', 'tea', 'coffee', 'shake',
    // Snacks
    'chips', 'crackers', 'nuts', 'popcorn'
  ];

  // Check if the message is a single food word or contains food words
  if (commonFoodWords.some(food => lowerMessage.includes(food)) && lowerMessage.length < 30) {
    console.log("🎯 Detected general food item");
    return 'generalFoodItem';
  }

  // Check if it's Eatzone-related at all
  if (intents.eatzone.some(keyword => lowerMessage.includes(keyword))) {
    return 'eatzone_general';
  }

  // Check if it might be feedback (short positive/negative words)
  const feedbackWords = ['amazing', 'good', 'excellent', 'great', 'awesome', 'fantastic', 'wonderful', 'nice', 'bad', 'poor', 'terrible', 'horrible', 'okay', 'fine', 'average', 'love', 'hate', 'best', 'worst', 'delicious', 'tasty', 'perfect', 'outstanding'];
  if (feedbackWords.some(word => lowerMessage.includes(word)) && lowerMessage.length < 50) {
    console.log("🎯 Detected potential feedback response");
    return 'feedbackResponse';
  }

  return 'off_topic';
};

// Helper function to get menu recommendations based on preferences
const getMenuRecommendations = (userMessage, allFoodItems) => {
  const lowerMessage = userMessage.toLowerCase();

  if (lowerMessage.includes('spicy') || lowerMessage.includes('hot')) {
    return allFoodItems.filter(item =>
      item.name.toLowerCase().includes('spicy') ||
      item.description.toLowerCase().includes('spicy')
    ).slice(0, 3);
  }

  if (lowerMessage.includes('sweet') || lowerMessage.includes('dessert')) {
    return allFoodItems.filter(item =>
      item.category.toLowerCase().includes('desert') ||
      item.category.toLowerCase().includes('cake')
    ).slice(0, 3);
  }

  if (lowerMessage.includes('healthy') || lowerMessage.includes('salad')) {
    return allFoodItems.filter(item =>
      item.category.toLowerCase().includes('salad') ||
      item.category.toLowerCase().includes('veg')
    ).slice(0, 3);
  }

  if (lowerMessage.includes('lunch') || lowerMessage.includes('dinner')) {
    return allFoodItems.filter(item =>
      item.category.toLowerCase().includes('pasta') ||
      item.category.toLowerCase().includes('roll') ||
      item.category.toLowerCase().includes('sandwich')
    ).slice(0, 3);
  }

  // Default recommendations
  return allFoodItems.slice(0, 3);
};

export const newChatWithBot = async (req, res) => {
  console.log("=== EATZONE OFFICIAL CHATBOT ===");

  // Check if API key is configured
  if (!isApiKeyValid) {
    return res.json({
      reply: "🤖 Chatbot is currently unavailable. Please contact support at +91 9876554321 for assistance."
    });
  }

  const { message, chatMode = 'support' } = req.body || {};
  const userId = req.body.userId || req.userId || "guest";

  // Sanitize user input to prevent prompt injection
  const sanitizedMessage = sanitizeInput(message);

  console.log("User:", userId, "| Mode:", chatMode);
  // Don't log the actual message for security reasons

  if (!sanitizedMessage) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    const userMessage = sanitizedMessage.trim();
    const intent = detectIntent(userMessage);

    console.log("📝 User message:", userMessage);
    console.log("🎯 Detected intent:", intent);

    // STEP 1: Check if query is Eatzone-related
    if (intent === 'off_topic') {
      console.log("❌ Off-topic query");
      return res.json({
        reply: "❓ I'm trained to answer only Eatzone-related queries like orders, payments, delivery, or food."
      });
    }

    // Fetch live data for processing with enhanced error handling
    console.log("🔍 Fetching data from database...");

    let allFoodItems = [];
    let userOrders = [];

    // Fetch food items with error handling
    try {
      allFoodItems = await foodModel.find({});
      console.log("📊 Available menu items:", allFoodItems.length);
    } catch (dbError) {
      console.error("❌ Database error fetching food items:", dbError);
      allFoodItems = [];
    }

    // Fetch user orders with error handling
    if (userId && userId !== "guest") {
      try {
        userOrders = await orderModel.find({ userId }).sort({ date: -1 }).limit(3);
        console.log("📦 User orders found:", userOrders.length);
      } catch (dbError) {
        console.error("❌ Database error fetching orders:", dbError);
        userOrders = [];
      }
    } else {
      console.log("📦 Guest user - no orders to fetch");
    }

    // Database error handling is already done in individual try-catch blocks above
    // Empty arrays are valid results (no food items or no orders for user)


    // STEP-BY-STEP INTENT PROCESSING
    console.log("🔄 Processing intent:", intent);

    // STEP 1: Order Cancellation (HIGH PRIORITY - check before order status)
    if (intent === 'cancelOrder') {
      console.log("❌ Order cancellation request");

      if (userOrders.length > 0) {
        const latestOrder = userOrders[0];
        const status = latestOrder.status || 'Food processing';

        console.log("📦 Order status for cancellation:", status);

        // According to prompt: if status is Processing or Food processing, it's too late
        if (status === 'Food processing' || status === 'Out for delivery' || status === 'Delivered' || status === 'Processing') {
          return res.json({
            reply: "❌ Sorry, it's too late to cancel. The order is being prepared or already out for delivery."
          });
        } else {
          // For Pending status, allow cancellation and update database
          try {
            await orderModel.findByIdAndUpdate(latestOrder._id, { status: 'Cancelled' });
            console.log("✅ Order cancelled successfully in database:", latestOrder._id);
            return res.json({
              reply: "✅ Your order has been cancelled successfully."
            });
          } catch (error) {
            console.error("❌ Failed to cancel order in database:", error);
            return res.json({
              reply: "❌ Failed to cancel order. Please contact support at +91 9876554321."
            });
          }
        }
      } else {
        return res.json({ reply: "I couldn't find your recent order. Please contact support at +91 9876554321." });
      }
    }

    // STEP 2: Order Status Queries
    if (intent === 'orderStatus') {
      console.log("📦 Order status request");

      if (userOrders.length > 0) {
        const latestOrder = userOrders[0];
        const orderItems = latestOrder.items || [];
        const itemsList = orderItems.map(item => `${item.name} x${item.quantity || 1}`).join(', ');
        const orderIdShort = latestOrder._id.toString().slice(-6).toUpperCase();

        const response = `📦 **Order Status:**\n\n` +
          `🆔 **Order ID**: ${orderIdShort}\n` +
          `📋 **Items**: ${itemsList}\n` +
          `📍 **Status**: ${latestOrder.status || 'Food processing'}\n` +
          `💵 **Payment**: ₹${latestOrder.amount}\n\n` +
          `Your order is being prepared and will be delivered soon.`;

        return res.json({ reply: response });
      } else {
        return res.json({ reply: "I couldn't fetch your order details. Please contact support at +91 9876554321." });
      }
    }

    // STEP 3: Refund Requests
    if (intent === 'refund') {
      console.log("💰 Refund request");

      if (userOrders.length > 0) {
        const latestOrder = userOrders[0];
        const status = latestOrder.status || 'Food processing';

        if (status === 'Delivered') {
          return res.json({
            reply: "Refunds are not possible after the order is delivered. For any issues with delivered food, please contact support at +91 9876554321."
          });
        } else {
          return res.json({
            reply: "Your refund will be processed in 3–5 business days. If you have any payment screenshot, please share it with our support team at +91 9876554321."
          });
        }
      } else {
        return res.json({
          reply: "I couldn't find your recent order. For refund assistance, please contact support at +91 9876554321."
        });
      }
    }

    // STEP 4: Delivery Time Queries
    if (intent === 'deliveryTime') {
      console.log("⏰ Delivery time query");
      return res.json({
        reply: "Your food is being prepared. Delivery usually takes 30–45 minutes after confirmation."
      });
    }

    // STEP 5: Payment Issues
    if (intent === 'payment') {
      console.log("💳 Payment query");
      return res.json({
        reply: "If the amount was deducted but order failed, please upload a screenshot. Refunds take 3–5 days. Contact support at +91 9876554321 for immediate assistance."
      });
    }

    // STEP 5: General Food Item Requests (fruits, vegetables, etc.)
    if (intent === 'generalFoodItem') {
      console.log("🍎 General food item request");

      try {
        const foodItem = userMessage.toLowerCase().trim();
        console.log("🔍 Searching for general food item:", foodItem);

        // Search for the specific food item in the database
        const requestedItems = allFoodItems.filter(item =>
          item.name.toLowerCase().includes(foodItem) ||
          item.category.toLowerCase().includes(foodItem) ||
          item.description?.toLowerCase().includes(foodItem)
        ).slice(0, 3);

        if (requestedItems.length > 0) {
          const itemsText = requestedItems.map(item => {
            return `ITEM:${item.name}|PRICE:₹${item.price}|CATEGORY:${item.category}`;
          }).join(' ');

          console.log("✅ Returning general food items:", itemsText);
          return res.json({ reply: itemsText });
        } else {
          // Provide helpful response for unavailable food items
          return res.json({
            reply: `🍽️ We don't currently have ${foodItem} on our menu, but we have many delicious options! Contact support at +91 9876554321 to see what's available or check our menu for similar items.`
          });
        }
      } catch (generalFoodError) {
        console.error("❌ General food error:", generalFoodError);
        return res.json({ reply: "I'm having trouble accessing our menu right now. Please contact support at +91 9876554321." });
      }
    }

    // STEP 6: Standalone Food Item Requests
    if (intent === 'standaloneFoodItem') {
      console.log("🍽️ Standalone food item request");

      try {
        const foodItem = userMessage.toLowerCase().trim();
        console.log("🔍 Searching for standalone food item:", foodItem);

        // Search for the specific food item in the database
        const requestedItems = allFoodItems.filter(item =>
          item.name.toLowerCase().includes(foodItem) ||
          item.category.toLowerCase().includes(foodItem) ||
          item.description?.toLowerCase().includes(foodItem)
        ).slice(0, 3);

        if (requestedItems.length > 0) {
          const itemsText = requestedItems.map(item => {
            return `ITEM:${item.name}|PRICE:₹${item.price}|CATEGORY:${item.category}`;
          }).join(' ');

          console.log("✅ Returning standalone food items:", itemsText);
          return res.json({ reply: itemsText });
        } else {
          return res.json({ reply: `Sorry, ${foodItem} is not available right now. Contact support at +91 9876554321 for more options or try our popular items.` });
        }
      } catch (standaloneError) {
        console.error("❌ Standalone food error:", standaloneError);
        return res.json({ reply: "I'm having trouble accessing our menu right now. Please contact support at +91 9876554321." });
      }
    }

    // STEP 7: App Features and Suggestions
    if (intent === 'appFeatures') {
      console.log("📱 App features request");
      return res.json({
        reply: "📱 **App Feature Suggestions:**\n\nThank you for your interest in improving Eatzone! We're always working to enhance your experience.\n\n🔄 **Current Features:**\n• Order tracking\n• Multiple payment options\n• Real-time delivery updates\n• Customer support chat\n\n💡 **Your suggestions matter!** Please contact our development team at +91 9876554321 or email feedback@eatzone.com with specific feature requests.\n\nWhat specific features would you like to see?"
      });
    }

    // STEP 8: Category-Specific Food Items
    if (intent === 'biryani' || intent === 'pizza' || intent === 'burger' || intent === 'cake' || intent === 'dessert' || intent === 'salad' || intent === 'rolls' || intent === 'sandwich' || intent === 'pasta' || intent === 'noodles') {
      console.log("🍽️ Category-specific request for:", intent);

      try {
        let categoryItems = [];

        if (intent === 'biryani') {
          console.log("🍛 Searching for biryani items");

          // First try to find items with "biryani" in the name (most specific)
          categoryItems = allFoodItems.filter(item =>
            item.name.toLowerCase().includes('biryani') ||
            item.name.toLowerCase().includes('biriyani')
          ).slice(0, 3);

          // If no biryani found, try category search
          if (categoryItems.length === 0) {
            categoryItems = allFoodItems.filter(item =>
              item.category.toLowerCase().includes('biryani') ||
              item.category.toLowerCase().includes('biriyani')
            ).slice(0, 3);
          }

          // If still no biryani, try broader rice search but exclude non-biryani items
          if (categoryItems.length === 0) {
            categoryItems = allFoodItems.filter(item =>
              (item.name.toLowerCase().includes('rice') &&
               !item.name.toLowerCase().includes('zucchini') &&
               !item.name.toLowerCase().includes('vegetable') &&
               !item.name.toLowerCase().includes('salad')) ||
              item.category.toLowerCase().includes('rice')
            ).slice(0, 3);
          }

          console.log("🔍 Found biryani items:", categoryItems.length);
          if (categoryItems.length > 0) {
            console.log("📋 Biryani items found:", categoryItems.map(item => item.name));
          }

          if (categoryItems.length === 0) {
            return res.json({ reply: "Sorry, biryani is not available right now. We have other delicious rice dishes available. Contact support at +91 9876554321 for more options." });
          }
        } else if (intent === 'pizza') {
          categoryItems = allFoodItems.filter(item =>
            item.name.toLowerCase().includes('pizza') ||
            item.category.toLowerCase().includes('pizza')
          ).slice(0, 3);

          if (categoryItems.length === 0) {
            return res.json({ reply: "Sorry, pizza is not available right now. Try our delicious rolls or sandwiches instead, or contact support at +91 9876554321." });
          }
        } else if (intent === 'burger') {
          categoryItems = allFoodItems.filter(item =>
            item.name.toLowerCase().includes('burger') ||
            item.category.toLowerCase().includes('burger')
          ).slice(0, 3);

          if (categoryItems.length === 0) {
            return res.json({ reply: "Sorry, burger is not available right now. Try our tasty sandwiches or rolls instead, or contact support at +91 9876554321." });
          }
        } else if (intent === 'cake') {
          categoryItems = allFoodItems.filter(item =>
            item.category.toLowerCase().includes('cake') ||
            item.name.toLowerCase().includes('cake')
          ).slice(0, 3);

          if (categoryItems.length === 0) {
            return res.json({ reply: "Sorry, cake is not available right now. Try our other desserts or contact support at +91 9876554321." });
          }
        } else if (intent === 'dessert') {
          categoryItems = allFoodItems.filter(item =>
            item.category.toLowerCase().includes('desert') ||
            item.category.toLowerCase().includes('cake') ||
            item.name.toLowerCase().includes('chocolate') ||
            item.name.toLowerCase().includes('ice cream')
          ).slice(0, 3);

          if (categoryItems.length === 0) {
            return res.json({ reply: "Sorry, desserts are not available right now. Contact support at +91 9876554321 for more options." });
          }
        } else if (intent === 'salad') {
          categoryItems = allFoodItems.filter(item =>
            item.category.toLowerCase().includes('salad') ||
            item.name.toLowerCase().includes('salad')
          ).slice(0, 3);

          if (categoryItems.length === 0) {
            return res.json({ reply: "Sorry, salad is not available right now. Try our other healthy options or contact support at +91 9876554321." });
          }
        } else if (intent === 'rolls') {
          categoryItems = allFoodItems.filter(item =>
            item.category.toLowerCase().includes('roll') ||
            item.name.toLowerCase().includes('roll')
          ).slice(0, 3);

          if (categoryItems.length === 0) {
            return res.json({ reply: "Sorry, rolls are not available right now. Try our sandwiches or contact support at +91 9876554321." });
          }
        } else if (intent === 'sandwich') {
          categoryItems = allFoodItems.filter(item =>
            item.category.toLowerCase().includes('sandwich') ||
            item.name.toLowerCase().includes('sandwich')
          ).slice(0, 3);

          if (categoryItems.length === 0) {
            return res.json({ reply: "Sorry, sandwich is not available right now. Try our rolls or contact support at +91 9876554321." });
          }
        } else if (intent === 'pasta') {
          categoryItems = allFoodItems.filter(item =>
            item.category.toLowerCase().includes('pasta') ||
            item.category.toLowerCase().includes('noodle') ||
            item.name.toLowerCase().includes('pasta') ||
            item.name.toLowerCase().includes('noodle')
          ).slice(0, 3);

          if (categoryItems.length === 0) {
            return res.json({ reply: "Sorry, pasta is not available right now. Try our other main dishes or contact support at +91 9876554321." });
          }
        } else if (intent === 'noodles') {
          categoryItems = allFoodItems.filter(item =>
            item.name.toLowerCase().includes('noodle') ||
            item.category.toLowerCase().includes('noodle')
          ).slice(0, 3);

          if (categoryItems.length === 0) {
            return res.json({ reply: "Sorry, noodles are not available right now. Try our pasta or other main dishes, or contact support at +91 9876554321." });
          }
        }

        console.log("🎯 Found", categoryItems.length, "items for category:", intent);

        if (categoryItems.length > 0) {
          const itemsText = categoryItems.map(item => {
            return `ITEM:${item.name}|PRICE:₹${item.price}|CATEGORY:${item.category}`;
          }).join(' ');

          console.log("✅ Returning category items:", itemsText);
          return res.json({ reply: itemsText });
        }
      } catch (categoryError) {
        console.error("❌ Category error:", categoryError);
        return res.json({ reply: "I'm having trouble accessing our menu right now. Please contact support at +91 9876554321." });
      }
    }

    // STEP 8: General Food Requests (i need, i want, etc.)
    if (intent === 'foodRequest') {
      console.log("🍽️ General food request");

      try {
        // Check what specific food they're asking for
        const lowerMessage = userMessage.toLowerCase();
        let requestedItems = [];

        // Check for specific food items in the request
        if (lowerMessage.includes('biryani')) {
          console.log("🍛 Searching for biryani in foodRequest handler");

          // First try to find items with "biryani" in the name
          requestedItems = allFoodItems.filter(item =>
            item.name.toLowerCase().includes('biryani') ||
            item.name.toLowerCase().includes('biriyani')
          ).slice(0, 3);

          // If no biryani found, try broader search but exclude non-biryani items
          if (requestedItems.length === 0) {
            requestedItems = allFoodItems.filter(item =>
              (item.name.toLowerCase().includes('rice') &&
               !item.name.toLowerCase().includes('zucchini') &&
               !item.name.toLowerCase().includes('vegetable') &&
               !item.name.toLowerCase().includes('salad')) ||
              item.category.toLowerCase().includes('biryani')
            ).slice(0, 3);
          }

          if (requestedItems.length === 0) {
            return res.json({ reply: "Sorry, biryani is not available right now. Contact support at +91 9876554321 for more options." });
          }
        } else if (lowerMessage.includes('pizza')) {
          requestedItems = allFoodItems.filter(item =>
            item.name.toLowerCase().includes('pizza')
          ).slice(0, 3);

          if (requestedItems.length === 0) {
            return res.json({ reply: "Sorry, pizza is not available right now. Try our rolls or sandwiches instead." });
          }
        } else if (lowerMessage.includes('burger')) {
          requestedItems = allFoodItems.filter(item =>
            item.name.toLowerCase().includes('burger')
          ).slice(0, 3);

          if (requestedItems.length === 0) {
            return res.json({ reply: "Sorry, burger is not available right now. Try our sandwiches or rolls instead." });
          }
        } else if (lowerMessage.includes('salad')) {
          requestedItems = allFoodItems.filter(item =>
            item.name.toLowerCase().includes('salad')
          ).slice(0, 3);

          if (requestedItems.length === 0) {
            return res.json({ reply: "Sorry, salad is not available right now. Contact support at +91 9876554321 for healthy options." });
          }
        } else {
          // Extract the food item name from the request
          let foodItem = '';
          if (lowerMessage.includes('i want ')) {
            foodItem = lowerMessage.replace('i want ', '').trim();
          } else if (lowerMessage.includes('i need ')) {
            foodItem = lowerMessage.replace('i need ', '').trim();
          } else if (lowerMessage.includes('give me ')) {
            foodItem = lowerMessage.replace('give me ', '').trim();
          } else if (lowerMessage.includes('show me ')) {
            foodItem = lowerMessage.replace('show me ', '').trim();
          }

          console.log("🔍 Searching for food item:", foodItem);

          // Search for the specific food item in the database
          if (foodItem) {
            requestedItems = allFoodItems.filter(item =>
              item.name.toLowerCase().includes(foodItem) ||
              item.category.toLowerCase().includes(foodItem) ||
              item.description?.toLowerCase().includes(foodItem)
            ).slice(0, 3);

            if (requestedItems.length === 0) {
              return res.json({ reply: `Sorry, ${foodItem} is not available right now. Contact support at +91 9876554321 for more options or try our popular items.` });
            }
          } else {
            // General food request - show popular items
            requestedItems = allFoodItems.slice(0, 3);
          }
        }

        if (requestedItems.length > 0) {
          const itemsText = requestedItems.map(item => {
            return `ITEM:${item.name}|PRICE:₹${item.price}|CATEGORY:${item.category}`;
          }).join(' ');

          return res.json({ reply: itemsText });
        } else {
          return res.json({ reply: "Let me show you our popular food items!" });
        }
      } catch (requestError) {
        console.error("❌ Food request error:", requestError);
        return res.json({ reply: "I'm having trouble accessing our menu right now. Please contact support at +91 9876554321." });
      }
    }

    // STEP 9: General Food Recommendations
    if (intent === 'recommend' || intent === 'spicy' || intent === 'light' || intent === 'breakfast' || intent === 'menu') {
      console.log("🍽️ Food recommendation request for intent:", intent);

      try {
        let recommendedItems = [];

        if (intent === 'spicy') {
          recommendedItems = allFoodItems.filter(item =>
            item.name.toLowerCase().includes('spicy') ||
            item.name.toLowerCase().includes('biryani') ||
            item.description?.toLowerCase().includes('spicy')
          ).slice(0, 3);

          if (recommendedItems.length === 0) {
            return res.json({ reply: "Try our Veg Biryani — it's a popular spicy choice with aromatic rice and vegetables!" });
          }
        } else if (intent === 'light') {
          recommendedItems = allFoodItems.filter(item =>
            item.category.toLowerCase().includes('salad') ||
            item.name.toLowerCase().includes('salad')
          ).slice(0, 3);

          if (recommendedItems.length === 0) {
            return res.json({ reply: "Try our fresh salads — perfect for a light and healthy meal!" });
          }
        } else {
          // General recommendations or menu
          recommendedItems = allFoodItems.slice(0, 3);
        }

        console.log("🎯 Found", recommendedItems.length, "recommended items");

        if (recommendedItems.length > 0) {
          const itemsText = recommendedItems.map(item => {
            return `ITEM:${item.name}|PRICE:₹${item.price}|CATEGORY:${item.category}`;
          }).join(' ');

          console.log("✅ Returning recommendations:", itemsText);
          return res.json({ reply: itemsText });
        } else {
          return res.json({ reply: "I couldn't find specific items for your preference. Please contact support at +91 9876554321 for personalized recommendations." });
        }
      } catch (recError) {
        console.error("❌ Recommendation error:", recError);
        return res.json({ reply: "I'm having trouble accessing our menu right now. Please contact support at +91 9876554321." });
      }
    }

    // STEP 8: Feedback Collection
    if (intent === 'feedback') {
      console.log("📝 Feedback request");
      return res.json({
        reply: "📝 We'd love your feedback! How was the food and delivery? Please share your experience with us."
      });
    }

    // STEP 8.1: Feedback Response Acknowledgment
    if (intent === 'feedbackResponse') {
      console.log("📝 User providing feedback");

      const lowerMessage = userMessage.toLowerCase();
      let response = "";

      // Positive feedback
      if (lowerMessage.includes('amazing') || lowerMessage.includes('excellent') || lowerMessage.includes('great') ||
          lowerMessage.includes('awesome') || lowerMessage.includes('fantastic') || lowerMessage.includes('wonderful') ||
          lowerMessage.includes('perfect') || lowerMessage.includes('love') || lowerMessage.includes('best') ||
          lowerMessage.includes('delicious') || lowerMessage.includes('tasty') || lowerMessage.includes('outstanding')) {
        response = "🌟 Thank you for the wonderful feedback! We're thrilled you had such a great experience with Eatzone. Your positive review motivates our team to keep delivering excellence!";
      }
      // Negative feedback
      else if (lowerMessage.includes('bad') || lowerMessage.includes('poor') || lowerMessage.includes('terrible') ||
               lowerMessage.includes('horrible') || lowerMessage.includes('hate') || lowerMessage.includes('worst') ||
               lowerMessage.includes('disappointing') || lowerMessage.includes('not good') || lowerMessage.includes('cold') ||
               lowerMessage.includes('late') || lowerMessage.includes('delayed') || lowerMessage.includes('slow')) {
        response = "😔 We sincerely apologize for not meeting your expectations. Your feedback is valuable and helps us improve. Please contact our support team at +91 9876554321 so we can make this right.";
      }
      // Neutral/Average feedback
      else if (lowerMessage.includes('good') || lowerMessage.includes('nice') || lowerMessage.includes('okay') ||
               lowerMessage.includes('fine') || lowerMessage.includes('average') || lowerMessage.includes('satisfactory')) {
        response = "👍 Thank you for your feedback! We appreciate you taking the time to share your experience. We're always working to improve and would love to exceed your expectations next time!";
      }
      // General acknowledgment
      else {
        response = "📝 Thank you for sharing your feedback with us! Every review helps us serve you better. Is there anything specific about your order or delivery experience you'd like to tell us?";
      }

      return res.json({ reply: response });
    }

    // STEP 9: Delivery Issues
    if (intent === 'delivery') {
      console.log("🚚 Delivery query");
      return res.json({
        reply: "⏳ Your order will arrive in 30–45 minutes. You'll be notified once it's out for delivery. For delivery issues, contact +91 9876554321."
      });
    }

    // STEP 9: Ordering Help
    if (intent === 'orderHelp') {
      console.log("📋 Ordering help request");
      return res.json({
        reply: "🛒 **How to Place an Order:**\n\n1️⃣ Browse our menu\n\n2️⃣ Add items to cart\n\n3️⃣ Proceed to checkout\n\n4️⃣ Enter delivery details\n\n5️⃣ Complete payment\n\n6️⃣ Track your order\n\nNeed help with a specific step?"
      });
    }

    // STEP 10: After Adding to Cart Help
    if (intent === 'afterCart') {
      console.log("🛒 After cart help request");
      return res.json({
        reply: "🛒 **After Adding Items to Cart:**\n\n1️⃣ **Review Cart**: Click the cart icon to see your items\n\n2️⃣ **Check Quantities**: Adjust amounts if needed\n\n3️⃣ **Proceed to Checkout**: Click 'PROCEED TO CHECKOUT'\n\n4️⃣ **Enter Address**: Fill delivery details\n\n5️⃣ **Complete Payment**: Pay securely\n\n6️⃣ **Track Order**: Monitor your order status\n\nYour items are saved automatically!"
      });
    }

    // STEP 8: General Eatzone queries (fallback for recognized Eatzone topics)
    if (intent === 'eatzone_general') {
      console.log("🔄 General Eatzone query");

      const lowerMessage = userMessage.toLowerCase();

      // Check for specific food requests that might have been missed
      if (lowerMessage.includes('i need') || lowerMessage.includes('i want') || lowerMessage.includes('give me') || lowerMessage.includes('show me')) {
        console.log("🍽️ Detected food request in general handler");

        let requestedItems = [];

        // Check for specific food items
        if (lowerMessage.includes('biryani')) {
          console.log("🍛 Searching for biryani in general handler");

          // First try to find items with "biryani" in the name
          requestedItems = allFoodItems.filter(item =>
            item.name.toLowerCase().includes('biryani') ||
            item.name.toLowerCase().includes('biriyani')
          ).slice(0, 3);

          // If no biryani found, try broader search but exclude non-biryani items
          if (requestedItems.length === 0) {
            requestedItems = allFoodItems.filter(item =>
              (item.name.toLowerCase().includes('rice') &&
               !item.name.toLowerCase().includes('zucchini') &&
               !item.name.toLowerCase().includes('vegetable') &&
               !item.name.toLowerCase().includes('salad')) ||
              item.category.toLowerCase().includes('biryani')
            ).slice(0, 3);
          }

          if (requestedItems.length === 0) {
            return res.json({ reply: "Sorry, biryani is not available right now. Contact support at +91 9876554321 for more options." });
          }
        } else if (lowerMessage.includes('pizza')) {
          requestedItems = allFoodItems.filter(item =>
            item.name.toLowerCase().includes('pizza')
          ).slice(0, 3);

          if (requestedItems.length === 0) {
            return res.json({ reply: "Sorry, pizza is not available right now. Try our rolls or sandwiches instead." });
          }
        } else if (lowerMessage.includes('burger')) {
          requestedItems = allFoodItems.filter(item =>
            item.name.toLowerCase().includes('burger')
          ).slice(0, 3);

          if (requestedItems.length === 0) {
            return res.json({ reply: "Sorry, burger is not available right now. Try our sandwiches or rolls instead." });
          }
        } else if (lowerMessage.includes('noodles')) {
          requestedItems = allFoodItems.filter(item =>
            item.name.toLowerCase().includes('noodle') ||
            item.category.toLowerCase().includes('noodle')
          ).slice(0, 3);

          if (requestedItems.length === 0) {
            return res.json({ reply: "Sorry, noodles are not available right now. Try our pasta or other main dishes." });
          }
        } else {
          // Check if it's a nonsensical request like "egg cry"
          const nonsensicalWords = ['egg cry', 'random', 'xyz', 'abc'];
          if (nonsensicalWords.some(word => lowerMessage.includes(word))) {
            return res.json({ reply: "❓ I'm trained to answer only Eatzone-related queries like orders, payments, delivery, or food." });
          }

          // Extract the food item name from the request
          let foodItem = '';
          if (lowerMessage.includes('i want ')) {
            foodItem = lowerMessage.replace('i want ', '').trim();
          } else if (lowerMessage.includes('i need ')) {
            foodItem = lowerMessage.replace('i need ', '').trim();
          } else if (lowerMessage.includes('give me ')) {
            foodItem = lowerMessage.replace('give me ', '').trim();
          } else if (lowerMessage.includes('show me ')) {
            foodItem = lowerMessage.replace('show me ', '').trim();
          }

          console.log("🔍 Searching for food item:", foodItem);

          // Search for the specific food item in the database
          if (foodItem) {
            requestedItems = allFoodItems.filter(item =>
              item.name.toLowerCase().includes(foodItem) ||
              item.category.toLowerCase().includes(foodItem) ||
              item.description?.toLowerCase().includes(foodItem)
            ).slice(0, 3);

            if (requestedItems.length === 0) {
              return res.json({ reply: `Sorry, ${foodItem} is not available right now. Contact support at +91 9876554321 for more options or try our popular items.` });
            }
          } else {
            // General food request - show popular items
            requestedItems = allFoodItems.slice(0, 3);
          }
        }

        if (requestedItems.length > 0) {
          const itemsText = requestedItems.map(item => {
            return `ITEM:${item.name}|PRICE:₹${item.price}|CATEGORY:${item.category}`;
          }).join(' ');

          return res.json({ reply: itemsText });
        }
      }

      // Check for menu/food browsing
      if (lowerMessage.includes('menu') || lowerMessage.includes('food items')) {
        const popularItems = allFoodItems.slice(0, 3);
        if (popularItems.length > 0) {
          const itemsText = popularItems.map(item => {
            return `ITEM:${item.name}|PRICE:₹${item.price}|CATEGORY:${item.category}`;
          }).join(' ');

          return res.json({ reply: itemsText });
        }
      }

      // General helpful response
      return res.json({
        reply: "I'm here to help with your Eatzone experience! I can assist with:\n\n" +
               "📦 Order status and tracking\n" +
               "❌ Order cancellation\n" +
               "💰 Refunds and payments\n" +
               "🍽️ Food recommendations\n" +
               "📝 Feedback collection\n\n" +
               "What can I help you with today?"
      });
    }



    // STEP 9: Final fallback for unhandled Eatzone queries
    console.log("❓ Unhandled query, routing to support");
    return res.json({
      reply: "I couldn't understand your specific request. Please contact our support team at +91 9876554321 for personalized assistance with your Eatzone order or account."
    });

  } catch (err) {
    console.error("🚨 EATZONE CHATBOT ERROR:", err);

    // Professional error response
    res.json({
      reply: "I'm experiencing technical difficulties right now. Please contact our support team at +91 9876554321 for immediate assistance with your Eatzone order or account."
    });
  }
};
