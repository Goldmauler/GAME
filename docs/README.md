# 📚 Documentation - IPL Auction Game

Welcome to the complete documentation for the IPL Auction Game project!

---

## 📖 Available Documentation

### 🚀 [QUICKSTART.md](./QUICKSTART.md)

**Get started in 5 minutes!**

- Quick installation guide
- First auction walkthrough
- Essential tips and controls
- Common troubleshooting

👉 **Start here if you want to play immediately**

---

### 📋 [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md)

**Complete project understanding**

- Project description and features
- Technology stack overview
- Architecture breakdown
- How everything works together
- Data flow diagrams

👉 **Read this to understand the entire project**

---

### 🛠️ [SETUP_GUIDE.md](./SETUP_GUIDE.md)

**Detailed installation instructions**

- System requirements
- Step-by-step setup
- Database configuration (Supabase/PostgreSQL)
- Environment variables
- Troubleshooting guide
- Network access setup

👉 **Use this for production deployment or detailed setup**

---

### 🔧 [TECH_STACK.md](./TECH_STACK.md)

**In-depth technology breakdown**

- Frontend technologies (Next.js, React, TypeScript)
- Backend technologies (Node.js, WebSocket)
- Database (PostgreSQL, Prisma ORM)
- UI libraries and tools
- Architecture patterns
- Performance optimizations

👉 **Read this if you want to understand or contribute to the codebase**

---

### 🎮 [GAME_RULES.md](./GAME_RULES.md)

**Complete game mechanics**

- Auction rules and mechanics
- Team building guidelines
- Bidding strategies
- Special features (timeouts, rounds, categories)
- Winning conditions
- Tips and tricks

👉 **Master the game with this guide**

---

## 🎯 Quick Navigation

### I want to...

**...play the game right now**
→ Go to [QUICKSTART.md](./QUICKSTART.md)

**...understand what this project does**
→ Go to [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md)

**...set up for development**
→ Go to [SETUP_GUIDE.md](./SETUP_GUIDE.md)

**...learn the technologies used**
→ Go to [TECH_STACK.md](./TECH_STACK.md)

**...learn how to win auctions**
→ Go to [GAME_RULES.md](./GAME_RULES.md)

**...contribute to the project**
→ Read [TECH_STACK.md](./TECH_STACK.md) + [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md)

**...deploy to production**
→ Go to [SETUP_GUIDE.md](./SETUP_GUIDE.md) → Production Deployment

---

## 📂 Project Structure Reference

```
GAME/
├── docs/                          # 📚 Documentation (you are here)
│   ├── README.md                  # This file
│   ├── QUICKSTART.md              # 5-minute setup
│   ├── PROJECT_OVERVIEW.md        # Complete overview
│   ├── SETUP_GUIDE.md             # Detailed setup
│   ├── TECH_STACK.md              # Technology details
│   └── GAME_RULES.md              # Game mechanics
│
├── app/                           # Next.js application
├── components/                    # React components
├── server/                        # WebSocket server
├── lib/                           # Utilities
├── prisma/                        # Database schema
├── public/                        # Static assets
│
├── package.json                   # Dependencies
├── tsconfig.json                  # TypeScript config
├── tailwind.config.ts             # Tailwind config
├── next.config.mjs                # Next.js config
└── .env                           # Environment variables
```

---

## 🚀 Quick Command Reference

```bash
# Development
npm run dev                    # Start Next.js (port 3000)
npm run start-room-server      # Start WebSocket (port 8080)

# Database
npx prisma generate            # Generate Prisma Client
npx prisma db push             # Sync schema to database
npx prisma studio              # Open database GUI

# Production
npm run build                  # Build for production
npm start                      # Start production server
```

---

## 🎮 Game Features Summary

