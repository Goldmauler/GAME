import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/user-stats/[userName] - Get user statistics
export async function GET(
  req: NextRequest,
  { params }: { params: { userName: string } }
) {
  try {
    const userName = params.userName

    if (!userName) {
      return NextResponse.json(
        { success: false, error: 'Username required' },
        { status: 400 }
      )
    }

    // Get user stats
    const userStats = await prisma.userStats.findUnique({
      where: { userName }
    })

    if (!userStats) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Get user's recent leaderboard entries
    const recentEntries = await prisma.leaderboardEntry.findMany({
      where: { userName },
      orderBy: { completedAt: 'desc' },
      take: 10
    })

    // Calculate additional stats
    const winRate = userStats.totalAuctions > 0 
      ? (userStats.wins / userStats.totalAuctions * 100).toFixed(2)
      : '0.00'

    const topThreeRate = userStats.totalAuctions > 0
      ? (userStats.topThree / userStats.totalAuctions * 100).toFixed(2)
      : '0.00'

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          ...userStats,
          winRate: parseFloat(winRate),
          topThreeRate: parseFloat(topThreeRate)
        },
        recentEntries
      }
    })
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user stats' },
      { status: 500 }
    )
  }
}
