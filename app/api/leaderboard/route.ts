import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/leaderboard - Get global leaderboard
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const roomCode = searchParams.get('roomCode')

    if (roomCode) {
      // Get leaderboard for specific room
      const leaderboard = await prisma.leaderboardEntry.findMany({
        where: { roomCode },
        orderBy: { rank: 'asc' }
      })

      const roomInfo = await prisma.auctionRoom.findUnique({
        where: { roomCode },
        select: {
          roomCode: true,
          hostName: true,
          status: true,
          startTime: true,
          endTime: true,
          createdAt: true
        }
      })

      return NextResponse.json({
        success: true,
        data: {
          roomCode,
          roomInfo,
          leaderboard
        }
      })
    } else {
      // Get global leaderboard (best ratings across all rooms)
      const topPlayers = await prisma.leaderboardEntry.findMany({
        orderBy: [
          { finalRating: 'desc' },
          { completedAt: 'desc' }
        ],
        take: limit
      })

      return NextResponse.json({
        success: true,
        data: {
          leaderboard: topPlayers,
          total: topPlayers.length
        }
      })
    }
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch leaderboard' },
      { status: 500 }
    )
  }
}

// GET /api/leaderboard/top-users - Get top users by win rate
export async function POST(req: NextRequest) {
  try {
    const { limit = 20, sortBy = 'wins' } = await req.json()

    const orderBy: any = {}
    switch (sortBy) {
      case 'wins':
        orderBy.wins = 'desc'
        break
      case 'avgRating':
        orderBy.avgRating = 'desc'
        break
      case 'highestRating':
        orderBy.highestRating = 'desc'
        break
      case 'totalAuctions':
        orderBy.totalAuctions = 'desc'
        break
      default:
        orderBy.wins = 'desc'
    }

    const topUsers = await prisma.userStats.findMany({
      orderBy,
      take: limit
    })

    return NextResponse.json({
      success: true,
      data: {
        topUsers,
        sortedBy: sortBy
      }
    })
  } catch (error) {
    console.error('Error fetching top users:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch top users' },
      { status: 500 }
    )
  }
}
