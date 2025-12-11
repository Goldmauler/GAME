// Rankings & Points System

import { calculateTeamRating } from "./team-rating"

interface Team {
  id: string
  name: string
  players: any[]
  budget: number
  color: string
}

export interface TeamRankingData {
  rank: number
  teamId: string
  teamName: string
  teamColor: string
  points: number
  overallRating: number
  playersCount: number
  budgetSpent: number
  budgetRemaining: number
  averagePlayerPrice: number
}

/**
 * Calculates total budget spent by team
 */
export function calculateBudgetSpent(team: Team): number {
  return team.players.reduce((acc, p) => acc + (p.basePrice || 0), 0)
}

/**
 * Calculates average price per player
 */
export function calculateAveragePrice(team: Team): number {
  if (team.players.length === 0) return 0
  return Math.round(calculateBudgetSpent(team) / team.players.length)
}

/**
 * Main ranking points calculation
 * Considers: team rating, squad size, budget efficiency, player value
 */
export function calculateRankingPoints(team: Team): number {
  const teamRating = calculateTeamRating(team)
  const budgetSpent = calculateBudgetSpent(team)
  const avgPrice = calculateAveragePrice(team)
  const squadCompleteness = (team.players.length / 25) * 100

  // Base points from team rating (max 40)
  const basePoints = teamRating.overallScore * 4

  // Squad completeness bonus (max 20)
  const completenessBonus = (squadCompleteness / 100) * 20

  // Budget efficiency (max 20)
  // Penalize for overspending on average players
  let efficiencyBonus = 20
  if (avgPrice > 80) {
    efficiencyBonus = 10 // Overpaid on average
  } else if (avgPrice > 60) {
    efficiencyBonus = 15
  } else if (avgPrice < 30) {
    efficiencyBonus = 12 // Too cheap might indicate weak squad
  }

  // Premium player bonus (max 20)
  const premiumPlayers = team.players.filter((p) => p.basePrice > 50).length
  const premiumBonus = Math.min(premiumPlayers * 2, 20)

  return Math.round(basePoints + completenessBonus + efficiencyBonus + premiumBonus)
}

/**
 * Generates full rankings for all teams
 */
export function generateRankings(teams: Team[]): TeamRankingData[] {
  const rankings = teams
    .map((team) => ({
      rank: 0, // Will be assigned after sorting
      teamId: team.id,
      teamName: team.name,
      teamColor: team.color,
      points: calculateRankingPoints(team),
      overallRating: calculateTeamRating(team).overallScore,
      playersCount: team.players.length,
      budgetSpent: calculateBudgetSpent(team),
      budgetRemaining: team.budget,
      averagePlayerPrice: calculateAveragePrice(team),
    }))
    .sort((a, b) => b.points - a.points)
    .map((ranking, idx) => ({
      ...ranking,
      rank: idx + 1,
    }))

  return rankings
}

/**
 * Generates trophy/achievement badges for top performers
 */
export function generateAchievements(rankings: TeamRankingData[]) {
  const achievements: Record<string, string[]> = {}

  rankings.forEach((team) => {
    achievements[team.teamId] = []

    // Ranking badges
    if (team.rank === 1) achievements[team.teamId].push("Champion")
    if (team.rank <= 3) achievements[team.teamId].push("Top Contender")
    if (team.rank <= 5) achievements[team.teamId].push("Playoff Spot")

    // Performance badges
    if (team.overallRating >= 8.5) achievements[team.teamId].push("Elite Squad")
    if (team.averagePlayerPrice > 70) achievements[team.teamId].push("Premium Team")
    if (team.playersCount === 25) achievements[team.teamId].push("Complete Squad")
    if (team.budgetSpent < 500) achievements[team.teamId].push("Budget Master")

    // Strategy badges
    if (team.playersCount >= 20 && team.averagePlayerPrice <= 40) {
      achievements[team.teamId].push("Value Strategy")
    }
  })

  return achievements
}

/**
 * Generates comparative statistics
 */
export function generateComparativeStats(rankings: TeamRankingData[]) {
  const avgRating = rankings.reduce((acc, t) => acc + t.overallRating, 0) / rankings.length
  const avgPoints = rankings.reduce((acc, t) => acc + t.points, 0) / rankings.length
  const avgPrice = rankings.reduce((acc, t) => acc + t.averagePlayerPrice, 0) / rankings.length

  return {
    averageRating: Math.round(avgRating * 10) / 10,
    averagePoints: Math.round(avgPoints),
    averagePlayerPrice: Math.round(avgPrice),
    topTeam: rankings[0],
    bottomTeam: rankings[rankings.length - 1],
    ratingRange: {
      highest: rankings.reduce((max, t) => (t.overallRating > max ? t.overallRating : max), 0),
      lowest: rankings.reduce((min, t) => (t.overallRating < min ? t.overallRating : min), 10),
    },
  }
}