| Feature                    | Description                                      |
| -------------------------- | ------------------------------------------------ |
| 🎯 **Solo Auction**        | Play vs 9 AI teams                               |
| 👥 **Multiplayer**         | Real-time auction with friends                   |
| 💰 **Budget System**       | ₹100 Crores per team                             |
| ⏱️ **Round-Based**         | 2 rounds with different timers                   |
| 📊 **Player Categories**   | Marquee, Batsmen, Bowlers, All-Rounders, Keepers |
| ⚡ **Strategic Timeouts**  | 2 per team (90s each)                            |
| 🔄 **Session Persistence** | Auto-save on page refresh                        |
| 🎨 **3D Animations**       | Modern UI with smooth transitions                |
| 📈 **Team Analysis**       | Detailed squad breakdown                         |
| 🏆 **Leaderboard**         | Track top auctions                               |

---

## 🛠️ Technology Stack Summary

### Frontend

- **Next.js 16.0** - React framework
- **React 19.2** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations

### Backend

- **Node.js** - Runtime
- **WebSocket** - Real-time communication
- **Prisma** - Database ORM

### Database

- **PostgreSQL** - Primary database
- **Supabase** - Managed hosting

---

## 📞 Support & Resources

### Documentation Issues

If you find any issues with the documentation:

1. Check the specific guide again
2. Refer to related documentation
3. Check troubleshooting sections

### Code Issues

For code-related problems:

1. Check browser console for errors
2. Check terminal output
3. Verify environment variables
4. Ensure both servers are running

### Learning Resources

- **Next.js**: https://nextjs.org/docs
- **React**: https://react.dev
- **TypeScript**: https://www.typescriptlang.org/docs
- **Prisma**: https://www.prisma.io/docs
- **Tailwind**: https://tailwindcss.com/docs

---

## 🎯 Getting Started Paths

### Path 1: Quick Player (5 minutes)

```
QUICKSTART.md → Play Solo Auction → Have Fun!
```

### Path 2: Developer (30 minutes)

```
PROJECT_OVERVIEW.md → SETUP_GUIDE.md → TECH_STACK.md → Start Coding
```

### Path 3: Strategic Player (20 minutes)

```
QUICKSTART.md → GAME_RULES.md → Master Auctions → Win!
```

### Path 4: Complete Understanding (60 minutes)

```
Read all documentation → Understand everything → Build & Play
```

---

## 📊 Documentation Stats

- **Total Pages**: 5
- **Total Words**: ~15,000
- **Reading Time**: ~60 minutes (all docs)
- **Quick Start Time**: 5 minutes
- **Coverage**: 100% project features

---

## 🎯 Documentation Checklist

For contributors or advanced users:

- [ ] ✅ Read QUICKSTART.md - Understand basic usage
- [ ] ✅ Read PROJECT_OVERVIEW.md - Understand architecture
- [ ] ✅ Read SETUP_GUIDE.md - Set up development environment
- [ ] ✅ Read TECH_STACK.md - Understand technologies
- [ ] ✅ Read GAME_RULES.md - Master game mechanics
- [ ] ✅ Successfully run solo auction
- [ ] ✅ Successfully run multiplayer auction
- [ ] ✅ Understand database schema
- [ ] ✅ Understand WebSocket flow
- [ ] ✅ Ready to contribute!

---

## 🎮 Quick Links

- **GitHub Repository**: https://github.com/Goldmauler/GAME
- **Live Demo**: _(Add when deployed)_
- **Issues**: _(Add GitHub issues link)_
- **Contributions**: _(Add contribution guidelines)_

---

**Happy coding and happy auctioning! 🏏🎉**

---

## 📝 Document Version History

- **v1.0** (2025-01-11) - Initial comprehensive documentation
  - Created QUICKSTART.md
  - Created PROJECT_OVERVIEW.md
  - Created SETUP_GUIDE.md
  - Created TECH_STACK.md
  - Created GAME_RULES.md
  - Organized documentation structure

---

_Documentation maintained by the IPL Auction Game development team_
