@echo off
echo.
echo ====================================
echo  IPL Auction - LocalTunnel Setup
echo ====================================
echo.

REM Check if localtunnel is installed
where lt >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo LocalTunnel is not installed. Installing now...
    echo.
    call npm install -g localtunnel
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to install localtunnel
        pause
        exit /b 1
    )
)

echo [OK] LocalTunnel is ready
echo.
echo IMPORTANT: Make sure your servers are running:
echo   - Terminal 1: npm run start-room-server
echo   - Terminal 2: npm run dev
echo.
echo Press any key to start tunnels...
pause >nul

echo.
echo Starting LocalTunnel...
echo.

REM Start both tunnels
echo [1/2] Starting tunnel for Next.js (port 3000)...
start "LocalTunnel - Next.js App" cmd /k "lt --port 3000"
timeout /t 2 >nul

echo [2/2] Starting tunnel for WebSocket (port 8080)...
start "LocalTunnel - WebSocket" cmd /k "lt --port 8080"

echo.
echo ====================================
echo  LocalTunnel Started!
echo ====================================
echo.
echo Two new windows opened with your public URLs
echo.
echo SHARE THE NEXT.JS URL (port 3000) with your friends!
echo.
echo Note: First-time visitors may see a warning page.
echo       Just click "Continue" to proceed.
echo.
pause
