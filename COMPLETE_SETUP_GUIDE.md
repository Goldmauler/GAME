# 🎉 IPL Auction Game - Complete Setup Guide

## 🚀 What's New

### Full Room-Based Multiplayer System

- **Create Room**: Host creates a 6-character room code
- **Join Room**: Players join using the room code
- **Team Selection Lobby**: Choose from 10 IPL franchises
- **Countdown Timer**: 10-second countdown when minimum teams ready
- **Live Auction**: Real-time bidding with WebSocket sync
- **Results & Leaderboard**: Automatic database saving

### Database Integration

- **PostgreSQL** via Supabase
- **4 Tables**:
  1. `AuctionRoom` - Room details and status
  2. `LeaderboardEntry` - Final rankings per auction
  3. `UserStats` - Player statistics across games
  4. `PlayerPurchase` - Every player bought (analytics)

---

## 📂 New Pages & Routes

### 1. Home/Lobby Page

**Route**: `/room-lobby`

- Create new room with your name
- Join existing room with 6-char code
- Beautiful UI with cricket theme
- Links to leaderboard

### 2. Room Page

**Route**: `/room/[roomCode]`

- **Join Screen**: Enter your name to join
- **Lobby**:
  - View room status (players, host, min teams)
  - Select your team from available franchises
  - Host can start auction when ready
  - Real-time countdown (10 seconds)
- **Active Auction**:
  - Live player bidding
  - Current price, time left, bid buttons
  - Real-time team budgets and squad sizes
- **Results**:
  - Final standings with ratings
  - Links to leaderboard and new game

### 3. Leaderboard Page

**Route**: `/leaderboard`

- Global top 50 players by rating
- Gold/Silver/Bronze medals for top 3
- Shows rating, spending, budget, date
- Beautiful card-based layout

---

## 🎮 How to Use

### Starting the Servers

```powershell
# Terminal 1: WebSocket Server (Port 8080)
npm run start-room-server

# Terminal 2: Next.js Dev Server (Port 3000)
npm run dev
```

### Playing the Game

1. **Go to**: `http://localhost:3000/room-lobby`

2. **Create Room**:

   - Enter your name
   - Click "Create Room"
   - You'll be redirected to your room
   - Share the 6-character code with friends

3. **Join Room**:

   - Get room code from host
   - Enter code and your name
   - Click "Join Room"

4. **Select Team**:

   - Choose from available IPL franchises
   - Taken teams are marked in red
   - Your selected team turns green

5. **Start Auction** (Host Only):

   - Wait for minimum 2 teams to join
   - Select your team first
   - Click "Start Auction"
   - 10-second countdown begins

6. **Bid on Players**:

   - Each player shown for 30 seconds
   - Click bid buttons (+₹1Cr, +₹5Cr, +₹10Cr, +₹20Cr)
   - Watch your budget and squad size
   - Build the best team!

7. **View Results**:
   - Auction completes automatically
   - See final rankings by rating
   - View your team in leaderboard
   - Start new auction or go home

---

## 🗄️ Database Schema

### AuctionRoom Table

```sql
id              String    @id @default(cuid())
roomCode        String    @unique (6-char code)
hostName        String
hostId          String
status          String    (lobby/countdown/active/completed)
teams           Json      (all 10 teams with budgets/players)
players         Json      (all available players)
playerIndex     Int       (current player being auctioned)
startTime       DateTime?
endTime         DateTime?
minTeams        Int       @default(2)
createdAt       DateTime
updatedAt       DateTime
```

### LeaderboardEntry Table

```sql
id              String    @id
roomCode        String    (which auction)
userName        String
userId          String
teamId          String
teamName        String
finalRating     Float     (calculated team strength)
totalSpent      Float     (₹ spent)
budgetLeft      Float     (₹ remaining)
playersCount    Int       (squad size)
rank            Int       (1st, 2nd, 3rd, etc.)
completedAt     DateTime
```

### UserStats Table

```sql
id              String    @id
userName        String    @unique
userId          String    @unique
totalAuctions   Int       (games played)
wins            Int       (1st place finishes)
topThree        Int       (top 3 finishes)
totalSpent      Float     (lifetime spending)
avgRating       Float     (average team rating)
highestRating   Float     (best team ever)
bestTeam        Json      (details of best team)
recentRooms     Json      (last 10 room codes)
createdAt       DateTime
updatedAt       DateTime
```

