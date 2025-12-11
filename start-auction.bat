@echo off
echo ========================================
echo  IPL Auction Game - Quick Start
echo ========================================
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install --legacy-peer-deps
    echo.
)

REM Check if database exists
if not exist "prisma\dev.db" (
    echo Setting up database...
    call npx prisma generate
    call npx prisma db push --force-reset
    echo.
)

REM Check if players are seeded
echo Checking player database...
call npx prisma db execute --stdin < check_players.sql 2>nul
if errorlevel 1 (
    echo Seeding players...
    call npm run seed-players
    echo.
)

echo ========================================
echo  Starting Services...
echo ========================================
echo.
echo 1. Next.js Dev Server (http://localhost:3000)
echo 2. WebSocket Server (ws://localhost:8080)
echo.
echo Press Ctrl+C to stop all services
echo.

REM Start both servers in new windows
start "Next.js Dev Server" cmd /k "npm run dev"
timeout /t 3 >nul
start "WebSocket Server" cmd /k "npm run start-ws"

echo.
echo ========================================
echo  Services Started!
echo ========================================
echo.
echo Open http://localhost:3000 in your browser
echo.
echo Press any key to stop all services...
pause >nul

REM Kill all node processes (this will stop the servers)
taskkill /F /IM node.exe >nul 2>&1
echo.
echo All services stopped.
