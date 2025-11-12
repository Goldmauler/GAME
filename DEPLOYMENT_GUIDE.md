# 🚀 IPL Auction Game - Production Deployment Guide

This guide shows you how to deploy your IPL Auction game to the cloud for permanent, professional hosting.

## 🎯 Architecture Overview

Your app has two parts that need hosting:

1. **Next.js Frontend** - The web app (port 3000)
2. **WebSocket Server** - Real-time auction sync (port 8080)

---

## Option 1: Vercel + Railway (Recommended)

### Part A: Deploy Next.js to Vercel

**Why Vercel?**

- Built for Next.js
- Free tier generous
- Automatic HTTPS
- Global CDN
- Zero config needed

**Steps:**

1. **Install Vercel CLI:**

   ```powershell
   npm install -g vercel
   ```

2. **Login:**

   ```powershell
   vercel login
   ```

3. **Deploy:**

   ```powershell
   vercel
   ```

4. **Environment Variables:**

   - In Vercel dashboard, add:
     - `WEBSOCKET_URL`: Your Railway WebSocket URL (add after step B)
     - `DATABASE_URL`: Your PostgreSQL connection string

5. **Production Deploy:**
   ```powershell
   vercel --prod
   ```

**Your Next.js app is now live!** 🎉

---

### Part B: Deploy WebSocket Server to Railway

**Why Railway?**

- Supports WebSocket
- Free $5 credit/month
- Easy deployment
- Automatic HTTPS

**Steps:**

1. **Create `Procfile` in root:**

   ```
   web: node server/auction-room-server.js
   ```

2. **Update `package.json` scripts:**

   ```json
   "scripts": {
     "start": "node server/auction-room-server.js"
   }
   ```

3. **Sign up at Railway:**

   - Visit: https://railway.app/
   - Connect GitHub account

4. **Create New Project:**

   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

5. **Configure:**

   - Railway auto-detects Node.js
   - Set environment variables:
     - `PORT`: Railway will set this automatically
     - `API_URL`: Your Vercel URL from Part A

6. **Deploy:**

   - Railway deploys automatically on push
   - Get your WebSocket URL (e.g., `wss://your-app.railway.app`)

7. **Update Vercel:**
   - Go back to Vercel
   - Add environment variable:
     - `WEBSOCKET_URL`: Your Railway URL

**Your WebSocket server is now live!** 🎉

---

## Option 2: Heroku (All-in-One)

Deploy both Next.js and WebSocket to Heroku.

**Steps:**

1. **Install Heroku CLI:**

   ```powershell
   npm install -g heroku
   ```

2. **Login:**

   ```powershell
   heroku login
   ```

3. **Create Heroku App:**

   ```powershell
   heroku create ipl-auction-game
   ```

4. **Create `Procfile`:**

   ```
   web: npm run start
   worker: node server/auction-room-server.js
   ```

5. **Update `package.json`:**

   ```json
   "scripts": {
     "start": "next start",
     "build": "next build",
     "heroku-postbuild": "npm run build"
   }
   ```

6. **Add PostgreSQL:**

   ```powershell
   heroku addons:create heroku-postgresql:hobby-dev
   ```

7. **Configure Environment Variables:**

   ```powershell
   heroku config:set WEBSOCKET_URL=wss://your-app.herokuapp.com
   ```

8. **Deploy:**

   ```powershell
   git push heroku main
   ```

9. **Scale Workers:**
   ```powershell
   heroku ps:scale web=1 worker=1
   ```

**Your full app is now live!** 🎉

---

## Option 3: DigitalOcean App Platform

**Steps:**

1. **Sign up:** https://www.digitalocean.com/

2. **Create New App:**

   - Click "Create App"
   - Connect GitHub

3. **Configure Components:**

   **Component 1: Next.js Web Service**

   - Type: Web Service
   - Build Command: `npm run build`
   - Run Command: `npm start`
   - Port: 3000

   **Component 2: WebSocket Service**

   - Type: Worker
   - Run Command: `node server/auction-room-server.js`
   - Port: 8080