### PlayerPurchase Table

```sql
id              String    @id
roomCode        String    (which auction)
playerName      String    (e.g., "Virat Kohli")
playerRole      String    (Batsman/Bowler/All-rounder/Wicket-keeper)
basePrice       Float     (starting price)
soldPrice       Float     (final price)
teamId          String
teamName        String    (which franchise)
userName        String    (who bought them)
purchasedAt     DateTime
```

---

## 🔌 WebSocket Server

### Location

`server/auction-room-server.js`

### Port

`8080`

### Messages

**Client → Server**:

```json
// Create new room
{
  "type": "create-room",
  "payload": {
    "hostName": "Player Name",
    "userId": "user-12345"
  }
}

// Join existing room
{
  "type": "join-room",
  "payload": {
    "roomCode": "ABC123",
    "userName": "Player Name",
    "userId": "user-12345"
  }
}

// Select team in lobby
{
  "type": "select-team",
  "payload": {
    "teamId": "1"
  }
}

// Start auction (host only)
{
  "type": "start-auction",
  "payload": {}
}

// Place bid during auction
{
  "type": "bid",
  "payload": {
    "amount": 25
  }
}
```

**Server → Client**:

```json
// Room created
{
  "type": "room-created",
  "payload": {
    "roomCode": "ABC123",
    "hostId": "user-12345",
    "roomInfo": {...},
    "availableTeams": [...]
  }
}

// Room joined
{
  "type": "room-joined",
  "payload": {
    "roomInfo": {...},
    "availableTeams": [...],
    "isHost": false
  }
}

// Room updated (player joined/left)
{
  "type": "room-update",
  "payload": {
    "roomInfo": {...},
    "availableTeams": [...]
  }
}

// Countdown started
{
  "type": "countdown",
  "payload": {
    "seconds": 10,
    "message": "Auction starting in 10..."
  }
}

// Auction state (real-time)
{
  "type": "state",
  "payload": {
    "teams": [...],
    "auctionState": {
      "playerIndex": 5,
      "currentPrice": 25,
      "highestBidder": "1",
      "timeLeft": 15,
      "phase": "active"
    }
  }
}

// Auction completed
{
  "type": "results",
  "payload": {
    "ratings": [...],
    "finalTeams": [...]
  }
}
```

---

## 📊 API Routes

### 1. Save Auction Results

**POST** `/api/auction/save-results`

Body:

```json
{
  "roomCode": "ABC123",
  "hostName": "Host Name",
  "teams": [
    {
      "teamId": "1",
      "teamName": "Mumbai Indians",
      "userName": "Player Name",
      "userId": "user-12345",
      "players": [...],
      "budget": 40,
      "rating": {
        "overallRating": 85.5,
        "battingRating": 90,
        "bowlingRating": 80,
        "balance": 0.8
      }
    }
  ]
}
```

### 2. Save Player Purchase

**POST** `/api/auction/save-player-purchase`

Body:

```json
{
  "roomCode": "ABC123",
  "playerName": "Virat Kohli",
  "playerRole": "Batsman",
  "basePrice": 20,
  "soldPrice": 85,
  "teamId": "1",
  "teamName": "Mumbai Indians",
  "userName": "Player Name"
}
```

**GET** `/api/auction/save-player-purchase?roomCode=ABC123`

- Returns all player purchases for a room

### 3. Global Leaderboard

**GET** `/api/leaderboard`

- Returns top 50 players by rating

**GET** `/api/leaderboard?roomCode=ABC123`

- Returns leaderboard for specific room

### 4. Room Management

**POST** `/api/rooms/create`

- Creates room in database

**GET** `/api/rooms/create?status=lobby`

- Lists available rooms

### 5. User Statistics

**GET** `/api/user-stats/[userName]`

- Returns user profile with stats

---

## 🎨 Features

### Team Selection

- ✅ 10 IPL franchises with authentic names
- ✅ Visual indicators (Taken = Red, Selected = Green)
- ✅ Click to select, automatic sync
- ✅ Host-only start control

### Live Auction

- ✅ 130+ real IPL players from Cricbuzz API
- ✅ Real-time bidding with WebSocket
- ✅ AI teams bid automatically
- ✅ 30-second timer per player
- ✅ Budget tracking
- ✅ Squad size limits (25 players max)

### Database Persistence

