# 🚀 IPL Auction Game - Render Deployment Instructions

## ✅ Files Ready for Deployment

All configuration files have been created and your code is ready to deploy to Render!

---

## 📋 Quick Start Guide

### Step 1: Push to GitHub

```bash
# Initialize git (if not done)
git init
git add .
git commit -m "Ready for Render deployment"

# Push to GitHub
git remote add origin https://github.com/Goldmauler/GAME.git
git branch -M main
git push -u origin main
```

### Step 2: Sign Up for Render

1. Go to **https://render.com**
2. Click **"Get Started for Free"**
3. Sign up with your **GitHub account**

### Step 3: Deploy Using Blueprint (EASIEST!)

1. In Render Dashboard, click **"New +"** → **"Blueprint"**
2. Connect your GitHub repository: **Goldmauler/GAME**
3. Render will detect `render.yaml` automatically
4. Click **"Apply"**
5. Wait 5-10 minutes for both services to deploy

✅ Done! You'll get two URLs:

- `https://ipl-auction-game.onrender.com` (your game)
- `https://ipl-auction-websocket.onrender.com` (WebSocket server)

### Step 4: Update WebSocket Environment Variable

1. Go to your **ipl-auction-game** service in Render
2. Click **"Environment"** in left sidebar
3. Find `NEXT_PUBLIC_WS_URL`
4. Set it to: `wss://ipl-auction-websocket.onrender.com`
5. Click **"Save Changes"**

Service will auto-redeploy (takes 2-3 minutes)

---

## 🎮 Share Your Game!

Once deployed, share this URL with friends:

```
https://ipl-auction-game.onrender.com/rooms
```

Anyone can access it from anywhere in the world! 🌍

---

## ⚠️ Important Notes

### Free Tier Limitations

- Services **sleep after 15 minutes** of inactivity
- First load takes **~30 seconds** to wake up
- **750 hours/month free** (enough for regular use)

### To Keep Services Always On

- Upgrade to **$7/month** per service
- Or use a ping service to keep it awake

### Custom Domain (Optional)

- You can add your own domain in Render settings
- Example: `auction.yourdomain.com`

---

## 🔧 Troubleshooting

### WebSocket Not Connecting?

**Check in browser console (F12):**

```
Should see: "✅ Using Render WebSocket: wss://ipl-auction-websocket.onrender.com"
```

**If not:**

1. Verify WebSocket service is **running** (green dot)
2. Check `NEXT_PUBLIC_WS_URL` is set correctly
3. Wait 30 seconds if service was sleeping

### Build Failed?

1. Check **Render Logs** for errors
2. Ensure all dependencies in `package.json`
3. Try manual redeploy: Service → Manual Deploy

### Services Keep Sleeping?

This is normal on free tier. Options:

1. Keep the tab open during gameplay
2. Upgrade to paid plan ($7/month)
3. Use UptimeRobot (free) to ping every 5 minutes

---

## 📊 Monitoring Your App

### View Logs

- Render Dashboard → Your Service → **Logs**
- See real-time server activity
- Debug connection issues

### Check Status

- Green dot = Running ✅
- Yellow dot = Deploying 🔄
- Red dot = Error ❌

---

## 🎯 What Changed?

### Code Updates:

✅ Added `render.yaml` - Auto-deployment config
✅ Updated WebSocket URLs - Auto-detects Render
✅ Server port configuration - Works with Render's PORT
✅ Environment variable support - Production-ready

### No Breaking Changes!

- ✅ Still works locally (npm run dev)
- ✅ Still works with ngrok (for testing)
- ✅ Now ALSO works on Render (production)

---

## 🆚 Render vs Ngrok

| Feature  | Ngrok (Old)      | Render (New)    |
| -------- | ---------------- | --------------- |
| Setup    | Terminal windows | One-time deploy |
| URL      | Random           | Permanent       |
| Uptime   | While running    | 24/7            |
| Cost     | Free (limited)   | Free (generous) |
| Best for | Testing          | Production      |

---

## 🚀 Next Steps

1. **Deploy to Render** (follow steps above)
2. **Test your game** at the Render URL
3. **Share with friends** - they can play anytime!
4. **Optional:** Add custom domain
5. **Optional:** Upgrade for always-on

---

## ❓ Need Help?

- **Render Docs:** https://render.com/docs
- **Check Status:** https://status.render.com
- **Community:** https://community.render.com

---

## 🎉 You're Ready!

Your game is **production-ready** and can be accessed by anyone, anywhere!

Just push to GitHub and deploy on Render - that's it! 🚀
