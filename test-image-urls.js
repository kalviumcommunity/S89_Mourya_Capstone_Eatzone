// Test script to verify image URL generation
const testImages = [
  // Server uploaded images (filename only)
  "1749184551598food_5.png",
  "1749191111940food_1.png",
  
  // Cloudinary URLs
  "https://res.cloudinary.com/dodxdudew/image/upload/v1750777697/eatzone/food/x04zrqcxmhrkvptr6dun.jpg",
  
  // Invalid/null cases
  null,
  undefined,
  "",
];

const serverUrl = "https://eatzone.onrender.com";

// Simulate the getImageUrl function
function getImageUrl(image, serverUrl = "https://eatzone.onrender.com", options = {}) {
  // Handle null or undefined images
  if (!image) {
    console.warn('No image provided, using default fallback');
    return 'https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/categories/default-food.jpg';
  }

  // Convert to string if it's not already
  const imageStr = String(image).trim();

  // Check if it's already a complete URL (Cloudinary, external URLs, etc.)
  if (imageStr.startsWith('http://') || imageStr.startsWith('https://')) {
    console.log(`Using external URL: ${imageStr}`);
    return imageStr;
  }

  // Check if it's a data URL
  if (imageStr.startsWith('data:')) {
    return imageStr;
  }

  // Check if it's an absolute path starting with /
  if (imageStr.startsWith('/')) {
    return imageStr;
  }

  // Handle server uploaded image filename - construct server URL
  if (imageStr.includes('.png') || imageStr.includes('.jpg') || imageStr.includes('.jpeg') || imageStr.includes('.webp') || imageStr.includes('.gif')) {
    const cleanImagePath = imageStr.startsWith('/') ? imageStr.substring(1) : imageStr;
    const fullUrl = `${serverUrl}/images/${cleanImagePath}`;
    console.log(`Constructed server image URL: ${fullUrl}`);
    return fullUrl;
  }

  // If none of the above, return default
  console.warn(`Unknown image format: ${imageStr}, using default fallback`);
  return 'https://res.cloudinary.com/dodxdudew/image/upload/v1735055000/eatzone/categories/default-food.jpg';
}

console.log("=== Testing Image URL Generation ===");

testImages.forEach((image, index) => {
  console.log(`\nTest ${index + 1}: Input = ${image}`);
  const result = getImageUrl(image, serverUrl);
  console.log(`Result: ${result}`);
  
  // Test if URL is accessible (basic check)
  if (result.startsWith('http')) {
    console.log(`✅ Valid URL format`);
  } else {
    console.log(`❌ Invalid URL format`);
  }
});

console.log("\n=== Testing with actual API data ===");

// Test with actual food items from API
const sampleFoodItems = [
  {
    name: "Lasanga Rolls",
    image: "1749184551598food_5.png"
  },
  {
    name: "Greek salad", 
    image: "1749191111940food_1.png"
  },
  {
    name: "biriyani",
    image: "https://res.cloudinary.com/dodxdudew/image/upload/v1750777697/eatzone/food/x04zrqcxmhrkvptr6dun.jpg"
  }
];

sampleFoodItems.forEach((item, index) => {
  console.log(`\nFood Item ${index + 1}: ${item.name}`);
  console.log(`Original image: ${item.image}`);
  const processedUrl = getImageUrl(item.image, serverUrl);
  console.log(`Processed URL: ${processedUrl}`);
});
