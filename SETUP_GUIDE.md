# IPL Auction Game 🏏

A real-time multiplayer IPL-style cricket auction game with AI bidding, team analysis, and player insights.

## 🎮 New Features

### 🎯 Team Selection System

- **Pre-Auction Team Selection** - Choose your team before the auction starts
- **Locked Selection** - Team choice is final once auction begins
- **No Mid-Auction Changes** - Cannot switch teams during the game
- **Visual Indicators** - "YOU" badge and locked status display

### 📊 Player Analysis & API Integration

- **Click to View Details** - Click any player card to see comprehensive stats
- **Cricket API Integration** - Connect to real cricket data APIs
- **Detailed Statistics** - Age, nationality, playing style, career stats
- **Career Highlights** - Player achievements and milestones
- **AI Analysis** - Performance insights and predictions
- **Fallback Mode** - Uses mock data if API unavailable

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Cricket API (Optional but Recommended)

Create a `.env.local` file in the root directory:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your API credentials:

```env
NEXT_PUBLIC_CRICKET_API_KEY=your_actual_api_key_here
NEXT_PUBLIC_CRICKET_API_URL=https://api.cricapi.com/v1
```

**Get Your API Key:**

- [CricAPI](https://www.cricapi.com/) - Free tier: 100 requests/day
- [Cricket Data API](https://cricketdata.org/) - Various plans
- [RapidAPI Cricket](https://rapidapi.com/hub) - Multiple providers

**Note:** App works without API (uses mock data for player details)

### 3. Start the Auction Server

Open a terminal and run:

```bash
npm run start-server
```

✅ WebSocket server starts on `ws://localhost:8080`

### 4. Start the Frontend

Open another terminal and run:

```bash
npm run dev
```

✅ Next.js app starts on `http://localhost:3000`

### 5. Play the Game

Open `http://localhost:3000` in your browser(s)

## 🎯 How to Play

### Phase 1: Team Selection 👥

1. Select your team from 10 IPL franchises
2. Review team details (₹100Cr budget, 25 player slots)
3. Click "START AUCTION" 🚀
4. ⚠️ **Selection is FINAL** - cannot be changed!

### Phase 2: Live Auction 🔥

1. **View Player Details**

   - Click on player card image
   - See detailed stats, career highlights
   - Review AI analysis

2. **Place Your Bids**

   - Use "Bid +₹5Cr (My Team)" button
   - Your team name shows with 🔒 Locked indicator
   - Watch your budget decrease with each purchase

3. **Watch AI Teams Bid**

   - 9 AI-controlled teams bid automatically
   - Different strategies: AGGRESSIVE, CONSERVATIVE, etc.
   - Real-time updates every second

4. **Monitor Progress**
   - Player counter: 1/100
   - Timer: 30s per player (resets on bids)
   - Bid history panel
   - Team budget bars

### Phase 3: Results & Analysis 📈

- Team ratings calculated automatically
- View batting, bowling, balance, value scores
- See strengths and weaknesses
- Compare all 10 teams

## 📋 Game Rules

| Rule             | Value               |
| ---------------- | ------------------- |
| Total Players    | 100                 |
| Teams            | 10                  |
| Budget per Team  | ₹100 Crore          |
| Max Squad Size   | 25 Players          |
| Timer per Player | 30 seconds          |
| Base Price Range | ₹20-100 Cr          |
| Team Selection   | Locked once started |

## 🛠 Technical Stack

- **Frontend**: Next.js 16.0.0, React 19.2.0, TypeScript
- **Animations**: Framer Motion
- **Styling**: Tailwind CSS
- **Backend**: Node.js WebSocket Server (ws@8.13.0)
- **AI Engine**: Custom bidding strategies
- **APIs**: Cricket data providers (optional)

## 📁 Project Structure

```
GAME/
├── app/
│   ├── page.tsx              # Main entry point
│   └── layout.tsx            # App layout
├── components/
│   ├── team-selection.tsx    # NEW: Team selection screen
│   ├── player-analysis.tsx   # NEW: Player details modal
│   ├── auction-arena.tsx     # Main auction UI (updated)
│   └── ui/                   # Reusable UI components
├── server/
│   ├── auction-server.js     # WebSocket server
│   ├── auction-logic.js      # AI bidding engine
│   ├── team-rating.js        # Team evaluation
│   └── tests/                # Test suites
├── lib/
│   ├── team-rating.ts        # TypeScript rating logic
│   └── utils.ts              # Utilities
├── .env.local.example        # API configuration template
└── README.md                 # This file
```

## 🔌 API Integration Guide

### Cricket API Setup

1. **Choose a Provider:**

   - CricAPI (recommended for beginners)
   - Cricket Data API
   - RapidAPI Cricket providers

2. **Get API Key:**

   - Sign up on provider's website
   - Copy your API key
   - Note the base URL

3. **Configure Environment:**

   ```bash
   # Create .env.local
   NEXT_PUBLIC_CRICKET_API_KEY=abc123xyz
   NEXT_PUBLIC_CRICKET_API_URL=https://api.cricapi.com/v1
   ```

4. **Test Integration:**
   - Restart Next.js dev server
   - Start auction, click on player
   - Check browser console for API calls

### API Response Format

The app expects this structure (adjust in `player-analysis.tsx` if different):

```json
{
  "data": [
    {
      "name": "Virat Kohli",
      "age": 35,
      "country": "India",
      "battingStyle": "Right-handed",
      "bowlingStyle": "Medium",
      "matches": 223,
      "runs": 7263,
      "wickets": 4,
      "battingAverage": 38.3,
      "strikeRate": 135.4,
      "achievements": ["Player of the Match - 15 times"]
    }
  ]
}
```

## 🧪 Testing

### Run All Tests

```bash
npm run test-all
```

### Individual Test Suites

```bash
npm run test-server    # Auction logic tests
npm run test-rating    # Team rating tests (7 scenarios)
npm run test-e2e       # End-to-end WebSocket test
```

### Test Coverage

✅ Auction logic (bidding decisions)  
✅ Team rating calculations  
✅ WebSocket server/client communication  
✅ Player purchase flow  
✅ State synchronization

## 🐛 Troubleshooting

### Issue: Team Selection Screen Not Showing

**Solution:** Clear browser cache, hard reload (Ctrl+F5)

### Issue: "Cannot change teams" Error

**Cause:** Team selection is locked after clicking "START AUCTION"  
**Solution:** Refresh page to select different team (auction restarts)

### Issue: Player Details Show "Loading..."

**Possible Causes:**

1. Invalid API key → Check `.env.local`
2. API rate limit exceeded → Wait or upgrade plan
3. Network error → Check internet connection

**Solution:** App falls back to mock data automatically

### Issue: WebSocket Connection Failed

**Causes:**

- Auction server not running
- Port 8080 blocked
- Firewall blocking WebSocket

**Solutions:**

```bash
# Check if server is running
npm run start-server

# Check port availability (PowerShell)
Get-NetTCPConnection -LocalPort 8080

# Temporarily disable firewall to test
```

### Issue: Player Details Don't Load

**Debug Steps:**

1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for API errors
4. Check Network tab for failed requests

## 📦 Scripts Reference

| Command                | Description                                  |
| ---------------------- | -------------------------------------------- |
| `npm run dev`          | Start Next.js development server (port 3000) |
| `npm run build`        | Build production bundle                      |
| `npm run start`        | Start production server                      |
| `npm run start-server` | Start WebSocket auction server (port 8080)   |
| `npm run test-all`     | Run complete test suite                      |
| `npm run test-server`  | Test auction logic only                      |
| `npm run test-rating`  | Test team rating engine                      |
| `npm run test-e2e`     | Test WebSocket server end-to-end             |

## 🎨 Customization

### Add More Teams

Edit `components/auction-arena.tsx`:

```typescript
const TEAMS: Team[] = [
  // Add your team here
  {
    id: "11",
    name: "Gujarat Titans",
    color: "from-blue-600 to-gray-800",
    budget: 1600,
    players: [],
    maxPlayers: 25,
    recentBids: 0,
  },
];
```

### Change Budget

Modify initial budget in team objects (1600 = ₹100Cr, displayed as 100)

### Adjust Timer

In `server/auction-server.js`:

```javascript
const TIMER_DURATION = 30; // Change to your preference
```

## 🚀 Deployment

### Production Build

```bash
npm run build
npm run start
```

### Deploy Server Separately

Host WebSocket server on cloud platform (e.g., Railway, Render)  
Update `auction-arena.tsx` WebSocket URL to production endpoint

## 🤝 Contributing

Contributions welcome! Areas for improvement:

- Real authentication system
- Database integration
- Advanced player statistics
- Mobile responsive design
- Audio/visual effects
- Chat system

## 📝 License

MIT License - feel free to use for learning or commercial projects

## 🏆 Credits

Built with passion for cricket and technology!

**Technologies Used:**

- Next.js & React Team
- Framer Motion (animations)
- Tailwind CSS (styling)
- WebSocket Protocol

---

**Questions?** Open an issue on GitHub  
**Enjoy the auction!** 🏏🎉
