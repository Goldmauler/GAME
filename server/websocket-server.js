// WebSocket Auction Server with Session Management and Reconnection
const WebSocket = require('ws')
const { PrismaClient } = require('@prisma/client')
const crypto = require('crypto')

const prisma = new PrismaClient()
const PORT = process.env.WS_PORT || 8080

// Store active auction rooms in memory
const auctionRooms = new Map()
// Map websocket connections to user sessions
const wsConnections = new Map()

class AuctionRoom {
  constructor(roomCode, hostId, hostName) {
    this.roomCode = roomCode
    this.hostId = hostId
    this.hostName = hostName
    this.status = 'lobby'
    this.teams = []
    this.currentPlayerId = null
    this.currentBid = null
    this.currentBidderId = null
    this.bidCount = 0
    this.playerQueue = []
    this.soldPlayers = []
    this.unsoldPlayers = []
    this.turnTimerStart = null
    this.bidTimer = null
    this.connections = new Set()
  }

  addConnection(ws, userId, userName, teamId) {
    this.connections.add(ws)
    wsConnections.set(ws, { roomCode: this.roomCode, userId, userName, teamId })
  }

  removeConnection(ws) {
    this.connections.delete(ws)
    wsConnections.delete(ws)
  }

  broadcast(message, excludeWs = null) {
    const data = JSON.stringify(message)
    this.connections.forEach(ws => {
      if (ws !== excludeWs && ws.readyState === WebSocket.OPEN) {
        ws.send(data)
      }
    })
  }

  async saveState() {
    try {
      // Save to database
      await prisma.auctionRoom.update({
        where: { roomCode: this.roomCode },
        data: {
          status: this.status,
          currentPlayerId: this.currentPlayerId,
          currentBid: this.currentBid,
          currentBidder: this.currentBidderId,
          bidCount: this.bidCount,
          playerIndex: this.playerQueue.length,
          turnTimerStart: this.turnTimerStart,
          teams: this.teams,
          availablePlayers: this.playerQueue,
          soldPlayers: this.soldPlayers,
          unsoldPlayers: this.unsoldPlayers,
          sessionState: this.getFullState(),
        }
      })
    } catch (error) {
      console.error('Failed to save room state:', error)
    }
  }

  getFullState() {
    return {
      roomCode: this.roomCode,
      status: this.status,
      teams: this.teams,
      currentPlayerId: this.currentPlayerId,
      currentBid: this.currentBid,
      currentBidderId: this.currentBidderId,
      bidCount: this.bidCount,
      playerQueue: this.playerQueue,
      soldPlayers: this.soldPlayers,
      unsoldPlayers: this.unsoldPlayers,
      turnTimerStart: this.turnTimerStart,
      hostId: this.hostId,
    }
  }

  startBidTimer() {
    if (this.bidTimer) {
      clearTimeout(this.bidTimer)
    }

    this.turnTimerStart = new Date()
    const timerDuration = 30000 // 30 seconds

    this.bidTimer = setTimeout(() => {
      this.handleBidTimeout()
    }, timerDuration)

    this.broadcast({
      type: 'TIMER_START',
      duration: timerDuration,
      startTime: this.turnTimerStart
    })
  }

  async handleBidTimeout() {
    this.bidCount++

    if (this.bidCount >= 3) {
      // Going once, going twice, SOLD!
      await this.handlePlayerSold()
    } else {
      // Continue countdown
      this.broadcast({
        type: 'BID_COUNTDOWN',
        count: this.bidCount,
        message: this.bidCount === 1 ? 'Going once...' : 'Going twice...'
      })
      this.startBidTimer()
    }

    await this.saveState()
  }

