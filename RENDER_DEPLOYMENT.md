# IPL Auction Game - Render Deployment Guide

## 🚀 Quick Deploy to Render

### Prerequisites

1. GitHub account
2. Render account (free) - https://render.com

### Step-by-Step Deployment

#### 1. Push Code to GitHub

```bash
# If not already initialized
git init
git add .
git commit -m "Ready for Render deployment"

# Create repo on GitHub and push
git remote add origin https://github.com/Goldmauler/GAME.git
git branch -M main
git push -u origin main
```

#### 2. Deploy on Render

**Option A: Blueprint (Automatic - Recommended)**

1. Go to https://render.com/dashboard
2. Click "New" → "Blueprint"
3. Connect your GitHub repository (GAME)
4. Render will detect `render.yaml` and create both services
5. Click "Apply"

**Option B: Manual Deployment**

**Deploy Web Service (Next.js):**

1. Go to https://dashboard.render.com
2. Click "New" → "Web Service"
3. Connect GitHub repo: `Goldmauler/GAME`
4. Settings:
   - **Name:** ipl-auction-game
   - **Region:** Singapore (or closest to you)
   - **Branch:** main
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Plan:** Free
5. Add Environment Variable:
   - Key: `NEXT_PUBLIC_WS_URL`
   - Value: `wss://ipl-auction-websocket.onrender.com` (update after creating WebSocket service)
6. Click "Create Web Service"

**Deploy WebSocket Service:**

1. Click "New" → "Web Service"
2. Connect same GitHub repo
3. Settings:
   - **Name:** ipl-auction-websocket
   - **Region:** Singapore (same as web service)
   - **Branch:** main
   - **Build Command:** `npm install`
   - **Start Command:** `node server/auction-room-server.js`
   - **Plan:** Free
4. Click "Create Web Service"

#### 3. Update WebSocket URL

Once both services are deployed, you'll get URLs like:

- Web App: `https://ipl-auction-game.onrender.com`
- WebSocket: `https://ipl-auction-websocket.onrender.com`

Update the environment variable in the Web Service:

- Go to Web Service → Environment
- Set `NEXT_PUBLIC_WS_URL` = `wss://ipl-auction-websocket.onrender.com`
- Click "Save Changes" (service will redeploy)

#### 4. Test Your Game

1. Open: `https://ipl-auction-game.onrender.com/rooms`
2. Create a room
3. Share the link with friends!

### URLs After Deployment

- **Game URL (share this):** `https://ipl-auction-game.onrender.com/rooms`
- **WebSocket:** `wss://ipl-auction-websocket.onrender.com`

### Important Notes

⚠️ **Free Tier Limitations:**

- Services spin down after 15 minutes of inactivity
- First request after inactivity takes ~30 seconds to wake up
- 750 hours/month free (enough for 24/7 if only one service)

💡 **Tips:**

- Keep the game open to prevent spin-down during active play
- Services restart automatically if they crash
- Logs available in Render dashboard

### Troubleshooting

**WebSocket not connecting:**

1. Check WebSocket service is running (green in dashboard)
2. Verify `NEXT_PUBLIC_WS_URL` environment variable is correct
3. Check browser console for errors

**Services spinning down:**

- This is normal on free tier
- First visitor waits ~30 seconds for wake-up
- Consider upgrading to paid tier ($7/month) for always-on

**Build failing:**

1. Check build logs in Render dashboard
2. Ensure `package.json` has all dependencies
3. Verify Node version compatibility

### Need Help?

Check Render status: https://status.render.com
View logs: Render Dashboard → Your Service → Logs
