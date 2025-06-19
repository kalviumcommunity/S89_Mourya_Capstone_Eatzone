// Utility to help resize images to 80x80 for menu icons
// This is a helper guide for manually resizing images

export const menuImageRequirements = {
  size: "80x80 pixels",
  format: "PNG with transparent background preferred",
  style: "Simple, clean icons that work well in circular frames",
  categories: [
    {
      name: "Pizza",
      filename: "menu_9.png",
      description: "Pizza slice or whole pizza icon"
    },
    {
      name: "Sushi", 
      filename: "menu_10.png",
      description: "Sushi roll or nigiri icon"
    },
    {
      name: "Soup",
      filename: "menu_11.png", 
      description: "Bowl of soup icon"
    },
    {
      name: "Tacos",
      filename: "menu_12.png",
      description: "Taco shell icon"
    },
    {
      name: "Main Course",
      filename: "menu_13.png",
      description: "Plate with main dish icon"
    },
    {
      name: "Appetizer", 
      filename: "menu_14.png",
      description: "Small plate or appetizer icon"
    }
  ]
};

// Recommended free icon sources:
export const iconSources = [
  "https://flaticon.com - Search 'food category icons'",
  "https://icons8.com - Food & Drinks section", 
  "https://freepik.com - Food icons collection",
  "https://iconfinder.com - Food category icons"
];

// Manual resize instructions:
export const resizeInstructions = `
1. Download icons from recommended sources
2. Use any image editor (Photoshop, GIMP, Canva, etc.)
3. Resize to exactly 80x80 pixels
4. Save as PNG format
5. Place in client/src/assets/ folder
6. Update imports in assets.js if needed
`;