- ✅ Room saved on creation
- ✅ Player purchase saved immediately after bid
- ✅ Auction results saved on completion
- ✅ User stats updated (wins, avg rating, best team)
- ✅ Leaderboard rankings calculated

### Real-Time Updates

- ✅ Player joins → All players notified
- ✅ Team selected → All players see taken teams
- ✅ Countdown → All players see timer
- ✅ Bids → All players see current price
- ✅ Player sold → All players see updated teams

---

## 🔧 Environment Setup

### .env

```bash
DATABASE_URL="postgresql://postgres:Vimalx007100%25@db.inzxttwcusjvufplkkud.supabase.co:5432/postgres"
```

### .env.local

```bash
DATABASE_URL="postgresql://postgres:Vimalx007100%25@db.inzxttwcusjvufplkkud.supabase.co:5432/postgres"
NEXT_PUBLIC_RAPIDAPI_KEY=f0484cffebmsh693ec841c20d016p16267bjsn43c1536f5c6a
NEXT_PUBLIC_CRICKET_API_URL=https://cricbuzz-cricket.p.rapidapi.com
```

---

## 📦 Dependencies

### Installed

- `@prisma/client` - Database ORM
- `prisma` - Database toolkit
- `node-fetch@2` - HTTP requests (server-side)

### Key Packages

- `next` 16.0.0 - React framework
- `react` 19.2.0 - UI library
- `framer-motion` - Animations
- `lucide-react` - Icons
- `ws` - WebSocket server

---

## 🎯 Testing Workflow

### 1. Create Room

```
1. Open: http://localhost:3000/room-lobby
2. Enter name: "TestPlayer1"
3. Click "Create Room"
4. Copy room code (e.g., "ABC123")
```

### 2. Join Room (2nd Player)

```
1. Open new tab: http://localhost:3000/room-lobby
2. Enter room code: "ABC123"
3. Enter name: "TestPlayer2"
4. Click "Join Room"
```

### 3. Select Teams

```
Player 1: Select "Mumbai Indians"
Player 2: Select "Chennai Super Kings"
```

### 4. Start Auction

```
Player 1 (Host): Click "Start Auction"
Both players see: 10-second countdown
```

### 5. Bid on Players

```
Current player shows: "Virat Kohli"
Base price: ₹20Cr
Both players can bid: +₹1Cr, +₹5Cr, +₹10Cr, +₹20Cr
Timer: 30 seconds
```

### 6. View Results

```
After all players sold:
- Final rankings displayed
- Saved to database
- View in leaderboard
```

### 7. Check Database

```powershell
npx prisma studio
```

Open: http://localhost:5555

- View AuctionRoom table (1 room)
- View PlayerPurchase table (all purchases)
- View LeaderboardEntry table (final rankings)
- View UserStats table (player profiles)

---

## 🐛 Troubleshooting

### WebSocket Not Connecting

```powershell
# Check if server running
Get-Process | Where-Object { $_.ProcessName -eq "node" }

# Restart server
npm run start-room-server
```

### Database Errors

```powershell
# Reset database (⚠️ deletes all data)
npx prisma migrate reset

# Rerun migration
npx prisma migrate dev --name init

# Regenerate client
npx prisma generate
```

### Port Already in Use

```powershell
# Kill all Node processes
Get-Process | Where-Object { $_.ProcessName -eq "node" } | Stop-Process -Force

# Restart servers
npm run start-room-server
npm run dev
```

---

## ✅ Success Checklist

- [x] PostgreSQL database connected
- [x] 4 tables created and migrated
- [x] WebSocket server running (port 8080)
- [x] Next.js server running (port 3000)
- [x] Room creation working
- [x] Room joining working
- [x] Team selection working
- [x] Countdown timer working
- [x] Live auction working
- [x] Player purchases saving to DB
- [x] Auction results saving to DB
- [x] Leaderboard displaying data
- [x] User stats tracking working

---

## 🎉 You're All Set!

The IPL Auction Game is fully functional with:

- ✅ Complete multiplayer room system
- ✅ Real-time WebSocket communication
- ✅ PostgreSQL database persistence
- ✅ Beautiful UI with cricket theme
- ✅ Team selection and auction flow
- ✅ Leaderboard and statistics

### Next Steps

1. Open `http://localhost:3000/room-lobby`
2. Create a room
3. Share the code with friends
4. Select teams and start bidding!

**Enjoy building your IPL dream team! 🏏🏆**
