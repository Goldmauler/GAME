import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      roomCode,
      playerName,
      playerRole,
      basePrice,
      soldPrice,
      teamId,
      teamName,
      userName,
    } = body

    // Validate required fields
    if (!roomCode || !playerName || !playerRole || !teamId || !teamName || !userName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create player purchase record
    const purchase = await prisma.playerPurchase.create({
      data: {
        roomCode,
        playerName,
        playerRole,
        basePrice: parseFloat(basePrice) || 0,
        soldPrice: parseFloat(soldPrice) || 0,
        teamId,
        teamName,
        userName,
      },
    })

    return NextResponse.json({
      success: true,
      purchase,
    })
  } catch (error: any) {
    console.error('Error saving player purchase:', error)
    return NextResponse.json(
      { error: 'Failed to save player purchase', details: error.message },
      { status: 500 }
    )
  }
}

// GET: Retrieve player purchases for a room or player
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const roomCode = searchParams.get('roomCode')
    const playerName = searchParams.get('playerName')
    const teamName = searchParams.get('teamName')

    let where: any = {}

    if (roomCode) where.roomCode = roomCode
    if (playerName) where.playerName = playerName
    if (teamName) where.teamName = teamName

    const purchases = await prisma.playerPurchase.findMany({
      where,
      orderBy: {
        purchasedAt: 'desc',
      },
      take: 100,
    })

    return NextResponse.json({
      purchases,
      count: purchases.length,
    })
  } catch (error: any) {
    console.error('Error fetching player purchases:', error)
    return NextResponse.json(
      { error: 'Failed to fetch player purchases', details: error.message },
      { status: 500 }
    )
  }
}
