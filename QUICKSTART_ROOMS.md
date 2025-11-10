# 🚀 Quick Start: Multiplayer Rooms

## For Players

### Creating a Room (Host)

1. Go to `http://localhost:3000/rooms`
2. Enter your name
3. Click **"Create Room"** 🎯
4. **Copy your room code** (e.g., `ABC123`)
5. Share code with friends via text/Discord/WhatsApp
6. Select your team (10 choices)
7. Wait for friends to join
8. Click **"Start Auction"** 🚀

### Joining a Room (Player)

1. Get room code from host
2. Go to `http://localhost:3000/rooms`
3. Enter your name
4. Click **"Join Room"** 🚪
5. Enter the 6-character code
6. Click **"Join Room 🎮"**
7. Select your team (available teams only)
8. Wait for host to start

### Browsing Rooms

1. Go to `http://localhost:3000/rooms`
2. Enter your name
3. Click **"Browse Rooms"** 🔍
4. See list of active rooms
5. Click any room card to join instantly

---

## For Developers

### Starting the Server

**Terminal 1: Room Server**

```bash
cd C:\Users\vimal\Desktop\GAME
npm run start-room-server
```

Output: `🏏 IPL Auction Room Server starting on ws://localhost:8080`

**Terminal 2: Frontend**

```bash
cd C:\Users\vimal\Desktop\GAME
npm run dev
```

Output: `✓ Ready on http://localhost:3000`

### Testing Locally

**Single Computer, Multiple Windows:**

1. Open Chrome: `http://localhost:3000/rooms`
2. Create room → get code `ABC123`
3. Open Incognito: `http://localhost:3000/rooms`
4. Join room `ABC123`
5. Open Firefox: `http://localhost:3000/rooms`
6. Join room `ABC123`
7. All 3 windows sync in real-time! ✅

**Different Computers (Same Network):**

```bash
# Find your IP
ipconfig  # Windows
ifconfig  # Mac/Linux

# Example: 192.168.1.100
# Other computers visit: http://192.168.1.100:3000/rooms
```

### File Structure

```
server/
  ├─ auction-server.js         # Original solo server
  └─ auction-room-server.js    # NEW: Room-based server ⭐

components/
  ├─ room-lobby.tsx            # NEW: Room creation/joining UI
  ├─ auction-room-app.tsx      # NEW: Room app wrapper
  ├─ auction-arena-room.tsx    # NEW: Room-based auction
  ├─ auction-arena.tsx         # Original solo auction
  └─ team-selection.tsx        # Shared team selection

app/
  ├─ page.tsx                  # Home (solo + room link)
  └─ rooms/
      └─ page.tsx              # NEW: Multiplayer rooms page ⭐
```

---

## Features

### Room Management

✅ Create unlimited rooms  
✅ 6-character unique codes  
✅ Max 10 players per room  
✅ Real-time player count  
✅ Auto-cleanup (30min inactive)

### During Auction

✅ Live bid synchronization  
✅ Team locking per player  
✅ AI controls unselected teams  
✅ Click players for details  
✅ 30-second countdown timer

### Security

✅ Team collision prevention  
✅ Room capacity limits  
✅ Ownership validation  
✅ Error handling

---

## Troubleshooting

| Issue                   | Solution                                       |
| ----------------------- | ---------------------------------------------- |
| "Connecting..." message | Start room server: `npm run start-room-server` |
| "Room not found"        | Check code spelling, case doesn't matter       |
| "Team already taken"    | Choose a different team                        |
| "Room is full"          | Max 10 players, create new room                |
| Bids not updating       | Refresh page, check WebSocket connection       |

---

## URLs

| Mode              | URL                                            | Description               |
| ----------------- | ---------------------------------------------- | ------------------------- |
| Home              | `http://localhost:3000`                        | Main menu                 |
| Solo Auction      | `http://localhost:3000` → "START SOLO AUCTION" | Single player             |
| Multiplayer Rooms | `http://localhost:3000/rooms`                  | Room-based multiplayer ⭐ |

---

## Scripts

```bash
# Start room server (port 8080)
npm run start-room-server

# Start original server (port 8080)
npm run start-server

# Start frontend (port 3000)
npm run dev

# Run tests
npm run test-all
```

**Note:** Can't run both servers simultaneously (same port). Choose one:

- **Solo mode:** `start-server`
- **Room mode:** `start-room-server` ⭐

---

## Share with Friends

**Message Template:**

```
🏏 Join my IPL Auction!

Room Code: ABC123
Link: http://YOUR_IP:3000/rooms

Steps:
1. Click link
2. Enter your name
3. Type code: ABC123
4. Select team
5. Let's go! 🚀
```

---

## Advanced

### Custom Port

```bash
# Change server port
AUCTION_PORT=9000 npm run start-room-server

# Update auction-arena-room.tsx
const url = `${protocol}://${host}:9000`
```

### Database Integration (Future)

```javascript
// Store rooms in MongoDB/PostgreSQL
await db.rooms.insert({
  code: roomCode,
  host: hostName,
  players: [...],
  createdAt: new Date()
})
```

---

## Next Steps

1. ✅ Start room server
2. ✅ Open `/rooms` page
3. ✅ Create/join room
4. ✅ Share code with friends
5. ✅ Start auction together!

**Enjoy multiplayer auctions!** 🎉🏏
