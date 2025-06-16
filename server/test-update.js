import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

const testUpdateEndpoint = async () => {
    try {
        console.log('🧪 Testing food update endpoint...');
        
        // First, get the list of food items to find one to update
        console.log('📋 Fetching food list...');
        const listResponse = await axios.get('http://localhost:4000/api/food/list');
        
        if (!listResponse.data.success || listResponse.data.data.length === 0) {
            console.log('❌ No food items found to test update');
            return;
        }
        
        const firstItem = listResponse.data.data[0];
        console.log('✅ Found food item to update:', firstItem.name);
        console.log('📝 Current details:', {
            id: firstItem._id,
            name: firstItem.name,
            price: firstItem.price,
            category: firstItem.category
        });
        
        // Test update without image
        console.log('\n🔄 Testing update without image...');
        const formData = new FormData();
        formData.append('id', firstItem._id);
        formData.append('name', firstItem.name + ' (Updated)');
        formData.append('description', 'Updated description for testing');
        formData.append('price', firstItem.price + 1);
        formData.append('category', firstItem.category);
        
        const updateResponse = await axios.post('http://localhost:4000/api/food/update', formData, {
            headers: {
                ...formData.getHeaders(),
            },
        });
        
        console.log('📤 Update response:', updateResponse.data);
        
        if (updateResponse.data.success) {
            console.log('✅ Update successful!');
            
            // Verify the update by fetching the list again
            console.log('\n🔍 Verifying update...');
            const verifyResponse = await axios.get('http://localhost:4000/api/food/list');
            const updatedItem = verifyResponse.data.data.find(item => item._id === firstItem._id);
            
            if (updatedItem) {
                console.log('✅ Verification successful!');
                console.log('📝 Updated details:', {
                    id: updatedItem._id,
                    name: updatedItem.name,
                    price: updatedItem.price,
                    category: updatedItem.category
                });
            } else {
                console.log('❌ Could not find updated item');
            }
        } else {
            console.log('❌ Update failed:', updateResponse.data.message);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.error('📤 Response status:', error.response.status);
            console.error('📤 Response data:', error.response.data);
        }
    }
};

// Test if server is running first
const testServerConnection = async () => {
    try {
        console.log('🔍 Testing server connection...');
        const response = await axios.get('http://localhost:4000/test');
        console.log('✅ Server is running:', response.data.message);
        return true;
    } catch (error) {
        console.log('❌ Server is not running or not accessible');
        console.log('💡 Please start the server first with: node server.js');
        return false;
    }
};

// Run the test
const runTest = async () => {
    const serverRunning = await testServerConnection();
    if (serverRunning) {
        await testUpdateEndpoint();
    }
};

runTest();
