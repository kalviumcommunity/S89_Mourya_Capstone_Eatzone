@echo off
echo ========================================
echo    EATZONE APPLICATION STARTUP SCRIPT
echo ========================================
echo.

echo 🔧 Killing any existing Node.js processes...
taskkill /F /IM node.exe >nul 2>&1

echo 📦 Installing dependencies if needed...

echo.
echo 📊 Starting Server (Port 4000)...
start "Eatzone Server" cmd /k "cd server && npm install && npm start"

timeout /t 3 >nul

echo.
echo 🖥️ Starting Client (Port 5173)...
start "Eatzone Client" cmd /k "cd client && npm install && npm run dev"

timeout /t 3 >nul

echo.
echo 👨‍💼 Starting Admin Panel (Port 5175)...
start "Eatzone Admin" cmd /k "cd admin && npm install && npm run dev"

echo.
echo ✅ All services are starting up...
echo.
echo 📋 Service URLs:
echo    🌐 Client:      http://localhost:5173
echo    👨‍💼 Admin:       http://localhost:5175
echo    📊 Server:      http://localhost:4000
echo    🧪 Server Test: http://localhost:4000/test
echo.
echo 🔍 Checking services in 10 seconds...
timeout /t 10 >nul

echo.
echo 📊 Service Status Check:
netstat -an | findstr ":4000" >nul && echo ✅ Server running on port 4000 || echo ❌ Server not running
netstat -an | findstr ":5173" >nul && echo ✅ Client running on port 5173 || echo ❌ Client not running  
netstat -an | findstr ":5175" >nul && echo ✅ Admin running on port 5175 || echo ❌ Admin not running

echo.
echo 🎉 Startup complete! Check the individual terminal windows for any errors.
echo 📝 Press any key to exit this script (services will continue running)
pause >nul
