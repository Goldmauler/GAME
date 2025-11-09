// Auto Auctioneer & Bidding Strategy Logic

interface Team {
  id: string
  name: string
  budget: number
  players: any[]
  maxPlayers: number
}

interface Player {
  id: string
  name: string
  role: "Batsman" | "Bowler" | "All-rounder" | "Wicket-keeper"
  basePrice: number
}

interface BiddingContext {
  currentPrice: number
  basePrice: number
  highestBidder: string
  remainingTime: number
  player: Player
}

// Bidding Strategy Types
export enum BiddingStrategy {
  AGGRESSIVE = "aggressive",
  CONSERVATIVE = "conservative",
  OPPORTUNISTIC = "opportunistic",
  PATIENT = "patient",
}

export interface TeamBiddingProfile {
  teamId: string
  strategy: BiddingStrategy
  maxPriceMultiplier: number // Multiplier of base price willing to pay
  targetRoles: string[]
  riskTolerance: number // 0-1, how willing to go all-in
}

/**
 * Calculates a team's bidding capacity based on budget and squad composition
 */
export function calculateBiddingCapacity(team: Team, context: BiddingContext): number {
  const remainingSlots = team.maxPlayers - team.players.length

  // Don't bid if squad is full
  if (remainingSlots <= 0) return 0

  // Calculate budget pressure (how much budget left relative to remaining slots)
  const avgPricePerSlot = team.budget / remainingSlots
  const budgetPressure = Math.min(avgPricePerSlot * 0.8, team.budget * 0.3)

  return Math.min(budgetPressure, team.budget)
}

/**
 * Determines if a team should bid based on strategy and context
 */
export function shouldTeamBid(team: Team, profile: TeamBiddingProfile, context: BiddingContext): boolean {
  // Check basic constraints
  if (team.budget < context.currentPrice) return false
  if (team.players.length >= team.maxPlayers) return false
  if (team.id === context.highestBidder) return false

  // Role matching - prefer players that fit team needs
  const isTargetRole = profile.targetRoles.length === 0 || profile.targetRoles.includes(context.player.role)
  if (!isTargetRole && Math.random() > 0.3) return false

  // Strategy-based decisions
  switch (profile.strategy) {
    case BiddingStrategy.AGGRESSIVE:
      // Bid on almost anything within capacity
      return context.currentPrice <= team.budget * 0.4

    case BiddingStrategy.CONSERVATIVE:
      // Only bid if price is reasonable compared to base
      return context.currentPrice <= context.basePrice * 1.5

    case BiddingStrategy.OPPORTUNISTIC:
      // Bid when price is low or time is running out
      const isLowPrice = context.currentPrice <= context.basePrice * 1.2
      const timePressure = context.remainingTime < 8
      return isLowPrice || timePressure

    case BiddingStrategy.PATIENT:
      // Wait for bargains
      return context.currentPrice <= context.basePrice * 1.1 || context.remainingTime < 3

    default:
      return false
  }
}

/**
 * Calculates the next bid amount a team would make
 */
export function calculateNextBid(
  currentPrice: number,
  team: Team,
  profile: TeamBiddingProfile,
  context: BiddingContext,
): number {
  const capacity = calculateBiddingCapacity(team, context)
  if (capacity <= currentPrice) return 0

  // Base increment
  let increment = 5

  // Aggressive bidders use larger increments
  if (profile.strategy === BiddingStrategy.AGGRESSIVE) {
    increment = Math.min(10, context.basePrice * profile.maxPriceMultiplier * 0.1)
  }

  // Increase bid increment when time is running out
  if (context.remainingTime < 5) {
    increment *= 2
  }

  // Risk tolerance affects how high they go
  const maxBid = Math.min(
    currentPrice + increment,
    context.basePrice * profile.maxPriceMultiplier,
    capacity * profile.riskTolerance,
  )

  return Math.floor(maxBid / 5) * 5 // Round to nearest 5
}

/**
 * Generates bidding profiles for teams based on their composition
 */