  async handlePlayerSold() {
    if (this.currentBidderId && this.currentBid) {
      // Sold to highest bidder
      const team = this.teams.find(t => t.id === this.currentBidderId)
      const player = await prisma.player.findUnique({
        where: { id: this.currentPlayerId }
      })

      if (team && player) {
        // Add player to team
        team.players.push({
          playerId: player.id,
          playerName: player.name,
          role: player.role,
          price: this.currentBid,
          isOverseas: player.country !== 'India'
        })

        team.budget -= this.currentBid

        // Update player in database
        await prisma.player.update({
          where: { id: player.id },
          data: {
            isSold: true,
            currentPrice: this.currentBid,
            teamName: team.name
          }
        })

        // Record purchase
        await prisma.playerPurchase.create({
          data: {
            roomCode: this.roomCode,
            playerId: player.id,
            playerName: player.name,
            playerRole: player.role,
            basePrice: player.basePrice,
            soldPrice: this.currentBid,
            teamId: team.id,
            teamName: team.name,
            userName: team.userName
          }
        })

        this.soldPlayers.push(player.id)

        this.broadcast({
          type: 'PLAYER_SOLD',
          player: player,
          team: team.name,
          price: this.currentBid
        })
      }
    } else {
      // Unsold
      this.unsoldPlayers.push(this.currentPlayerId)
      
      this.broadcast({
        type: 'PLAYER_UNSOLD',
        playerId: this.currentPlayerId
      })
    }

    // Move to next player
    await this.moveToNextPlayer()
  }

  async moveToNextPlayer() {
    if (this.playerQueue.length === 0) {
      await this.endAuction()
      return
    }

    this.currentPlayerId = this.playerQueue.shift()
    this.currentBid = null
    this.currentBidderId = null
    this.bidCount = 0

    const player = await prisma.player.findUnique({
      where: { id: this.currentPlayerId }
    })

    this.broadcast({
      type: 'NEXT_PLAYER',
      player: player
    })

    this.startBidTimer()
    await this.saveState()
  }

  async endAuction() {
    this.status = 'completed'
    
    if (this.bidTimer) {
      clearTimeout(this.bidTimer)
    }

    // Calculate final standings
    const leaderboard = this.teams.map((team, index) => {
      const totalSpent = team.players.reduce((sum, p) => sum + p.price, 0)
      const rating = totalSpent + (team.players.length * 100)
      return { ...team, rating, rank: index + 1 }
    }).sort((a, b) => b.rating - a.rating)

    // Save leaderboard
    for (const entry of leaderboard) {
      await prisma.leaderboardEntry.create({
        data: {
          roomCode: this.roomCode,
          userName: entry.userName,
          userId: entry.userId,
          teamId: entry.id,
          teamName: entry.name,
          finalRating: entry.rating,
          totalSpent: 10000 - entry.budget,
          budgetLeft: entry.budget,
          playersCount: entry.players.length,
          rank: entry.rank
        }
      })
    }

    await prisma.auctionRoom.update({
      where: { roomCode: this.roomCode },
      data: {
        status: 'completed',
        endTime: new Date()
      }
    })

    this.broadcast({
      type: 'AUCTION_COMPLETE',
      leaderboard: leaderboard
    })
  }
}

// WebSocket Server
const wss = new WebSocket.Server({ port: PORT })

console.log(`🏏 IPL Auction WebSocket Server running on port ${PORT}`)

wss.on('connection', async (ws, req) => {
  console.log('New WebSocket connection')

  // Heartbeat mechanism
  ws.isAlive = true
  ws.on('pong', () => {
    ws.isAlive = true
  })

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message)
      await handleMessage(ws, data)
    } catch (error) {
      console.error('Message handling error:', error)
      ws.send(JSON.stringify({ type: 'ERROR', message: error.message }))
    }
  })

  ws.on('close', async () => {
    const sessionInfo = wsConnections.get(ws)
    if (sessionInfo) {
      const room = auctionRooms.get(sessionInfo.roomCode)
      if (room) {
        room.removeConnection(ws)
        room.broadcast({
          type: 'USER_DISCONNECTED',
          userId: sessionInfo.userId,
          userName: sessionInfo.userName
        })
      }
    }
  })
})

