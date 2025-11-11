# 🚀 Quick Start Guide - IPL Auction Game

## ⚡ Get Started in 5 Minutes

### Prerequisites

- Node.js 18+ installed
- Git installed
- 5 minutes of your time

---

## 📥 Installation (2 minutes)

```bash
# 1. Clone repository
git clone https://github.com/Goldmauler/GAME.git
cd GAME

# 2. Install dependencies
npm install

# 3. Setup environment
# Create .env file with your database URL
echo 'DATABASE_URL="your_postgresql_url_here"' > .env

# 4. Initialize database
npx prisma generate
npx prisma db push
```

---

## 🎮 Running the Game (1 minute)

### Option 1: Quick Start (Solo Mode Only)

```bash
# Start Next.js server
npm run dev

# Open browser: http://localhost:3000
# Click "START SOLO AUCTION"
```

### Option 2: Full Setup (Solo + Multiplayer)

**Terminal 1:**

```bash
npm run dev
```

**Terminal 2:**

```bash
npm run start-room-server
```

**Access:** http://localhost:3000

---

## 🎯 First Auction (2 minutes)

### Solo Mode

1. Click **"START SOLO AUCTION"**
2. Choose your team (e.g., Mumbai Indians)
3. Click **"BID"** when you want a player
4. Build your 15-player squad
5. Win with best team!

### Multiplayer Mode

1. Click **"MULTIPLAYER AUCTION"**
2. **Create Room** or **Join Room** with code
3. Wait for host to start
4. Bid against real players!

---

## 🎨 Key Features at a Glance

| Feature       | Description                             |
| ------------- | --------------------------------------- |
| 💰 Budget     | ₹100 Crores per team                    |
| 👥 Squad Size | 15 players maximum                      |
| ⏱️ Timer      | 60s (Round 1), 30s (Round 2)            |
| 💪 Roles      | Batsmen, Bowlers, All-Rounders, Keepers |
| ⚡ Timeouts   | 2 strategic timeouts (90s each)         |
| 🎯 Categories | 5 player categories                     |
| 🔄 Rounds     | 2 rounds (main + accelerated)           |

---

## 🎮 Controls

```
Click "BID"           → Place bid (+₹1 Cr)
Click "PASS"          → Skip current player
Strategic Timeout     → Pause for 90s (2 per game)
Teams Table Toggle    → View all teams
Team Analysis         → Select team tab to analyze
```

---

## 📊 Understanding Your Dashboard

### During Auction

```
┌─────────────────────────────────────┐
│ AUCTION ARENA                       │
├─────────────────────────────────────┤
│ Player: Virat Kohli                 │
│ Role: Batsman | Country: India      │
│ Base Price: ₹15 Cr                  │
│                                     │
│ Current Bid: ₹18 Cr                 │
│ Highest Bidder: Chennai Super Kings│
│ Time Left: 45s                      │
│                                     │
│ [BID] [PASS] [STRATEGIC TIMEOUT]    │
├─────────────────────────────────────┤
│ YOUR TEAM: Mumbai Indians           │
│ Budget: ₹82 Cr | Players: 3/15      │
│ Spent: ₹18 Cr                       │
└─────────────────────────────────────┘
```

### Team Analysis

```
┌─────────────────────────────────────┐
│ [MI] [CSK] [RCB] [KKR] ...          │ ← Click tabs
├─────────────────────────────────────┤
│ Mumbai Indians                      │
│ Players: 15 | Budget: ₹5 Cr         │
│ Spent: ₹95 Cr | Avg: ₹6.3 Cr        │
│                                     │
│ 🏏 Batsmen (5)                      │
│ ⚡ Bowlers (5)                       │
│ 💪 All-Rounders (3)                 │
│ 🧤 Wicket-Keepers (2)               │
└─────────────────────────────────────┘
```

---

## 💡 Quick Tips

### Budget Management

```
✅ DO: Save ₹20 Cr for last 5 players
✅ DO: Spend ₹40-50 Cr on 3 star players
✅ DO: Keep budget for Round 2 bargains

❌ DON'T: Spend > ₹25 Cr on one player
❌ DON'T: Use all budget with 8+ players left
❌ DON'T: Ignore squad balance
```

### Squad Building

