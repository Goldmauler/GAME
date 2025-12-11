// Auction logic (JS port of lib/auctioneer-logic.ts core functions)
// Updated for IPL 2025 Mega Auction realism

const BiddingStrategy = {
  AGGRESSIVE: "aggressive",     // High-value targets, willing to overpay
  CONSERVATIVE: "conservative", // Stick close to base price
  OPPORTUNISTIC: "opportunistic", // Wait for good deals
  PATIENT: "patient",           // Wait until last moment
  DESPERATE: "desperate",       // Need to fill squad, will overbid
}

// IPL 2025 auction bid increments (more realistic)
function getBidIncrement(currentPrice) {
  if (currentPrice >= 20) return 0.50;      // 50 lakhs for 20+ Cr
  if (currentPrice >= 10) return 0.25;      // 25 lakhs for 10-20 Cr
  if (currentPrice >= 5) return 0.20;       // 20 lakhs for 5-10 Cr
  if (currentPrice >= 2) return 0.10;       // 10 lakhs for 2-5 Cr
  return 0.05;                              // 5 lakhs for under 2 Cr
}

function calculateBiddingCapacity(team, context) {
  const remainingSlots = team.maxPlayers - (team.players?.length || 0)
  if (remainingSlots <= 0) return 0
  
  // Reserve minimum budget for remaining players
  const minPerPlayer = 0.30 // 30 lakhs minimum per player
  const reserveBudget = (remainingSlots - 1) * minPerPlayer
  const availableBudget = Math.max(0, team.budget - reserveBudget)
  
  // Factor in player quality and team needs
  const isMarqueePlayer = context.basePrice >= 10
  const budgetMultiplier = isMarqueePlayer ? 0.5 : 0.35 // Can spend more on marquee
  
  return Math.min(availableBudget, team.budget * budgetMultiplier)
}

// Check if team needs this player's role
function getRoleNeed(team, role) {
  const players = Array.isArray(team.players) ? team.players : []
  const roleCount = { 
    'Batsman': 0, 
    'Bowler': 0, 
    'All-rounder': 0, 
    'Wicket-keeper': 0 
  }
  
  players.forEach(p => {
    if (roleCount[p.role] !== undefined) {
      roleCount[p.role]++
    }
  })
  
  // Optimal squad composition targets
  const optimalCounts = {
    'Batsman': 5,
    'Bowler': 6,
    'All-rounder': 4,
    'Wicket-keeper': 2
  }
  
  const current = roleCount[role] || 0
  const optimal = optimalCounts[role] || 3
  
  if (current === 0) return 3.0  // Critical need
  if (current < optimal * 0.5) return 2.0  // High need
  if (current < optimal) return 1.0  // Normal need
  return 0.3  // Low need (already have enough)
}

function shouldTeamBid(team, profile, context) {
  if (!profile) return false
  
  const increment = getBidIncrement(context.currentPrice)
  const nextBid = context.currentPrice + increment
  
  // Can't afford
  if (team.budget < nextBid) return false
  
  // Already full
  if ((team.players?.length || 0) >= team.maxPlayers) return false
  
  // Already highest bidder
  if (team.id === context.highestBidder) return false

  // Calculate role need factor
  const roleNeed = getRoleNeed(team, context.player.role)
  
  // Low need = less likely to bid
  if (roleNeed < 0.5 && Math.random() > 0.2) return false

  // Check if former team (RTM-like behavior)
  const isFormerTeam = context.player.previousTeam && 
    team.name && 
    team.name.toLowerCase().includes(context.player.previousTeam.toLowerCase().split(' ')[0])
  
  // Marquee player factor
  const isMarquee = context.basePrice >= 10
  const isElite = context.basePrice >= 15
  
  // Price thresholds based on strategy and player quality
  let priceLimit
  const basePriceMultiplier = profile.maxPriceMultiplier || 2.5
  
  switch (profile.strategy) {
    case BiddingStrategy.AGGRESSIVE:
      priceLimit = context.basePrice * basePriceMultiplier * 1.3
      break
    case BiddingStrategy.DESPERATE:
      priceLimit = context.basePrice * basePriceMultiplier * 1.5
      break
    case BiddingStrategy.CONSERVATIVE:
      priceLimit = context.basePrice * 1.4
      break
    case BiddingStrategy.OPPORTUNISTIC:
      priceLimit = context.basePrice * (context.remainingTime < 8 ? 1.8 : 1.3)
      break
    case BiddingStrategy.PATIENT:
      priceLimit = context.basePrice * (context.remainingTime < 5 ? 1.6 : 1.1)
      break
    default:
      priceLimit = context.basePrice * 1.5
  }
  
  // Former team bonus (will pay more)
  if (isFormerTeam) {
    priceLimit *= 1.25
  }
  
  // Role need bonus
  priceLimit *= (1 + (roleNeed - 1) * 0.15)
  
  // Elite players get more aggressive bidding
  if (isElite) {
    priceLimit *= 1.2
  }
  
  // Check if we should continue bidding
  const shouldBid = nextBid <= priceLimit && nextBid <= team.budget * 0.6
  
  // Add randomness for realism
  if (shouldBid && Math.random() < 0.15) return false // Sometimes teams pause
  if (!shouldBid && isMarquee && roleNeed >= 2 && Math.random() < 0.3) return true // Sometimes stretch for needed players
  
  return shouldBid
}