async function handleMessage(ws, data) {
  const { type, ...payload } = data

  switch (type) {
    case 'CREATE_ROOM':
      await handleCreateRoom(ws, payload)
      break

    case 'JOIN_ROOM':
      await handleJoinRoom(ws, payload)
      break

    case 'RECONNECT':
      await handleReconnect(ws, payload)
      break

    case 'START_AUCTION':
      await handleStartAuction(ws, payload)
      break

    case 'PLACE_BID':
      await handlePlaceBid(ws, payload)
      break

    case 'USE_RTM':
      await handleUseRTM(ws, payload)
      break

    case 'PAUSE_AUCTION':
      await handlePauseAuction(ws, payload)
      break

    case 'RESUME_AUCTION':
      await handleResumeAuction(ws, payload)
      break

    case 'SKIP_PLAYER':
      await handleSkipPlayer(ws, payload)
      break

    default:
      ws.send(JSON.stringify({ type: 'ERROR', message: 'Unknown message type' }))
  }
}

async function handleCreateRoom(ws, { hostId, hostName, roomCode }) {
  const room = new AuctionRoom(roomCode, hostId, hostName)
  auctionRooms.set(roomCode, room)

  // Create in database
  const players = await prisma.player.findMany({
    where: { isSold: false },
    select: { id: true }
  })

  await prisma.auctionRoom.create({
    data: {
      roomCode,
      hostId,
      hostName,
      status: 'lobby',
      teams: [],
      availablePlayers: players.map(p => p.id),
      soldPlayers: [],
      unsoldPlayers: []
    }
  })

  ws.send(JSON.stringify({
    type: 'ROOM_CREATED',
    roomCode,
    state: room.getFullState()
  }))
}

async function handleJoinRoom(ws, { roomCode, userId, userName, teamName }) {
  let room = auctionRooms.get(roomCode)

  // If room not in memory, try to load from database
  if (!room) {
    const dbRoom = await prisma.auctionRoom.findUnique({
      where: { roomCode }
    })

    if (dbRoom) {
      room = new AuctionRoom(roomCode, dbRoom.hostId, dbRoom.hostName)
      room.status = dbRoom.status
      room.teams = dbRoom.teams
      room.currentPlayerId = dbRoom.currentPlayerId
      room.currentBid = dbRoom.currentBid
      room.currentBidderId = dbRoom.currentBidder
      room.bidCount = dbRoom.bidCount
      room.playerQueue = dbRoom.availablePlayers
      room.soldPlayers = dbRoom.soldPlayers
      room.unsoldPlayers = dbRoom.unsoldPlayers
      auctionRooms.set(roomCode, room)
    }
  }

  if (!room) {
    ws.send(JSON.stringify({ type: 'ERROR', message: 'Room not found' }))
    return
  }

  // Create team
  const teamId = crypto.randomUUID()
  const team = {
    id: teamId,
    name: teamName,
    userName,
    userId,
    budget: 10000,
    players: [],
    rtmCardsLeft: 2,
    isActive: true
  }

  room.teams.push(team)
  
  // Create session
  const sessionToken = crypto.randomUUID()
  await prisma.userSession.create({
    data: {
      roomCode,
      userId,
      userName,
      teamId,
      sessionToken
    }
  })

  room.addConnection(ws, userId, userName, teamId)
  await room.saveState()

  room.broadcast({
    type: 'USER_JOINED',
    userName,
    teamName,
    teams: room.teams
  })

  ws.send(JSON.stringify({
    type: 'JOINED_ROOM',
    sessionToken,
    teamId,
    state: room.getFullState()
  }))
}

async function handleReconnect(ws, { sessionToken }) {
  const session = await prisma.userSession.findUnique({
    where: { sessionToken }
  })

  if (!session) {
    ws.send(JSON.stringify({ type: 'ERROR', message: 'Invalid session' }))
    return
  }

  const room = auctionRooms.get(session.roomCode)
  if (!room) {
    ws.send(JSON.stringify({ type: 'ERROR', message: 'Room no longer active' }))
    return
  }

  // Update session heartbeat
  await prisma.userSession.update({
    where: { sessionToken },
    data: { lastHeartbeat: new Date() }
  })

  room.addConnection(ws, session.userId, session.userName, session.teamId)

  ws.send(JSON.stringify({
    type: 'RECONNECTED',
    state: room.getFullState()
  }))

  room.broadcast({
    type: 'USER_RECONNECTED',
    userName: session.userName
  }, ws)
}

