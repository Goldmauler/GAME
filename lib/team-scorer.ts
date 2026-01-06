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
    starPower: number          // Max 25 points (Performance Metrics)
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

// --- Cortex Helper Functions ---

function calculateBattingImpact(player: Player): number {
  if (!player.stats) return 50
  const { average = 20, strikeRate = 120, matches = 0 } = player.stats

  // Experience weighting
  const experienceFactor = Math.min(1.2, 0.8 + (Math.log10(Math.max(matches, 10)) / 4))

  // Benchmark: Avg 30, SR 140 is elite
  const srScore = Math.min(100, (strikeRate / 150) * 100)
  const avgScore = Math.min(100, (average / 35) * 100)

  let rawScore = (srScore * 0.65) + (avgScore * 0.35)
  return Math.min(100, rawScore * experienceFactor)
}

function calculateBowlingControl(player: Player): number {
  if (!player.stats) return 50
  const { economy = 8.5, wickets = 0, matches = 1 } = player.stats

  const wicketsPerMatch = wickets / Math.max(matches, 1)
  const experienceFactor = Math.min(1.2, 0.8 + (Math.log10(Math.max(matches, 10)) / 4))

  // Benchmark: WPM 1.2, Eco 7.0 is elite
  const wktScore = Math.min(100, (wicketsPerMatch / 1.5) * 100)
  const ecoScore = Math.min(100, ((10 - Math.min(economy, 10)) / 3) * 100)

  let rawScore = (wktScore * 0.6) + (ecoScore * 0.4)
  return Math.min(100, rawScore * experienceFactor)
}

interface RoleCounts extends Record<string, number> {
  'Batsman': number
  'Bowler': number
  'All-rounder': number
  'Wicket-keeper': number
}

function getRoleCount(players: Player[]): RoleCounts {
  const count: RoleCounts = {
    'Batsman': 0,
    'Bowler': 0,
    'All-rounder': 0,
    'Wicket-keeper': 0
  }

  players.forEach(p => {
    const role = normalizeRole(p.role)
    if (count[role] !== undefined) count[role]++
  })
  return count
}

function normalizeRole(role: string): string {
  const lower = role.toLowerCase()
  if (lower.includes('bat')) return 'Batsman'
  if (lower.includes('bowl')) return 'Bowler'
  if (lower.includes('all') || lower.includes('rounder')) return 'All-rounder'
  if (lower.includes('keep') || lower.includes('wicket')) return 'Wicket-keeper'
  return 'Batsman'
}

function getGrade(score: number): string {
  if (score >= 90) return 'S+'
  if (score >= 85) return 'S'
  if (score >= 80) return 'A+'
  if (score >= 75) return 'A'
  if (score >= 70) return 'B+'
  if (score >= 60) return 'B'
  if (score >= 50) return 'C+'
  if (score >= 40) return 'C'
  return 'F'
}

// --- Main Scoring Logic (Cortex) ---

