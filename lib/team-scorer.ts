// Advanced Team Scoring System for IPL Auction Game
// Evaluates teams based on multiple factors after auction completion

export interface Player {
  id: string
  name: string
  role: string
  basePrice: number
  soldPrice?: number
  auctionPrice?: number
  rating?: number
  stats?: {
    matches?: number
    runs?: number
    wickets?: number
    average?: number
    strikeRate?: number
    economy?: number
  }
  isMarquee?: boolean
  isRetained?: boolean
}

export interface Team {
  id: string
  name: string
  budget: number
  players: Player[]
  maxPlayers: number
}

export interface TeamScore {
  teamId: string
  teamName: string
  totalScore: number
  rank: number
  breakdown: {
    squadBalance: number       // Max 25 points
    starPower: number          // Max 25 points
    budgetEfficiency: number   // Max 20 points
    squadDepth: number         // Max 15 points
    valueForMoney: number      // Max 15 points
  }
  details: {
    totalSpent: number
    avgPlayerPrice: number
    squadSize: number
    roleBreakdown: Record<string, number>
    topPlayers: string[]
    strengths: string[]
    weaknesses: string[]
  }
  grade: string
}

// Optimal squad composition for T20/IPL
const OPTIMAL_COMPOSITION = {
  'Batsman': { min: 4, optimal: 5, max: 7 },
  'Bowler': { min: 5, optimal: 6, max: 8 },
  'All-rounder': { min: 2, optimal: 4, max: 5 },
  'Wicket-keeper': { min: 1, optimal: 2, max: 3 }
}

const ROLE_WEIGHTS = {
  'Batsman': 1.0,
  'Bowler': 1.1,       // Slightly more valuable due to scarcity
  'All-rounder': 1.3,  // Most valuable
  'Wicket-keeper': 0.9
}

// Calculate squad balance score (max 25 points)
function calculateSquadBalance(players: Player[]): { score: number, roleBreakdown: Record<string, number>, analysis: string[] } {
  const roleCount: Record<string, number> = {
    'Batsman': 0,
    'Bowler': 0,
    'All-rounder': 0,
    'Wicket-keeper': 0
  }
  
  players.forEach(p => {
    const role = normalizeRole(p.role)
    if (roleCount[role] !== undefined) {
      roleCount[role]++
    }
  })
  
  let score = 0
  const analysis: string[] = []
  
  Object.entries(OPTIMAL_COMPOSITION).forEach(([role, config]) => {
    const count = roleCount[role] || 0
    
    if (count >= config.min && count <= config.max) {
      // Within acceptable range
      const optimalDiff = Math.abs(count - config.optimal)
      const roleScore = (1 - optimalDiff / config.optimal) * 6.25 // 6.25 per role = 25 total
      score += roleScore
      
      if (count === config.optimal) {
        analysis.push(`Perfect ${role.toLowerCase()} count`)
      }
    } else if (count < config.min) {
      score += 1 // Minimal points for being short
      analysis.push(`Short on ${role.toLowerCase()}s (${count}/${config.min} min)`)
    } else {
      score += 3 // Some points for overstocking
      analysis.push(`Too many ${role.toLowerCase()}s`)
    }
  })
  
  return { score: Math.min(25, score), roleBreakdown: roleCount, analysis }
}

// Calculate star power score (max 25 points)
function calculateStarPower(players: Player[]): { score: number, topPlayers: string[] } {
  let score = 0
  const topPlayers: string[] = []
  
  // Sort by value (soldPrice or basePrice)
  const sortedPlayers = [...players].sort((a, b) => {
    const aPrice = a.soldPrice || a.basePrice || 0
    const bPrice = b.soldPrice || b.basePrice || 0
    return bPrice - aPrice
  })
  
  // Elite players (20+ Cr) - 5 points each, max 3
  const elitePlayers = sortedPlayers.filter(p => (p.soldPrice || p.basePrice || 0) >= 20)
  score += Math.min(3, elitePlayers.length) * 5
  topPlayers.push(...elitePlayers.slice(0, 3).map(p => p.name))
  
  // Star players (10-20 Cr) - 2.5 points each, max 4
  const starPlayers = sortedPlayers.filter(p => {
    const price = p.soldPrice || p.basePrice || 0
    return price >= 10 && price < 20
  })
  score += Math.min(4, starPlayers.length) * 2.5
  
  // Marquee/Retained bonus
  const marqueeCount = players.filter(p => p.isMarquee || p.isRetained).length
  score += Math.min(5, marqueeCount)
  
  return { score: Math.min(25, score), topPlayers }
}

