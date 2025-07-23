@echo off
echo 🚀 EatZone Client Deployment Script
echo ===================================

echo.
echo 📁 Navigating to client directory...
cd client

echo.
echo 📦 Installing dependencies...
npm ci

echo.
echo 🔨 Building the application...
npm run build

echo.
echo ✅ Build completed successfully!
echo.
echo 📋 Next steps:
echo 1. Go to https://app.netlify.com
echo 2. Find your eatzone1.netlify.app site
echo 3. Go to Deploys tab
echo 4. Drag and drop the 'client/dist' folder
echo.
echo 🎉 Your EatZone client app will be live!

pause
