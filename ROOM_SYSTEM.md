# 🏏 Room-Based Multiplayer Auction System

## Overview

The IPL Auction game now supports **room-based multiplayer** where users can create private auction rooms, share unique room codes, and play together in real-time!

Inspired by platforms like richup.io, this system allows up to **10 players per room** to participate in live auctions.

---

## 🎯 Key Features

### Room System

- **Create Private Rooms** - Generate unique 6-character room codes
- **Join via Code** - Enter a friend's room code to join their auction
- **Browse Active Rooms** - See all available rooms waiting for players
- **Max 10 Players** - Each room supports up to 10 human players
- **AI Filler** - Unselected teams are controlled by AI
- **Automatic Cleanup** - Empty rooms are deleted after 30 minutes

### Room Phases

1. **Waiting** - Players join and select teams
2. **Active** - Host starts the auction, bidding begins
3. **Completed** - Results and team ratings displayed

### Security & Fair Play

- **Unique Room Codes** - 6-character codes (avoiding confusing characters)
- **Team Locking** - Each team can only be selected by one player
- **Room Validation** - Full room checking prevents overselling
- **Owner Controls** - Room creator can start the auction

---

## 🚀 Quick Start

### 1. Start the Room Server

```bash
npm run start-room-server
```

Server starts on `ws://localhost:8080`

### 2. Start the Frontend

```bash
npm run dev
```

App runs on `http://localhost:3000`

### 3. Play!

**Option A: Solo Auction**

- Click "START SOLO AUCTION" on home page
- Uses original single-server mode

**Option B: Multiplayer Rooms**

- Click "🚪 JOIN MULTIPLAYER ROOM"
- Create or join a room
- Share room code with friends

---

## 📋 How to Use

### Creating a Room

1. Navigate to `/rooms` page
2. Enter your name
3. Click **"Create Room"**
4. Receive unique room code (e.g., `ABC123`)
5. **Share code with friends**
6. Select your team from 10 franchises
7. Wait for others to join
8. Click **"Start Auction"** when ready

### Joining a Room

1. Navigate to `/rooms` page
2. Enter your name
3. **Option A: Enter Code**
   - Click "Join Room"
   - Enter the 6-character code
   - Click "Join Room 🎮"
4. **Option B: Browse Rooms**
   - Click "Browse Rooms"
   - See list of waiting rooms
   - Click on a room card to quick-join
5. Select your team (unavailable teams are greyed out)
6. Wait for host to start

### During Auction

- **Your Team** - Displayed at top with room code
- **Place Bids** - Click "Bid ₹XCr 🔥" button
- **Only for Your Team** - Can only bid for your selected team
- **Real-time Updates** - See other players' bids instantly
- **Live Timer** - 30 seconds per player (resets on bids)
- **Player Analysis** - Click player cards for detailed stats

---

## 🛠 Technical Architecture

### Server: `server/auction-room-server.js`

**Room Management:**

```javascript
const rooms = new Map(); // roomCode -> AuctionRoom instance
const clientRooms = new Map(); // WebSocket -> roomCode
```

**Message Types:**

| Type            | Direction       | Purpose                      |
| --------------- | --------------- | ---------------------------- |
| `create-room`   | Client → Server | Create new room              |
| `room-created`  | Server → Client | Room created successfully    |
| `join-room`     | Client → Server | Join existing room           |
| `joined-room`   | Server → Client | Successfully joined          |
| `start-auction` | Client → Server | Start the auction            |
| `bid`           | Client → Server | Place a bid                  |
| `state`         | Server → Client | Auction state update (1/sec) |
| `results`       | Server → Client | Final results                |
| `list-rooms`    | Client → Server | Get available rooms          |
| `room-list`     | Server → Client | List of rooms                |
| `leave-room`    | Client → Server | Leave current room           |
| `error`         | Server → Client | Error message                |

**Room Class:**

```javascript
class AuctionRoom {
  constructor(roomCode, hostName)
  addClient(ws, teamId, userName)
  removeClient(ws)
  startAuction()
  placeBid(teamId, amount)
  nextPlayer()
  completeAuction()
  broadcastState()
  getRoomInfo()
}
```

### Frontend Components

