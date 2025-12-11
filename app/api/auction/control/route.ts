// API Route: Auction Session Management
// Note: This API works with the sessionState JSON field for full auction state
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Type for auction state stored in sessionState JSON
interface AuctionState {
  roomCode: string
  status: 'lobby' | 'countdown' | 'active' | 'paused' | 'completed'
  teams: any[]
  currentPlayerId: string | null
  currentBid: number | null
  currentBidderId: string | null
  bidCount: number
  playerQueue: string[]
  soldPlayers: string[]
  unsoldPlayers: string[]
  turnTimerStart: Date | null
  hostId: string
}

// Helper to get auction state from room's sessionState or construct from fields
function getAuctionState(room: any): AuctionState {
  // If sessionState exists, use it
  if (room.sessionState) {
    return room.sessionState as AuctionState
  }
  
  // Otherwise construct from available fields
  return {
    roomCode: room.roomCode,
    status: room.status || 'lobby',
    teams: (room.teams as any) || [],
    currentPlayerId: null,
    currentBid: null,
    currentBidderId: null,
    bidCount: 0,
    playerQueue: (room.players as string[]) || [],
    soldPlayers: [],
    unsoldPlayers: [],
    turnTimerStart: null,
    hostId: room.hostId,
  }
}

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
  
  const state = getAuctionState(room)
  
  // Find the team
  const team = state.teams.find((t: any) => t.id === teamId)
  if (!team) {
    return NextResponse.json(
      { success: false, error: 'Team not found' },
      { status: 404 }
    )
  }
  
  // Validate bid
  if (bidAmount <= (state.currentBid || 0)) {
    return NextResponse.json(
      { success: false, error: 'Bid must be higher than current bid' },
      { status: 400 }
    )
  }
  
  if (bidAmount > team.budget) {
    return NextResponse.json(
      { success: false, error: 'Insufficient budget' },
      { status: 400 }
    )
  }
  
  // Update state
  state.currentBid = bidAmount
  state.currentBidderId = teamId
  state.bidCount = (state.bidCount || 0) + 1
  
  // Save updated state
  await prisma.auctionRoom.update({
    where: { roomCode },
    data: {
      sessionState: state as any,
      teams: state.teams as any,
    }
  })
  
  return NextResponse.json({ 
    success: true, 
    message: 'Bid placed',
    newBid: bidAmount,
    bidderId: teamId,
    bidderName: team.name
  })
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
  
  const state = getAuctionState(room)
  
  // Find the team
  const team = state.teams.find((t: any) => t.id === teamId)
  if (!team) {
    return NextResponse.json(
      { success: false, error: 'Team not found' },
      { status: 404 }
    )
  }
  
  // Check RTM availability
  if (!team.rtmCardsLeft || team.rtmCardsLeft <= 0) {
    return NextResponse.json(
      { success: false, error: 'No RTM cards remaining' },
      { status: 400 }
    )
  }
  
  // Use RTM card
  team.rtmCardsLeft -= 1
  state.currentBidderId = teamId
  
  // Save updated state
  await prisma.auctionRoom.update({
    where: { roomCode },
    data: {
      sessionState: state as any,
      teams: state.teams as any,
    }
  })
  
  return NextResponse.json({ 
    success: true, 
    message: 'RTM used successfully',
    teamId,
    rtmCardsLeft: team.rtmCardsLeft
  })
}

async function handlePause(body: any) {
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
  
  const state = getAuctionState(room)
  state.status = 'paused'
  
  await prisma.auctionRoom.update({
    where: { roomCode },
    data: { 
      status: 'paused',
      sessionState: state as any
    }
  })
  
  return NextResponse.json({ success: true, message: 'Auction paused' })
}

async function handleResume(body: any) {
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
  
  const state = getAuctionState(room)
  state.status = 'active'
  state.turnTimerStart = new Date()
  
  await prisma.auctionRoom.update({
    where: { roomCode },
    data: { 
      status: 'active',
      sessionState: state as any
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
  
  const state = getAuctionState(room)
  
  // Move current player to unsold
  if (state.currentPlayerId) {
    state.unsoldPlayers.push(state.currentPlayerId)
  }
  
  // Get next player
  if (state.playerQueue.length > 0) {
    state.currentPlayerId = state.playerQueue.shift() || null
  } else {
    state.currentPlayerId = null
  }
  
  // Reset bid state
  state.currentBid = null
  state.currentBidderId = null
  state.bidCount = 0
  state.turnTimerStart = new Date()
  
  await prisma.auctionRoom.update({
    where: { roomCode },
    data: {
      sessionState: state as any,
      playerIndex: room.playerIndex + 1
    }
  })
  
  return NextResponse.json({ 
    success: true, 
    message: 'Player skipped',
    nextPlayerId: state.currentPlayerId
  })
}

async function handleReset(body: any) {
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
  
  // Reset to initial state
  const initialState: AuctionState = {
    roomCode: room.roomCode,
    status: 'lobby',
    teams: (room.teams as any[]) || [],
    currentPlayerId: null,
    currentBid: null,
    currentBidderId: null,
    bidCount: 0,
    playerQueue: (room.players as string[]) || [],
    soldPlayers: [],
    unsoldPlayers: [],
    turnTimerStart: null,
    hostId: room.hostId,
  }
  
  // Reset team budgets and players
  initialState.teams = initialState.teams.map((team: any) => ({
    ...team,
    budget: 10000, // Reset budget to 100 crore
    players: [],
    rtmCardsLeft: 2
  }))
  
  await prisma.auctionRoom.update({
    where: { roomCode },
    data: {
      status: 'lobby',
      playerIndex: 0,
      teams: initialState.teams as any,
      sessionState: initialState as any
    }
  })
  
  return NextResponse.json({ success: true, message: 'Auction reset' })
}
