@echo off
title IPL Auction Game - Multiplayer Server

echo.
echo ========================================
echo   Starting IPL Auction Game Servers
echo ========================================
echo.

REM Kill any existing node processes to free up ports
echo Cleaning up old processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo Starting servers...
echo.

REM Start WebSocket server in a new window
start "WebSocket Server (Port 8080)" cmd /k "npm run start-room-server"

REM Wait a moment for WebSocket server to start
timeout /t 3 /nobreak >nul

REM Start Next.js dev server in a new window
start "Next.js Dev Server (Port 3000)" cmd /k "npm run dev"

echo.
echo ========================================
echo   Servers Starting!
echo ========================================
echo.
echo Two windows will open:
echo 1. WebSocket Server (Port 8080)
echo 2. Next.js Dev Server (Port 3000)
echo.
echo Wait for both to fully start, then:
echo - Access locally: http://localhost:3000
echo - From other devices: http://[YOUR-IP]:3000
echo.
echo To find your IP, run: get-ip.bat
echo.
echo ========================================
echo.
pause