**Component Hierarchy:**

```
app/rooms/page.tsx
  └─ AuctionRoomApp
      ├─ RoomLobby
      │   ├─ Menu (name input)
      │   ├─ Create Room
      │   ├─ Join Room
      │   └─ Browse Rooms
      ├─ TeamSelection
      └─ AuctionArena (room-based)
          ├─ Room Header (code, team, players)
          ├─ Player Card (clickable)
          ├─ Bidding Panel
          ├─ Teams Grid
          └─ Results Panel
```

**State Flow:**

```
1. Connect to WebSocket (on mount)
2. Show RoomLobby (phase: "lobby")
3. Create/Join room → receive room code
4. Show TeamSelection (phase: "team-selection")
5. Select team → send join-room message
6. Show AuctionArena (phase: "auction")
7. Receive real-time state updates
8. Auction completes → show results
```

---

## 🔌 WebSocket Protocol

### Client → Server

**Create Room:**

```json
{
  "type": "create-room",
  "payload": {
    "hostName": "PlayerName"
  }
}
```

**Join Room:**

```json
{
  "type": "join-room",
  "payload": {
    "roomCode": "ABC123",
    "teamId": "1",
    "userName": "PlayerName"
  }
}
```

**Place Bid:**

```json
{
  "type": "bid",
  "payload": {
    "teamId": "1",
    "amount": 15
  }
}
```

**Start Auction:**

```json
{
  "type": "start-auction"
}
```

### Server → Client

**Room Created:**

```json
{
  "type": "room-created",
  "payload": {
    "roomCode": "ABC123",
    "roomInfo": {
      "hostName": "PlayerName",
      "playerCount": 1,
      "maxPlayers": 10,
      "phase": "waiting"
    }
  }
}
```

**State Update:**

```json
{
  "type": "state",
  "payload": {
    "teams": [...],
    "auctionState": {
      "playerIndex": 5,
      "currentPrice": 15,
      "highestBidder": "2",
      "bidHistory": [...],
      "timeLeft": 22,
      "phase": "active"
    },
    "roomCode": "ABC123",
    "playerCount": 3
  }
}
```

**Error:**

```json
{
  "type": "error",
  "payload": {
    "message": "Room is full (max 10 players)"
  }
}
```

---

## 🎮 Game Rules (Room Mode)

| Rule              | Value                     |
| ----------------- | ------------------------- |
| Players per Room  | 1-10                      |
| Total Teams       | 10                        |
| Teams per Player  | 1 (locked)                |
| Total Players     | 120                       |
| Budget per Team   | ₹100 Crore                |
| Max Squad Size    | 25 Players                |
| Timer per Player  | 30 seconds                |
| Room Code Length  | 6 characters              |
| Room Cleanup Time | 30 minutes (if empty)     |
| AI Behavior       | Controls unselected teams |

---

## 🔐 Security Features

### Room Codes

- **Format:** 6 uppercase alphanumeric characters
- **Excluded:** Confusing characters (I, O, 0, 1, L)
- **Uniqueness:** Collision-free generation
- **Example:** `ABC123`, `XYZ789`, `DEF456`

### Team Protection

```javascript
if (room.takenTeams.has(teamId)) {
  return error("Team already taken by another player");
}
```

### Room Capacity

```javascript
if (room.clients.size >= 10) {
  return error("Room is full (max 10 players)");
}
```

### Ownership Validation

```javascript
if (client.teamId !== teamId) {
  return error("You can only bid for your own team");
}
```

---

## 📊 Comparison: Solo vs Room Mode

| Feature        | Solo Mode                | Room Mode                     |
| -------------- | ------------------------ | ----------------------------- |
| Server         | `auction-server.js`      | `auction-room-server.js`      |
| URL            | `http://localhost:3000/` | `http://localhost:3000/rooms` |
| Players        | 1 human                  | 1-10 humans                   |
| Room Codes     | No                       | Yes (6 chars)                 |
| Team Selection | Any time                 | Locked per room               |
| AI Teams       | All 9 teams              | Unselected teams              |
| State Sync     | Single client            | Broadcast to all              |
| Cleanup        | Manual restart           | Auto after 30min              |

---

## 🧪 Testing