async function handleStartAuction(ws, { roomCode }) {
  const room = auctionRooms.get(roomCode)
  if (!room) {
    ws.send(JSON.stringify({ type: 'ERROR', message: 'Room not found' }))
    return
  }

  // Load player queue
  const players = await prisma.player.findMany({
    where: { isSold: false }
  })

  // Shuffle players
  room.playerQueue = players.map(p => p.id).sort(() => Math.random() - 0.5)
  room.status = 'active'

  await room.moveToNextPlayer()
  await room.saveState()

  room.broadcast({
    type: 'AUCTION_STARTED',
    state: room.getFullState()
  })
}

async function handlePlaceBid(ws, { roomCode, teamId, bidAmount }) {
  const room = auctionRooms.get(roomCode)
  if (!room) return

  const team = room.teams.find(t => t.id === teamId)
  if (!team) return

  const player = await prisma.player.findUnique({
    where: { id: room.currentPlayerId }
  })

  // Validate bid
  const currentBid = room.currentBid || player.basePrice
  if (bidAmount < currentBid + 10) {
    ws.send(JSON.stringify({
      type: 'BID_REJECTED',
      reason: 'Bid increment must be at least ₹10L'
    }))
    return
  }

  if (bidAmount > team.budget) {
    ws.send(JSON.stringify({
      type: 'BID_REJECTED',
      reason: 'Insufficient budget'
    }))
    return
  }

  // Accept bid
  room.currentBid = bidAmount
  room.currentBidderId = teamId
  room.bidCount = 0

  // Record bid
  await prisma.bidHistory.create({
    data: {
      roomCode,
      playerId: player.id,
      teamId,
      teamName: team.name,
      userName: team.userName,
      bidAmount
    }
  })

  room.broadcast({
    type: 'BID_PLACED',
    teamName: team.name,
    bidAmount,
    player: player
  })

  // Restart timer
  room.startBidTimer()
  await room.saveState()
}

async function handleUseRTM(ws, { roomCode, teamId }) {
  const room = auctionRooms.get(roomCode)
  if (!room) return

  const team = room.teams.find(t => t.id === teamId)
  if (!team || team.rtmCardsLeft <= 0) {
    ws.send(JSON.stringify({
      type: 'RTM_REJECTED',
      reason: 'No RTM cards remaining'
    }))
    return
  }

  team.rtmCardsLeft--
  await room.handlePlayerSold()

  room.broadcast({
    type: 'RTM_USED',
    teamName: team.name
  })
}

async function handlePauseAuction(ws, { roomCode }) {
  const room = auctionRooms.get(roomCode)
  if (!room) return

  room.status = 'paused'
  if (room.bidTimer) {
    clearTimeout(room.bidTimer)
  }

  await room.saveState()
  room.broadcast({ type: 'AUCTION_PAUSED' })
}

async function handleResumeAuction(ws, { roomCode }) {
  const room = auctionRooms.get(roomCode)
  if (!room) return

  room.status = 'active'
  room.startBidTimer()
  
  await room.saveState()
  room.broadcast({ type: 'AUCTION_RESUMED' })
}

async function handleSkipPlayer(ws, { roomCode }) {
  const room = auctionRooms.get(roomCode)
  if (!room) return

  if (room.currentPlayerId) {
    room.unsoldPlayers.push(room.currentPlayerId)
  }

  await room.moveToNextPlayer()
}

// Heartbeat interval to detect dead connections
setInterval(() => {
  wss.clients.forEach(ws => {
    if (!ws.isAlive) {
      return ws.terminate()
    }
    ws.isAlive = false
    ws.ping()
  })
}, 30000)

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down WebSocket server...')
  
  // Save all room states
  for (const [roomCode, room] of auctionRooms) {
    await room.saveState()
  }
  
  await prisma.$disconnect()
  process.exit(0)
})