// Calculate budget efficiency (max 20 points)
function calculateBudgetEfficiency(team: Team): { score: number, totalSpent: number, avgPrice: number } {
  const initialBudget = 100 // 100 Cr
  const totalSpent = initialBudget - team.budget
  const squadSize = team.players.length
  const avgPrice = squadSize > 0 ? totalSpent / squadSize : 0
  
  let score = 0
  
  // Reward spending most of budget (80-95% is optimal)
  const spendingRatio = totalSpent / initialBudget
  if (spendingRatio >= 0.80 && spendingRatio <= 0.95) {
    score += 10 // Perfect spending
  } else if (spendingRatio >= 0.70 && spendingRatio <= 0.98) {
    score += 7
  } else if (spendingRatio >= 0.60) {
    score += 5
  } else {
    score += 2 // Underspent significantly
  }
  
  // Squad size efficiency (15-18 players optimal)
  if (squadSize >= 15 && squadSize <= 18) {
    score += 10
  } else if (squadSize >= 12 && squadSize <= 20) {
    score += 6
  } else if (squadSize >= 8) {
    score += 3
  }
  
  return { score: Math.min(20, score), totalSpent, avgPrice }
}

// Calculate squad depth (max 15 points)
function calculateSquadDepth(players: Player[]): { score: number, analysis: string[] } {
  let score = 0
  const analysis: string[] = []
  
  const roleCount = getRoleCount(players)
  
  // Playing XI quality (can field a balanced team)
  const canFieldXI = roleCount['Batsman'] >= 4 && 
                     roleCount['Bowler'] >= 4 && 
                     roleCount['All-rounder'] >= 1 &&
                     roleCount['Wicket-keeper'] >= 1
  
  if (canFieldXI) {
    score += 5
    analysis.push('Can field balanced XI')
  }
  
  // Backup options
  if (roleCount['Batsman'] >= 6) score += 2
  if (roleCount['Bowler'] >= 6) score += 2
  if (roleCount['All-rounder'] >= 3) score += 3
  if (roleCount['Wicket-keeper'] >= 2) score += 2
  
  // Total squad size depth
  if (players.length >= 18) {
    score += 1
    analysis.push('Full squad depth')
  }
  
  return { score: Math.min(15, score), analysis }
}

// Calculate value for money (max 15 points)
function calculateValueForMoney(players: Player[]): { score: number } {
  let score = 0
  
  players.forEach(p => {
    const soldPrice = p.soldPrice || p.basePrice || 1
    const basePrice = p.basePrice || 1
    const rating = p.rating || 70
    
    // Calculate value ratio
    const valueRatio = basePrice / soldPrice // Higher is better (paid less than base)
    const ratingBonus = rating / 100
    
    // Good deals (paid at or below base price)
    if (valueRatio >= 1) {
      score += 0.8 * ratingBonus
    } else if (valueRatio >= 0.7) {
      score += 0.5 * ratingBonus
    } else if (valueRatio >= 0.5) {
      score += 0.3 * ratingBonus
    }
    // Overpaid significantly = no bonus
  })
  
  return { score: Math.min(15, score) }
}

function getRoleCount(players: Player[]): Record<string, number> {
  const count: Record<string, number> = {
    'Batsman': 0,
    'Bowler': 0,
    'All-rounder': 0,
    'Wicket-keeper': 0
  }
  
  players.forEach(p => {
    const role = normalizeRole(p.role)
    if (count[role] !== undefined) {
      count[role]++
    }
  })
  
  return count
}

function normalizeRole(role: string): string {
  const lower = role.toLowerCase()
  if (lower.includes('bat') || lower.includes('batter')) return 'Batsman'
  if (lower.includes('bowl')) return 'Bowler'
  if (lower.includes('all') || lower.includes('rounder')) return 'All-rounder'
  if (lower.includes('keep') || lower.includes('wicket')) return 'Wicket-keeper'
  return 'Batsman' // Default
}

function getGrade(score: number): string {
  if (score >= 90) return 'S+'
  if (score >= 85) return 'S'
  if (score >= 80) return 'A+'
  if (score >= 75) return 'A'
  if (score >= 70) return 'B+'
  if (score >= 65) return 'B'
  if (score >= 60) return 'C+'
  if (score >= 55) return 'C'
  if (score >= 50) return 'D'
  return 'F'
}

