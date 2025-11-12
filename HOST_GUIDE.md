# 🎯 IPL Auction Game - Host Guide

## 📋 **What You Need to Do**

### **1. Keep Your Computer Running**

Your laptop/PC must stay ON with:

- ✅ WebSocket Server running
- ✅ Next.js Dev Server running
- ✅ Both Ngrok tunnels active

**DO NOT CLOSE THESE TERMINAL WINDOWS!**

---

### **2. Share the Game Link**

Send this link to your friends:

```
https://especially-unadministrative-patience.ngrok-free.dev
```

**Copy and paste it exactly!**

You can share via:

- 📱 WhatsApp
- 💬 Discord
- 📧 Email
- 💼 Slack
- Any messaging app

---

### **3. Share the Room Code**

After you create a room, you'll get a 6-character code like:

```
ABC123
```

Share this code with your friends so they can join!

---

## 🚀 **Step-by-Step Hosting**

### **Step 1: Create a Room**

1. Open: http://localhost:3000 (on YOUR computer)
2. Enter your name
3. Click **"Create Room"**
4. You'll get a room code (e.g., `ABC123`)

### **Step 2: Share with Friends**

Send them:

```
Game Link: https://especially-unadministrative-patience.ngrok-free.dev
Room Code: ABC123

Instructions: SHARE_WITH_FRIEND.md
```

### **Step 3: Wait for Players**

- You'll see players joining in the lobby
- Wait for at least 2 players (including you)
- Each player selects a team

### **Step 4: Start the Auction**

- Once everyone is ready, click **"Start Auction"**
- 10-second countdown begins
- Auction starts automatically!

### **Step 5: Play!**

- Bid on players
- Build your team
- Have fun! 🎉

---

## 🌐 **Current Setup**

### **Your Servers:**

| Service                 | URL                                                         | Status     |
| ----------------------- | ----------------------------------------------------------- | ---------- |
| 🎮 Game (Internet)      | https://especially-unadministrative-patience.ngrok-free.dev | ✅ LIVE    |
| 🔌 WebSocket (Internet) | wss://sheathier-achromatous-meredith.ngrok-free.dev         | ✅ LIVE    |
| 🏠 Game (Local)         | http://localhost:3000                                       | ✅ Running |

---

## ⚠️ **Important Notes**

### **Keep Terminals Open**

You should have these terminals running:

1. **Terminal 1**: WebSocket Server (`npm run start-room-server`)
2. **Terminal 2**: Next.js Dev Server (`npm run dev`)
3. **Terminal 3**: Ngrok for Next.js (port 3000)
4. **Terminal 4**: Ngrok for WebSocket (port 8080)

**DO NOT CLOSE THEM!**

---

### **If Connection Drops**

If players can't connect:

1. **Check if servers are running**

   - Look for the terminal windows
   - They should show "Running..." or similar

2. **Restart if needed**
   Run these commands in PowerShell:

   ```powershell
   # In terminal 1
   npm run start-room-server

   # In terminal 2
   npm run dev

   # In terminal 3
   .\ngrok.exe http 3000 --domain=especially-unadministrative-patience.ngrok-free.dev

   # In terminal 4
   .\ngrok.exe http 8080 --config="$env:USERPROFILE\.ngrok2\ngrok.yml"
   ```

---

## 🎮 **Quick Command Reference**

### **Start Everything**

Open 4 separate PowerShell windows in `C:\Users\vimal\Desktop\GAME`:

**Window 1 - WebSocket Server:**

```powershell
npm run start-room-server
```

**Window 2 - Next.js Server:**

```powershell
npm run dev
```

**Window 3 - Ngrok (Web App):**

```powershell
.\ngrok.exe http 3000 --domain=especially-unadministrative-patience.ngrok-free.dev
```

**Window 4 - Ngrok (WebSocket):**

```powershell
.\ngrok.exe http 8080 --config="$env:USERPROFILE\.ngrok2\ngrok.yml"
```

---

## 📱 **For Local Network Players (Same WiFi)**

If someone is on the same WiFi as you, they can use:

```
http://192.168.56.1:3000
```

This is faster and more stable!

---

## 🆘 **Common Issues**

### Players stuck on "Connecting to server..."

- Make sure both ngrok tunnels are running
- Check if WebSocket server is running (Terminal 1)
- Ask them to refresh the page

### Players can't join room

- Make sure you shared the correct room code
- Check if the room is still in "lobby" phase
- Maximum 10 players per room

### Auction won't start

- Need minimum 2 players
- Make sure you (host) clicked "Start Auction"
- Check if everyone selected a team

---

## 📊 **System Check**

Run this in PowerShell to check if everything is running:

```powershell
Get-Process node, ngrok | Select-Object ProcessName, Id, StartTime
```

You should see:

- 2 node processes (Next.js + WebSocket)
- 2 ngrok processes (ports 3000 + 8080)

---

## 🎯 **Player Limits**

- **Minimum Players**: 2 (including host)
- **Maximum Players**: 10
- **Recommended**: 4-8 players for best experience

---

## 🏆 **After the Game**

- Results are automatically saved
- Check leaderboard to see rankings
- You can start a new game anytime!

---

**🎮 Have fun hosting! Good luck! 🏆**
