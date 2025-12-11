# IPL Auction Game - Complete Setup & Usage Guide

## 🎯 Overview
This is a complete IPL auction game with real-time multiplayer, session persistence, and authentic IPL auction rules.

## 📦 What's Been Implemented

### 1. Database Schema (Prisma)
- ✅ **Player Model**: Store IPL player data from Cricbuzz API
- ✅ **AuctionRoom Model**: Enhanced with session state, bid tracking, RTM cards
- ✅ **BidHistory Model**: Track all bids placed during auction
- ✅ **UserSession Model**: Enable reconnection after disconnects
- ✅ **PlayerCache Model**: Cache API responses to avoid rate limits
- ✅ **LeaderboardEntry Model**: Store final auction results
- ✅ **PlayerPurchase Model**: Track all player sales

### 2. Cricbuzz API Integration (`lib/cricbuzz-api.ts`)
- ✅ Fetch real player data from Cricbuzz RapidAPI
- ✅ Automatic caching (24-hour duration)
- ✅ Fallback to backup Cricket API
- ✅ Rate limiting protection
- ✅ Batch player fetching for seeding

### 3. Auction Engine (`lib/auction-engine.ts`)
- ✅ Complete IPL auction rules:
  - Budget: ₹100 crore per team
  - Squad: 18-25 players
  - Role requirements: 5 batsmen, 5 bowlers, 2 all-rounders, 2 wicket-keepers
  - Bid increment: ₹10 lakhs minimum
  - Overseas limit: Max 8 per team
  - RTM cards: 2 per team
- ✅ Bid validation (budget, squad size, role requirements)
- ✅ Going once/twice/sold mechanism
- ✅ Team rating calculation
- ✅ Admin controls (pause, resume, skip, reset)

### 4. WebSocket Server (`server/websocket-server.js`)
- ✅ Real-time bid synchronization
- ✅ Session management with reconnection support
- ✅ Automatic state persistence to database
- ✅ Bid timer with countdown
- ✅ Heartbeat mechanism for connection health
- ✅ Room-based messaging
- ✅ Graceful shutdown with state saving

### 5. API Routes
- ✅ `/api/players` - Get/create players
- ✅ `/api/auction/control` - Bid, RTM, pause/resume, skip, reset
- ✅ `/api/session` - Create, validate, reconnect sessions
- ✅ `/api/rooms` - Room management
- ✅ `/api/leaderboard` - Final standings

### 6. Player Seed Script (`prisma/seed-players.ts`)
- ✅ 75+ IPL players with real base prices
- ✅ Automatic Cricbuzz API integration
- ✅ Fallback to placeholder images
- ✅ Progress tracking and error handling

## 🚀 Setup Instructions

### Step 1: Database Setup
```powershell
# Generate Prisma client
npm run prisma:generate

# Push schema to database
npm run prisma:push
```

### Step 2: Seed Player Database
```powershell
# This will fetch real player data from Cricbuzz API
# and populate the database with 75+ IPL players
npm run seed-players
```

**Note**: The seed script will:
- Fetch data from Cricbuzz API (with rate limiting)
- Cache responses to avoid hitting limits
- Add fallback placeholder images if API fails
- Show progress for each player

### Step 3: Start the Application

You need to run **THREE** processes:

**Terminal 1: Next.js Dev Server**
```powershell
npm run dev
```
This runs on http://localhost:3000

**Terminal 2: WebSocket Server**
```powershell
npm run start-ws
```
This runs on ws://localhost:8080

**Terminal 3 (Optional): Prisma Studio**
```powershell
npm run prisma:studio
```
This opens database GUI on http://localhost:5555

## 🎮 How to Use

### Creating an Auction

1. **Host Creates Room**:
   - Go to http://localhost:3000
   - Click "Create Room"
   - Enter your name and team name
   - Get a unique room code

2. **Players Join**:
   - Share room code with friends
   - They click "Join Room"
   - Enter room code, name, and team name
   - Wait in lobby

3. **Start Auction**:
   - Host clicks "Start Auction"
   - System shuffles players randomly
   - First player appears for bidding

### During Auction

**Bidding**:
- Current player shows with base price
- Click "Place Bid" and enter amount (minimum ₹10L increment)
- Bid timer shows 30 seconds countdown
- System announces "Going once", "Going twice", then "SOLD!"

**RTM (Right to Match)**:
- Each team gets 2 RTM cards
- Use to match highest bid for a player
- Cannot be used if you're already highest bidder

**Squad Building**:
- Monitor your budget (starts at ₹100 crore)
- Ensure balanced squad:
  - At least 5 batsmen
  - At least 5 bowlers
  - At least 2 all-rounders
  - At least 2 wicket-keepers
- Maximum 8 overseas players

