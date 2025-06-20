// Simple test to check if the improved chatbot is working
import fetch from 'node-fetch';

const testChatbot = async () => {
  console.log("🤖 Testing Eatzone Chatbot...\n");
  
  const testQueries = [
    { message: "hello", expected: "greeting" },
    { message: "recommend chicken", expected: "chicken recommendations" },
    { message: "desserts", expected: "dessert recommendations" },
    { message: "how to order", expected: "ordering process" },
    { message: "refund", expected: "refund information" },
    { message: "delivery time", expected: "delivery info" },
    { message: "menu", expected: "menu categories" }
  ];
  
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
          userId: "test-user"
        })
      });
      
      if (!response.ok) {
        console.log(`❌ HTTP Error: ${response.status}`);
        continue;
      }
      
      const data = await response.json();
      console.log(`✅ Response: ${data.reply}`);
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log("\n🎉 Chatbot testing completed!");
};

testChatbot().catch(console.error);
