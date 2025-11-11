# 🏏 IPL Auction Game

> **A full-stack, real-time multiplayer cricket auction simulator that brings the excitement of IPL player auctions to your browser!**

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-12+-blue)](https://www.postgresql.org/)
[![WebSocket](https://img.shields.io/badge/WebSocket-Real--time-green)](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)

---

## 🎮 What is This?

An immersive cricket auction game that replicates the **Indian Premier League (IPL) auction experience**. Build your dream team by bidding on real cricket players, manage your budget strategically, and compete against AI opponents or real players in real-time multiplayer auctions!

### ✨ Key Features

- 🎯 **Solo Auction Mode** - Play against 9 intelligent AI teams
- 👥 **Multiplayer Mode** - Real-time bidding with friends via room codes
- 💰 **Realistic Budget System** - ₹100 Crores per team
- ⚡ **IPL Auction Features** - Player categories, rounds, strategic timeouts, breaks
- 🎨 **Modern UI** - 3D animated backgrounds, smooth transitions
- 💾 **Session Persistence** - Never lose your progress
- 📊 **Team Analysis** - Comprehensive squad breakdown and statistics
- 🏆 **Leaderboard** - Track and compare your auction results

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database or Supabase account

### Installation (5 minutes)

```bash
# 1. Clone the repository
git clone https://github.com/Goldmauler/GAME.git
cd GAME

# 2. Install dependencies
npm install

# 3. Set up environment variables
# Create .env file with your database URL
echo 'DATABASE_URL="postgresql://user:password@host:5432/database"' > .env

# 4. Initialize database
npx prisma generate
npx prisma db push

# 5. Start the application
# Terminal 1: Next.js server
npm run dev

# Terminal 2: WebSocket server (for multiplayer)
npm run start-room-server

# 6. Open browser
# http://localhost:3000
```

### First Auction

1. Open **http://localhost:3000**
2. Click **"START SOLO AUCTION"**
3. Choose your favorite IPL team
4. Start bidding and build your squad!

---

## 📚 Complete Documentation

All comprehensive documentation is available in the **[`docs/`](./docs/)** folder:

| Document | Description | When to Read |
|----------|-------------|--------------|
| **[📖 Quick Start](./docs/QUICKSTART.md)** | 5-minute setup guide | Start here! |
| **[🎯 Project Summary](./docs/PROJECT_SUMMARY.md)** | Stats & overview | Quick understanding |
| **[📋 Project Overview](./docs/PROJECT_OVERVIEW.md)** | Complete guide | Detailed understanding |
| **[🛠️ Setup Guide](./docs/SETUP_GUIDE.md)** | Detailed installation | Production setup |
| **[🔧 Tech Stack](./docs/TECH_STACK.md)** | Technology breakdown | For developers |
| **[🎮 Game Rules](./docs/GAME_RULES.md)** | Rules and strategies | Master the game |

👉 **[View Full Documentation Index →](./docs/README.md)**

---

## 🎯 Game Overview

### Solo Auction Mode

- Play against 9 AI teams with smart bidding strategies
- Choose any IPL franchise to manage
- Switch teams anytime during auction
- ₹100 Crore budget to build 15-player squad
- Real-time budget tracking and team analysis

### Multiplayer Auction Mode

- Create or join rooms with unique codes
- 2-10 players per auction
- Real-time synchronized bidding via WebSocket
- Host controls and room management
- Live chat and player interactions

### Auction Features

- **Player Categorization**: Marquee, Batsmen, Bowlers, All-Rounders, Keepers
- **Round System**: 2 rounds (60s and 30s timers)
- **Strategic Timeouts**: 2 per team (90s each)
- **Category Breaks**: 30s breaks between categories
- **Real Budget Management**: ₹1 Cr bid increments
- **Session Persistence**: Auto-save on refresh

---

## 🛠️ Tech Stack

### Frontend

- **Next.js 16.0** (App Router, Turbopack)
- **React 19.2** (Latest with enhanced rendering)
- **TypeScript** (Strict type safety)
- **Tailwind CSS** (Utility-first styling)
- **Framer Motion** (Smooth animations)
- **shadcn/ui** (Component library)

### Backend

- **Node.js** (Server runtime)
- **WebSocket (ws)** (Real-time bidding)
- **Prisma 6.19** (Type-safe ORM)
- **PostgreSQL** (Primary database)

### External APIs

- **Cricbuzz API** (Player data and statistics)

👉 **[See Complete Tech Stack →](./docs/TECH_STACK.md)**

---

## 📂 Project Structure

```
GAME/
├── docs/                          # 📚 Complete documentation
├── app/                           # Next.js app (pages, layouts, API)
├── components/                    # React components
│   ├── auction-arena.tsx          # Solo auction UI
│   ├── auction-arena-room.tsx     # Multiplayer UI
│   └── ui/                        # shadcn/ui components
├── server/                        # Backend logic
│   ├── auction-room-server.js     # WebSocket server
│   └── auction-logic.js           # AI bidding logic
├── lib/                           # Utilities and helpers
├── prisma/                        # Database schema & migrations
├── public/                        # Static assets
├── .env                           # Environment variables
└── package.json                   # Dependencies
```

---

## 🎮 How to Play

### Solo Mode

1. **Select Team** - Choose your IPL franchise
2. **Auction Begins** - Players presented one by one
3. **Place Bids** - Click "BID" to increase by ₹1 Cr
4. **Strategic Thinking** - Use timeouts to plan
5. **Build Squad** - Aim for 15 players with balance
6. **View Results** - Analyze your team's rating

### Multiplayer Mode

1. **Create/Join Room** - Use unique room codes
2. **Wait for Players** - 2-10 players needed
3. **Host Starts** - Room creator begins auction
4. **Real-time Bidding** - Compete with real opponents
5. **Chat & Interact** - Communicate during auction
6. **Compare Teams** - See who built the best squad

### Tips for Success

- 💡 Keep ₹20 Cr for last 5 players
- 💡 Get at least 1 wicket-keeper early
- 💡 Balance stars with role players
- 💡 Use strategic timeouts wisely
- 💡 Watch AI bidding patterns

👉 **[See Complete Rules →](./docs/GAME_RULES.md)**

---

## 🔧 Development

### Available Scripts

```bash
npm run dev                    # Start Next.js dev server (port 3000)
npm run start-room-server      # Start WebSocket server (port 8080)
npm run build                  # Build for production
npm start                      # Start production server
npx prisma generate            # Generate Prisma Client
npx prisma db push             # Sync database schema
npx prisma studio              # Open database GUI
```

### Environment Variables

```env
# .env
DATABASE_URL="postgresql://user:password@host:5432/database"
```

👉 **[See Detailed Setup →](./docs/SETUP_GUIDE.md)**

---

## 📊 Database Schema

```prisma
model AuctionResult {
  id          String   @id @default(cuid())
  userName    String
  teamName    String
  players     Json
  totalSpent  Float
  createdAt   DateTime @default(now())
}

model Player {
  id          String   @id
  name        String   @unique
  role        String
  country     String
  stats       Json?
}

model Room {
  id          String   @id
  roomCode    String   @unique
  hostId      String
  players     Json
  status      String
}
```

---

## 🤝 Contributing

Contributions are welcome! Here's how:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 🐛 Troubleshooting

### Common Issues

**Port already in use:**

```powershell
Stop-Process -Name node -Force
npm run dev
```

**Database connection failed:**

```bash
# Verify .env file exists and DATABASE_URL is correct
npx prisma db pull
```

**WebSocket not connecting:**

```bash
# Ensure room server is running
npm run start-room-server
```

👉 **[See Full Troubleshooting Guide →](./docs/SETUP_GUIDE.md#troubleshooting)**

---

## 📄 License

This project is open source and available for personal and educational use.

---

## 🙏 Acknowledgments

- IPL for the auction format inspiration
- Cricbuzz for player data
- shadcn/ui for beautiful components
- Next.js team for amazing framework

---

## 📞 Support

- **Documentation**: [docs/README.md](./docs/README.md)
- **GitHub Issues**: [Report a bug or request feature](https://github.com/Goldmauler/GAME/issues)

---

**Built with ❤️ for cricket and auction enthusiasts!**

**⭐ Star this repo if you enjoyed the game!**

- Persistence: The server is in-memory; add a DB (SQLite/Postgres) if you need persistent auctions.
- Auth: Currently anyone can pick any team via dropdown. Add authentication and proper team claiming for real multiplayer.
- Tests: Minimal unit tests and CI are not yet added.
- UI polish: More animation, graphics and cricket theming can be improved further.

If you want, I can now:

- Add unit tests for auction logic and AI (recommended).
- Improve UI visuals and fix TypeScript strictness issues.
- Add persistence or convert server to TypeScript.