4. **Environment Variables:**

   - Add your environment variables

5. **Deploy:**
   - Click "Create Resources"
   - Wait for deployment

**Your app is now live!** 🎉

---

## Option 4: AWS (Advanced)

For full control and scalability:

### Services Needed:

1. **AWS Elastic Beanstalk** - For Next.js
2. **AWS EC2** - For WebSocket server
3. **AWS RDS** - For PostgreSQL database
4. **AWS CloudFront** - CDN (optional)
5. **Route 53** - Custom domain (optional)

This is more complex but gives you full control.

---

## 🔐 Pre-Deployment Checklist

Before deploying to production:

### 1. Environment Variables

Create `.env.production`:

```env
DATABASE_URL=your_production_db_url
WEBSOCKET_URL=your_production_ws_url
NEXT_PUBLIC_WS_URL=your_production_ws_url
NODE_ENV=production
```

### 2. Security

- [ ] Add authentication/authorization
- [ ] Implement rate limiting
- [ ] Add CORS configuration
- [ ] Sanitize user inputs
- [ ] Add room passwords
- [ ] Implement user sessions

### 3. Database

- [ ] Run migrations: `npx prisma migrate deploy`
- [ ] Set up backup strategy
- [ ] Configure connection pooling

### 4. Performance

- [ ] Enable Next.js production mode
- [ ] Add caching headers
- [ ] Optimize images
- [ ] Enable compression

### 5. Monitoring

- [ ] Set up error tracking (Sentry)
- [ ] Add analytics
- [ ] Configure uptime monitoring
- [ ] Set up logging

---

## 🌐 Custom Domain Setup

### For Vercel:

1. **Buy Domain** (GoDaddy, Namecheap, etc.)

2. **Add to Vercel:**
   - Go to project settings
   - Add domain
   - Update DNS records

### For Railway:

1. **Add Custom Domain:**
   - Project settings → Domains
   - Add your domain
   - Update DNS CNAME record

---

## 💰 Cost Estimates

### Free Tier Options:

- **Vercel**: Free (hobby projects)
- **Railway**: $5 credit/month (then ~$5-10/month)
- **Heroku**: Free tier ended, starts at $7/month
- **DigitalOcean**: $4/month minimum

### Recommended for Production:

- **Vercel (Frontend)**: $20/month (Pro)
- **Railway (WebSocket)**: ~$10/month
- **Total**: ~$30/month for reliable service

---

## 🐛 Troubleshooting

### WebSocket Connection Issues:

```javascript
// Update components/auction-arena-room.tsx
const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080";
```

### Database Connection Issues:

```javascript
// lib/prisma.ts - Add connection pooling
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  connection_limit = 10
}
```

### Build Failures:

```powershell
# Test build locally first
npm run build
npm start
```

---

## 📚 Helpful Resources

- **Vercel Docs**: https://vercel.com/docs
- **Railway Docs**: https://docs.railway.app/
- **Heroku Docs**: https://devcenter.heroku.com/
- **Next.js Deployment**: https://nextjs.org/docs/deployment

---

## 🎯 Quick Start: Deploy in 10 Minutes

**Fastest Path to Production:**

1. **Push to GitHub** (if not already)

   ```powershell
   git init
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy Frontend:**

   - Go to https://vercel.com/new
   - Import your GitHub repo
   - Click "Deploy"
   - Done! ✅

3. **Deploy WebSocket:**

   - Go to https://railway.app/new
   - Connect GitHub
   - Select repo
   - Add start command: `node server/auction-room-server.js`
   - Deploy! ✅

4. **Connect them:**
   - Copy Railway URL
   - Add to Vercel environment variables
   - Redeploy

**Your game is now live on the internet!** 🌍🎉

---

Need help deploying? Let me know which platform you'd like to use!
