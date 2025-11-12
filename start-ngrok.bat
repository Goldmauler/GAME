@echo off
echo.
echo ====================================
echo  IPL Auction - Internet Setup
echo ====================================
echo.
echo This script will help you expose your game to the internet using Ngrok
echo.

REM Check if ngrok is installed
where ngrok >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Ngrok is not installed!
    echo.
    echo Please install ngrok:
    echo 1. Download from: https://ngrok.com/download
    echo 2. Or install with Chocolatey: choco install ngrok
    echo.
    pause
    exit /b 1
)

echo [OK] Ngrok is installed
echo.
echo IMPORTANT: Make sure your servers are running:
echo   - Terminal 1: npm run start-room-server
echo   - Terminal 2: npm run dev
echo.
echo Press any key to start ngrok tunnels...
pause >nul

echo.
echo Starting Ngrok tunnels...
echo.

REM Start both tunnels
echo [1/2] Starting tunnel for Next.js (port 3000)...
start "Ngrok - Next.js App" cmd /k "ngrok http 3000"
timeout /t 2 >nul

echo [2/2] Starting tunnel for WebSocket (port 8080)...
start "Ngrok - WebSocket" cmd /k "ngrok http 8080"

echo.
echo ====================================
echo  Ngrok Tunnels Started!
echo ====================================
echo.
echo Two new windows opened:
echo   1. Next.js App Tunnel (port 3000)
echo   2. WebSocket Tunnel (port 8080)
echo.
echo Look for URLs like: https://abc123.ngrok.io
echo.
echo SHARE THE NEXT.JS URL with your friends!
echo.
echo Note: Free ngrok URLs change each time you restart.
echo       Get a permanent URL with ngrok paid plan.
echo.
pause
