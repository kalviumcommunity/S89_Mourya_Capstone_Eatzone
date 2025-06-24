// Test script to verify category API connectivity
const testCategoryAPI = async () => {
    const apiUrl = 'https://eatzone.onrender.com/api/category/list';
    
    console.log('🔄 Testing category API...');
    console.log('API URL:', apiUrl);
    
    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
            }
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ API Response:', data);
        
        if (data.success) {
            console.log(`📊 Found ${data.data.length} categories:`);
            data.data.forEach((category, index) => {
                console.log(`${index + 1}. ${category.name} - ${category.image}`);
            });
        } else {
            console.error('❌ API returned error:', data.message);
        }
        
    } catch (error) {
        console.error('❌ Error testing API:', error);
    }
};

// Run the test
testCategoryAPI();
