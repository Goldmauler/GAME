import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// POST /api/rooms/create - Create new auction room
export async function POST(req: NextRequest) {
  try {
    const {
      roomCode,
      hostName,
      hostId,
      teams,
      players,
      minTeams = 2
    } = await req.json()

    if (!roomCode || !hostName || !hostId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if room code already exists
    const existing = await prisma.auctionRoom.findUnique({
      where: { roomCode }
    })

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Room code already exists' },
        { status: 409 }
      )
    }

    // Create new room
    const room = await prisma.auctionRoom.create({
      data: {
        roomCode,
        hostName,
        hostId,
        status: 'lobby',
        teams: teams || [],
        players: players || [],
        minTeams,
        playerIndex: 0
      }
    })

    return NextResponse.json({
      success: true,
      data: { room }
    })
  } catch (error) {
    console.error('Error creating room:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create room' },
      { status: 500 }
    )
  }
}

// GET /api/rooms/create - Get available rooms
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || 'lobby'

    const rooms = await prisma.auctionRoom.findMany({
      where: { status },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        roomCode: true,
        hostName: true,
        status: true,
        minTeams: true,
        createdAt: true,
        teams: true
      }
    })

    return NextResponse.json({
      success: true,
      data: { rooms }
    })
  } catch (error) {
    console.error('Error fetching rooms:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch rooms' },
      { status: 500 }
    )
  }
}
