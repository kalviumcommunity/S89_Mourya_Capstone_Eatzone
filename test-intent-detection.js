// Test intent detection logic
const detectIntent = (message) => {
  const lowerMessage = message.toLowerCase();
  
  // Intent patterns with priority order - EXACT matches for user queries
  const intents = {
    // Order management intents (HIGH PRIORITY - check first)
    cancelOrder: ['cancel my order', 'cancel order', 'how to cancel', 'how to vcancel', 'want to cancel', 'stop order', 'i said cancel'],
    orderStatus: ['order status', 'where is my order', 'track order', 'order update', 'my order'],
    refund: ['refund', 'money back', 'return money', 'get refund'],
    deliveryTime: ['how much time for delivery', 'how much time', 'delivery time', 'when will arrive', 'how long', 'eta'],
    payment: ['payment related', 'payment', 'payment failed', 'money deducted', 'payment issue'],
    delivery: ['delivery', 'delivery problem', 'late delivery', 'delivery issue'],
    
    // Food recommendation intents
    recommend: ['recommend me food', 'recommend', 'suggest', 'what to eat', 'food recommendation'],
    spicy: ['spicy food', 'spicy', 'hot food'],
    sweet: ['sweet', 'dessert', 'chocolate', 'cake'],
    light: ['light', 'salad', 'healthy', 'diet'],
    breakfast: ['breakfast', 'morning food'],
    
    // Feedback intents
    feedback: ['food quality feedback', 'overall rating', 'feedback', 'delivery feedback', 'experience', 'review', 'rating'],
    
    // Ordering help
    orderHelp: ['how to order', 'place order', 'ordering process'],
    
    // General Eatzone keywords (LOWEST PRIORITY)
    eatzone: ['order', 'food', 'delivery', 'menu', 'eatzone', 'dish', 'meal', 'restaurant']
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

// Test cases
const testCases = [
  "Cancel my order",
  "i said cancel my order", 
  "how to vcancel my order",
  "order status",
  "spicy food",
  "overall rating",
  "delivery",
  "how to order"
];

console.log("🧪 Testing Intent Detection:\n");

testCases.forEach(testCase => {
  const intent = detectIntent(testCase);
  console.log(`"${testCase}" → ${intent}`);
});
