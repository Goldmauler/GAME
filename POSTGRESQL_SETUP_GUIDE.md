# 🚀 PostgreSQL Database Setup - Step by Step

## ✅ Step 1: Create Supabase Account (FREE - 2 minutes)

1. **Go to**: https://supabase.com
2. **Click**: "Start your project"
3. **Sign in** with GitHub, Google, or email
4. **Create new organization** (if first time)

---

## ✅ Step 2: Create New Project (2 minutes)

1. **Click**: "New Project"
2. **Fill in**:
   - Name: `ipl-auction` (or any name)
   - Database Password: **SAVE THIS PASSWORD!** (You'll need it)
   - Region: Choose closest to you
   - Plan: **Free** (500MB database, 2GB bandwidth)
3. **Click**: "Create new project"
4. **Wait**: 2-3 minutes for project to provision

---

## ✅ Step 3: Get Database Connection String

1. In your project dashboard, click **"Settings"** (⚙️ icon in sidebar)
2. Click **"Database"** in settings menu
3. Scroll to **"Connection string"** section
4. Choose **"URI"** tab
5. Click **"Copy"** button

It will look like:

```
postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
```

---

## ✅ Step 4: Update .env.local File

1. Open `c:\Users\vimal\Desktop\GAME\.env.local`
2. Find the line with `DATABASE_URL=`
3. Replace it with your copied connection string:

```bash
DATABASE_URL="postgresql://postgres.abcdefgh:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres"
```

**IMPORTANT**:

- Replace `[YOUR-PASSWORD]` with the password you created
- Keep the quotes around the URL
- Save the file

---

## ✅ Step 5: Run Database Migration (Creates Tables)

Open PowerShell in your project folder and run:

```powershell
npx prisma migrate dev --name init
```

This will:

- Create all database tables
- Set up indexes
- Generate Prisma Client

You should see:

```
✔ Generated Prisma Client
✔ The migration has been applied successfully
```

---

## ✅ Step 6: Generate Prisma Client

```powershell
npx prisma generate
```

This creates the TypeScript types for database access.

---

## ✅ Step 7: Verify Setup

Check if everything works:

```powershell
npx prisma studio
```

This opens a visual database browser at http://localhost:5555

You should see 4 tables:

- AuctionRoom
- LeaderboardEntry
- UserStats
- PlayerPurchase

---

## 🎉 Done! Now What?

Your database is ready! Here's what will happen:

### When Room is Created:

```
1. Room saved to AuctionRoom table
2. Players join and select teams
3. Host starts auction
4. Auction proceeds normally
5. When complete → Save results
```

### Data Stored:

- **AuctionRoom**: All room details, teams, players
- **LeaderboardEntry**: Final rankings per room
- **UserStats**: User performance across all auctions
- **PlayerPurchase**: Every player bought in every auction

---

## 📊 Database Schema Overview

### AuctionRoom

```javascript
{
  roomCode: "ABC123",
  hostName: "John",
  hostId: "user-123",
  status: "active", // lobby, countdown, active, completed
  teams: [...], // All team data
  players: [...], // All players
  startTime, endTime, minTeams, createdAt
}
```

### LeaderboardEntry

```javascript
{
  roomCode: "ABC123",
  userName: "John",
  teamName: "Mumbai Indians",
  finalRating: 82.5,
  totalSpent: 55,
  budgetLeft: 45,
  playersCount: 15,
  rank: 1 // 1st place!
}
```

### UserStats

```javascript
{
  userName: "John",
  totalAuctions: 25,
  wins: 8,
  topThree: 15,
  avgRating: 78.5,
  highestRating: 92.3
}
```

---

## 🔧 Troubleshooting

### Error: "Can't reach database server"

- Check if DATABASE_URL is correct
- Verify password has no special characters causing issues
- Try URL encoding the password if it has special chars

### Error: "Prisma Client could not be generated"

- Run: `npx prisma generate`
- Restart your code editor

### Error: "Table already exists"

- Run: `npx prisma migrate reset`
- Then: `npx prisma migrate dev --name init`

---

## 📝 Next Steps After Setup

Once your database is ready, tell me and I'll:

1. ✅ Create API routes for database operations
2. ✅ Update WebSocket server to save auction data
3. ✅ Create team selection UI component
4. ✅ Add countdown timer component
5. ✅ Build leaderboard page
6. ✅ Create user stats dashboard
7. ✅ Complete the full integration

---

## ⚡ Quick Commands Reference

```powershell
# View database in browser
npx prisma studio

# Reset database (careful!)
npx prisma migrate reset

# Generate client after schema changes
npx prisma generate

# Create new migration
npx prisma migrate dev --name your_migration_name

# Check migration status
npx prisma migrate status
```

---

## 🎯 Current Status

- ✅ Prisma installed
- ✅ Schema created (4 tables)
- ✅ Prisma client setup
- ⏳ **YOU NEED TO**: Get Supabase connection string
- ⏳ **THEN**: Run migration commands

**Once you complete Steps 1-6, we're ready to build the API routes!** 🚀
