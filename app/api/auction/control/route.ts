// API Route: Auction Session Management
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { 
  processBid, 
  processRTM, 
  pauseAuction, 
  resumeAuction, 
  skipPlayer,
  resetAuction,
  type AuctionState
} from '@/lib/auction-engine'

// Start auction
export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const body = await request.json()
    
    switch (action) {
      case 'bid':
        return await handleBid(body)
      case 'rtm':
        return await handleRTM(body)
      case 'pause':
        return await handlePause(body)
      case 'resume':
        return await handleResume(body)
      case 'skip':
        return await handleSkip(body)
      case 'reset':
        return await handleReset(body)
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error: any) {
    console.error('Auction API error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

async function handleBid(body: any) {
  const { roomCode, teamId, bidAmount } = body
  
  // Get current auction state from database
  const room = await prisma.auctionRoom.findUnique({
    where: { roomCode }
  })
  
  if (!room) {
    return NextResponse.json(
      { success: false, error: 'Room not found' },
      { status: 404 }
    )
  }
  
  const state: AuctionState = {
    roomCode: room.roomCode,
    status: room.status as any,
    teams: room.teams as any,
    currentPlayerId: room.currentPlayerId,
    currentBid: room.currentBid,
    currentBidderId: room.currentBidder,
    bidCount: room.bidCount,
    playerQueue: room.availablePlayers as string[],
    soldPlayers: room.soldPlayers as string[],
    unsoldPlayers: room.unsoldPlayers as string[],
    turnTimerStart: room.turnTimerStart,
    hostId: room.hostId,
  }
  
  const result = await processBid(roomCode, teamId, bidAmount, state)
  
  if (result.success) {
    // Update database
    await prisma.auctionRoom.update({
      where: { roomCode },
      data: {
        currentBid: state.currentBid,
        currentBidder: state.currentBidderId,
        bidCount: state.bidCount,
        teams: state.teams as any,
      }
    })
  }
  
  return NextResponse.json(result)
}

async function handleRTM(body: any) {
  const { roomCode, teamId } = body
  
  const room = await prisma.auctionRoom.findUnique({
    where: { roomCode }
  })
  
  if (!room) {
    return NextResponse.json(
      { success: false, error: 'Room not found' },
      { status: 404 }
    )
  }
  
  const state: AuctionState = {
    roomCode: room.roomCode,
    status: room.status as any,
    teams: room.teams as any,
    currentPlayerId: room.currentPlayerId,
    currentBid: room.currentBid,
    currentBidderId: room.currentBidder,
    bidCount: room.bidCount,
    playerQueue: room.availablePlayers as string[],
    soldPlayers: room.soldPlayers as string[],
    unsoldPlayers: room.unsoldPlayers as string[],
    turnTimerStart: room.turnTimerStart,
    hostId: room.hostId,
  }
  
  const result = await processRTM(roomCode, teamId, state)
  
  if (result.success) {
    await prisma.auctionRoom.update({
      where: { roomCode },
      data: {
        teams: state.teams as any,
        soldPlayers: state.soldPlayers as any,
      }
    })
  }
  
  return NextResponse.json(result)
}

async function handlePause(body: any) {
  const { roomCode } = body
  
  await prisma.auctionRoom.update({
    where: { roomCode },
    data: { status: 'paused' }
  })
  
  return NextResponse.json({ success: true, message: 'Auction paused' })
}

async function handleResume(body: any) {
  const { roomCode } = body
  
  await prisma.auctionRoom.update({
    where: { roomCode },
    data: { 
      status: 'active',
      turnTimerStart: new Date()
    }
  })
  
  return NextResponse.json({ success: true, message: 'Auction resumed' })
}

async function handleSkip(body: any) {
  const { roomCode } = body
  
  const room = await prisma.auctionRoom.findUnique({
    where: { roomCode }
  })
  
  if (!room) {
    return NextResponse.json(
      { success: false, error: 'Room not found' },
      { status: 404 }
    )
  }
  
  const state: AuctionState = {
    roomCode: room.roomCode,
    status: room.status as any,
    teams: room.teams as any,
    currentPlayerId: room.currentPlayerId,
    currentBid: room.currentBid,
    currentBidderId: room.currentBidder,
    bidCount: room.bidCount,
    playerQueue: room.availablePlayers as string[],
    soldPlayers: room.soldPlayers as string[],
    unsoldPlayers: room.unsoldPlayers as string[],
    turnTimerStart: room.turnTimerStart,
    hostId: room.hostId,
  }
  
  await skipPlayer(state)
  
  await prisma.auctionRoom.update({
    where: { roomCode },
    data: {
      currentPlayerId: state.currentPlayerId,
      unsoldPlayers: state.unsoldPlayers,
      availablePlayers: state.playerQueue,
    }
  })
  
  return NextResponse.json({ success: true, message: 'Player skipped' })
}

async function handleReset(body: any) {
  const { roomCode } = body
  
  await resetAuction(roomCode)
  
  // Reset room state
  await prisma.auctionRoom.update({
    where: { roomCode },
    data: {
      status: 'lobby',
      currentPlayerId: null,
      currentBid: null,
      currentBidder: null,
      bidCount: 0,
      playerIndex: 0,
      soldPlayers: [],
      unsoldPlayers: [],
    }
  })
  
  return NextResponse.json({ success: true, message: 'Auction reset' })
}
