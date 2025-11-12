#!/bin/bash

echo ""
echo "========================================"
echo "  IPL Auction Game - Network Info"
echo "========================================"
echo ""
echo "Your Local IP Address(es):"
echo ""

# Get IP addresses (works on macOS and Linux)
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print "  " $2}'
else
    # Linux
    hostname -I | tr ' ' '\n' | grep -v '^$' | awk '{print "  " $1}'
fi

echo ""
echo "========================================"
echo "Share this with other players:"
echo ""
echo "Web App URL: http://[YOUR-IP]:3000"
echo "Example: http://192.168.1.100:3000"
echo ""
echo "========================================"
echo ""
echo "Make sure both servers are running:"
echo "1. npm run dev (Port 3000)"
echo "2. npm run start-room-server (Port 8080)"
echo ""
echo "========================================"
echo ""
