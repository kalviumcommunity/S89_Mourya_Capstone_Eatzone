// Quick test to debug chatbot issues
import fetch from 'node-fetch';

const testQueries = [
  { message: "How much time for delivery", expected: "delivery time response" },
  { message: "payment related", expected: "payment response" },
  { message: "spicy food", expected: "spicy food recommendations" },
  { message: "recommend me food", expected: "food recommendations" },
  { message: "food quality feedback", expected: "feedback response" }
];

const testChatbot = async () => {
  console.log("🧪 Testing Eatzone Chatbot...\n");
  
  for (const test of testQueries) {
    console.log(`\n=== Testing: "${test.message}" ===`);
    
    try {
      const response = await fetch('http://localhost:4000/api/chatbot/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: test.message,
          chatMode: 'support'
        })
      });
      
      if (!response.ok) {
        console.log(`❌ HTTP Error: ${response.status}`);
        continue;
      }
      
      const data = await response.json();
      console.log(`✅ Response: ${data.reply.substring(0, 100)}...`);
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
  }
};

// Run test if server is available
testChatbot().catch(err => {
  console.error("Test failed:", err.message);
  console.log("Make sure the server is running on http://localhost:4000");
});