export function scoreTeam(team: Team): TeamScore {
  const players = team.players || []
  const initialBudget = 100
  const totalSpent = initialBudget - team.budget

  // 1. PERFORMANCE METRICS (Max 25 points - mapped from 40 in server/cortex)
  // We calculate Impact (Batting) and Control (Bowling)
  let totalBattingImpact = 0
  let totalBowlingControl = 0

  const validBatters = players.filter(p => !normalizeRole(p.role).includes('Bowler'))
  const validBowlers = players.filter(p => !normalizeRole(p.role).includes('Batsman') && !normalizeRole(p.role).includes('Wicket'))

  validBatters.forEach(p => totalBattingImpact += calculateBattingImpact(p))
  validBowlers.forEach(p => totalBowlingControl += calculateBowlingControl(p))

  const avgBattingScore = validBatters.length ? (totalBattingImpact / validBatters.length) : 0
  const avgBowlingScore = validBowlers.length ? (totalBowlingControl / validBowlers.length) : 0

  // Performance Score (0-100 scale)
  const rawPerformanceScore = (avgBattingScore + avgBowlingScore) / 2
  const starPowerScore = Math.min(25, (rawPerformanceScore / 100) * 25)

  // 2. SQUAD BALANCE (Max 25 points)
  const roleCounts = getRoleCount(players)
  let balanceScore = 0
  if (roleCounts.Batsman >= 4) balanceScore += 5
  if (roleCounts.Bowler >= 4) balanceScore += 5
  if (roleCounts["All-rounder"] >= 2) balanceScore += 5
  if (roleCounts["Wicket-keeper"] >= 1) balanceScore += 5
  if (players.length >= 15) balanceScore += 5 // Minimum viable squad

  const squadBalance = Math.min(25, balanceScore)

  // 3. BUDGET EFFICIENCY (Max 20 points)
  // ROI based approach
  const totalImpact = totalBattingImpact + totalBowlingControl
  const roiRatio = totalSpent > 0 ? (totalImpact / totalSpent) : 0
  const budgetEfficiency = Math.min(20, (roiRatio / 20) * 20)

  // 4. SQUAD DEPTH (Max 15 points)
  let depthScore = 0
  if (players.length >= 18) depthScore = 15
  else if (players.length >= 16) depthScore = 10
  else if (players.length >= 12) depthScore = 5
  const squadDepth = depthScore

  // 5. VALUE FOR MONEY (Max 15 points) - Synergy/Variety proxy
  // Check deviation in IDs or stats to ensure variety
  const srValues = validBatters.map(p => p.stats?.strikeRate || 0)
  const meanSR = srValues.reduce((a, b) => a + b, 0) / (srValues.length || 1)
  const variance = srValues.reduce((a, b) => a + Math.pow(b - meanSR, 2), 0) / (srValues.length || 1)
  const stdDev = Math.sqrt(variance)

  // Reward partial variety (anchors + hitters)
  const valueForMoney = Math.min(15, (stdDev / 30) * 15) + (roleCounts["All-rounder"] >= 3 ? 5 : 0)

  // Total
  const totalScore = Math.min(100, starPowerScore + squadBalance + budgetEfficiency + squadDepth + valueForMoney)

  // Analysis
  const strengths: string[] = []
  if (avgBattingScore > 75) strengths.push("Explosive batting lineup")
  if (avgBowlingScore > 75) strengths.push("World-class bowling attack")
  if (budgetEfficiency > 15) strengths.push("High ROI / Smart Spending")
  if (squadDepth >= 10) strengths.push("Deep Squad")

  const weaknesses: string[] = []
  if (roleCounts["Wicket-keeper"] === 0) weaknesses.push("No Wicket-keeper")
  if (players.length < 15) weaknesses.push("Squad too small")
  if (avgBattingScore < 50) weaknesses.push("Batting lacks impact")

  return {
    teamId: team.id,
    teamName: team.name,
    totalScore: Math.round(totalScore * 10) / 10,
    rank: 0,
    breakdown: {
      squadBalance: Math.round(squadBalance * 10) / 10,
      starPower: Math.round(starPowerScore * 10) / 10,
      budgetEfficiency: Math.round(budgetEfficiency * 10) / 10,
      squadDepth: Math.round(squadDepth * 10) / 10,
      valueForMoney: Math.round(Math.min(15, valueForMoney) * 10) / 10
    },
    details: {
      totalSpent: Math.round(totalSpent * 100) / 100,
      avgPlayerPrice: Math.round((totalSpent / (players.length || 1)) * 100) / 100,
      squadSize: players.length,
      roleBreakdown: roleCounts,
      topPlayers: players.sort((a, b) => (b.soldPrice || 0) - (a.soldPrice || 0)).slice(0, 3).map(p => p.name),
      strengths,
      weaknesses
    },
    grade: getGrade(totalScore)
  }
}

export function createLeaderboard(teams: Team[]): TeamScore[] {
  const activeTeams = teams.filter(t => t.players && t.players.length > 0)
  const scores = activeTeams.map(team => scoreTeam(team))
  scores.sort((a, b) => b.totalScore - a.totalScore)

  let currentRank = 1
  for (let i = 0; i < scores.length; i++) {
    if (i > 0 && scores[i].totalScore < scores[i - 1].totalScore) {
      currentRank = i + 1
    }
    scores[i].rank = currentRank
  }
  return scores
}

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
