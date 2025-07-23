@echo off
echo 🚀 EatZone Admin Panel Deployment Script
echo ========================================

echo.
echo 📁 Navigating to admin directory...
cd admin

echo.
echo 📦 Installing dependencies...
npm ci

echo.
echo 🔨 Building the admin panel...
npm run build

echo.
echo ✅ Build completed successfully!
echo.
echo 📋 Next steps:
echo 1. Go to https://app.netlify.com
echo 2. Find your eatzone.netlify.app site
echo 3. Go to Deploys tab
echo 4. Drag and drop the 'admin/dist' folder
echo.
echo 🎉 Your EatZone admin panel will be live!

pause
