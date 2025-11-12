# Network Connection Diagram

## How It Works

```
┌─────────────────────────────────────────────────────────┐
│                    HOST LAPTOP                          │
│                 (192.168.1.100)                         │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │     Next.js Dev Server (Port 3000)              │  │
│  │     http://192.168.1.100:3000                    │  │
│  │                                                  │  │
│  │     - Serves the game website                   │  │
│  │     - Handles API requests                      │  │
│  │     - Player info, stats, etc.                  │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │   WebSocket Server (Port 8080)                  │  │
│  │   ws://192.168.1.100:8080                       │  │
│  │                                                  │  │
│  │   - Real-time auction state                     │  │
│  │   - Room management                             │  │
│  │   - Bidding synchronization                     │  │
│  │   - Player connections                          │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
                          │
                          │
            ┌─────────────┼─────────────┐
            │             │             │
            │    WiFi Network (Router)  │
            │                           │
            └─────────────┬─────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        │                 │                 │
┌───────▼──────┐  ┌───────▼──────┐  ┌───────▼──────┐
│  LAPTOP 1    │  │  LAPTOP 2    │  │  LAPTOP 3    │
│  (Player)    │  │  (Player)    │  │  (Player)    │
│              │  │              │  │              │
│  Opens:      │  │  Opens:      │  │  Opens:      │
│  192.168.1   │  │  192.168.1   │  │  192.168.1   │
│  .100:3000   │  │  .100:3000   │  │  .100:3000   │
│              │  │              │  │              │
│  Connects    │  │  Connects    │  │  Connects    │
│  WebSocket:  │  │  WebSocket:  │  │  WebSocket:  │
│  ws://192    │  │  ws://192    │  │  ws://192    │
│  .168.1.100  │  │  .168.1.100  │  │  .168.1.100  │
│  :8080       │  │  :8080       │  │  :8080       │
│              │  │              │  │              │
│  Team: MI    │  │  Team: CSK   │  │  Team: DC    │
└──────────────┘  └──────────────┘  └──────────────┘
```

## Data Flow

### 1. Initial Connection

```
Player Laptop
   │
   ├──► HTTP Request to http://192.168.1.100:3000
   │    (Host serves Next.js website)
   │
   └──► WebSocket connect to ws://192.168.1.100:8080
        (Establishes real-time connection)
```

### 2. Creating/Joining Room

```
Player 1 (Host)                     WebSocket Server
   │                                      │
   ├───── "create-room" ────────────────► │
   │                                      ├─► Creates room "ABC123"
   │ ◄──── room-created { code: ABC123 }──┤
   │                                      │

Player 2                                  │
   │                                      │
   ├───── "join-room ABC123" ───────────► │
   │                                      ├─► Adds to room
   │ ◄──── joined-room { success } ───────┤
   │                                      │
   │ ◄──── room-update (to all) ──────────┤
```

### 3. During Auction (Real-time Sync)

```
Player 1                WebSocket Server              Player 2, 3, 4...
   │                          │                             │
   ├─ "bid: $5M" ────────────►│                             │
   │                          ├─ Process bid                │
   │                          ├─ Update game state          │
   │                          │                             │
   │ ◄─ "bid-placed" ─────────┤────── broadcast ───────────►│
   │    (everyone gets same state)                          │
   │                          │                             │
   │                          │ ◄─ "pass" ──────────────────┤
   │                          ├─ Process pass               │
   │                          │                             │
   │ ◄─ "player-passed" ──────┤────── broadcast ───────────►│
```

## Key Concepts

### Single Source of Truth

- **Server** holds the authoritative game state
- **Clients** only display what server tells them
- **No client-side state manipulation** (prevents cheating)

### Broadcast Pattern

```
One client sends action → Server processes → Server broadcasts to ALL clients
```

Everyone stays perfectly synchronized!

### Room Isolation

```
Room ABC123                    Room XYZ789
├─ Player 1 (MI)              ├─ Player 5 (RR)
├─ Player 2 (CSK)             ├─ Player 6 (KKR)
├─ Player 3 (DC)              └─ Player 7 (PBKS)
└─ Player 4 (RCB)

Separate game states, no interference
```

## Port Mapping

| Port | Service          | Protocol | Purpose                     |
| ---- | ---------------- | -------- | --------------------------- |
| 3000 | Next.js          | HTTP     | Web interface, static files |
| 8080 | WebSocket Server | WS       | Real-time game state        |

## Connection States

### Successful Connection Flow

```
1. Browser loads http://192.168.1.100:3000
   └─ Status: Loading website...

2. Next.js serves React app
   └─ Status: Website loaded

3. React app initializes
   └─ Status: Initializing...

4. WebSocket connects to ws://192.168.1.100:8080
   └─ Status: Connecting to server...

5. Server accepts connection
   └─ Status: Connected! ✓

6. User creates/joins room
   └─ Status: In lobby

7. Game starts
   └─ Status: Auction in progress
```

### Troubleshooting Connection Issues

```
Can't access website?
├─ Check: Is Next.js running? (npm run dev)
├─ Check: Correct IP address?
├─ Check: Same WiFi network?
└─ Check: Firewall allowing port 3000?

Can't connect to game?
├─ Check: Is WebSocket server running? (npm run start-room-server)
├─ Check: Firewall allowing port 8080?
├─ Check: Browser console for errors (F12)
└─ Check: WebSocket status in Network tab
```

## Security Layers

### Local Network (Current Setup)

```
Router
  └─ Only accessible to devices on same WiFi
     └─ Natural firewall
        └─ Relatively safe for home/office use
```

### Internet Exposure (If needed)

```
Internet
  │
  ├─ Port Forwarding (Router)
  │    └─ Exposes ports to internet
  │       └─ Requires: Strong auth, rate limiting, validation
  │
  └─ Alternative: Use VPN (Hamachi, ZeroTier)
       └─ Creates virtual private network
          └─ Secure, no port forwarding needed
```

## Performance Considerations

### Optimal Setup

```
Host Laptop
  └─ Wired connection (Ethernet) ✓
     └─ Located near router ✓
        └─ No other heavy network usage ✓
           └─ Result: <10ms latency

Player Laptops
  └─ 5GHz WiFi or Ethernet ✓
     └─ Strong signal ✓
        └─ Modern browser ✓
           └─ Result: <50ms latency
```

### Suboptimal (May cause lag)

```
Host on weak WiFi + Players far from router + 2.4GHz WiFi
  └─ Result: 100-500ms latency
     └─ Noticeable delays in bidding
```

## Supported Devices

### Web Browsers

```
✓ Chrome (recommended)
✓ Firefox
✓ Edge
✓ Safari
✓ Mobile browsers (Chrome Mobile, Safari iOS)
```

### Operating Systems

```
✓ Windows 10/11
✓ macOS
✓ Linux
✓ iOS (iPad/iPhone)
✓ Android
```

## Maximum Players

```
Technical Limit: 1000+ concurrent connections
Practical Limit: 10 teams = 10 players per auction
Recommended: 4-8 players for best experience
```

## Data Transfer

### Bandwidth Usage

```
Per player during auction:
├─ Initial load: ~5-10 MB (website assets)
├─ WebSocket: ~1-5 KB/second (very light!)
└─ Total per hour: ~20-30 MB

For 8 players:
└─ Host upload: ~8-40 KB/second
   └─ Works on most home internet
```

---

**Visual Guide Complete! Ready to connect players! 🏏🎮**
