// Simple test to check chatbot functionality
import fetch from 'node-fetch';

const testChatbot = async () => {
  console.log("Testing chatbot...");
  
  try {
    // Test 1: Ordering question
    console.log("\n=== Test 1: Ordering Question ===");
    const response1 = await fetch('http://localhost:4000/api/chatbot/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'how to order after adding items to cart',
        chatMode: 'recommendations'
      })
    });
    
    const data1 = await response1.json();
    console.log("Response:", data1.reply);
    
    // Test 2: Desserts question
    console.log("\n=== Test 2: Desserts Question ===");
    const response2 = await fetch('http://localhost:4000/api/chatbot/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'desserts',
        chatMode: 'recommendations'
      })
    });
    
    const data2 = await response2.json();
    console.log("Response:", data2.reply);
    
    // Test 3: Popular items
    console.log("\n=== Test 3: Popular Items ===");
    const response3 = await fetch('http://localhost:4000/api/chatbot/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'popular items',
        chatMode: 'recommendations'
      })
    });
    
    const data3 = await response3.json();
    console.log("Response:", data3.reply);
    
  } catch (error) {
    console.error("Error testing chatbot:", error);
  }
};

testChatbot();
