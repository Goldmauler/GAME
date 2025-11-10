import { NextResponse } from 'next/server'

// RapidAPI Cricbuzz for detailed stats
const RAPIDAPI_KEY = 'f0484cffebmsh693ec841c20d016p16267bjsn43c1536f5c6a'
const RAPIDAPI_HOST = 'cricbuzz-cricket.p.rapidapi.com'
const CRICBUZZ_API = `https://${RAPIDAPI_HOST}`

// Get player detailed statistics from Cricbuzz
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const playerId = searchParams.get('id')

  if (!playerId) {
    return NextResponse.json({ error: 'Player ID is required' }, { status: 400 })
  }

  console.log(`🔍 Fetching detailed stats for player ID: ${playerId}`)

  try {
    // Fetch player career stats from Cricbuzz
    const statsUrl = `${CRICBUZZ_API}/stats/v1/player/${playerId}`
    console.log(`📡 Cricbuzz Stats URL: ${statsUrl}`)
    
    const response = await fetch(statsUrl, {
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': RAPIDAPI_HOST,
        'Accept': 'application/json',
      },
    })

    console.log(`📊 Cricbuzz Response Status: ${response.status}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ Cricbuzz API Error: ${response.status} - ${errorText}`)
      
      return NextResponse.json({
        success: false,
        message: 'Detailed stats not available for this player',
        data: null
      })
    }

    const statsData = await response.json()
    console.log(`✅ Cricbuzz Success: Player stats retrieved`)
    
    // Parse recent batting and bowling performances
    const formatStats = (statsData: any) => {
      // Extract recent batting stats
      const recentBatting = statsData.recentBatting?.rows || []
      const recentBowling = statsData.recentBowling?.rows || []
      
      // Calculate batting aggregates from recent matches
      let totalRuns = 0
      let totalMatches = 0
      let fifties = 0
      let hundreds = 0
      let highScore = 0
      
      recentBatting.forEach((match: any) => {
        const scoreStr = match.values?.[2] || '' // Score is in 3rd column
        const runsMatch = scoreStr.match(/(\d+)/)
        if (runsMatch) {
          const runs = parseInt(runsMatch[1])
          totalRuns += runs
          totalMatches++
          if (runs >= 50 && runs < 100) fifties++
          if (runs >= 100) hundreds++
          if (runs > highScore) highScore = runs
        }
      })
      
      // Calculate bowling aggregates
      let totalWickets = 0
      let bowlingMatches = 0
      
      recentBowling.forEach((match: any) => {
        const wicketsStr = match.values?.[2] || '' // Wickets in 3rd column
        const wicketsMatch = wicketsStr.match(/(\d+)-/)
        if (wicketsMatch) {
          totalWickets += parseInt(wicketsMatch[1])
          bowlingMatches++
        }
      })
      
      const battingStats = totalMatches > 0 ? {
        matches: totalMatches,
        innings: totalMatches,
        runs: totalRuns,
        average: totalMatches > 0 ? parseFloat((totalRuns / totalMatches).toFixed(2)) : 0,
        strikeRate: 0, // Not available in recent stats
        fifties: fifties,
        hundreds: hundreds,
        highScore: highScore > 0 ? highScore.toString() : 'N/A'
      } : null
      
      const bowlingStats = bowlingMatches > 0 ? {
        matches: bowlingMatches,
        innings: bowlingMatches,
        wickets: totalWickets,
        average: 0, // Not available
        economy: 0, // Not available
        bestBowling: 'N/A'
      } : null
      
      console.log('📊 Parsed Stats:', { battingStats, bowlingStats })
      
      return {
        batting: battingStats,
        bowling: bowlingStats
      }
    }
    
    const playerInfo = {
      id: statsData.id || playerId,
      name: statsData.name,
      country: statsData.intlTeam,
      role: statsData.role,
      battingStyle: statsData.bat,
      bowlingStyle: statsData.bowl,
      birthPlace: statsData.birthPlace,
      dateOfBirth: statsData.DoB,
      imageUrl: statsData.faceImageId ? `https://img1.cricbuzz.com/img/faceImages/${statsData.faceImageId}.jpg` : null,
      stats: formatStats(statsData),
      teams: statsData.teams,
      rankings: statsData.rankings,
      recentMatches: {
        batting: statsData.recentBatting?.rows?.map((row: any) => ({
          opponent: row.values?.[1] || 'N/A',
          score: row.values?.[2] || 'N/A',
          format: row.values?.[3] || 'N/A',
          date: row.values?.[4] || 'N/A'
        })) || [],
        bowling: statsData.recentBowling?.rows?.map((row: any) => ({
          opponent: row.values?.[1] || 'N/A',
          wickets: row.values?.[2] || 'N/A',
          format: row.values?.[3] || 'N/A',
          date: row.values?.[4] || 'N/A'
        })) || []
      }
    }
    
    return NextResponse.json({
      success: true,
      data: playerInfo,
      source: 'Cricbuzz RapidAPI',
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('❌ Error fetching player stats:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch player stats',
        data: null
      },
      { status: 500 }
    )
  }
}