**Admin Controls** (Host only):
- **Pause/Resume**: Pause auction anytime
- **Skip Player**: Mark current player unsold, move to next
- **Reset Auction**: Clear all bids and start over

### After Auction

- View final leaderboard ranked by team strength
- See complete squad breakdown
- Export results (future feature)

## 🔌 Reconnection Feature

If you accidentally disconnect:

1. **Refresh the page** or **reopen the app**
2. Your session token is stored locally
3. Click "Reconnect to Auction"
4. You'll rejoin with your team intact

The system saves:
- Your current budget
- Your acquired players
- Your RTM cards remaining
- Current auction state

## 📊 Database Management

### View Database
```powershell
npm run prisma:studio
```

### Reset Everything
```powershell
# Reset database and reseed
npm run prisma:push -- --force-reset
npm run seed-players
```

### Check Auction State
```powershell
# Open Prisma Studio and check:
# - AuctionRoom: See active rooms
# - UserSession: See connected users
# - BidHistory: See all bids
# - Player: See sold/unsold status
```

## 🔧 Environment Variables

Your `.env` file has:
```env
# Cricket APIs
NEXT_PUBLIC_RAPIDAPI_KEY=f0484cffebmsh693ec841c20d016p16267bjsn43c1536f5c6a
NEXT_PUBLIC_CRICKET_API_URL=https://cricbuzz-cricket.p.rapidapi.com
NEXT_PUBLIC_API_HOST=cricbuzz-cricket.p.rapidapi.com

NEXT_PUBLIC_BACKUP_API_KEY=3a9d8ee5-d5fc-49a6-820e-f1b2422952a3
NEXT_PUBLIC_BACKUP_API_URL=https://api.cricapi.com/v1

# WebSocket
NEXT_PUBLIC_WS_URL=ws://192.168.56.1:8080

# Database
DATABASE_URL="file:./dev.db"
```

## 🎯 Key Features

### Authentic IPL Rules
- ✅ ₹100 crore budget per team
- ✅ 18-25 player squad requirement
- ✅ Role-based player requirements
- ✅ ₹10 lakh minimum bid increment
- ✅ RTM card system
- ✅ Overseas player limits
- ✅ Going once/twice/sold mechanism

### Real-Time Multiplayer
- ✅ WebSocket-based synchronization
- ✅ Live bid updates for all players
- ✅ Real-time timer countdown
- ✅ Instant player sold notifications

### Session Persistence
- ✅ Reconnect after disconnect
- ✅ Resume from exact auction state
- ✅ No data loss on refresh
- ✅ Session tokens for security

### Player Data
- ✅ Real data from Cricbuzz API
- ✅ Player images, stats, countries
- ✅ Base prices from IPL 2024
- ✅ 75+ real IPL players

## 🐛 Troubleshooting

### WebSocket Connection Issues
```powershell
# Check if WebSocket server is running
# Terminal should show: "🏏 IPL Auction WebSocket Server running on port 8080"

# If not, run:
npm run start-ws
```

### Database Errors
```powershell
# Regenerate Prisma client
npm run prisma:generate

# Reset and rebuild database
npm run prisma:push -- --force-reset
npm run seed-players
```

### API Rate Limiting
- Cricbuzz API: 500 requests/day (FREE tier)
- Responses are cached for 24 hours
- Backup API automatically used if primary fails
- Player data is seeded once, then read from database

### Players Not Loading
```powershell
# Reseed the database
npm run seed-players

# Check if players exist
npm run prisma:studio
# Navigate to "Player" table
```

## 📁 Project Structure

```
├── app/api/
│   ├── auction/control/    # Auction control endpoints
│   ├── players/           # Player data endpoints
│   ├── session/          # Session management
│   └── ...
├── lib/
│   ├── auction-engine.ts    # Core auction logic
│   ├── cricbuzz-api.ts     # API integration
│   └── prisma.ts          # Database client
├── server/
│   └── websocket-server.js # WebSocket server
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed-players.ts     # Player seed script
└── components/            # React components
```

## 🎓 Next Steps

1. **Test the full flow**:
   - Create a room
   - Join with multiple browsers (different profiles)
   - Run a complete auction
   - Test reconnection by refreshing

2. **Customize**:
   - Add more players in `seed-players.ts`
   - Adjust auction rules in `auction-engine.ts`
   - Modify UI components

3. **Deploy** (future):
   - Deploy Next.js to Vercel
   - Deploy WebSocket server to a VPS
   - Use PostgreSQL for production database

## 🏆 Success Checklist

- [ ] Database seeded with players
- [ ] Dev server running (localhost:3000)
- [ ] WebSocket server running (localhost:8080)
- [ ] Created a test auction room
- [ ] Joined with multiple users
- [ ] Placed bids successfully
- [ ] Tested reconnection
- [ ] Completed full auction
- [ ] Viewed leaderboard

Enjoy your IPL Auction Game! 🏏🎉
