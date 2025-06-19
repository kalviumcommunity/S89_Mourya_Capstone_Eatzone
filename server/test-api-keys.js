import dotenv from 'dotenv';
import { GoogleGenerativeAI } from "@google/generative-ai";
import Stripe from "stripe";

// Load environment variables
dotenv.config();

console.log('=== API Keys Test ===\n');

// Test environment variables loading
console.log('Environment Variables:');
console.log(`GEMINI_API_KEY: ${process.env.GEMINI_API_KEY ? '✓ Set (value hidden)' : '✗ Not set'}`);
console.log(`STRIPE_SECRET_KEY: ${process.env.STRIPE_SECRET_KEY ? '✓ Set (value hidden)' : '✗ Not set'}\n`);

// Test Gemini API
async function testGeminiAPI() {
    console.log('Testing Gemini API...');
    
    if (!process.env.GEMINI_API_KEY) {
        console.log('❌ Gemini API Key not found');
        return false;
    }
    
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        
        const result = await model.generateContent("Say hello in one word");
        const response = result.response.text();
        
        console.log('✅ Gemini API working! Response:', response.trim());
        return true;
    } catch (error) {
        console.log('❌ Gemini API Error:', error.message);
        return false;
    }
}

// Test Stripe API
async function testStripeAPI() {
    console.log('Testing Stripe API...');
    
    if (!process.env.STRIPE_SECRET_KEY) {
        console.log('❌ Stripe Secret Key not found');
        return false;
    }
    
    try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        
        // Test by retrieving account information
        const account = await stripe.accounts.retrieve();
        
        console.log('✅ Stripe API working! Account ID:', account.id);
        return true;
    } catch (error) {
        console.log('❌ Stripe API Error:', error.message);
        return false;
    }
}

// Run tests
async function runTests() {
    const geminiWorking = await testGeminiAPI();
    console.log('');
    const stripeWorking = await testStripeAPI();
    
    console.log('\n=== Test Results ===');
    console.log(`Gemini API: ${geminiWorking ? '✅ Working' : '❌ Failed'}`);
    console.log(`Stripe API: ${stripeWorking ? '✅ Working' : '❌ Failed'}`);
    
    if (geminiWorking && stripeWorking) {
        console.log('\n🎉 All APIs are working correctly!');
    } else {
        console.log('\n⚠️  Some APIs need attention. Check the errors above.');
    }
}

runTests().catch(console.error);
