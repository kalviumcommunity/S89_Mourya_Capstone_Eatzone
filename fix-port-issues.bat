@echo off
echo ========================================
echo    EATZONE PORT CLEANUP & RESTART
echo ========================================
echo.

echo 🛑 Stopping all Node.js processes...
taskkill /F /IM node.exe >nul 2>&1

echo 🧹 Cleaning up any processes on wrong ports...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5174"') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5176"') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5177"') do taskkill /F /PID %%a >nul 2>&1

echo ⏳ Waiting for processes to stop...
timeout /t 3 >nul

echo.
echo 🚀 Starting services on correct ports...
echo.

echo 📊 Starting Server (Port 4000)...
start "Eatzone Server" cmd /k "cd server && npm start"

timeout /t 3 >nul

echo 🖥️ Starting Client (Port 5173 - STRICT)...
start "Eatzone Client" cmd /k "cd client && npm run dev"

timeout /t 3 >nul

echo 👨‍💼 Starting Admin Panel (Port 5175)...
start "Eatzone Admin" cmd /k "cd admin && npm run dev"

echo.
echo ✅ All services starting with correct port configuration...
echo.
echo 📋 Correct Service URLs:
echo    🌐 Client:      http://localhost:5173 (FIXED PORT)
echo    👨‍💼 Admin:       http://localhost:5175 (FIXED PORT)
echo    📊 Server:      http://localhost:4000
echo.
echo 🔍 Checking services in 10 seconds...
timeout /t 10 >nul

echo.
echo 📊 Port Status Check:
netstat -an | findstr ":4000" >nul && echo ✅ Server running on port 4000 || echo ❌ Server not running
netstat -an | findstr ":5173" >nul && echo ✅ Client running on port 5173 || echo ❌ Client not running  
netstat -an | findstr ":5175" >nul && echo ✅ Admin running on port 5175 || echo ❌ Admin not running

echo.
echo 🚨 Checking for wrong ports:
netstat -an | findstr ":5174" >nul && echo ⚠️ WARNING: Something running on port 5174 (should be empty) || echo ✅ Port 5174 is free
netstat -an | findstr ":5176" >nul && echo ⚠️ WARNING: Something running on port 5176 (should be empty) || echo ✅ Port 5176 is free

echo.
echo ========================================
echo    PORT CLEANUP COMPLETE
echo ========================================
echo.
echo 🔧 Google OAuth Configuration:
echo    User Callback:  http://localhost:4000/api/user/auth/google/callback
echo    Admin Callback: http://localhost:4000/api/admin/auth/google/callback
echo.
echo 📝 Make sure these URLs are configured in Google Cloud Console!
echo.
echo Press any key to exit...
pause >nul
