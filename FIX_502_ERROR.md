# 502 Bad Gateway Fix - Troubleshooting Guide

## Problem
Getting "502 Bad Gateway" error when accessing the Render deployment.

## Root Cause
The WebSocket server wasn't properly responding to Render's health checks, causing Render to mark the service as unhealthy.

## Solutions Applied

### 1. ✅ Added Health Check Endpoint
**File:** `server/auction-room-server.js`

Added a proper HTTP health check endpoint:
```javascript
const server = http.createServer((req, res) => {
  if (req.url === '/health' || req.url === '/') {
    res.writeHead(200, { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    })
    res.end(JSON.stringify({
      status: 'ok',
      service: 'IPL Auction WebSocket Server',
      timestamp: new Date().toISOString(),
      activeRooms: rooms.size,
      activeConnections: wss.clients.size
    }))
  }
})
```

### 2. ✅ Updated Render Configuration
**File:** `render.yaml`

Added health check path and proper build command:
```yaml
- type: web
  name: ipl-auction-websocket
  runtime: node
  buildCommand: npm install --legacy-peer-deps
  startCommand: node server/auction-room-server.js
  healthCheckPath: /health  # ← THIS IS CRITICAL
  envVars:
    - key: NODE_ENV
      value: production
    - key: PORT
      sync: false
```

### 3. ✅ Server Binding Verification
Confirmed server is binding to `0.0.0.0:PORT`:
```javascript
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is LIVE on port ${PORT}`)
})
```

## Deployment Steps

### After Pushing Changes:

1. **Check Render Dashboard**
   - Go to https://dashboard.render.com
   - Select your WebSocket service (`ipl-auction-websocket` or `game-websocket-7qw0`)
   - Monitor the "Logs" tab

2. **Look for These Success Messages:**
   ```
   ✅ IPL Auction Server is LIVE!
   🌐 HTTP Server: http://0.0.0.0:10000
   🔌 WebSocket Server: ws://0.0.0.0:10000
   💚 Health Check: http://0.0.0.0:10000/health
   ```

3. **Test Health Check**
   Once deployed, visit:
   ```
   https://game-websocket-7qw0.onrender.com/health
   ```
   
   You should see:
   ```json
   {
     "status": "ok",
     "service": "IPL Auction WebSocket Server",
     "timestamp": "2025-01-13T...",
     "activeRooms": 0,
     "activeConnections": 0
   }
   ```

4. **Test WebSocket Connection**
   - Visit your web app: https://game-zh8s.onrender.com
   - Go to "Rooms" page
   - Check browser console for connection logs

## If 502 Persists

### Check 1: Render Service Status
```bash
# In Render Dashboard → Service → Events
# Look for:
- "Deploy live"
- "Health check succeeded"
```

### Check 2: Render Logs
```bash
# In Render Dashboard → Service → Logs
# Look for errors like:
- "Port already in use"
- "EADDRINUSE"
- "Module not found"
```

### Check 3: Environment Variables
Verify in Render Dashboard → Service → Environment:
```
NODE_ENV = production
PORT = (should be auto-set by Render)
```

### Check 4: Build Command
Should be:
```
npm install --legacy-peer-deps
```

NOT:
```
npm install --legacy-peer-deps && npm run build
```
(WebSocket server doesn't need a build step)

### Check 5: Start Command
Should be:
```
node server/auction-room-server.js
```

## Common Errors and Fixes

### Error: "EADDRINUSE"
**Cause:** Port conflict
**Fix:** Restart the service in Render Dashboard

### Error: "Module not found: ws"
**Cause:** Dependencies not installed
**Fix:** Check `package.json` has `ws` in dependencies (not devDependencies)

### Error: "Health check timeout"
**Cause:** Server takes too long to start
**Fix:** 
1. Reduce startup time
2. Increase health check grace period in Render settings

### Error: "Cannot find module '../lib/fetch-players'"
**Cause:** Build didn't copy all files
**Fix:** Verify all files are committed to git:
```bash
git add server/
git add lib/
git commit -m "Add missing files"
git push origin main
```

## Manual Verification Steps

### 1. Local Test
```bash
# Terminal 1: Start WebSocket server
cd "c:\Users\vimal\Desktop\GAME"
node server/auction-room-server.js

# Should see:
# ✅ IPL Auction Server is LIVE!
```

```bash
# Terminal 2: Test health check
curl http://localhost:8080/health

# Should return JSON with status: "ok"
```

### 2. Production Test (After Deploy)
```bash
# Test health endpoint
curl https://game-websocket-7qw0.onrender.com/health

# Should return:
# {"status":"ok","service":"IPL Auction WebSocket Server",...}
```

```bash
# Test WebSocket (using wscat)
npm install -g wscat
wscat -c wss://game-websocket-7qw0.onrender.com

# Should connect without errors
```

## Render Free Tier Limitations

**Important:** Render free tier services:
- Spin down after 15 minutes of inactivity
- Take 30-60 seconds to wake up on first request
- May show 502 during wake-up period

**User Impact:**
- First visitor may see "Connecting..." for 30-60 seconds
- Subsequent visitors (within 15 min) connect instantly

**Workaround:**
- Ping the health endpoint every 10 minutes:
  ```bash
  # Set up a cron job or external uptime monitor
  curl https://game-websocket-7qw0.onrender.com/health
  ```

## Success Checklist

- ✅ Health check endpoint returns 200 OK
- ✅ `/health` path configured in render.yaml
- ✅ Server binds to `0.0.0.0` and uses PORT env var
- ✅ Build command uses `--legacy-peer-deps`
- ✅ Start command is `node server/auction-room-server.js`
- ✅ All dependencies in package.json
- ✅ Git pushed to main branch
- ✅ Render auto-deployed successfully
- ✅ Logs show "Server is LIVE"
- ✅ Health check succeeds in Render Events

## Next Steps After Fix

1. **Wait 2-3 minutes** for Render to rebuild and deploy
2. **Check Render Dashboard** → Events for "Deploy live" and "Health check succeeded"
3. **Test the web app** at https://game-zh8s.onrender.com
4. **Create a room** and verify WebSocket connection works
5. **Monitor for 5-10 minutes** to ensure stability

## Still Not Working?

If you still see 502 after following all steps:

1. **Check Render Status Page:** https://status.render.com
2. **Try Manual Restart:** Render Dashboard → Service → Manual Deploy → Deploy Latest Commit
3. **Check Service Region:** Some regions may have issues
4. **Contact Render Support:** support@render.com (for free tier, response may take 24-48h)

---

**Last Updated:** Commit `4ebe308`  
**Status:** Health check endpoint added, should resolve 502 errors