function calculateNextBid(currentPrice, team, profile, context) {
  const capacity = calculateBiddingCapacity(team, context)
  const increment = getBidIncrement(currentPrice)
  
  if (capacity <= currentPrice + increment) return 0

  let bidIncrement = increment
  
  // Aggressive bidders sometimes skip increments (jump bidding)
  if (profile.strategy === BiddingStrategy.AGGRESSIVE || profile.strategy === BiddingStrategy.DESPERATE) {
    const jumpChance = profile.strategy === BiddingStrategy.DESPERATE ? 0.4 : 0.25
    if (Math.random() < jumpChance) {
      bidIncrement = increment * (2 + Math.floor(Math.random() * 3)) // 2x to 4x jump
    }
  }
  
  // Time pressure = bigger jumps
  if (context.remainingTime < 5) {
    bidIncrement *= 1.5
  }

  const nextBid = currentPrice + bidIncrement
  const maxBid = Math.min(
    nextBid,
    context.basePrice * profile.maxPriceMultiplier,
    capacity * (profile.riskTolerance || 1),
    team.budget * 0.65 // Never spend more than 65% on one player
  )

  return Math.round(maxBid * 100) / 100 // Round to 2 decimal places
}

function generateTeamBiddingProfile(team, allPlayers) {
  const roleCount = { Batsman: 0, Bowler: 0, "All-rounder": 0, "Wicket-keeper": 0 }
  const players = Array.isArray(team.players) ? team.players : []
  
  for (let i = 0; i < players.length; i++) {
    const p = players[i]
    if (roleCount[p.role] !== undefined) {
      roleCount[p.role] = (roleCount[p.role] || 0) + 1
    }
  }

  // Identify critical needs
  const targetRoles = Object.entries(roleCount)
    .filter(([role, count]) => {
      const targets = { Batsman: 5, Bowler: 6, 'All-rounder': 4, 'Wicket-keeper': 2 }
      return count < (targets[role] || 3)
    })
    .map(([role]) => role)

  // Budget utilization affects strategy
  const initialBudget = 100 // 100 Cr initial budget
  const budgetUtilization = team.budget / initialBudget
  const squadSize = players.length
  const remainingSlots = team.maxPlayers - squadSize
  
  // Determine strategy based on situation
  let strategy
  if (remainingSlots <= 3 && budgetUtilization > 0.3) {
    strategy = BiddingStrategy.AGGRESSIVE // Need to spend remaining budget
  } else if (remainingSlots <= 5 && budgetUtilization > 0.5) {
    strategy = BiddingStrategy.DESPERATE // Running out of slots with money left
  } else if (budgetUtilization > 0.7) {
    strategy = BiddingStrategy.PATIENT
  } else if (budgetUtilization > 0.4) {
    strategy = BiddingStrategy.OPPORTUNISTIC
  } else if (budgetUtilization > 0.2) {
    strategy = BiddingStrategy.CONSERVATIVE
  } else {
    strategy = BiddingStrategy.AGGRESSIVE // Low budget = must win some players
  }

  // Max multiplier based on budget situation
  let maxMultiplier
  if (budgetUtilization > 0.6) {
    maxMultiplier = 3.5 // Can afford to overpay
  } else if (budgetUtilization > 0.4) {
    maxMultiplier = 2.8
  } else if (budgetUtilization > 0.2) {
    maxMultiplier = 2.2
  } else {
    maxMultiplier = 1.8 // Budget tight
  }

  // Risk tolerance
  const riskTolerance = Math.max(0.4, Math.min(0.95, budgetUtilization * 0.8 + 0.2))

  return {
    teamId: team.id,
    strategy,
    maxPriceMultiplier: maxMultiplier,
    targetRoles,
    riskTolerance,
    budgetUtilization,
    remainingSlots
  }
}

function getNextBidder(teams, context, currentProfiles) {
  // Get teams that can and want to bid
  const potential = teams.filter((team) => {
    const profile = currentProfiles[team.id]
    if (!profile) return false
    return shouldTeamBid(team, profile, context)
  })
  
  if (potential.length === 0) return null

  // Score each team's likelihood to bid
  const scoredTeams = potential.map(team => {
    const profile = currentProfiles[team.id]
    const roleNeed = getRoleNeed(team, context.player.role)
    const budgetScore = team.budget / 100
    
    // Base score from strategy
    let strategyScore = {
      [BiddingStrategy.AGGRESSIVE]: 0.9,
      [BiddingStrategy.DESPERATE]: 0.95,
      [BiddingStrategy.OPPORTUNISTIC]: 0.6,
      [BiddingStrategy.CONSERVATIVE]: 0.4,
      [BiddingStrategy.PATIENT]: 0.3
    }[profile.strategy] || 0.5
    
    // Combine factors
    const score = strategyScore * roleNeed * budgetScore * (0.7 + Math.random() * 0.3)
    
    return { team, score }
  }).sort((a, b) => b.score - a.score)

  // Weighted random selection favoring higher scores
  const weights = scoredTeams.map((_, idx) => 1 / (idx + 1))
  const total = weights.reduce((a, b) => a + b, 0)
  let r = Math.random() * total
  
  for (let i = 0; i < scoredTeams.length; i++) {
    r -= weights[i]
    if (r <= 0) return scoredTeams[i].team.id
  }
  
  return scoredTeams[0].team.id
}

module.exports = { 
  generateTeamBiddingProfile, 
  shouldTeamBid, 
  calculateNextBid, 
  getNextBidder,
  getBidIncrement,
  getRoleNeed,
  BiddingStrategy
}