export function generateTeamBiddingProfile(team: Team, allPlayers: Player[]): TeamBiddingProfile {
  // Count current role distribution
  const roleCount = {
    Batsman: 0,
    Bowler: 0,
    "All-rounder": 0,
    "Wicket-keeper": 0,
  }

  team.players.forEach((p: any) => {
    roleCount[p.role as keyof typeof roleCount]++
  })

  // Determine target roles (underrepresented roles get higher priority)
  const targetRoles = Object.entries(roleCount)
    .filter(([_, count]) => count < 6) // Each role should have ~6 players
    .map(([role]) => role)

  // Determine strategy based on remaining budget
  const budgetUtilization = team.budget / 1600 // Assuming 1600 is initial budget
  let strategy: BiddingStrategy

  if (budgetUtilization > 0.7) {
    strategy = BiddingStrategy.PATIENT // Very limited budget
  } else if (budgetUtilization > 0.5) {
    strategy = BiddingStrategy.CONSERVATIVE // Running low
  } else if (budgetUtilization > 0.25) {
    strategy = BiddingStrategy.OPPORTUNISTIC // Moderate budget
  } else {
    strategy = BiddingStrategy.AGGRESSIVE // Plenty of budget
  }

  // Adjust multiplier based on available budget
  const maxMultiplier = budgetUtilization < 0.2 ? 3 : budgetUtilization < 0.4 ? 2.5 : 2

  return {
    teamId: team.id,
    strategy,
    maxPriceMultiplier: maxMultiplier,
    targetRoles,
    riskTolerance: Math.max(0.3, Math.min(0.9, 1 - budgetUtilization * 0.5)),
  }
}

/**
 * Simulates the auctioneer calling for next bid
 * Returns the team that should bid next, or null if auction should close
 */
export function getNextBidder(
  teams: Team[],
  context: BiddingContext,
  currentProfiles: Map<string, TeamBiddingProfile>,
): string | null {
  const potentialBidders = teams
    .filter((team) => {
      const profile = currentProfiles.get(team.id)
      if (!profile) return false
      return shouldTeamBid(team, profile, context)
    })
    .sort((a, b) => {
      // Prioritize teams that are actively building or need this role
      const profileA = currentProfiles.get(a.id)!
      const profileB = currentProfiles.get(b.id)!

      const isTargetA = profileA.targetRoles.includes(context.player.role)
      const isTargetB = profileB.targetRoles.includes(context.player.role)

      if (isTargetA && !isTargetB) return -1
      if (!isTargetA && isTargetB) return 1

      // Tiebreaker: more budget = higher priority (aggressive teams bid first)
      return b.budget - a.budget
    })

  if (potentialBidders.length === 0) return null

  // Weighted random selection (top teams have higher chance)
  const weights = potentialBidders.map((_, idx) => 1 / (idx + 1))
  const totalWeight = weights.reduce((a, b) => a + b, 0)
  let random = Math.random() * totalWeight
  for (let i = 0; i < potentialBidders.length; i++) {
    random -= weights[i]
    if (random <= 0) return potentialBidders[i].id
  }

  return potentialBidders[0]?.id || null
}

/**
 * Generates match highlights and analysis after auction
 */
export function generateAuctionAnalytics(
  teams: Team[],
  soldPlayers: Array<{ player: Player; team: Team; price: number }>,
) {
  const analytics = {
    totalSpent: 0,
    averagePrice: 0,
    pricierPlayers: [] as typeof soldPlayers,
    bargains: [] as typeof soldPlayers,
    teamSpending: {} as Record<string, number>,
  }

  soldPlayers.forEach(({ price, team }) => {
    analytics.totalSpent += price
    analytics.teamSpending[team.id] = (analytics.teamSpending[team.id] || 0) + price
  })

  analytics.averagePrice = analytics.totalSpent / soldPlayers.length

  // Identify bargains and expensive picks
  soldPlayers.forEach((item) => {
    if (item.price > analytics.averagePrice * 1.5) {
      analytics.pricierPlayers.push(item)
    } else if (item.price < analytics.averagePrice * 0.7) {
      analytics.bargains.push(item)
    }
  })

  return analytics
}
