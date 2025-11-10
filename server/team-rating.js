// Simple team rating ported from lib/team-rating.ts (JS version)

function calculateBattingScore(team) {
  const batsmen = team.players.filter((p) => p.role === "Batsman")
  const allrounders = team.players.filter((p) => p.role === "All-rounder")
  const keepers = team.players.filter((p) => p.role === "Wicket-keeper")

  const totalBattingUnits = batsmen.length + allrounders.length * 0.7 + keepers.length * 0.3

  const premiumBatsmen = batsmen.filter((p) => p.basePrice > 40).length
  const premiumMultiplier = 1 + premiumBatsmen * 0.15

  const depthBonus = Math.min(batsmen.length * 0.5, 3)

  let score = (totalBattingUnits / 8) * 10
  score *= premiumMultiplier
  score += depthBonus

  return Math.min(score, 10)
}

function calculateBowlingScore(team) {
  const bowlers = team.players.filter((p) => p.role === "Bowler")
  const allrounders = team.players.filter((p) => p.role === "All-rounder")

  const totalBowlingUnits = bowlers.length + allrounders.length * 0.6

  const premiumBowlers = bowlers.filter((p) => p.basePrice > 35).length
  const premiumBonus = premiumBowlers * 1.2

  const varietyBonus = Math.min(bowlers.length * 0.4, 2)

  let score = (totalBowlingUnits / 7) * 10
  score += premiumBonus
  score += varietyBonus

  return Math.min(score, 10)
}

function calculateBalanceScore(team) {
  const roleCount = {
    Batsman: team.players.filter((p) => p.role === "Batsman").length,
    Bowler: team.players.filter((p) => p.role === "Bowler").length,
    "All-rounder": team.players.filter((p) => p.role === "All-rounder").length,
    "Wicket-keeper": team.players.filter((p) => p.role === "Wicket-keeper").length,
  }

  const idealDistribution = { Batsman: 6, Bowler: 5, "All-rounder": 3, "Wicket-keeper": 1 }

  let totalDeviation = 0
  let maxPossibleDeviation = 0

  Object.entries(idealDistribution).forEach(([role, ideal]) => {
    const actual = roleCount[role]
    totalDeviation += Math.abs(actual - ideal)
    maxPossibleDeviation += ideal
  })

  const balance = 1 - totalDeviation / (maxPossibleDeviation * 2)
  return Math.max(0, balance * 10)
}

function calculateValueScore(team) {
  if (!team.players || team.players.length === 0) return 0

  const averagePrice = team.players.reduce((acc, p) => acc + (p.basePrice || 0), 0) / team.players.length
  const qualityRatio = team.players.filter((p) => p.basePrice > 50).length / team.players.length

  const priceEfficiency = 1 - Math.abs(averagePrice - 55) / 55
  const qualityBonus = qualityRatio * 3

  const score = Math.max(0, priceEfficiency * 10) + qualityBonus
  return Math.min(score, 10)
}

function generateStrengths(team, scores) {
  const strengths = []
  if (scores.batting >= 7) strengths.push("Exceptional batting lineup")
  if (scores.bowling >= 7) strengths.push("Strong bowling attack")
  if (scores.balance >= 7) strengths.push("Well-balanced squad composition")
  if (scores.value >= 7) strengths.push("High value for money")

  const premiumCount = team.players.filter((p) => p.basePrice > 50).length
  if (premiumCount >= 3) strengths.push(`${premiumCount} premium star players`)

  const allrounders = team.players.filter((p) => p.role === "All-rounder")
  if (allrounders.length >= 3) strengths.push("Solid all-rounder depth")

  return strengths.length > 0 ? strengths : ["Competitive squad"]
}

function generateWeaknesses(team, scores) {
  const weaknesses = []
  if (scores.batting < 5) weaknesses.push("Weak batting department")
  if (scores.bowling < 5) weaknesses.push("Vulnerable bowling attack")
  if (scores.balance < 5) weaknesses.push("Unbalanced squad composition")
  if (scores.value < 5) weaknesses.push("Poor value acquisitions")

  const keepers = team.players.filter((p) => p.role === "Wicket-keeper")
  if (keepers.length === 0) weaknesses.push("No dedicated wicket-keeper")

  const youngPlayers = team.players.filter((p) => p.basePrice < 20)
  if (youngPlayers.length > 10) weaknesses.push("Too many inexperienced players")

  return weaknesses.length > 0 ? weaknesses : ["No major weaknesses"]
}

function generateRecommendations(team, scores) {
  const recommendations = []
  if (scores.batting < 6) recommendations.push("Focus on acquiring quality batsmen to strengthen the middle order")
  if (scores.bowling < 6) recommendations.push("Invest in experienced fast bowlers for death overs defense")
  if (scores.value < 6) recommendations.push("Better budget management - look for underrated talents in next auction")

  const allrounders = team.players.filter((p) => p.role === "All-rounder")
  if (allrounders.length < 2) recommendations.push("Add more all-rounders for flexibility and depth")

  if (team.budget > 100) recommendations.push("Significant budget remaining - consider upgrading bench strength")

  return recommendations
}

function generateInsights(team, scores) {
  const insights = []
  const battingPercentage = (team.players.filter((p) => p.role === "Batsman").length / Math.max(team.players.length, 1)) * 100
  const bowlingPercentage = (team.players.filter((p) => p.role === "Bowler").length / Math.max(team.players.length, 1)) * 100

  if (battingPercentage > 50) insights.push("Aggressive team composition focused on batting dominance")
  else if (bowlingPercentage > 45) insights.push("Defensive strategy with emphasis on bowling control")

  const totalValue = team.players.reduce((acc, p) => acc + (p.basePrice || 0), 0)
  const overallAvg = totalValue / Math.max(team.players.length, 1)

  if (overallAvg > 60) insights.push("Star-studded lineup with expensive marquee players")
  else if (overallAvg < 30) insights.push("Young and hungry squad with budget-friendly selections")

  if (team.players.length >= 25) insights.push("Full squad utilization - complete retention strategy")
  else if (team.players.length < 15) insights.push("Selective approach - quality over quantity")

  return insights
}

function calculateTeamRating(team) {
  const battingScore = calculateBattingScore(team)
  const bowlingScore = calculateBowlingScore(team)
  const balanceScore = calculateBalanceScore(team)
  const valueScore = calculateValueScore(team)

  const overallScore = (battingScore * 0.35 + bowlingScore * 0.3 + balanceScore * 0.2 + valueScore * 0.15) / 10

  const scores = { batting: battingScore, bowling: bowlingScore, balance: balanceScore, value: valueScore }

  return {
    teamId: team.id,
    overallScore: Math.round(overallScore * 10) / 10,
    battingScore: Math.round(battingScore * 10) / 10,
    bowlingScore: Math.round(bowlingScore * 10) / 10,
    balanceScore: Math.round(balanceScore * 10) / 10,
    valueScore: Math.round(valueScore * 10) / 10,
    strengths: generateStrengths(team, scores),
    weaknesses: generateWeaknesses(team, scores),
    insights: generateInsights(team, scores),
    recommendations: generateRecommendations(team, scores),
  }
}

module.exports = { calculateTeamRating }
