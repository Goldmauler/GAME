/**
 * Cortex Reasoning Engine
 * Advanced Team Scoring and Analysis System
 * 
 * Pillars of Evaluation:
 * 1. Performance Metrics (40%): Data-driven stats analysis (Moneyball)
 * 2. Squad Composition (30%): Role coverage and depth
 * 3. Value Efficiency (20%): ROI on budget utilization
 * 4. Strategic Synergy (10%): Variety and tactical balance
 */

// --- Constants & Weights ---
const WEIGHTS = {
    PERFORMANCE: 0.4,
    COMPOSITION: 0.3,
    VALUE: 0.2,
    SYNERGY: 0.1
}

const IDEAL_ROLES = {
    Batsman: 6,
    Bowler: 6,
    "All-rounder": 3,
    "Wicket-keeper": 2
}

// --- Helper Functions ---

// Calculate batting impact score (0-100) based on T20 metrics
function calculateBattingImpact(player) {
    if (!player.stats) return 50
    const { average = 20, strikeRate = 120, matches = 0 } = player.stats

    // Experience weighting (Caps at 1.2x for 100+ matches)
    const experienceFactor = Math.min(1.2, 0.8 + (Math.log10(Math.max(matches, 10)) / 4))

    // T20 Formula: SR is king, Avg gives stability
    // Benchmark: Avg 30, SR 140 is elite (100 pts)
    const srScore = Math.min(100, (strikeRate / 150) * 100)
    const avgScore = Math.min(100, (average / 35) * 100)

    let rawScore = (srScore * 0.65) + (avgScore * 0.35)
    return Math.min(100, rawScore * experienceFactor)
}

// Calculate bowling control score (0-100)
function calculateBowlingControl(player) {
    if (!player.stats) return 50
    const { economy = 8.5, wickets = 0, matches = 1 } = player.stats

    const wicketsPerMatch = wickets / Math.max(matches, 1)

    // Experience weighting
    const experienceFactor = Math.min(1.2, 0.8 + (Math.log10(Math.max(matches, 10)) / 4))

    // Benchmark: WPM 1.2, Eco 7.0 is elite (100 pts)
    const wktScore = Math.min(100, (wicketsPerMatch / 1.5) * 100)
    const ecoScore = Math.min(100, ((10 - Math.min(economy, 10)) / 3) * 100) // Eco < 7 is great

    let rawScore = (wktScore * 0.6) + (ecoScore * 0.4)
    return Math.min(100, rawScore * experienceFactor)
}

function getStandardDeviation(array) {
    if (array.length === 0) return 0
    const n = array.length
    const mean = array.reduce((a, b) => a + b, 0) / n
    return Math.sqrt(array.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) / n)
}

// --- Main Scoring Logic ---

