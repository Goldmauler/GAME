# Multiplayer Setup Guide - Connect Users Across Different Laptops

This guide will help you set up the IPL Auction Game to allow users on different laptops to play together over a local network or the internet.

---

## 🎯 Quick Start (Local Network)

### Step 1: Find Your Host Machine's IP Address

**On Windows (Host Machine):**

1. Open Command Prompt or PowerShell
2. Type: `ipconfig`
3. Look for "IPv4 Address" under your active network adapter
4. Example: `192.168.1.100` (this is your local IP)

**On macOS/Linux:**

1. Open Terminal
2. Type: `ifconfig` or `ip addr`
3. Look for your IP address (usually starts with 192.168.x.x or 10.x.x.x)

### Step 2: Start the Servers on Host Machine

Open **TWO** terminals on the host machine:

**Terminal 1 - Next.js Dev Server:**

```bash
npm run dev
```

This starts the web app on port 3000.

**Terminal 2 - WebSocket Server:**

```bash
npm run start-room-server
```

This starts the auction server on port 8080.

### Step 3: Configure Firewall on Host Machine

**Windows Firewall:**

1. Open Windows Defender Firewall
2. Click "Advanced settings"
3. Click "Inbound Rules" → "New Rule"
4. Select "Port" → Next
5. Select "TCP" and enter ports: `3000,8080` → Next
6. Select "Allow the connection" → Next
7. Check all profiles (Domain, Private, Public) → Next
8. Name it "IPL Auction Game" → Finish

**Alternative (Quick but less secure):**

- Turn off Windows Firewall temporarily for testing
- Settings → Update & Security → Windows Security → Firewall & Network Protection → Turn off

### Step 4: Connect from Other Laptops

On the **other laptops**, open a web browser and go to:

```
http://[HOST_IP]:3000
```

Replace `[HOST_IP]` with the IP address from Step 1.

**Example:**

```
http://192.168.1.100:3000
```

---

## 🌐 Network Configuration Options

### Option 1: Local Network (Same WiFi/LAN)

**Best for:**

- Playing at home
- Office/School network
- Gaming cafes

**Setup:**

- All devices connected to same WiFi/Router
- Use host machine's local IP (192.168.x.x)
- No port forwarding needed
- Fast and low latency

**Current Configuration:**

```javascript
// server/auction-room-server.js
const PORT = 8080;
const wss = new WebSocket.Server({
  port: PORT,
  host: "0.0.0.0", // Listen on all network interfaces
});
```

---

### Option 2: Internet (Different Networks)

**Best for:**

- Friends in different locations
- Playing from home vs office
- Cross-city/country gameplay

**Requirements:**

- Host machine with public IP or router port forwarding
- More complex setup

**Setup Steps:**

#### A. Find Your Public IP

Visit: https://whatismyipaddress.com/

#### B. Configure Router Port Forwarding

