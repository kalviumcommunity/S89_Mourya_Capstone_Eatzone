// Test biryani search filtering fix
const testBiryaniFilter = () => {
  // Mock food items similar to what might be in the database
  const mockFoodItems = [
    { name: "Veg Rice Zucchini", price: 12, category: "Pure" },
    { name: "Greek salad", price: 12, category: "Salad" },
    { name: "Veg salad", price: 18, category: "Salad" },
    { name: "Chicken Biryani", price: 220, category: "Rice" },
    { name: "Veg Biryani", price: 180, category: "Rice" },
    { name: "Dum Biryani", price: 250, category: "Biryani" },
    { name: "Mutton Biryani", price: 280, category: "Rice" },
    { name: "Fried Rice", price: 120, category: "Rice" }
  ];

  console.log("🧪 Testing Biryani Filter Logic:\n");

  // Test the improved biryani filtering logic
  const testBiryaniSearch = (searchTerm) => {
    console.log(`\n🔍 Searching for: "${searchTerm}"`);
    
    // First try to find items with "biryani" in the name (most specific)
    let categoryItems = mockFoodItems.filter(item =>
      item.name.toLowerCase().includes('biryani') ||
      item.name.toLowerCase().includes('biriyani')
    ).slice(0, 3);
    
    console.log("Step 1 - Biryani name search:", categoryItems.map(item => item.name));
    
    // If no biryani found, try category search
    if (categoryItems.length === 0) {
      categoryItems = mockFoodItems.filter(item =>
        item.category.toLowerCase().includes('biryani') ||
        item.category.toLowerCase().includes('biriyani')
      ).slice(0, 3);
      
      console.log("Step 2 - Biryani category search:", categoryItems.map(item => item.name));
    }
    
    // If still no biryani, try broader rice search but exclude non-biryani items
    if (categoryItems.length === 0) {
      categoryItems = mockFoodItems.filter(item =>
        (item.name.toLowerCase().includes('rice') && 
         !item.name.toLowerCase().includes('zucchini') &&
         !item.name.toLowerCase().includes('vegetable') &&
         !item.name.toLowerCase().includes('salad')) ||
        item.category.toLowerCase().includes('rice')
      ).slice(0, 3);
      
      console.log("Step 3 - Filtered rice search:", categoryItems.map(item => item.name));
    }
    
    console.log("✅ Final result:", categoryItems.map(item => `${item.name} (₹${item.price})`));
    
    return categoryItems;
  };

  // Test different biryani searches
  const testCases = [
    "chicken biryani",
    "dum biryani", 
    "biryani",
    "biriyani"
  ];

  testCases.forEach(testCase => {
    const results = testBiryaniSearch(testCase);
    const hasCorrectResults = results.some(item => 
      item.name.toLowerCase().includes('biryani') || 
      item.name.toLowerCase().includes('biriyani')
    );
    
    const status = hasCorrectResults ? "✅ PASS" : "❌ FAIL";
    console.log(`${status} "${testCase}" - Found ${results.length} relevant items`);
  });

  console.log("\n🎯 Expected behavior:");
  console.log("- Should find actual biryani items first");
  console.log("- Should NOT return 'Veg Rice Zucchini' for biryani searches");
  console.log("- Should prioritize items with 'biryani' in name");
  console.log("- Should fall back to rice items only if no biryani found");
};

testBiryaniFilter();
