# 🗄️ Database Setup Guide for IPL Auction Game

## Overview

We'll use **MongoDB** (free tier) or **PostgreSQL** (Vercel Postgres) to store:

- Auction room details
- Player auction results
- Leaderboard data
- User statistics

---

## Option 1: MongoDB Atlas (Recommended - Easy & Free)

### Step 1: Create MongoDB Account

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for free account
3. Create a **FREE M0 cluster** (512MB storage)

### Step 2: Get Connection String

1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy connection string: `mongodb+srv://username:<password>@cluster.mongodb.net/`
4. Replace `<password>` with your database password

### Step 3: Add to .env.local

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ipl-auction?retryWrites=true&w=majority
```

### Step 4: Install Mongoose

```bash
npm install mongoose
```

### Database Schema:

```javascript
// Auction Room
{
  roomCode: String,
  hostName: String,
  hostId: String,
  status: 'waiting' | 'starting' | 'active' | 'completed',
  teams: [{
    teamId: String,
    teamName: String,
    userName: String,
    budget: Number,
    players: Array
  }],
  startTime: Date,
  endTime: Date,
  minTeams: Number,
  createdAt: Date
}

// Leaderboard Entry
{
  userName: String,
  roomCode: String,
  teamName: String,
  finalRating: Number,
  totalSpent: Number,
  playersCount: Number,
  rank: Number,
  completedAt: Date
}

// User Stats
{
  userName: String,
  totalAuctions: Number,
  wins: Number,
  totalSpent: Number,
  avgRating: Number,
  bestTeam: Object
}
```

---

## Option 2: PostgreSQL (Vercel/Supabase)

### Step 1: Create Supabase Project

1. Go to https://supabase.com
2. Sign up and create new project (FREE)
3. Get connection string from Settings > Database

### Step 2: Add to .env.local

```env
DATABASE_URL=postgresql://user:password@host:port/database
```

### Step 3: Install Prisma

```bash
npm install prisma @prisma/client
npx prisma init
```

### Step 4: Create Schema (prisma/schema.prisma)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model AuctionRoom {
  id          String   @id @default(cuid())
  roomCode    String   @unique
  hostName    String
  hostId      String
  status      String   @default("waiting")
  teams       Json
  startTime   DateTime?
  endTime     DateTime?
  minTeams    Int      @default(2)
  createdAt   DateTime @default(now())
  leaderboard Leaderboard[]
}

model Leaderboard {
  id           String      @id @default(cuid())
  userName     String
  roomCode     String
  teamName     String
  finalRating  Float
  totalSpent   Float
  playersCount Int
  rank         Int
  completedAt  DateTime    @default(now())
  room         AuctionRoom @relation(fields: [roomCode], references: [roomCode])
}

model UserStats {
  id            String   @id @default(cuid())
  userName      String   @unique
  totalAuctions Int      @default(0)
  wins          Int      @default(0)
  totalSpent    Float    @default(0)
  avgRating     Float    @default(0)
  bestTeam      Json?
  updatedAt     DateTime @updatedAt
}
```

### Step 5: Run Migration

```bash
npx prisma migrate dev --name init
npx prisma generate
```

---

## Recommended: MongoDB (Simpler for Your Use Case)

**Why MongoDB?**

- ✅ Free tier is generous (512MB)
- ✅ Easy JSON-like document storage
- ✅ No schema migrations needed
- ✅ Fast setup
- ✅ Perfect for real-time auction data

---

## Implementation Plan

### Phase 1: Database Connection (I'll create)

- `lib/db.js` - MongoDB connection
- `lib/models/` - Mongoose schemas

### Phase 2: Room Flow (I'll implement)

1. Create room → Save to DB
2. Join room → Update DB
3. Select team → Mark team as taken
4. Start auction (when minTeams reached)
5. 10-second countdown
6. Auction proceeds normally
7. Save results to leaderboard

### Phase 3: API Routes (I'll create)

- `/api/rooms/create` - Create new room
- `/api/rooms/join` - Join existing room
- `/api/rooms/[code]` - Get room details
- `/api/leaderboard` - Get global leaderboard
- `/api/user-stats` - Get user statistics

---

## Next Steps

**Tell me which database you prefer:**

1. ✅ **MongoDB** (I recommend - easier)
2. ⚠️ **PostgreSQL** (more structured)

Once you choose, I'll:

1. Set up the database connection
2. Create the schemas/models
3. Implement the enhanced room system
4. Add team selection UI
5. Implement 10-second countdown
6. Save auction results
7. Create leaderboard page

**What's your choice? MongoDB or PostgreSQL?**