1. Access your router settings (usually http://192.168.1.1)
2. Find "Port Forwarding" or "Virtual Server" section
3. Add these rules:
   ```
   Port 3000 → Forward to [HOST_LOCAL_IP]:3000 (TCP)
   Port 8080 → Forward to [HOST_LOCAL_IP]:8080 (TCP)
   ```
4. Save and restart router

#### C. Share Your Connection Details

Share with other players:

```
http://[YOUR_PUBLIC_IP]:3000
```

**Security Note:** When exposing ports to internet, consider:

- Use strong authentication
- Close ports when not playing
- Use VPN services like Hamachi or ZeroTier as alternative

---

### Option 3: Using Tunneling Services (Easiest for Internet)

**Using ngrok (Recommended for beginners):**

1. Download ngrok: https://ngrok.com/download
2. Install and authenticate
3. Start your servers (Next.js on 3000, WebSocket on 8080)
4. Open TWO terminals for ngrok:

**Terminal 1:**

```bash
ngrok http 3000
```

Copy the forwarding URL (e.g., https://abc123.ngrok.io)

**Terminal 2:**

```bash
ngrok tcp 8080
```

Copy the TCP address (e.g., 0.tcp.ngrok.io:12345)

5. Update the WebSocket connection code with ngrok URL
6. Share the ngrok web URL with other players

**Benefits:**

- No router configuration needed
- Works across any network
- Free tier available
- Automatic HTTPS

---

## 🔧 Code Configuration

### Update WebSocket Server for Network Access

**File: `server/auction-room-server.js`**

Current:

```javascript
const wss = new WebSocket.Server({ port: PORT });
```

Updated (for local network):

```javascript
const wss = new WebSocket.Server({
  port: PORT,
  host: "0.0.0.0", // Listen on all network interfaces
});
```

### Update Client WebSocket Connection

**File: `components/auction-room-app.tsx`**

Current:

```javascript
const url = `${protocol}://${host}:8080`;
```

This automatically uses:

- `localhost:8080` when on host machine
- `[HOST_IP]:8080` when accessed from other machines

**No changes needed!** The code already supports this.

---

## 🧪 Testing Your Setup

### Test 1: Local Access (Same Machine)

1. Start both servers
2. Open browser: http://localhost:3000
3. Create a room
4. Should work perfectly ✓

### Test 2: Local Network Access

1. Find host IP: `ipconfig` → 192.168.1.100
2. On another laptop (same WiFi):
3. Open browser: http://192.168.1.100:3000
4. Create/join room
5. Should connect ✓

### Test 3: Cross-Network (Internet)

1. Set up port forwarding OR use ngrok
2. Share public URL
3. Test from mobile data (not WiFi)
4. Should work ✓

---

## 🐛 Troubleshooting

### Problem: "Cannot connect to server"

**Check:**

1. Is WebSocket server running? (`npm run start-room-server`)
2. Is Next.js server running? (`npm run dev`)
3. Check terminal for errors
4. Are ports 3000 and 8080 free?

**Solution:**

```bash
# Windows - Check what's using ports
netstat -ano | findstr :3000
netstat -ano | findstr :8080

# Kill processes if needed
Stop-Process -Id [PID] -Force
```

---

### Problem: "Firewall blocking connection"

**Check:**

- Windows Firewall settings
- Antivirus software blocking ports
- Router firewall

**Solution:**

- Add firewall rules (see Step 3 above)
- Temporarily disable to test
- Check router settings

---

### Problem: "Connected but can't join room"

**Check:**

- Browser console (F12) for errors
- WebSocket server logs
- Network tab showing WebSocket connection

**Solution:**

- Refresh page
- Check room code is correct
- Restart WebSocket server

---

### Problem: "Other laptop can't access"

**Check:**

1. Can you ping the host?
   ```bash
   ping 192.168.1.100
   ```
2. Are both on same network?
3. Is host IP correct?
4. Firewall enabled on host?

**Solution:**

- Verify IP address
- Check WiFi connection
- Disable firewall temporarily to test
- Try different network

---

## 📊 Network Architecture

```
┌─────────────────────────────────────────────┐
│           Host Machine (Server)              │
│  ┌──────────────────────────────────────┐   │
│  │  Next.js Dev Server (Port 3000)      │   │
│  │  - Serves web pages                   │   │
│  │  - API routes                         │   │
│  └──────────────────────────────────────┘   │
│  ┌──────────────────────────────────────┐   │
│  │  WebSocket Server (Port 8080)        │   │
│  │  - Real-time auction state           │   │
│  │  - Room management                    │   │
│  │  - Player synchronization            │   │
│  └──────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
                    │
                    │ Network (WiFi/LAN/Internet)
                    │
        ┌───────────┴───────────┐
        │                       │
┌───────▼──────┐        ┌───────▼──────┐
│  Laptop 1    │        │  Laptop 2    │
│  (Client)    │        │  (Client)    │
│              │        │              │
│  Browser     │        │  Browser     │
│  Connected   │        │  Connected   │
└──────────────┘        └──────────────┘
```

---

## 🚀 Production Deployment (Optional)

For permanent hosting:

### Option 1: Cloud Hosting (Vercel + Railway)

**Next.js on Vercel:**

1. Push code to GitHub
2. Import on Vercel.com
3. Deploy automatically
4. Get URL: https://your-game.vercel.app

**WebSocket on Railway:**

1. Create account on Railway.app
2. New Project → Deploy from GitHub
3. Add start command: `node server/auction-room-server.js`
4. Get WebSocket URL: wss://your-game.railway.app

**Update code to use Railway URL for WebSocket**

---

### Option 2: VPS (DigitalOcean, AWS, etc.)

1. Rent a server (Ubuntu 22.04 recommended)
2. Install Node.js
3. Clone your repository
4. Install dependencies: `npm install`
5. Use PM2 for process management:
   ```bash
   npm install -g pm2
   pm2 start server/auction-room-server.js --name auction-server
   pm2 start npm --name nextjs -- start
   pm2 save
   pm2 startup
   ```
6. Configure Nginx as reverse proxy
7. Get domain name and SSL certificate

---

## 📝 Environment Variables

Create `.env.local` file for configuration:

```env
# For local network
NEXT_PUBLIC_WS_URL=ws://localhost:8080

# For production
# NEXT_PUBLIC_WS_URL=wss://your-domain.com:8080

# API URL
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Then update the code to use:

```javascript
const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080";
```

---

## ✅ Pre-Game Checklist

Before inviting others to play:

- [ ] Both servers running (ports 3000 & 8080)
- [ ] Host IP address noted down
- [ ] Firewall rules added
- [ ] Tested connection from another device
- [ ] Room creation works
- [ ] Multiple users can join
- [ ] Auction bidding syncs properly
- [ ] No errors in browser console
- [ ] No errors in server logs

---

## 🎮 How to Play Multiplayer

### Host Player:

1. Start both servers
2. Note your IP address
3. Share with other players: `http://[YOUR_IP]:3000`
4. Create a room → Get room code
5. Share room code with others
6. Wait for players to join
7. Select your team
8. Mark ready
9. Start auction when everyone is ready

### Joining Players:

1. Receive host IP from host player
2. Open browser: `http://[HOST_IP]:3000`
3. Click "Join Room"
4. Enter room code
5. Select your team
6. Mark ready
7. Wait for host to start

---

## 🔒 Security Considerations

**For Local Network:**

- Relatively safe
- Only accessible to people on same network

**For Internet:**

- Add authentication
- Use HTTPS/WSS
- Implement rate limiting
- Validate all inputs
- Add room passwords
- Limit room lifetime

---

## 💡 Performance Tips

1. **Host Machine:**

   - Use wired connection (Ethernet) if possible
   - Close unnecessary applications
   - Good internet connection (if playing online)

2. **Player Machines:**

   - Use modern browsers (Chrome, Firefox, Edge)
   - Stable internet connection
   - Low latency to host

3. **Network:**
   - 5GHz WiFi better than 2.4GHz
   - Wired > WiFi
   - Close to router

---

## 📱 Mobile Support

The game works on mobile browsers!

**To play from mobile:**

1. Connect to same WiFi
2. Open browser (Chrome/Safari)
3. Enter: `http://[HOST_IP]:3000`
4. Works on tablets too!

---

## 🆘 Quick Commands Reference

```bash
# Find IP (Windows)
ipconfig

# Find IP (Mac/Linux)
ifconfig

# Check if port is open
Test-NetConnection -ComputerName [IP] -Port 3000
Test-NetConnection -ComputerName [IP] -Port 8080

# Kill process on port (Windows)
netstat -ano | findstr :8080
Stop-Process -Id [PID] -Force

# Start servers
npm run dev                    # Web server (3000)
npm run start-room-server      # WebSocket (8080)

# Restart everything
Stop-Process -Name node -Force
npm run dev
npm run start-room-server
```

---

## 📞 Support

If you encounter issues:

1. Check browser console (F12)
2. Check server terminal logs
3. Verify firewall settings
4. Test with localhost first
5. Try from different device on same network
6. Check this guide's troubleshooting section

---

**Ready to Play? Start the servers and share your IP! 🏏🎮**
