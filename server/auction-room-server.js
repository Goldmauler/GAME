const WebSocket = require("ws")
const { calculateTeamRating } = require("./team-rating")
const { createPlayers: fetchRealPlayers } = require("../lib/fetch-players")

const PORT = process.env.AUCTION_PORT || 8080

const wss = new WebSocket.Server({ port: PORT })

console.log(`🏏 IPL Auction Room Server starting on ws://localhost:${PORT}`)

// Room management
const rooms = new Map() // roomCode -> Room object
const clientRooms = new Map() // ws -> roomCode

// Generate unique 6-character room code
function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Excluding confusing chars
  let code
  do {
    code = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  } while (rooms.has(code))
  return code
}

// Create teams template
function createTeams() {
  const TEAMS = [
    "Mumbai Indians",
    "Chennai Super Kings",
    "Delhi Capitals",
    "Rajasthan Royals",
    "Kolkata Knight Riders",
    "Punjab Kings",
    "Sunrisers Hyderabad",
    "Lucknow Super Giants",
    "Bangalore Royals",
    "Hyderabad Chargers",
  ]

  return TEAMS.map((name, i) => ({
    id: String(i + 1),
    name,
    budget: 100, // 100 Cr per team
    players: [],
    maxPlayers: 25,
  }))
}

// Use real IPL players from fetch-players.js
function createPlayers() {
  return fetchRealPlayers()
}

// Room class
class AuctionRoom {
  constructor(roomCode, hostName) {
    this.roomCode = roomCode
    this.hostName = hostName
    this.teams = createTeams()
    this.players = createPlayers()
    this.clients = new Map() // ws -> {teamId, userName}
    this.takenTeams = new Set() // Track which teams are taken
    this.auctionState = {
      playerIndex: 0,
      currentPrice: this.players[0].basePrice,
      highestBidder: null,
      bidHistory: [],
      timeLeft: 30,
      phase: "waiting", // waiting, active, completed
    }
    this.tickInterval = null
    this.createdAt = Date.now()
  }

  addClient(ws, teamId, userName) {
    this.clients.set(ws, { teamId, userName })
    this.takenTeams.add(teamId)
  }

  removeClient(ws) {
    const client = this.clients.get(ws)
    if (client) {
      this.takenTeams.delete(client.teamId)
      this.clients.delete(ws)
    }
    
    // If no clients left, mark for cleanup
    if (this.clients.size === 0 && this.auctionState.phase !== 'active') {
      return true // Room can be deleted
    }
    return false
  }

  startAuction() {
    if (this.auctionState.phase === 'waiting') {
      this.auctionState.phase = 'active'
      this.startTicking()
    }
  }

  startTicking() {
    if (this.tickInterval) return
    
    this.tickInterval = setInterval(() => {
      if (this.auctionState.phase !== 'active') {
        this.stopTicking()
        return
      }

      this.auctionState.timeLeft -= 1

      // AI bidding
      this.aiTick()

      // Time expired
      if (this.auctionState.timeLeft <= 0) {
        this.nextPlayer()
      }

      this.broadcastState()
    }, 1000)
  }

  stopTicking() {
    if (this.tickInterval) {
      clearInterval(this.tickInterval)
      this.tickInterval = null
    }
  }

  aiTick() {
    const { generateTeamBiddingProfile, shouldTeamBid, calculateNextBid, getNextBidder } = require('./auction-logic')
    
    if (this.auctionState.timeLeft < 25 && Math.random() < 0.3) {
      const eligibleTeams = this.teams.filter(t => {
        if (this.takenTeams.has(t.id)) return false // Skip human-controlled teams
        return t.budget >= this.auctionState.currentPrice + 1 && t.players.length < 25
      })

      if (eligibleTeams.length > 0) {
        const profiles = eligibleTeams.map(t => generateTeamBiddingProfile(t, this.auctionState.currentPrice))
        const interestedTeams = eligibleTeams.filter((t, i) => 
          shouldTeamBid(profiles[i], this.players[this.auctionState.playerIndex], this.auctionState.currentPrice)
        )

        if (interestedTeams.length > 0) {
          const bidder = getNextBidder(interestedTeams, this.auctionState.highestBidder)
          if (bidder) {
            const profile = generateTeamBiddingProfile(bidder, this.auctionState.currentPrice)
            const nextBid = calculateNextBid(profile, this.players[this.auctionState.playerIndex], this.auctionState.currentPrice)
            this.placeBid(bidder.id, nextBid)
          }
        }
      }
    }
  }

