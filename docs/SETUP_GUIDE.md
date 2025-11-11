# 🚀 IPL Auction Game - Setup Guide

## 📋 Table of Contents

1. [System Requirements](#system-requirements)
2. [Installation Steps](#installation-steps)
3. [Database Configuration](#database-configuration)
4. [Running the Application](#running-the-application)
5. [Troubleshooting](#troubleshooting)

---

## 💻 System Requirements

### Required Software

- **Node.js**: Version 18.x or higher
- **npm** or **pnpm**: Latest version
- **Git**: For cloning repository
- **PostgreSQL**: Version 12+ (or Supabase account)

### Recommended Specifications

- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 500MB free space
- **OS**: Windows 10/11, macOS 10.15+, Linux (Ubuntu 20.04+)
- **Browser**: Chrome 90+, Firefox 88+, Edge 90+

---

## 📥 Installation Steps

### 1. Clone Repository

```bash
# Via HTTPS
git clone https://github.com/Goldmauler/GAME.git

# Or via SSH
git clone git@github.com:Goldmauler/GAME.git

# Navigate to project directory
cd GAME
```

### 2. Install Dependencies

```bash
# Using npm
npm install

# Or using pnpm (faster)
pnpm install
```

**Expected Output:**

```
✓ Dependencies installed successfully
✓ 1234 packages installed
```

### 3. Environment Configuration

Create a `.env` file in the project root:

```bash
# Windows (PowerShell)
New-Item .env

# macOS/Linux
touch .env
```

Add the following variables:

```env
# Database Connection
DATABASE_URL="postgresql://username:password@host:5432/database_name"

# Optional: API Keys (if using external services)
CRICBUZZ_API_KEY="your_api_key_here"
```

**Example with Supabase:**

```env
DATABASE_URL="postgresql://postgres.inzxttwcusjvufplkkud:YourPassword@aws-0-ap-south-1.pooler.supabase.com:5432/postgres"
```

---

## 🗄️ Database Configuration

### Option 1: Supabase (Recommended)

#### Step 1: Create Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub/Google

#### Step 2: Create New Project

1. Click "New Project"
2. Fill in details:
   - **Name**: IPL-Auction-Game
   - **Database Password**: (create strong password)
   - **Region**: Choose nearest region
3. Click "Create new project"
4. Wait 2-3 minutes for setup

#### Step 3: Get Connection String

1. Go to **Settings** → **Database**
2. Scroll to **Connection String**
3. Copy **URI** format connection string
4. Add to `.env` file as `DATABASE_URL`

#### Step 4: Initialize Database Schema

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push
```

**Expected Output:**

```
✓ Generated Prisma Client
✓ Database schema synchronized
```

### Option 2: Local PostgreSQL

#### Step 1: Install PostgreSQL

- **Windows**: Download from [postgresql.org](https://www.postgresql.org/download/windows/)
- **macOS**: `brew install postgresql`
- **Linux**: `sudo apt-get install postgresql`

#### Step 2: Create Database

```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create database
CREATE DATABASE ipl_auction_game;

-- Create user (optional)
CREATE USER auction_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE ipl_auction_game TO auction_user;
```

#### Step 3: Configure .env

```env
DATABASE_URL="postgresql://auction_user:your_password@localhost:5432/ipl_auction_game"
```

#### Step 4: Run Migrations

```bash
npx prisma generate
npx prisma db push
```

---

## 🏃 Running the Application

### Development Mode

You need **TWO terminals** running simultaneously:

#### Terminal 1: Next.js Development Server

```bash
npm run dev
```

**Expected Output:**

```
▲ Next.js 16.0.0
- Local:        http://localhost:3000
- Network:      http://192.168.1.x:3000

✓ Ready in 2.5s
```

#### Terminal 2: WebSocket Server

```bash
npm run start-room-server
```

**Expected Output:**

```
🎮 Auction Room Server Started
🌐 WebSocket server listening on port 8080
✓ Ready for connections
```

### Access the Application

1. Open browser: **http://localhost:3000**
2. You should see the lobby with 3D animated background
3. Choose **Solo Auction** or **Multiplayer**

---

## 🎮 Using the Application

### Solo Auction Quick Start

1. Click **"START SOLO AUCTION"**
2. Select your IPL team (e.g., Mumbai Indians)
3. Wait for auction to begin
4. Click **"BID"** button to place bids
5. Monitor your budget (₹100 Crores)
6. Build your 15-player squad
7. View results and team analysis

### Multiplayer Auction Quick Start

1. Click **"MULTIPLAYER AUCTION"**
2. **Create Room**:
   - Enter room name
   - Click "Create Room"
   - Share room code with friends
3. **Join Room**:
   - Enter room code
   - Enter your name
   - Click "Join Room"
4. Wait for host to start auction
5. Bid in real-time with other players

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Port Already in Use

**Error:**

```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:**

**Windows PowerShell:**

```powershell
# Find process using port 3000
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess

# Kill the process
Stop-Process -Id <ProcessID> -Force

# Or kill all Node processes
Stop-Process -Name node -Force
```

**macOS/Linux:**

```bash
# Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Find and kill process on port 8080
lsof -ti:8080 | xargs kill -9
```

#### 2. Database Connection Failed

**Error:**

```
Error: P1001: Can't reach database server
```

**Solutions:**

✅ **Check DATABASE_URL format:**

```env
# Correct format
DATABASE_URL="postgresql://user:password@host:5432/database"

# Common mistakes:
# ❌ Missing protocol: user:password@host:5432/database
# ❌ Wrong port: postgresql://user:password@host:3000/database
# ❌ Special chars not encoded: password contains @ or #
```

✅ **Encode special characters in password:**

```
@ → %40
# → %23
$ → %24
% → %25
```

Example:

```env
# Password: Pass@123
DATABASE_URL="postgresql://user:Pass%40123@host:5432/db"
```

✅ **Test connection:**

```bash
npx prisma db pull
```

#### 3. Prisma Client Not Generated

**Error:**

```
Error: @prisma/client did not initialize yet
```

**Solution:**

```bash
# Generate Prisma Client
npx prisma generate

# If still failing, reinstall
npm install @prisma/client
npx prisma generate
```

#### 4. WebSocket Connection Failed

**Error in browser console:**

```
WebSocket connection to 'ws://localhost:8080' failed
```

**Solutions:**

✅ **Ensure WebSocket server is running:**

```bash
npm run start-room-server
```

✅ **Check if port 8080 is available:**

```powershell
# Windows
Test-NetConnection -ComputerName localhost -Port 8080

# macOS/Linux
nc -zv localhost 8080
```

✅ **Check firewall settings:**

- Allow Node.js through firewall
- Allow port 8080 for incoming connections

#### 5. Module Not Found Errors

**Error:**

```
Error: Cannot find module 'framer-motion'
```

**Solution:**

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Or force clean install
npm ci
```

#### 6. Database Schema Out of Sync

**Error:**

```
Error: Invalid prisma.auctionResult.create() invocation
```

**Solution:**

```bash
# Reset database (⚠️ DELETES ALL DATA)
npx prisma migrate reset

# Or just push schema changes
npx prisma db push
```

---

## 🔍 Verification Checklist

After setup, verify everything works:

- [ ] ✅ Next.js dev server running on port 3000
- [ ] ✅ WebSocket server running on port 8080
- [ ] ✅ Can access http://localhost:3000
- [ ] ✅ Lobby page loads with animations
- [ ] ✅ Solo auction starts successfully
- [ ] ✅ Can create multiplayer room
- [ ] ✅ Database connection successful
- [ ] ✅ No console errors in browser

---

## 📦 Package Scripts

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "start-room-server": "node server/auction-room-server.js",
    "prisma:generate": "prisma generate",
    "prisma:push": "prisma db push",
    "prisma:studio": "prisma studio"
  }
}
```

### Usage:

```bash
# Development
npm run dev                    # Start Next.js dev server
npm run start-room-server      # Start WebSocket server

# Production
npm run build                  # Build for production
npm start                      # Start production server

# Database
npm run prisma:generate        # Generate Prisma Client
npm run prisma:push           # Push schema to database
npm run prisma:studio         # Open Prisma Studio GUI
```

---

## 🌐 Network Access (Optional)

To access from other devices on your network:

### 1. Find Your Local IP

**Windows:**

```powershell
ipconfig
# Look for IPv4 Address under your network adapter
```

**macOS/Linux:**

```bash
ifconfig
# or
ip addr show
```

### 2. Update Next.js Config

```javascript
// next.config.mjs
const nextConfig = {
  // Allow external access
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [{ key: "Access-Control-Allow-Origin", value: "*" }],
      },
    ];
  },
};
```

### 3. Access from Other Devices

```
http://YOUR_LOCAL_IP:3000
ws://YOUR_LOCAL_IP:8080
```

Example: `http://192.168.1.100:3000`

---

## 🚀 Production Deployment

### Vercel Deployment (Frontend)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import repository
4. Add environment variables
5. Deploy

### WebSocket Server Deployment

For production WebSocket server, consider:

- **Railway**: Simple deployment
- **Render**: Free tier available
- **AWS EC2**: Full control
- **DigitalOcean**: App Platform

Update WebSocket URL in production:

```typescript
// components/auction-arena-room.tsx
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080";
```

---

## 📞 Support

If you encounter issues not covered here:

1. Check browser console for errors
2. Check terminal output for server errors
3. Verify all environment variables are set
4. Ensure both servers are running
5. Try clearing browser cache
6. Restart development servers

---

**Setup complete! Enjoy your IPL Auction Game! 🏏🎮**
