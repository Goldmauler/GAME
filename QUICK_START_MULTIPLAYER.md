# 🎮 Quick Start - Multiplayer Setup

## For the Host (The person running the servers):

### Windows Users:

1. **Double-click:** `start-multiplayer.bat`
   - This starts both servers automatically
2. **Get your IP address:**
   - Double-click: `get-ip.bat`
   - Note your IP (e.g., 192.168.1.100)
3. **Share with friends:**
   - Tell them to open: `http://[YOUR-IP]:3000`
   - Example: `http://192.168.1.100:3000`

### Mac/Linux Users:

1. **Run in terminal:**
   ```bash
   chmod +x start-multiplayer.sh
   ./start-multiplayer.sh
   ```
2. **Get your IP:**
   ```bash
   chmod +x get-ip.sh
   ./get-ip.sh
   ```
3. **Share with friends:**
   - Tell them to open: `http://[YOUR-IP]:3000`

---

## For Players (Joining from other laptops):

1. **Get the URL from host player**

   - Example: `http://192.168.1.100:3000`

2. **Open in your browser**

   - Make sure you're on the same WiFi network

3. **Join or Create a Room**
   - Enter the room code shared by host
   - Select your team
   - Click Ready
   - Start playing!

---

## Firewall Setup (Windows)

If other players can't connect:

1. Open **Windows Defender Firewall**
2. Click **"Allow an app through firewall"**
3. Click **"Allow another app"**
4. Browse and select: `C:\Program Files\nodejs\node.exe`
5. Check **both Private and Public networks**
6. Click **OK**

**OR** use this quick command (Run as Administrator):

```powershell
New-NetFirewallRule -DisplayName "IPL Auction Game" -Direction Inbound -Protocol TCP -LocalPort 3000,8080 -Action Allow
```

---

## Troubleshooting

### "Can't connect" from other laptop

- ✅ Check both players on same WiFi
- ✅ Verify host IP is correct
- ✅ Both servers running on host machine
- ✅ Windows Firewall allowing Node.js
- ✅ Try pinging: `ping [HOST-IP]`

### "Room not found"

- ✅ Check room code is correct (case-sensitive)
- ✅ WebSocket server is running
- ✅ Check browser console (F12) for errors

### "Servers won't start"

- ✅ Close previous instances
- ✅ Ports 3000 and 8080 are free
- ✅ Run: `taskkill /F /IM node.exe` (Windows)
- ✅ Try starting manually:
  ```bash
  npm run start-room-server   # Terminal 1
  npm run dev                  # Terminal 2
  ```

---

## Manual Start (If scripts don't work)

**Open 2 terminals:**

Terminal 1:

```bash
npm run start-room-server
```

Terminal 2:

```bash
npm run dev
```

Wait for both to fully start, then access the game!

---

## Need More Help?

Check the full guide: `MULTIPLAYER_SETUP_GUIDE.md`

---

## Network Requirements

- **Same WiFi Network:** All players must be connected to the same WiFi/router
- **Ports Used:** 3000 (Web), 8080 (WebSocket)
- **Recommended:** Good WiFi signal, modern browser (Chrome/Firefox/Edge)

---

**Ready? Start the servers and invite your friends! 🏏🎮**
