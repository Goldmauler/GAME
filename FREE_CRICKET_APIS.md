# 🏏 Free Cricket API Options for Player Stats

## Current Issues with CricAPI

Your current API (cricapi.com) provides basic player info but limited statistics. Here are better free alternatives:

---

## 🌟 **Recommended: Cricbuzz Unofficial API**

**Best for**: Real-time IPL stats, player profiles, match data

- **Cost**: FREE (no API key needed)
- **Base URL**: `https://cricbuzz-cricket.p.rapidapi.com/` via RapidAPI
- **Free Tier**: 500 requests/day
- **Data Available**:
  - Player profiles with career stats
  - Recent match performances
  - IPL team rosters
  - Live scores and rankings

### How to Get Started:

1. Sign up at: https://rapidapi.com/cricketapilive/api/cricbuzz-cricket
2. Subscribe to FREE plan (500 requests/day)
3. Copy your RapidAPI key from dashboard

### Example Endpoints:

```
GET /stats/v1/player/{playerId}
GET /stats/v1/rankings/batsmen
GET /teams/v1/10897/players (for team rosters)
```

---

## 🥈 **Alternative 1: CricketData.org**

**Best for**: Comprehensive player statistics

- **Website**: https://cricketdata.org/
- **Free Tier**: 100 requests/day
- **API Key**: Free registration required
- **Data Available**:
  - Detailed player stats (batting avg, strike rate, wickets)
  - Career records
  - Match-by-match performance
  - Tournament-specific data

### Endpoints:

```
GET /api/players/{player_id}/stats
GET /api/players/search?name={name}
```

---

## 🥉 **Alternative 2: Cricket Live Line API (RapidAPI)**

**Best for**: Live match data and player stats

- **Platform**: RapidAPI
- **Free Tier**: 100 requests/day
- **URL**: https://rapidapi.com/techwithdev/api/cricket-live-line
- **Data Available**:
  - Player profiles
  - Live scores
  - Tournament stats
  - Team information

---

## 🆓 **Alternative 3: Open Cricket API**

**Best for**: Historical cricket data

- **GitHub**: https://github.com/rithulkamesh/cricket-api
- **Cost**: Completely FREE, no limits
- **Self-hosted**: You can run it yourself
- **Data Available**:
  - Player information
  - Match data
  - Historical statistics

---

## 🚀 **Recommended Setup: Use RapidAPI Cricbuzz**

### Step 1: Sign Up

1. Go to: https://rapidapi.com/cricketapilive/api/cricbuzz-cricket
2. Click "Subscribe to Test"
3. Choose **FREE Basic Plan** (500 req/day)
4. Copy your RapidAPI Key (shown as `X-RapidAPI-Key`)

### Step 2: Update Your Code

Replace in `.env.local`:

```env
NEXT_PUBLIC_CRICKET_API_KEY=your_rapidapi_key_here
NEXT_PUBLIC_CRICKET_API_URL=https://cricbuzz-cricket.p.rapidapi.com
NEXT_PUBLIC_API_HOST=cricbuzz-cricket.p.rapidapi.com
```

### Step 3: API Request Format

```javascript
const response = await fetch(
  "https://cricbuzz-cricket.p.rapidapi.com/stats/v1/player/1",
  {
    headers: {
      "X-RapidAPI-Key": "YOUR_KEY_HERE",
      "X-RapidAPI-Host": "cricbuzz-cricket.p.rapidapi.com",
    },
  }
);
```

---

## 📊 **Data Comparison**

| API                     | Free Requests/Day | Player Stats  | Live Scores | IPL Data   | Setup Difficulty |
| ----------------------- | ----------------- | ------------- | ----------- | ---------- | ---------------- |
| **Cricbuzz (RapidAPI)** | 500               | ✅ Full       | ✅ Yes      | ✅ Yes     | Easy             |
| CricketData.org         | 100               | ✅ Full       | ❌ No       | ✅ Yes     | Easy             |
| Cricket Live Line       | 100               | ⚠️ Limited    | ✅ Yes      | ✅ Yes     | Easy             |
| Current CricAPI         | 100               | ❌ Basic only | ❌ No       | ⚠️ Limited | Easy             |

---

## 🎯 **My Recommendation**

### For IPL Auction Game: **Use Cricbuzz via RapidAPI**

**Why?**

- ✅ 500 free requests/day (5x more than current)
- ✅ Comprehensive player statistics
- ✅ Real IPL data and team rosters
- ✅ Recent match performance data
- ✅ Easy to integrate
- ✅ Well-documented API

**Quick Start:**

1. Sign up at RapidAPI: https://rapidapi.com/cricketapilive/api/cricbuzz-cricket
2. Get your free API key
3. I'll help you integrate it into the game

---

## 📝 **Sample API Response (Cricbuzz)**

```json
{
  "id": "1413",
  "name": "Virat Kohli",
  "country": "India",
  "playingRole": "Batsman",
  "battingStyle": "Right Handed Bat",
  "bowlingStyle": "Right-arm medium",
  "stats": {
    "IPL": {
      "batting": {
        "matches": 223,
        "runs": 7263,
        "average": 37.25,
        "strikeRate": 130.41,
        "fifties": 50,
        "hundreds": 7
      }
    }
  }
}
```

Much better than your current API which only gives basic info! 🎉

---

## ⚡ **Want me to integrate any of these?**

Just let me know which API you want to use and I'll:

1. ✅ Update all the API routes
2. ✅ Modify the player-analysis component
3. ✅ Update the .env.local file
4. ✅ Add proper error handling
5. ✅ Show real player statistics in the game

Let me know which one you prefer! 🏏
