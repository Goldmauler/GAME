# 🎮 IPL Auction Game - Complete Game Rules

## 📋 Table of Contents
1. [Game Overview](#game-overview)
2. [Auction Mechanics](#auction-mechanics)
3. [Team Building Rules](#team-building-rules)
4. [Bidding Strategy](#bidding-strategy)
5. [Special Features](#special-features)
6. [Winning Conditions](#winning-conditions)

---

## 🎯 Game Overview

### Objective
Build the best possible cricket team within budget constraints by strategically bidding on players in a competitive auction environment.

### Game Modes

#### 1. Solo Auction
- **Players**: You vs 9 AI teams
- **Choose**: Any IPL franchise to manage
- **Flexibility**: Switch teams during auction
- **AI Behavior**: Intelligent bidding based on team needs and player value

#### 2. Multiplayer Auction
- **Players**: 2-10 human players
- **Real-time**: Live bidding with WebSocket synchronization
- **Host Controls**: Room creator manages game start
- **Competition**: Compete against real opponents

---

## 💰 Auction Mechanics

### Budget System
- **Starting Budget**: ₹100 Crores per team
- **Currency**: Crore (Cr) = 10 Million Rupees
- **Minimum Bid**: Base price of player
- **Bid Increment**: ₹1 Crore per bid
- **Budget Tracking**: Real-time remaining budget display

### Player Base Prices
```
Marquee Players:      ₹15-20 Cr
Top Batsmen/Bowlers:  ₹8-15 Cr
Quality Players:      ₹4-8 Cr
Role Players:         ₹2-4 Cr
Emerging Players:     ₹1-2 Cr
```

### Bidding Process

#### Step 1: Player Introduction
- Player name, role, country displayed
- Base price announced
- Timer starts (60 seconds in Round 1)

#### Step 2: Bidding War
- Any team can bid by clicking **"BID"** button
- Each bid increases price by ₹1 Cr
- Timer resets to 60s after each bid
- Current highest bidder highlighted

#### Step 3: Timer Countdown
- Red warning when timer < 10 seconds
- Countdown display shows remaining time
- Auto-pass if no bid placed

#### Step 4: Player Sold
- Timer reaches 0
- Highest bidder wins player
- Budget deducted from winning team
- Player added to team roster

#### Step 5: Next Player
- Transition animation
- Next player introduced
- Process repeats

### Unsold Players
- If no bids placed: Player marked "UNSOLD"
- Returns in Round 2
- Reduced base price (optional enhancement)

---

## 👥 Team Building Rules

### Squad Limits

#### Maximum Players: 15
```
Minimum Requirements:
├── Batsmen:        3-7 players
├── Bowlers:        3-7 players
├── All-Rounders:   1-4 players
└── Wicket-Keepers: 1-2 players
```

#### Ideal Balanced Squad
```
Batsmen:         5 players
Bowlers:         5 players
All-Rounders:    3 players
Wicket-Keepers:  2 players
Total:           15 players
```

### Budget Management

#### Spending Strategy
```
Total Budget:     ₹100 Cr
Players to Buy:   15

Average per Player: ₹6.67 Cr

Recommended Allocation:
├── Star Players (3):     ₹45 Cr (₹15 Cr each)
├── Core Players (7):     ₹35 Cr (₹5 Cr each)
└── Role Players (5):     ₹20 Cr (₹4 Cr each)
```

#### Budget Warnings
- **Red Alert**: < ₹10 Cr remaining
- **Yellow Caution**: < ₹20 Cr remaining with < 5 players
- **Green Safe**: > ₹20 Cr remaining

### Role Requirements

#### Batsmen 🏏
- **Purpose**: Score runs
- **Types**: Openers, Middle-order, Finishers
- **Minimum**: 3 required
- **Ideal**: 5 batsmen

#### Bowlers ⚡
- **Purpose**: Take wickets, control runs
- **Types**: Pace bowlers, Spinners
- **Minimum**: 3 required
- **Ideal**: 5 bowlers (3 pace, 2 spin)

#### All-Rounders 💪
- **Purpose**: Bat AND bowl
- **Value**: Most versatile
- **Minimum**: 1 required
- **Ideal**: 3 all-rounders

#### Wicket-Keepers 🧤
- **Purpose**: Keeping + batting
- **Requirement**: At least 1 keeper
- **Ideal**: 2 keepers for flexibility

---

## 🎯 Bidding Strategy

### AI Bidding Logic (Solo Mode)

#### Factors Considered:
1. **Player Value** (40% weight)
   - Role importance
   - Skills and stats
   - Current performance

2. **Team Needs** (30% weight)
   - Role shortages
   - Squad balance
   - Minimum requirements

3. **Budget Awareness** (20% weight)
   - Remaining budget
   - Players still needed
   - Average spending required

4. **Competition** (10% weight)
   - Other teams' budgets
   - Number of active bidders
   - Pressure situations

#### AI Behavior Patterns:
- **Aggressive**: Bids on marquee players early
- **Balanced**: Spreads budget evenly
- **Conservative**: Waits for value deals
- **Reactive**: Responds to team gaps

### Human Strategy Tips

#### Early Auction (Players 1-20)
✅ **Do:**
- Secure 1-2 marquee players
- Identify undervalued players
- Observe AI bidding patterns

❌ **Don't:**
- Overspend on first player
- Ignore budget planning
- Bid emotionally

#### Mid Auction (Players 21-40)
✅ **Do:**
- Fill role gaps
- Build squad balance
- Target quality all-rounders

❌ **Don't:**
- Exhaust budget too early
- Ignore keeper position
- Chase every player

#### Late Auction (Players 41-60)
✅ **Do:**
- Complete minimum 15 players
- Find bargain deals
- Fill remaining gaps

❌ **Don't:**
- Run out of budget
- Leave squad incomplete
- Panic bid

---

## ⚡ Special Features

### Player Categorization

#### 1. Marquee Players
- **Base Price**: ₹15-20 Cr
- **Who**: Top international stars
- **When**: First 10 players in auction
- **Strategy**: High competition, worth investment

#### 2. Category-Based Rounds
```
Auction Structure:
├── Round 1
│   ├── Marquee (10 players)
│   ├── Batsmen (15 players)
│   ├── Bowlers (15 players)
│   ├── All-Rounders (10 players)
│   └── Wicket-Keepers (10 players)
│
└── Round 2 (Unsold Players)
    └── Accelerated Auction (30s timer)
```

### Strategic Timeouts

#### Usage Rules
- **Allocation**: 2 timeouts per team
- **Duration**: 90 seconds each
- **When**: Activated by team during auction
- **Purpose**: 
  - Review squad and budget
  - Plan remaining bids
  - Strategic thinking time
  - Regroup after losing key player

#### Activation
```
Click "Strategic Timeout" button
↓
Auction pauses for 90 seconds
↓
All teams see timeout screen
↓
Countdown displayed
↓
Auction resumes automatically
```

### Break System

#### Category Breaks
- **When**: Between player categories
- **Duration**: 30 seconds
- **Purpose**: Review completed category, plan next

#### Snack Breaks
- **When**: After every 20 players (optional)
- **Duration**: 60 seconds
- **Purpose**: Rest period, strategic planning

### Round System

#### Round 1 - Main Auction
- **Timer**: 60 seconds per player
- **Pace**: Standard, thorough bidding
- **Players**: All 60 initial players
- **Focus**: Build core squad

#### Round 2 - Accelerated Auction
- **Timer**: 30 seconds per player
- **Pace**: Fast, urgent bidding
- **Players**: Unsold from Round 1
- **Focus**: Complete squad, find bargains

---

## 🏆 Winning Conditions

### Team Evaluation Criteria

#### 1. Squad Completion (25 points)
```
15 players:        25 points
12-14 players:     20 points
10-11 players:     15 points
< 10 players:      Penalty
```

#### 2. Role Balance (25 points)
```
Perfect Balance:   25 points
├── Batsmen:       5 (±1)
├── Bowlers:       5 (±1)
├── All-Rounders:  3 (±1)
└── Keepers:       2 (±1)

Acceptable:        18 points
Poor Balance:      10 points
```

#### 3. Budget Efficiency (25 points)
```
Budget Used: 85-95%:    25 points
Budget Used: 70-84%:    20 points
Budget Used: 95-100%:   18 points
Budget Wasted > 15 Cr:  10 points
```

#### 4. Player Quality (25 points)
```
Average Player Value:
├── Excellent (>8 Cr):  25 points
├── Good (6-8 Cr):      20 points
├── Average (4-6 Cr):   15 points
└── Weak (<4 Cr):       10 points
```

### Overall Rating
```
90-100 points: ⭐⭐⭐⭐⭐ Outstanding
75-89 points:  ⭐⭐⭐⭐ Excellent
60-74 points:  ⭐⭐⭐ Good
45-59 points:  ⭐⭐ Average
< 45 points:   ⭐ Poor
```

---

## 📊 Team Analysis Features

### Real-Time Metrics

#### During Auction
- Current squad size
- Remaining budget
- Money spent
- Average price per player
- Role distribution

#### Post-Auction
- Final squad rating
- Squad balance score
- Best purchases
- Value-for-money players
- Weak areas

### Team Comparison
```
Your Team vs AI Teams:
├── Total Spent
├── Average Price
├── Squad Balance
├── Star Players Count
└── Overall Rating
```

---

## 🎮 Tips for Success

### Beginner Tips
1. ✅ Always keep ₹20 Cr for last 5 players
2. ✅ Get at least 1 wicket-keeper early
3. ✅ Don't overbid on first player
4. ✅ Watch AI bidding patterns
5. ✅ Use strategic timeouts wisely

### Advanced Strategies
1. 🎯 Target undervalued all-rounders
2. 🎯 Let AI teams exhaust budgets early
3. 🎯 Build bowling depth (5+ bowlers)
4. 🎯 Save budget for Round 2 bargains
5. 🎯 Balance between stars and role players

### Common Mistakes to Avoid
1. ❌ Spending > ₹50 Cr on 3 players
2. ❌ Ignoring squad balance
3. ❌ Running out of budget early
4. ❌ Not having backup wicket-keeper
5. ❌ Chasing players you don't need

---

## 🎯 Quick Reference Guide

### Auction Cheat Sheet
```
Budget:              ₹100 Cr
Players:             15 maximum
Bid Increment:       ₹1 Cr
Round 1 Timer:       60 seconds
Round 2 Timer:       30 seconds
Strategic Timeouts:  2 per team (90s each)
Category Breaks:     30 seconds
```

### Ideal Squad Template
```
Position          Count    Budget    Total
─────────────────────────────────────────
Marquee Batsman    1       ₹18 Cr   ₹18 Cr
Star Bowler        1       ₹15 Cr   ₹15 Cr
Quality All-R      2       ₹8 Cr    ₹16 Cr
Core Batsmen       3       ₹5 Cr    ₹15 Cr
Core Bowlers       3       ₹5 Cr    ₹15 Cr
Wicket-Keeper      2       ₹4 Cr    ₹8 Cr
Role Players       3       ₹4 Cr    ₹12 Cr
─────────────────────────────────────────
Total             15                ₹99 Cr
Remaining                           ₹1 Cr
```

---

## 🏅 Achievement System (Potential Feature)

### Milestones
- **Perfect Squad**: All 15 players, balanced roles
- **Budget Master**: Spend 95-100% of budget
- **Bargain Hunter**: Get 3+ players below base price
- **Star Collector**: Own 5+ marquee players
- **Strategic Genius**: Win using both timeouts
- **Speed Demon**: Complete auction in < 30 minutes

---

**Master these rules and dominate the auction! 🏏🏆**