function identifyStrengthsWeaknesses(
  breakdown: TeamScore['breakdown'],
  roleBreakdown: Record<string, number>,
  players: Player[]
): { strengths: string[], weaknesses: string[] } {
  const strengths: string[] = []
  const weaknesses: string[] = []
  
  // Squad balance
  if (breakdown.squadBalance >= 20) strengths.push('Well-balanced squad')
  else if (breakdown.squadBalance < 15) weaknesses.push('Unbalanced squad composition')
  
  // Star power
  if (breakdown.starPower >= 20) strengths.push('Star-studded lineup')
  else if (breakdown.starPower < 12) weaknesses.push('Lacks marquee players')
  
  // Budget
  if (breakdown.budgetEfficiency >= 16) strengths.push('Excellent budget management')
  else if (breakdown.budgetEfficiency < 10) weaknesses.push('Poor budget utilization')
  
  // Depth
  if (breakdown.squadDepth >= 12) strengths.push('Strong squad depth')
  else if (breakdown.squadDepth < 8) weaknesses.push('Thin squad depth')
  
  // Value
  if (breakdown.valueForMoney >= 12) strengths.push('Smart value picks')
  else if (breakdown.valueForMoney < 7) weaknesses.push('Overpaid for players')
  
  // Role-specific
  if (roleBreakdown['All-rounder'] >= 4) strengths.push('Strong all-rounder core')
  if (roleBreakdown['Bowler'] >= 6) strengths.push('Deep bowling attack')
  if (roleBreakdown['Wicket-keeper'] >= 2) strengths.push('Keeping options covered')
  
  if (roleBreakdown['Batsman'] < 4) weaknesses.push('Short on batting options')
  if (roleBreakdown['Bowler'] < 5) weaknesses.push('Bowling department weak')
  if (roleBreakdown['All-rounder'] < 2) weaknesses.push('Lacks all-round options')
  if (roleBreakdown['Wicket-keeper'] < 1) weaknesses.push('No designated keeper!')
  
  return { strengths: strengths.slice(0, 4), weaknesses: weaknesses.slice(0, 4) }
}

// Main scoring function
export function scoreTeam(team: Team): TeamScore {
  const players = team.players || []
  
  // Calculate all components
  const balanceResult = calculateSquadBalance(players)
  const starResult = calculateStarPower(players)
  const efficiencyResult = calculateBudgetEfficiency(team)
  const depthResult = calculateSquadDepth(players)
  const valueResult = calculateValueForMoney(players)
  
  const breakdown = {
    squadBalance: Math.round(balanceResult.score * 10) / 10,
    starPower: Math.round(starResult.score * 10) / 10,
    budgetEfficiency: Math.round(efficiencyResult.score * 10) / 10,
    squadDepth: Math.round(depthResult.score * 10) / 10,
    valueForMoney: Math.round(valueResult.score * 10) / 10
  }
  
  const totalScore = Object.values(breakdown).reduce((a, b) => a + b, 0)
  
  const { strengths, weaknesses } = identifyStrengthsWeaknesses(
    breakdown,
    balanceResult.roleBreakdown,
    players
  )
  
  return {
    teamId: team.id,
    teamName: team.name,
    totalScore: Math.round(totalScore * 10) / 10,
    rank: 0, // Will be set when comparing teams
    breakdown,
    details: {
      totalSpent: Math.round(efficiencyResult.totalSpent * 100) / 100,
      avgPlayerPrice: Math.round(efficiencyResult.avgPrice * 100) / 100,
      squadSize: players.length,
      roleBreakdown: balanceResult.roleBreakdown,
      topPlayers: starResult.topPlayers,
      strengths,
      weaknesses
    },
    grade: getGrade(totalScore)
  }
}

// Score all teams and create leaderboard
export function createLeaderboard(teams: Team[]): TeamScore[] {
  // Filter teams with at least some players
  const activeTeams = teams.filter(t => t.players && t.players.length > 0)
  
  // Score each team
  const scores = activeTeams.map(team => scoreTeam(team))
  
  // Sort by total score (descending)
  scores.sort((a, b) => b.totalScore - a.totalScore)
  
  // Assign ranks (handle ties)
  let currentRank = 1
  for (let i = 0; i < scores.length; i++) {
    if (i > 0 && scores[i].totalScore < scores[i - 1].totalScore) {
      currentRank = i + 1
    }
    scores[i].rank = currentRank
  }
  
  return scores
}

// Get detailed comparison between two teams
export function compareTeams(team1: TeamScore, team2: TeamScore): {
  winner: string
  categories: Record<string, { winner: string, margin: number }>
} {
  const categories: Record<string, { winner: string, margin: number }> = {}
  
  Object.keys(team1.breakdown).forEach(key => {
    const k = key as keyof typeof team1.breakdown
    const val1 = team1.breakdown[k]
    const val2 = team2.breakdown[k]
    categories[key] = {
      winner: val1 > val2 ? team1.teamName : val2 > val1 ? team2.teamName : 'Tie',
      margin: Math.abs(val1 - val2)
    }
  })
  
  return {
    winner: team1.totalScore > team2.totalScore ? team1.teamName : 
            team2.totalScore > team1.totalScore ? team2.teamName : 'Tie',
    categories
  }
}
