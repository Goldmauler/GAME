#!/bin/bash

echo ""
echo "========================================"
echo "  Starting IPL Auction Game Servers"
echo "========================================"
echo ""

echo "Cleaning up old processes..."
pkill -f "node.*auction-room-server" 2>/dev/null
pkill -f "next dev" 2>/dev/null
sleep 2

echo ""
echo "Starting servers..."
echo ""

# Start WebSocket server in background
echo "1. Starting WebSocket Server (Port 8080)..."
npm run start-room-server &
WS_PID=$!

# Wait for WebSocket server to start
sleep 3

# Start Next.js dev server
echo "2. Starting Next.js Dev Server (Port 3000)..."
npm run dev &
NEXT_PID=$!

echo ""
echo "========================================"
echo "   Servers Started!"
echo "========================================"
echo ""
echo "WebSocket Server PID: $WS_PID"
echo "Next.js Server PID: $NEXT_PID"
echo ""
echo "Access points:"
echo "- Local: http://localhost:3000"
echo "- Network: http://[YOUR-IP]:3000"
echo ""
echo "To find your IP, run: ./get-ip.sh"
echo ""
echo "Press Ctrl+C to stop all servers"
echo "========================================"
echo ""

# Wait for both processes
wait $WS_PID $NEXT_PID
