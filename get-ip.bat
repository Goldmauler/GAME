@echo off
echo.
echo ========================================
echo   IPL Auction Game - Network Info
echo ========================================
echo.
echo Your Local IP Address(es):
echo.
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    echo   %%a
)
echo.
echo ========================================
echo Share this with other players:
echo.
echo Web App URL: http://[YOUR-IP]:3000
echo Example: http://192.168.1.100:3000
echo.
echo ========================================
echo.
echo Make sure both servers are running:
echo 1. npm run dev (Port 3000)
echo 2. npm run start-room-server (Port 8080)
echo.
echo ========================================
echo.
pause