### Manual Testing Checklist

**Room Creation:**

- [ ] Can create room with valid name
- [ ] Receives unique 6-char room code
- [ ] Room appears in browse list

**Room Joining:**

- [ ] Can join with valid code
- [ ] Cannot join full room (10 players)
- [ ] Cannot select taken team
- [ ] Room code is case-insensitive

**Auction Flow:**

- [ ] Host can start auction
- [ ] All players see synchronized state
- [ ] Bids update in real-time
- [ ] Timer countdown works
- [ ] Player cards are clickable
- [ ] AI teams bid automatically

**Multi-Window Testing:**

```bash
# Open 3+ browser windows
Window 1: Create room (host)
Window 2: Join room (player)
Window 3: Join room (player)

# Verify:
- Each sees other players' counts
- Bids appear instantly in all windows
- Only one player per team
- Host can start auction
```

### Automated Tests

Create `server/tests/test-room-server.js`:

```javascript
// Test room creation
// Test room joining
// Test team collision
// Test bid validation
// Test state broadcasting
```

---

## 🚨 Troubleshooting

### "Cannot connect to server"

**Cause:** Room server not running  
**Fix:** `npm run start-room-server`

### "Room not found"

**Cause:** Invalid room code or room expired  
**Fix:** Double-check code, create new room

### "Team already taken"

**Cause:** Another player selected that team  
**Fix:** Choose different team

### "Room is full"

**Cause:** 10 players already in room  
**Fix:** Create new room or wait for slot

### State not updating

**Cause:** WebSocket connection lost  
**Fix:** Refresh page, check server logs

---

## 🔄 Migration Guide

### From Old System

**Before (Solo Mode):**

```tsx
// Single server, no rooms
<AuctionArena onComplete={...} />
```

**After (Room Mode):**

```tsx
// Room-based with lobby
<AuctionRoomApp />
```

**Both modes coexist!**

- Solo: `/` page (original auction-server.js)
- Rooms: `/rooms` page (new auction-room-server.js)

---

## 📈 Future Enhancements

### Planned Features

- [ ] **Room Passwords** - Private room protection
- [ ] **Spectator Mode** - Watch without playing
- [ ] **Room Chat** - In-auction messaging
- [ ] **Room Settings** - Custom timers, budgets
- [ ] **Room History** - Save/replay auctions
- [ ] **Leaderboards** - Cross-room rankings
- [ ] **Room Invites** - Direct invite links
- [ ] **Room Persistence** - Save rooms to database

### Scalability

```javascript
// Redis for distributed rooms
const Redis = require("redis");
const redis = Redis.createClient();

// Store rooms in Redis
redis.set(`room:${code}`, JSON.stringify(room));

// Support multiple server instances
```

---

## 📝 API Reference

### Room Server Endpoints

**Create Room**

```javascript
ws.send({
  type: "create-room",
  payload: { hostName: string },
});
// Response: { type: 'room-created', payload: { roomCode, roomInfo } }
```

**Join Room**

```javascript
ws.send({
  type: "join-room",
  payload: { roomCode: string, teamId: string, userName: string },
});
// Response: { type: 'joined-room', payload: { teams, auctionState } }
```

**Start Auction**

```javascript
ws.send({ type: "start-auction" });
// Response: State update with phase: 'active'
```

**Place Bid**

```javascript
ws.send({
  type: "bid",
  payload: { teamId: string, amount: number },
});
// Response: State update with new bid
```

**List Rooms**

```javascript
ws.send({ type: "list-rooms" });
// Response: { type: 'room-list', payload: { rooms: [...] } }
```

---

## 🎉 Summary

The room-based system brings **true multiplayer** to the IPL Auction game!

**Key Benefits:**
✅ Play with friends remotely  
✅ Easy room sharing via codes  
✅ Scalable architecture  
✅ Maintains solo mode compatibility  
✅ Real-time synchronization  
✅ Fair team distribution  
✅ Auto-cleanup for efficiency

**Start Playing:**

```bash
npm run start-room-server  # Terminal 1
npm run dev                # Terminal 2
# Navigate to http://localhost:3000/rooms
```

Enjoy your multiplayer auctions! 🏏🎮
