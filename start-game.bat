@echo off
echo Starting IPL Auction Game...

:: Start Server in a new window
echo Starting WebSocket Server on port 8080...
start "IPL Auction Server" cmd /k "npm run start-room-server"

:: Wait 3 seconds for server to initialize
timeout /t 3 /nobreak >nul

:: Start Client in a new window
echo Starting Next.js Client on port 3000...
start "IPL Auction Client" cmd /k "npm run dev"

echo.
echo ===================================================
echo Game started!
echo Server: http://localhost:8080
echo Client: http://localhost:3000
echo ===================================================
echo.
pause
