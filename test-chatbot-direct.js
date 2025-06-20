// Direct test of the improved chatbot logic
import { chatWithBot } from './server/controllers/newChatbotController.js';

// Mock request and response objects
const createMockReq = (message) => ({
  body: {
    message: message,
    userId: "test-user"
  }
});

const createMockRes = () => {
  let responseData = null;
  return {
    json: (data) => {
      responseData = data;
      console.log(`✅ Response: ${data.reply}`);
    },
    status: (code) => ({
      json: (data) => {
        responseData = data;
        console.log(`❌ Error ${code}: ${data.error || data.reply}`);
      }
    }),
    getResponse: () => responseData
  };
};

const testQueries = [
  "hello",
  "chicken", 
  "something with chicken",
  "recommend chicken",
  "desserts",
  "cake",
  "veg items",
  "rolls",
  "salad",
  "pizza",
  "pasta",
  "recommend me food",
  "what's popular",
  "spicy food"
];

console.log("🤖 Testing Improved Chatbot Logic...\n");

for (const query of testQueries) {
  console.log(`\n=== Testing: "${query}" ===`);
  
  try {
    const req = createMockReq(query);
    const res = createMockRes();
    
    await chatWithBot(req, res);
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

console.log("\n🎉 Chatbot testing completed!");
