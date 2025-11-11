# 🏏 IPL Auction Game - Complete Project Overview

## 📋 Table of Contents

1. [Project Description](#project-description)
2. [Game Features](#game-features)
3. [Tech Stack](#tech-stack)
4. [Architecture](#architecture)
5. [How It Works](#how-it-works)
6. [Getting Started](#getting-started)

---

## 🎮 Project Description

**IPL Auction Game** is a full-stack, real-time multiplayer cricket auction simulator that replicates the excitement and strategy of the Indian Premier League (IPL) player auction. Players can participate in realistic auction sessions, build their dream cricket teams, and compete with others in an immersive bidding environment.

### Key Highlights

- 🎯 **Realistic Auction Mechanics**: Player categorization, round-based bidding, strategic timeouts
- 👥 **Multiplayer Support**: Real-time bidding with WebSocket connections
- 🤖 **Solo Mode**: Practice against AI opponents with smart bidding strategies
- 💾 **Session Persistence**: Never lose your progress with automatic saving
- 🎨 **Modern UI**: 3D animated backgrounds, smooth transitions, responsive design
- 📊 **Analytics**: Comprehensive team analysis, squad balance, leaderboards

---

## 🎯 Game Features

### Auction Modes

#### 1. **Solo Auction**

- Play against 9 AI teams
- Choose any IPL team to manage
- Switch teams during auction (no locking)
- ₹100 Crore budget per team
- Real-time budget tracking
- Comprehensive teams overview table
- Team analysis with role-based player organization

#### 2. **Multiplayer Auction (Room-Based)**

- Create or join auction rooms with unique codes
- 2-10 players per room
- Real-time synchronized bidding
- Host controls (start auction, kick players)
- Live chat functionality
- Room persistence across refreshes

### Realistic IPL Auction Features

#### Player Categorization

- **Marquee Players**: Star performers, highest base prices
- **Batsmen**: Specialist batting talent
- **Bowlers**: Fast bowlers, spinners
- **All-Rounders**: Dual-skilled players
- **Wicket-Keepers**: Specialist keepers

#### Round-Based System

- **Round 1**: Standard 60-second timer per player
- **Round 2**: Accelerated auction (30-second timer)
- Unsold players return in Round 2
- Strategic depth with round progression

#### Strategic Elements

- **Strategic Timeouts**: 2 per team, 90 seconds each
- **Category Breaks**: 30-second breaks between categories
- **Snack Breaks**: 60-second breaks at strategic intervals
- **RTM (Right to Match)**: Ability to match final bids (structure in place)

#### Auction Mechanics

- ₹1 Crore bid increments
- Countdown timer with visual feedback
- Auto-pass after timer expires
- Real-time budget validation
- Highest bidder wins player

### Team Management

#### Squad Building

- Maximum 15 players per team
- Budget management (₹100 Crores)
- Role balance tracking
- Real-time spending analysis

#### Team Analysis View

- **Tab-based interface** for all 10 teams
- **Summary card** with key metrics:
  - Total players & budget remaining
  - Money spent & average price per player
  - Squad composition by role
- **Role-based player lists**:
  - Batsmen (Blue theme)
  - Bowlers (Red theme)
  - All-Rounders (Purple theme)
  - Wicket-Keepers (Green theme)
- **Player details**: Name, base price, sold price, price increase %
- **Visual indicators**: Your team highlighted, smooth animations

### Results & Leaderboard

- Automatic database saving
- Historical auction results
- Player statistics
- Team rankings
- Points table with match simulations

---

## 🛠️ Tech Stack

### Frontend

- **Framework**: Next.js 16.0.0 (App Router)
- **UI Library**: React 19.2.0
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui component library
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **State Management**: React Hooks + Context

### Backend

- **Server**: Node.js with WebSocket (ws library)
- **Real-time**: WebSocket connections on port 8080
- **API Routes**: Next.js API routes
- **Database ORM**: Prisma 6.19.0

### Database

- **Primary**: PostgreSQL (via Supabase)
- **Connection**: Direct PostgreSQL connection string
- **Schema Management**: Prisma migrations
- **Tables**:
  - `AuctionResult` - Completed auctions
  - `Player` - Player statistics
  - `Room` - Multiplayer room data

### External APIs

- **Cricbuzz Unofficial API**: Real player statistics and information
- **Endpoints Used**:
  - Player info by ID
  - Player statistics
  - Search functionality

### Development Tools

- **Build Tool**: Turbopack (Next.js 15+)
- **Package Manager**: npm / pnpm
- **Version Control**: Git

---

## 🏗️ Architecture

### Project Structure

```
GAME/
├── app/                          # Next.js app directory
│   ├── page.tsx                  # Main lobby with 3D animations
│   ├── layout.tsx                # Root layout
│   ├── globals.css               # Global styles
│   ├── api/                      # API routes
│   │   ├── auction/              # Auction endpoints
│   │   ├── leaderboard/          # Leaderboard data
│   │   ├── players/              # Player CRUD
│   │   ├── rooms/                # Room management
│   │   └── user-stats/           # User statistics
│   ├── room/[roomCode]/          # Dynamic room pages
│   ├── rooms/                    # Room listing
│   └── leaderboard/              # Global leaderboard
│
├── components/                   # React components
│   ├── auction-arena.tsx         # Solo auction UI
│   ├── auction-arena-room.tsx    # Multiplayer auction UI
│   ├── room-lobby.tsx            # Room lobby component
│   ├── header.tsx                # Navigation header
│   ├── team-showcase.tsx         # Team display
│   ├── points-table.tsx          # Match results
│   ├── player-analysis.tsx       # Player stats modal
│   └── ui/                       # shadcn/ui components
│
├── server/                       # Backend logic
│   ├── auction-room-server.js    # WebSocket server
│   ├── auction-logic.js          # Auction algorithms
│   └── team-rating.js            # Team analysis
│
├── lib/                          # Utility functions
│   ├── prisma.ts                 # Prisma client
│   ├── utils.ts                  # Helper functions
│   ├── auctioneer-logic.ts       # AI bidding logic
│   ├── rankings.ts               # Team rankings
│   └── team-rating.ts            # Squad analysis
│
├── prisma/                       # Database
│   ├── schema.prisma             # Database schema
│   └── migrations/               # Schema migrations
│
├── public/                       # Static assets
└── docs/                         # Documentation
```

### Data Flow

#### Solo Auction Flow

1. User selects "Solo Auction" from lobby
2. Choose IPL team to manage
3. `auction-arena.tsx` component loads
4. Player list generated with categories
5. Bidding cycle begins:
   - Timer starts (60s Round 1, 30s Round 2)
   - AI teams make bids using `auctioneer-logic.ts`
   - User can place bids
   - Highest bidder wins
   - Budget updated, player added to team
6. Session state saved to `sessionStorage`
7. Auction completes → Results saved to PostgreSQL

#### Multiplayer Auction Flow

1. User creates/joins room via `/rooms` page
2. Room code generated/entered
3. WebSocket connection established to port 8080
4. `auction-room-server.js` manages room state
5. Host starts auction
6. Server broadcasts player updates to all clients
7. Bidding messages sent via WebSocket:
   ```json
   { "type": "bid", "teamName": "MI", "amount": 5 }
   ```
8. Server validates bids, updates state
9. Winner determined, state synchronized
10. Results saved to database via API route

#### Database Persistence

1. Auction completes
2. API route `/api/auction` receives results
3. Prisma ORM creates `AuctionResult` record
4. Player statistics updated in `Player` table
5. Room data saved/updated in `Room` table
6. Leaderboard automatically recalculated

---

## 🎮 How It Works

### Game Initialization

#### Solo Mode

```typescript
// app/page.tsx - User chooses mode
const [gamePhase, setGamePhase] = useState('lobby')

// Load saved game from sessionStorage
useEffect(() => {
  const saved = sessionStorage.getItem('gamePhase')
  if (saved) setGamePhase(saved)
}, [])

// Start auction
<AuctionArena onComplete={handleComplete} />
```

#### Multiplayer Mode

```typescript
// User creates room
POST /api/rooms/create
Response: { roomCode: "ABC123", hostId: "user123" }

// Join room via WebSocket
const ws = new WebSocket('ws://localhost:8080')
ws.send(JSON.stringify({
  type: 'join',
  roomCode: 'ABC123',
  playerName: 'Player1'
}))
```

### Bidding Mechanism

#### Client-Side (Solo)

```typescript
// components/auction-arena.tsx
const handleBid = () => {
  if (currentBid + 1 > myTeam.budget) return; // Budget check

  setCurrentBid((prev) => prev + 1);
  setHighestBidder(myTeam.id);

  // Reset timer
  setTimeLeft(60);

  // Save state
  sessionStorage.setItem("auctionState", JSON.stringify(state));
};
```

#### Client-Side (Multiplayer)

```typescript
// Send bid to server
ws.send(
  JSON.stringify({
    type: "bid",
    teamName: selectedTeam,
    amount: currentBid + 1,
  })
);

// Receive updates
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === "auctionUpdate") {
    setCurrentBid(data.currentBid);
    setHighestBidder(data.highestBidder);
    setTimeLeft(data.timeLeft);
  }
};
```

#### Server-Side Logic

```javascript
// server/auction-room-server.js
handleBid(ws, message) {
  const { teamName, amount } = message
  const team = this.teams[teamName]

  // Validation
  if (amount <= this.currentBid) return
  if (amount > team.budget) return

  // Update state
  this.currentBid = amount
  this.highestBidder = teamName
  this.timeLeft = 60 // Reset timer

  // Broadcast to all clients
  this.broadcastState()
}
```

### AI Bidding Strategy

```typescript
// lib/auctioneer-logic.ts
export const makeAIBid = (
  player: Player,
  currentBid: number,
  team: Team,
  allTeams: Team[]
): boolean => {
  // Calculate player value
  const valueScore = calculatePlayerValue(player);

  // Check team needs
  const needScore = calculateTeamNeed(team, player.role);

  // Budget awareness
  const budgetFactor = team.budget / 100;

  // Competition factor
  const competitionLevel = allTeams.filter(
    (t) => t.budget >= currentBid + 1
  ).length;

  // Decision algorithm
  const bidProbability =
    valueScore * 0.4 +
    needScore * 0.3 +
    budgetFactor * 0.2 +
    (1 - competitionLevel / 10) * 0.1;

  return Math.random() < bidProbability && team.budget >= currentBid + 1;
};
```

### Session Persistence

```typescript
// Save state
useEffect(() => {
  const state = {
    gamePhase,
    teams,
    playerIndex,
    currentBid,
    auctionPhase,
    results,
  };
  sessionStorage.setItem("auctionState", JSON.stringify(state));
}, [teams, playerIndex, currentBid]);

// Load state on mount
useEffect(() => {
  const saved = sessionStorage.getItem("auctionState");
  if (saved) {
    const state = JSON.parse(saved);
    setTeams(state.teams);
    setPlayerIndex(state.playerIndex);
    setCurrentBid(state.currentBid);
    // ... restore all state
  }
}, []);

// Reset functionality
const resetGame = () => {
  sessionStorage.removeItem("gamePhase");
  sessionStorage.removeItem("auctionState");
  window.location.reload();
};
```

### Real-Time Synchronization

```javascript
// Server broadcasts state every 100ms
setInterval(() => {
  if (this.auctionActive && this.timeLeft > 0) {
    this.timeLeft -= 0.1;

    if (this.timeLeft <= 0) {
      this.handleTimeout();
    }

    this.broadcastState();
  }
}, 100);

// Client receives updates
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);

  switch (data.type) {
    case "auctionUpdate":
      updateAuctionState(data);
      break;
    case "playerSold":
      handlePlayerSold(data);
      break;
    case "nextPlayer":
      loadNextPlayer(data);
      break;
    case "categoryBreak":
      showBreakScreen(data);
      break;
  }
};
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database (Supabase account recommended)
- Git for version control

### Quick Setup

1. **Clone Repository**

   ```bash
   git clone https://github.com/Goldmauler/GAME.git
   cd GAME
   ```

2. **Install Dependencies**

   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Environment Setup**
   Create `.env` file:

   ```env
   DATABASE_URL="postgresql://user:password@host:5432/database"
   ```

4. **Database Setup**

   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start Development Servers**

   Terminal 1 - Next.js:

   ```bash
   npm run dev
   ```

   Terminal 2 - WebSocket Server:

   ```bash
   npm run start-room-server
   ```

6. **Access Application**
   - Frontend: http://localhost:3000
   - WebSocket: ws://localhost:8080

### First Auction

1. Open http://localhost:3000
2. Click **"START SOLO AUCTION"**
3. Select your favorite IPL team
4. Start bidding when auction begins!

---

## 📚 Additional Documentation

- **[Setup Guide](./SETUP_GUIDE.md)** - Detailed installation instructions
- **[Tech Stack Details](./TECH_STACK.md)** - In-depth technology breakdown
- **[API Reference](./API_REFERENCE.md)** - Backend endpoints documentation
- **[Game Rules](./GAME_RULES.md)** - Complete auction rules and mechanics

---

## 🎯 Key Takeaways

✅ **Full-Stack Application**: Next.js frontend + Node.js WebSocket backend + PostgreSQL database

✅ **Real-Time Multiplayer**: WebSocket-based synchronization for live bidding

✅ **Realistic Simulation**: Authentic IPL auction mechanics with all features

✅ **Modern Tech Stack**: Latest React, TypeScript, Tailwind CSS, Framer Motion

✅ **Production Ready**: Session persistence, error handling, database integration

✅ **Scalable Architecture**: Component-based design, modular server logic

---

**Built with ❤️ for cricket and auction enthusiasts!**
