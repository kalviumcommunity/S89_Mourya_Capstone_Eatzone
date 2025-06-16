// Test the fixed chatbot issues
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
    
    // Ordering help - specific patterns
    orderHelp: ['how to order', 'place order', 'ordering process'],
    afterCart: ['how to order items after adding to cart', 'after adding to cart', 'what to do after adding', 'next step after cart'],
    
    // Food category intents (SPECIFIC CATEGORIES)
    cake: ['cake', 'i want cake', 'cakes', 'birthday cake'],
    dessert: ['dessert', 'desserts', 'sweet', 'chocolate'],
    salad: ['salad', 'salads', 'healthy', 'green'],
    rolls: ['roll', 'rolls', 'wrap', 'wraps'],
    sandwich: ['sandwich', 'sandwiches'],
    pasta: ['pasta', 'spaghetti', 'noodles'],
    pizza: ['pizza', 'pizzas'],
    
    // Food recommendation intents
    recommend: ['recommend me food', 'recommend', 'suggest', 'what to eat', 'food recommendation'],
    spicy: ['spicy food', 'spicy', 'hot food'],
    light: ['light', 'diet'],
    breakfast: ['breakfast', 'morning food'],
    
    // Feedback intents
    feedback: ['food quality feedback', 'overall rating', 'feedback', 'delivery feedback', 'experience', 'review', 'rating'],
    
    // Menu browsing
    menu: ['food items', 'menu', 'show menu', 'what food'],
    
    // General Eatzone keywords (LOWEST PRIORITY)
    eatzone: ['order', 'food', 'delivery', 'eatzone', 'dish', 'meal', 'restaurant']
  };
  
  // Check for specific intents first with exact matching
  for (const [intent, keywords] of Object.entries(intents)) {
    if (intent !== 'eatzone') {
      for (const keyword of keywords) {
        if (lowerMessage.includes(keyword)) {
          console.log(`🎯 Intent "${intent}" matched keyword: "${keyword}"`);
          return intent;
        }
      }
    }
  }
  
  // Check if it's Eatzone-related at all
  if (intents.eatzone.some(keyword => lowerMessage.includes(keyword))) {
    return 'eatzone_general';
  }
  
  return 'off_topic';
};

// Test the specific issues mentioned
const testCases = [
  { query: "status", expected: "orderStatus" },
  { query: "how to order items after adding to cart", expected: "afterCart" },
  { query: "cake", expected: "cake" },
  { query: "i want cake", expected: "cake" },
  { query: "food items", expected: "menu" },
  { query: "Cancel my order", expected: "cancelOrder" },
  { query: "order status", expected: "orderStatus" }
];

console.log("🧪 Testing Fixed Issues:\n");

testCases.forEach(test => {
  const intent = detectIntent(test.query);
  const status = intent === test.expected ? "✅ PASS" : "❌ FAIL";
  console.log(`${status} "${test.query}" → ${intent} (expected: ${test.expected})`);
});
