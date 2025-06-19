@echo off
echo ========================================
echo    EATZONE SERVER RESTART SCRIPT
echo ========================================
echo.

echo 🛑 Stopping existing server...
taskkill /F /IM node.exe >nul 2>&1

echo ⏳ Waiting for processes to stop...
timeout /t 2 >nul

echo 🚀 Starting enhanced server...
cd server
start "Eatzone Server" cmd /k "node server.js"

echo ⏳ Waiting for server to start...
timeout /t 5 >nul

echo.
echo 🧪 Testing server endpoints...
echo.

echo 📊 Testing root endpoint...
curl -s http://localhost:4000/ && echo. || echo ❌ Root endpoint failed

echo.
echo 🏥 Testing health endpoint...
curl -s http://localhost:4000/health | findstr "healthy" >nul && echo ✅ Health endpoint working || echo ❌ Health endpoint failed

echo.
echo 🧪 Testing test endpoint...
curl -s http://localhost:4000/test | findstr "working" >nul && echo ✅ Test endpoint working || echo ❌ Test endpoint failed

echo.
echo 🌐 Testing API endpoint...
curl -s http://localhost:4000/api/food/list | findstr "success" >nul && echo ✅ API endpoint working || echo ❌ API endpoint failed

echo.
echo ========================================
echo    SERVER RESTART COMPLETE
echo ========================================
echo.
echo 📊 Server: http://localhost:4000
echo 🏥 Health: http://localhost:4000/health
echo 🧪 Test:   http://localhost:4000/test
echo.
echo Press any key to exit...
pause >nul