  placeBid(teamId, amount) {
    const team = this.teams.find(t => t.id === teamId)
    if (!team || team.budget < amount || team.players.length >= 25) return false

    this.auctionState.currentPrice = amount
    this.auctionState.highestBidder = teamId
    this.auctionState.bidHistory.push({ team: teamId, price: amount, timestamp: Date.now() })
    this.auctionState.timeLeft = Math.max(5, Math.min(10, this.auctionState.timeLeft + 3))

    return true
  }

  nextPlayer() {
    // Award player to highest bidder
    if (this.auctionState.highestBidder) {
      const team = this.teams.find(t => t.id === this.auctionState.highestBidder)
      if (team) {
        const player = this.players[this.auctionState.playerIndex]
        team.players.push({ ...player, soldPrice: this.auctionState.currentPrice, soldTo: team.id })
        team.budget -= this.auctionState.currentPrice
      }
    }

    // Move to next player
    if (this.auctionState.playerIndex < this.players.length - 1) {
      this.auctionState.playerIndex += 1
      this.auctionState.currentPrice = this.players[this.auctionState.playerIndex].basePrice
      this.auctionState.highestBidder = null
      this.auctionState.bidHistory = []
      this.auctionState.timeLeft = 30
    } else {
      // Auction complete
      this.completeAuction()
    }
  }

  completeAuction() {
    this.auctionState.phase = 'completed'
    this.stopTicking()

    // Calculate ratings
    const ratings = this.teams.map(team => ({
      teamId: team.id,
      ...calculateTeamRating(team),
    }))

    this.broadcastResults(ratings)
  }

  broadcastState() {
    const message = JSON.stringify({
      type: 'state',
      payload: {
        teams: this.teams,
        auctionState: this.auctionState,
        roomCode: this.roomCode,
        playerCount: this.clients.size,
      },
    })

    this.clients.forEach((_, ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message)
      }
    })
  }

  broadcastResults(ratings) {
    const message = JSON.stringify({
      type: 'results',
      payload: { ratings, finalTeams: this.teams },
    })

    this.clients.forEach((_, ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message)
      }
    })
  }

  getRoomInfo() {
    return {
      roomCode: this.roomCode,
      hostName: this.hostName,
      playerCount: this.clients.size,
      maxPlayers: 10,
      phase: this.auctionState.phase,
      takenTeams: Array.from(this.takenTeams),
      createdAt: this.createdAt,
    }
  }
}

// WebSocket connection handler
wss.on("connection", (ws) => {
  console.log("Client connected")

  ws.on("message", (data) => {
    try {
      const msg = JSON.parse(data)
      handleMessage(ws, msg)
    } catch (e) {
      console.error("Invalid message:", e)
    }
  })

  ws.on("close", () => {
    console.log("Client disconnected")
    
    const roomCode = clientRooms.get(ws)
    if (roomCode) {
      const room = rooms.get(roomCode)
      if (room) {
        const shouldDelete = room.removeClient(ws)
        room.broadcastState()
        
        if (shouldDelete) {
          rooms.delete(roomCode)
          console.log(`Room ${roomCode} deleted (empty)`)
        }
      }
      clientRooms.delete(ws)
    }
  })
})

function handleMessage(ws, msg) {
  const { type, payload } = msg

  switch (type) {
    case 'create-room':
      handleCreateRoom(ws, payload)
      break
    
    case 'join-room':
      handleJoinRoom(ws, payload)
      break
    
    case 'start-auction':
      handleStartAuction(ws)
      break
    
    case 'bid':
      handleBid(ws, payload)
      break
    
    case 'list-rooms':
      handleListRooms(ws)
      break
    
    case 'leave-room':
      handleLeaveRoom(ws)
      break

    default:
      console.log('Unknown message type:', type)
  }
}