function calculateCortexScore(team) {
    const { players, budget } = team
    const totalSpent = team.maxBudget ? (team.maxBudget - budget) : (100 - budget) // Assuming 100 Cr base if not set

    if (!players || players.length === 0) {
        return {
            totalScore: 0,
            grade: 'F',
            breakdown: { squadBalance: 0, starPower: 0, budgetEfficiency: 0, squadDepth: 0, valueForMoney: 0 },
            details: { roleBreakdown: {}, topPlayers: [], strengths: [], weaknesses: [], avgPlayerPrice: 0, squadSize: 0, totalSpent: 0 }
        }
    }

    // 1. PERFORMANCE METRICS (40 Points)
    let totalBattingImpact = 0
    let totalBowlingControl = 0
    const validBatters = players.filter(p => p.role !== 'Bowler')
    const validBowlers = players.filter(p => p.role !== 'Batsman' && p.role !== 'Wicket-keeper')

    validBatters.forEach(p => totalBattingImpact += calculateBattingImpact(p))
    validBowlers.forEach(p => totalBowlingControl += calculateBowlingControl(p))

    const avgBattingScore = validBatters.length ? (totalBattingImpact / validBatters.length) : 0
    const avgBowlingScore = validBowlers.length ? (totalBowlingControl / validBowlers.length) : 0

    // Weighted performance score (0-40)
    const performanceScore = ((avgBattingScore + avgBowlingScore) / 200) * 40 // Normalize 0-100 to 0-40

    // 2. SQUAD COMPOSITION & DEPTH (30 Points)
    const roleCounts = {
        Batsman: players.filter(p => p.role === "Batsman").length,
        Bowler: players.filter(p => p.role === "Bowler").length,
        "All-rounder": players.filter(p => p.role === "All-rounder").length,
        "Wicket-keeper": players.filter(p => p.role === "Wicket-keeper").length,
    }

    // Role fulfillment (0-20)
    let roleScore = 0
    if (roleCounts.Batsman >= 4) roleScore += 5
    if (roleCounts.Bowler >= 4) roleScore += 5
    if (roleCounts["All-rounder"] >= 2) roleScore += 5
    if (roleCounts["Wicket-keeper"] >= 1) roleScore += 5

    // Squad Depth (0-10) - Target 18-25 players
    let depthScore = 0
    const squadSize = players.length
    if (squadSize >= 18) depthScore = 10
    else if (squadSize >= 15) depthScore = 6
    else if (squadSize >= 12) depthScore = 3
    else depthScore = 0 // Too few players

    const compositionScore = roleScore + depthScore

    // 3. VALUE EFFICIENCY (20 Points)
    // ROI = Total Performance Points / Total Spent
    // Ideal: 1500 Combined Impact Points for 100 Crores = 15 ratio
    const totalImpact = totalBattingImpact + totalBowlingControl
    const roiRatio = totalSpent > 0 ? (totalImpact / totalSpent) : 0

    // Normalize ROI: Ratio > 25 is excellent (20pts), < 10 is poor
    const valueScore = Math.min(20, (roiRatio / 25) * 20)

    // 4. STRATEGIC SYNERGY (10 Points)
    // Variety check: Do we have anchors AND hitters?
    const strikeRates = validBatters.map(p => p.stats?.strikeRate || 100)
    const srDeviation = getStandardDeviation(strikeRates)

    // Higher deviation implies good variety (Anchors ~120, Hitters ~160)
    // Target deviation around 20-30
    let synergyScore = Math.min(5, (srDeviation / 25) * 5)

    // Bowling variety (Spin vs Pace logic requires more data, using simpler backup)
    // Here we check if we have enough all-rounders for flexibility
    if (roleCounts["All-rounder"] >= 3) synergyScore += 5
    else if (roleCounts["All-rounder"] >= 1) synergyScore += 2

    // --- Final Calculation ---
    let totalScore = Math.min(100, performanceScore + compositionScore + valueScore + synergyScore)

    // PENALTY: Squad Minimum Requirement (18 Players)
    if (squadSize < 18) {
        // Severe penalty: Reduce score by 50% and cap at 40
        totalScore = Math.min(40, totalScore * 0.5)
    }

    // Grading
    let grade = 'F'
    if (totalScore >= 90) grade = 'S+'
    else if (totalScore >= 85) grade = 'S'
    else if (totalScore >= 80) grade = 'A+'
    else if (totalScore >= 75) grade = 'A'
    else if (totalScore >= 70) grade = 'B+'
    else if (totalScore >= 60) grade = 'B'
    else if (totalScore >= 50) grade = 'C+'
    else if (totalScore >= 40) grade = 'C'
    else if (totalScore >= 30) grade = 'D'

    // --- Analysis Text ---
    const strengths = []
    if (avgBattingScore > 75) strengths.push("Explosive batting lineup")
    if (avgBowlingScore > 75) strengths.push("World-class bowling attack")
    if (valueScore > 15) strengths.push("Incredible value for money")
    if (roleCounts["All-rounder"] >= 4) strengths.push("Deep batting & bowling options")

    const weaknesses = []
    if (squadSize < 18) weaknesses.push(`Incomplete Squad (${squadSize}/18 players)`)
    else if (squadSize < 15) weaknesses.push("Squad lacks depth") // Should not be reachable if < 18 check exists, but good for robust logic
    if (roleCounts["Wicket-keeper"] === 0) weaknesses.push("No specialist Wicket-keeper")
    if (avgBattingScore < 50) weaknesses.push("Low batting impact")
    if (totalSpent > 95 && squadSize < 16) weaknesses.push("Overspent on few players")

    return {
        teamId: team.id,
        teamName: team.name,
        totalScore,
        grade,
        // Mapping breakdown to fit UI components
        breakdown: {
            squadBalance: Math.min(25, (compositionScore / 30) * 25),      // Map 30 -> 25
            starPower: Math.min(25, (performanceScore / 40) * 25),         // Map 40 -> 25
            budgetEfficiency: Math.min(20, valueScore),                    // Map 20 -> 20
            squadDepth: Math.min(15, (depthScore / 10) * 15),              // Map 10 -> 15
            valueForMoney: Math.min(15, (valueScore / 20) * 15)            // Map 20 -> 15 (Redundant but used in UI)
        },
        details: {
            roleBreakdown: roleCounts,
            topPlayers: players.sort((a, b) => (b.soldPrice || 0) - (a.soldPrice || 0)).slice(0, 3).map(p => p.name),
            strengths,
            weaknesses,
            avgPlayerPrice: totalSpent / Math.max(1, squadSize),
            squadSize,
            totalSpent
        }
    }
}

module.exports = { calculateCortexScore }
