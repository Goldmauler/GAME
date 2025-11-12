@echo off
echo.
echo ============================================
echo  IPL Auction Game - Full Internet Setup
echo ============================================
echo.
echo This will start:
echo   1. WebSocket Server (Room Server)
echo   2. Next.js Development Server
echo   3. Ngrok Tunnels (Internet Access)
echo.
echo Make sure you have ngrok installed and configured!
echo Visit: https://ngrok.com/download
echo.
echo Press any key to start all servers...
pause >nul

echo.
echo [1/4] Cleaning up old processes...
powershell -Command "Stop-Process -Name node -Force 2>$null"
timeout /t 2 >nul

echo [2/4] Starting WebSocket Server...
start "IPL Auction - WebSocket Server" cmd /k "npm run start-room-server"
timeout /t 3 >nul

echo [3/4] Starting Next.js Server...
start "IPL Auction - Next.js Dev" cmd /k "npm run dev"
timeout /t 5 >nul

echo [4/4] Starting Ngrok Tunnels...
timeout /t 2 >nul

where ngrok >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [WARNING] Ngrok not found!
    echo.
    echo Your servers are running locally, but not accessible from internet.
    echo.
    echo To enable internet access:
    echo   1. Install ngrok: https://ngrok.com/download
    echo   2. Run: start-ngrok.bat
    echo.
    pause
    exit /b 0
)

start "Ngrok - Next.js" cmd /k "ngrok http 3000"
timeout /t 2 >nul
start "Ngrok - WebSocket" cmd /k "ngrok http 8080"

echo.
echo ============================================
echo  All Servers Started!
echo ============================================
echo.
echo Four new windows opened:
echo   1. WebSocket Server (port 8080)
echo   2. Next.js Dev Server (port 3000)
echo   3. Ngrok Tunnel - Next.js
echo   4. Ngrok Tunnel - WebSocket
echo.
echo Check the Ngrok windows for public URLs
echo Share the Next.js URL with your friends!
echo.
echo Local URLs:
echo   - Game: http://localhost:3000
echo   - WebSocket: ws://localhost:8080
echo.
pause