function handleCreateRoom(ws, payload) {
  const { hostName } = payload
  const roomCode = generateRoomCode()
  const room = new AuctionRoom(roomCode, hostName || 'Host')
  
  rooms.set(roomCode, room)
  clientRooms.set(ws, roomCode)

  console.log(`✅ Room ${roomCode} created by ${hostName}`)

  ws.send(JSON.stringify({
    type: 'room-created',
    payload: {
      roomCode,
      roomInfo: room.getRoomInfo(),
    },
  }))
}

function handleJoinRoom(ws, payload) {
  const { roomCode, teamId, userName } = payload

  const room = rooms.get(roomCode)
  if (!room) {
    ws.send(JSON.stringify({
      type: 'error',
      payload: { message: 'Room not found' },
    }))
    return
  }

  if (room.clients.size >= 10) {
    ws.send(JSON.stringify({
      type: 'error',
      payload: { message: 'Room is full (max 10 players)' },
    }))
    return
  }

  if (room.takenTeams.has(teamId)) {
    ws.send(JSON.stringify({
      type: 'error',
      payload: { message: 'Team already taken by another player' },
    }))
    return
  }

  room.addClient(ws, teamId, userName || 'Player')
  clientRooms.set(ws, roomCode)

  console.log(`${userName} joined room ${roomCode} as team ${teamId}`)

  // Send welcome message
  ws.send(JSON.stringify({
    type: 'joined-room',
    payload: {
      roomCode,
      teams: room.teams,
      auctionState: room.auctionState,
      roomInfo: room.getRoomInfo(),
    },
  }))

  // Notify all clients
  room.broadcastState()
}

function handleStartAuction(ws) {
  const roomCode = clientRooms.get(ws)
  if (!roomCode) return

  const room = rooms.get(roomCode)
  if (!room) return

  // Only allow if at least 2 players (1 human + AI teams is fine)
  if (room.clients.size < 1) {
    ws.send(JSON.stringify({
      type: 'error',
      payload: { message: 'Need at least 1 player to start' },
    }))
    return
  }

  room.startAuction()
  console.log(`Auction started in room ${roomCode}`)
  
  room.broadcastState()
}

function handleBid(ws, payload) {
  const roomCode = clientRooms.get(ws)
  if (!roomCode) return

  const room = rooms.get(roomCode)
  if (!room) return

  const { teamId, amount } = payload
  const client = room.clients.get(ws)

  if (!client || client.teamId !== teamId) {
    ws.send(JSON.stringify({
      type: 'error',
      payload: { message: 'You can only bid for your own team' },
    }))
    return
  }

  const success = room.placeBid(teamId, amount)
  if (success) {
    room.broadcastState()
  }
}

function handleListRooms(ws) {
  const roomList = Array.from(rooms.values())
    .filter(room => room.auctionState.phase === 'waiting') // Only show joinable rooms
    .map(room => room.getRoomInfo())

  ws.send(JSON.stringify({
    type: 'room-list',
    payload: { rooms: roomList },
  }))
}

function handleLeaveRoom(ws) {
  const roomCode = clientRooms.get(ws)
  if (!roomCode) return

  const room = rooms.get(roomCode)
  if (room) {
    const shouldDelete = room.removeClient(ws)
    room.broadcastState()
    
    if (shouldDelete) {
      rooms.delete(roomCode)
      console.log(`Room ${roomCode} deleted`)
    }
  }
  
  clientRooms.delete(ws)
  
  ws.send(JSON.stringify({
    type: 'left-room',
    payload: { success: true },
  }))
}

// Cleanup old empty rooms every 5 minutes
setInterval(() => {
  const now = Date.now()
  const OLD_ROOM_THRESHOLD = 30 * 60 * 1000 // 30 minutes
  
  rooms.forEach((room, code) => {
    if (room.clients.size === 0 && now - room.createdAt > OLD_ROOM_THRESHOLD) {
      room.stopTicking()
      rooms.delete(code)
      console.log(`Cleaned up old room ${code}`)
    }
  })
}, 5 * 60 * 1000)

console.log("✅ Room-based auction server ready!")
