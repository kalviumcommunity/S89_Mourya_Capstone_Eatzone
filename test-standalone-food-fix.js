// Test standalone food item detection and app features
const detectIntent = (message) => {
  const lowerMessage = message.toLowerCase();
  
  // Intent patterns with priority order
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
    
    // Standalone food items (without "i want/i need")
    standaloneFoodItem: ['dal curry', 'egg curry', 'chicken curry', 'paneer curry', 'curd rice', 'fried rice', 'chicken rice', 'mutton curry', 'fish curry', 'sambar', 'rasam', 'chapati', 'roti', 'paratha'],
    
    // Food category intents (SPECIFIC CATEGORIES)
    biryani: ['biryani', 'i need biryani', 'i want biryani', 'biriyani', 'rice'],
    pizza: ['pizza', 'i need pizza', 'i want pizza', 'pizzas'],
    burger: ['burger', 'i need burger', 'i want burger', 'burgers'],
    noodles: ['noodles', 'i need noodles', 'i want noodles'],
    cake: ['cake', 'i want cake', 'cakes', 'birthday cake'],
    dessert: ['dessert', 'desserts', 'sweet', 'chocolate'],
    salad: ['salad', 'salads', 'healthy', 'green'],
    rolls: ['roll', 'rolls', 'wrap', 'wraps'],
    sandwich: ['sandwich', 'sandwiches'],
    pasta: ['pasta', 'spaghetti'],
    
    // Specific food requests
    foodRequest: ['i need', 'i want', 'give me', 'show me', 'looking for'],
    
    // App-related queries
    appFeatures: ['add more features', 'new features', 'app features', 'improve app', 'app suggestions', 'app feedback'],
    
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

// Test the specific issues reported
const reportedIssues = [
  { query: "dal curry", expected: "standaloneFoodItem", note: "Should detect standalone food item" },
  { query: "egg curry", expected: "standaloneFoodItem", note: "Should detect standalone food item" },
  { query: "curd rice", expected: "standaloneFoodItem", note: "Should detect standalone food item" },
  { query: "can you add more features", expected: "appFeatures", note: "Should detect app feature request" },
  { query: "i want dal curry", expected: "foodRequest", note: "Should still work with 'i want'" },
  { query: "i want curd rice", expected: "foodRequest", note: "Should still work with 'i want'" },
  { query: "good", expected: "feedbackResponse", note: "Should still work for feedback" }
];

console.log("🧪 Testing Standalone Food and App Features:\n");

reportedIssues.forEach(test => {
  const intent = detectIntent(test.query);
  const status = intent === test.expected ? "✅ PASS" : "❌ FAIL";
  console.log(`${status} "${test.query}" → ${intent} (expected: ${test.expected}) - ${test.note}`);
});
