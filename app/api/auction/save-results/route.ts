import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const {
      roomCode,
      teams,
      completedAt
    } = await req.json()

    if (!roomCode || !teams || teams.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Calculate rankings based on team ratings
    const teamsWithRatings = teams.map((team: any) => {
      // Calculate team rating (you can adjust this logic)
      const totalSpent = 100 - team.budget
      const playersCount = team.players?.length || 0
      const rating = calculateTeamRating(team)
      
      return {
        ...team,
        totalSpent,
        playersCount,
        rating
      }
    })

    // Sort by rating (highest first)
    teamsWithRatings.sort((a: any, b: any) => b.rating - a.rating)

    // Create leaderboard entries
    const leaderboardEntries = await Promise.all(
      teamsWithRatings.map(async (team: any, index: number) => {
        return prisma.leaderboardEntry.create({
          data: {
            roomCode,
            userName: team.userName || `Team ${team.id}`,
            userId: team.userId || `user-${team.id}`,
            teamId: team.id,
            teamName: team.name,
            finalRating: team.rating,
            totalSpent: team.totalSpent,
            budgetLeft: team.budget,
            playersCount: team.playersCount,
            rank: index + 1,
            completedAt: new Date(completedAt)
          }
        })
      })
    )

    // Update user statistics
    await Promise.all(
      teamsWithRatings.map(async (team: any, index: number) => {
        const userId = team.userId || `user-${team.id}`
        const userName = team.userName || `Team ${team.id}`
        
        // Get or create user stats
        const existingStats = await prisma.userStats.findUnique({
          where: { userId }
        })

        const isWin = index === 0 // First place
        const isTopThree = index < 3

        if (existingStats) {
          // Update existing stats
          const newTotalAuctions = existingStats.totalAuctions + 1
          const newWins = existingStats.wins + (isWin ? 1 : 0)
          const newTopThree = existingStats.topThree + (isTopThree ? 1 : 0)
          const newTotalSpent = existingStats.totalSpent + team.totalSpent
          const newAvgRating = (existingStats.avgRating * existingStats.totalAuctions + team.rating) / newTotalAuctions
          const newHighestRating = Math.max(existingStats.highestRating, team.rating)

          await prisma.userStats.update({
            where: { userId },
            data: {
              totalAuctions: newTotalAuctions,
              wins: newWins,
              topThree: newTopThree,
              totalSpent: newTotalSpent,
              avgRating: newAvgRating,
              highestRating: newHighestRating,
              bestTeam: newHighestRating === team.rating ? {
                roomCode,
                teamName: team.name,
                rating: team.rating,
                playersCount: team.playersCount
              } : existingStats.bestTeam,
              recentRooms: [roomCode, ...((existingStats.recentRooms as string[]) || [])].slice(0, 10)
            }
          })
        } else {
          // Create new user stats
          await prisma.userStats.create({
            data: {
              userName,
              userId,
              totalAuctions: 1,
              wins: isWin ? 1 : 0,
              topThree: isTopThree ? 1 : 0,
              totalSpent: team.totalSpent,
              avgRating: team.rating,
              highestRating: team.rating,
              bestTeam: {
                roomCode,
                teamName: team.name,
                rating: team.rating,
                playersCount: team.playersCount
              },
              recentRooms: [roomCode]
            }
          })
        }
      })
    )

    // Update room status
    await prisma.auctionRoom.update({
      where: { roomCode },
      data: {
        status: 'completed',
        endTime: new Date(completedAt),
        teams: teamsWithRatings
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        leaderboard: leaderboardEntries,
        winner: teamsWithRatings[0]
      }
    })
  } catch (error) {
    console.error('Error saving auction results:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save auction results' },
      { status: 500 }
    )
  }
}

// Calculate team rating (customize this based on your logic)
function calculateTeamRating(team: any) {
  const players = team.players || []
  if (players.length === 0) return 0

  // Simple rating: average of all player base prices, adjusted for squad balance
  const totalValue = players.reduce((sum: number, p: any) => sum + (p.soldPrice || p.basePrice || 0), 0)
  const avgValue = totalValue / players.length
  
  // Count players by role
  const roleCount = {
    Batsman: players.filter((p: any) => p.role === 'Batsman').length,
    Bowler: players.filter((p: any) => p.role === 'Bowler').length,
    'All-rounder': players.filter((p: any) => p.role === 'All-rounder').length,
    'Wicket-keeper': players.filter((p: any) => p.role === 'Wicket-keeper').length
  }

  // Balance bonus (having good distribution)
  const balanceScore = Math.min(roleCount.Batsman, 5) + 
                        Math.min(roleCount.Bowler, 5) + 
                        (roleCount['All-rounder'] * 1.5) + 
                        Math.min(roleCount['Wicket-keeper'], 2)

  // Final rating (0-100 scale)
  const rating = Math.min(100, (avgValue * 2) + balanceScore)
  
  return parseFloat(rating.toFixed(2))
}