```
✅ DO: Get 1 wicket-keeper early
✅ DO: Aim for 5 batsmen, 5 bowlers
✅ DO: Target 2-3 all-rounders
✅ DO: Balance between stars and role players

❌ DON'T: Skip wicket-keeper position
❌ DON'T: Buy 10 batsmen, 2 bowlers
❌ DON'T: Leave squad incomplete
```

---

## 🐛 Quick Troubleshooting

### Port Already in Use

```powershell
# Windows
Stop-Process -Name node -Force

# Then restart
npm run dev
```

### Database Connection Failed

```bash
# Check .env file exists
# Verify DATABASE_URL is correct
# Test connection:
npx prisma db pull
```

### WebSocket Not Connecting

```bash
# Ensure room server is running
npm run start-room-server

# Should see: "WebSocket server listening on port 8080"
```

---

## 🎯 Game Flow Diagram

```
START
  │
  ├─→ SOLO AUCTION
  │     │
  │     ├─→ Choose Team
  │     ├─→ Auction Begins
  │     ├─→ Bid on Players
  │     ├─→ Build Squad (15 players)
  │     ├─→ View Results
  │     └─→ Leaderboard
  │
  └─→ MULTIPLAYER AUCTION
        │
        ├─→ Create/Join Room
        ├─→ Wait for Players
        ├─→ Host Starts Auction
        ├─→ Real-time Bidding
        ├─→ Build Squad
        ├─→ Compare Teams
        └─→ Winner Announced
```

---

## 📱 Multiplayer Room Flow

```
HOST                          PLAYERS
  │                              │
  ├─ Create Room                 │
  ├─ Share Code: ABC123 ────────→ Enter Code: ABC123
  │                              │
  ├─ Wait for players ←──────────┤ Join Room
  │                              │
  ├─ Start Auction ──────────────→ Auction Begins
  │                              │
  ├─ Place Bid ←────────────────→ Place Bid
  │                              │
  ├─ State Sync ←───────────────→ State Sync
  │                              │
  └─ Auction Complete ───────────→ View Results
```

---

## 🎮 Keyboard Shortcuts (Coming Soon)

```
Space     → Place Bid
P         → Pass
T         → Strategic Timeout
Escape    → Close Modals
Tab       → Switch Teams
```

---

## 📊 Session Persistence

**Your progress is automatically saved!**

- ✅ Refresh page → Continue where you left off
- ✅ Close tab → Data saved in session
- ✅ Browser restart → Use "Continue" button
- ❌ Clear cache → Data lost (use "New Game")

---

## 🔗 Important URLs

```
Application:    http://localhost:3000
WebSocket:      ws://localhost:8080
Prisma Studio:  npx prisma studio (http://localhost:5555)
```

---

## 📚 Learn More

### Full Documentation

- **[PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md)** - Complete project guide
- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Detailed setup instructions
- **[TECH_STACK.md](./TECH_STACK.md)** - Technology breakdown
- **[GAME_RULES.md](./GAME_RULES.md)** - Complete rules and strategies

### External Resources

- Next.js: https://nextjs.org/docs
- React: https://react.dev
- Prisma: https://www.prisma.io/docs
- Tailwind: https://tailwindcss.com/docs

---

## 🎯 Your First Winning Strategy

### Round 1 (Players 1-10) - Marquee

```
Budget to spend: ₹30 Cr
Get: 2 marquee players (₹15 Cr each)
```

### Round 1 (Players 11-40) - Core Squad

```
Budget to spend: ₹50 Cr
Get: 8-10 quality players (₹5 Cr average)
```

### Round 2 (Remaining) - Fill Gaps

```
Budget remaining: ₹20 Cr
Get: 3-5 role players to complete 15
```

---

## 🏆 Success Checklist

After your first auction, you should have:

- [ ] ✅ 15 players in squad
- [ ] ✅ At least 1 wicket-keeper
- [ ] ✅ 4-6 batsmen
- [ ] ✅ 4-6 bowlers
- [ ] ✅ 2-3 all-rounders
- [ ] ✅ Used 85-100% of budget
- [ ] ✅ Team rating 3+ stars

---

## 🎮 Ready to Play?

```bash
# Terminal 1
npm run dev

# Terminal 2 (for multiplayer)
npm run start-room-server

# Open: http://localhost:3000
# Click: START SOLO AUCTION
# Enjoy! 🏏🎉
```

---

**Time to build your dream team! Good luck! 🏆**
