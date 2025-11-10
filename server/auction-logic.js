// Auction logic (JS port of lib/auctioneer-logic.ts core functions)

const BiddingStrategy = {
  AGGRESSIVE: "aggressive",
  CONSERVATIVE: "conservative",
  OPPORTUNISTIC: "opportunistic",
  PATIENT: "patient",
}

function calculateBiddingCapacity(team, context) {
  const remainingSlots = team.maxPlayers - (team.players?.length || 0)
  if (remainingSlots <= 0) return 0
  const avgPricePerSlot = team.budget / remainingSlots
  const budgetPressure = Math.min(avgPricePerSlot * 0.8, team.budget * 0.3)
  return Math.min(budgetPressure, team.budget)
}

function shouldTeamBid(team, profile, context) {
  if (!profile) return false
  if (team.budget < context.currentPrice) return false
  if ((team.players?.length || 0) >= team.maxPlayers) return false
  if (team.id === context.highestBidder) return false

  const isTargetRole = !profile.targetRoles || profile.targetRoles.length === 0 || profile.targetRoles.includes(context.player.role)
  if (!isTargetRole && Math.random() > 0.3) return false

  switch (profile.strategy) {
    case BiddingStrategy.AGGRESSIVE:
      return context.currentPrice <= team.budget * 0.4
    case BiddingStrategy.CONSERVATIVE:
      return context.currentPrice <= context.basePrice * 1.5
    case BiddingStrategy.OPPORTUNISTIC:
      const isLowPrice = context.currentPrice <= context.basePrice * 1.2
      const timePressure = context.remainingTime < 8
      return isLowPrice || timePressure
    case BiddingStrategy.PATIENT:
      return context.currentPrice <= context.basePrice * 1.1 || context.remainingTime < 3
    default:
      return false
  }
}

function calculateNextBid(currentPrice, team, profile, context) {
  const capacity = calculateBiddingCapacity(team, context)
  if (capacity <= currentPrice) return 0

  let increment = 1
  if (profile.strategy === BiddingStrategy.AGGRESSIVE) {
    increment = Math.min(3, context.basePrice * profile.maxPriceMultiplier * 0.1)
  }
  if (context.remainingTime < 5) increment *= 2

  const maxBid = Math.min(
    currentPrice + increment,
    context.basePrice * profile.maxPriceMultiplier,
    capacity * (profile.riskTolerance || 1),
  )

  return Math.floor(maxBid)
}

function generateTeamBiddingProfile(team, allPlayers) {
  const roleCount = { Batsman: 0, Bowler: 0, "All-rounder": 0, "Wicket-keeper": 0 }
  const players = Array.isArray(team.players) ? team.players : []
  for (let i = 0; i < players.length; i++) {
    const p = players[i]
    roleCount[p.role] = (roleCount[p.role] || 0) + 1
  }

  const targetRoles = Object.entries(roleCount).filter(([_, count]) => count < 6).map(([role]) => role)

  const budgetUtilization = team.budget / 100 // initial budget is 100Cr here
  let strategy = BiddingStrategy.OPPORTUNISTIC
  if (budgetUtilization > 0.7) strategy = BiddingStrategy.PATIENT
  else if (budgetUtilization > 0.5) strategy = BiddingStrategy.CONSERVATIVE
  else if (budgetUtilization > 0.25) strategy = BiddingStrategy.OPPORTUNISTIC
  else strategy = BiddingStrategy.AGGRESSIVE

  const maxMultiplier = budgetUtilization < 0.2 ? 3 : budgetUtilization < 0.4 ? 2.5 : 2

  return {
    teamId: team.id,
    strategy,
    maxPriceMultiplier: maxMultiplier,
    targetRoles,
    riskTolerance: Math.max(0.3, Math.min(0.9, 1 - budgetUtilization * 0.5)),
  }
}

function getNextBidder(teams, context, currentProfiles) {
  const potential = teams.filter((team) => {
    const profile = currentProfiles[team.id]
    if (!profile) return false
    return shouldTeamBid(team, profile, context)
  }).sort((a, b) => b.budget - a.budget)

  if (potential.length === 0) return null

  const weights = potential.map((_, idx) => 1 / (idx + 1))
  const total = weights.reduce((a, b) => a + b, 0)
  let r = Math.random() * total
  for (let i = 0; i < potential.length; i++) {
    r -= weights[i]
    if (r <= 0) return potential[i].id
  }
  return potential[0].id
}

module.exports = { generateTeamBiddingProfile, shouldTeamBid, calculateNextBid, getNextBidder }
