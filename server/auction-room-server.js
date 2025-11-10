const WebSocket = require("ws")
const { calculateTeamRating } = require("./team-rating")
const { createPlayers: fetchRealPlayers } = require("../lib/fetch-players")
const fetch = require("node-fetch")

const PORT = process.env.AUCTION_PORT || 8080
const API_BASE_URL = process.env.API_URL || "http://localhost:3000"

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

// Database helper functions
async function saveRoomToDatabase(room) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/rooms/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        roomCode: room.roomCode,
        hostName: room.hostName,
        hostId: room.hostId,
        minTeams: room.minTeams,
        status: 'lobby',
        teams: room.teams,
        players: room.players,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to save room: ${response.status} ${errorText}`)
    }

    const result = await response.json()
    console.log(`✅ Room ${room.roomCode} saved to database`)
    return result
  } catch (error) {
    console.error(`❌ Error saving room ${room.roomCode}:`, error.message)
    throw error
  }
}

// Room class
class AuctionRoom {
  constructor(roomCode, hostName, hostId) {
    this.roomCode = roomCode
    this.hostName = hostName
    this.hostId = hostId
    this.teams = createTeams()
    this.players = createPlayers()
    this.clients = new Map() // ws -> {teamId, userName, userId, isHost}
    this.takenTeams = new Set() // Track which teams are taken
    this.minTeams = 2 // Minimum teams to start auction
    this.startCountdown = null // Countdown timer
    this.auctionState = {
      playerIndex: 0,
      currentPrice: this.players[0].basePrice,
      highestBidder: null,
      bidHistory: [],
      timeLeft: 30,
      phase: "lobby", // lobby, countdown, active, completed
      countdownSeconds: 10,
    }
    this.tickInterval = null
    this.countdownInterval = null
    this.createdAt = Date.now()
  }

  addClient(ws, teamId, userName, userId) {
    const isHost = userId === this.hostId
    this.clients.set(ws, { teamId, userName, userId, isHost })
    this.takenTeams.add(teamId)
    
    // Check if minimum teams reached and host hasn't started yet
    if (this.auctionState.phase === 'lobby' && this.clients.size >= this.minTeams) {
      this.notifyReadyToStart()
    }
  }

  notifyReadyToStart() {
    const message = JSON.stringify({
      type: 'ready_to_start',
      payload: {
        message: `${this.clients.size} teams ready! Host can start the auction.`,
        canStart: true
      }
    })
    
    this.clients.forEach((client, ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message)
      }
    })
  }

  selectTeam(ws, teamId) {
    const client = this.clients.get(ws)
    if (!client) return false
    
    // Check if team is already taken
    if (this.takenTeams.has(teamId) && client.teamId !== teamId) {
      return false
    }
    
    // Remove old team selection
    if (client.teamId) {
      this.takenTeams.delete(client.teamId)
    }
    
    // Set new team
    client.teamId = teamId
    this.takenTeams.add(teamId)
    this.clients.set(ws, client)
    
    return true
  }

  startCountdownTimer() {
    if (this.auctionState.phase !== 'lobby') return false
    if (this.clients.size < this.minTeams) return false
    
    this.auctionState.phase = 'countdown'
    this.auctionState.countdownSeconds = 10
    
    this.countdownInterval = setInterval(() => {
      this.auctionState.countdownSeconds -= 1
      
      this.broadcastCountdown()
      
      if (this.auctionState.countdownSeconds <= 0) {
        clearInterval(this.countdownInterval)
        this.countdownInterval = null
        this.startAuction()
      }
    }, 1000)
    
    return true
  }

  broadcastCountdown() {
    const message = JSON.stringify({
      type: 'countdown',
      payload: {
        seconds: this.auctionState.countdownSeconds,
        message: `Auction starting in ${this.auctionState.countdownSeconds}...`
      }
    })
    
    this.clients.forEach((_, ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message)
      }
    })
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
    if (this.auctionState.phase === 'lobby' || this.auctionState.phase === 'countdown') {
      this.auctionState.phase = 'active'
      this.startTicking()
      
      // Broadcast auction started
      const message = JSON.stringify({
        type: 'auction_started',
        payload: {
          message: 'Auction has begun! Good luck!',
          currentPlayer: this.players[this.auctionState.playerIndex]
        }
      })
      
      this.clients.forEach((_, ws) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(message)
        }
      })
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
        
        // Save player purchase to database (only for human-controlled teams)
        if (this.takenTeams.has(team.id)) {
          this.savePlayerPurchase(team, player, this.auctionState.currentPrice).catch(err => {
            console.error(`Failed to save player purchase:`, err.message)
          })
        }
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
    
    // Save results to database
    this.saveAuctionResults(ratings).catch(err => {
      console.error(`Failed to save results for room ${this.roomCode}:`, err.message)
    })
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

  async saveAuctionResults(ratings) {
    try {
      // Prepare teams data with only human-controlled teams
      const teamsData = []
      
      this.clients.forEach((client, ws) => {
        const team = this.teams.find(t => t.id === client.teamId)
        if (team) {
          const teamRating = ratings.find(r => r.teamId === team.id)
          teamsData.push({
            teamId: team.id,
            teamName: team.name,
            userName: client.userName,
            userId: client.userId,
            players: team.players,
            budget: team.budget,
            rating: teamRating || { overallRating: 0, battingRating: 0, bowlingRating: 0, balance: 0 }
          })
        }
      })

      // Save to database via API
      const response = await fetch(`${API_BASE_URL}/api/auction/save-results`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomCode: this.roomCode,
          hostName: this.hostName,
          teams: teamsData,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to save results: ${response.status} ${errorText}`)
      }

      const result = await response.json()
      console.log(`✅ Results saved for room ${this.roomCode}`)
      return result
    } catch (error) {
      console.error(`❌ Error saving results for room ${this.roomCode}:`, error.message)
      throw error
    }
  }

  async savePlayerPurchase(team, player, soldPrice) {
    try {
      // Get the userName for this team
      let userName = 'AI'
      this.clients.forEach((client, ws) => {
        if (client.teamId === team.id) {
          userName = client.userName
        }
      })

      const response = await fetch(`${API_BASE_URL}/api/auction/save-player-purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomCode: this.roomCode,
          playerName: player.name,
          playerRole: player.role,
          basePrice: player.basePrice,
          soldPrice: soldPrice,
          teamId: team.id,
          teamName: team.name,
          userName: userName,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Failed to save player purchase: ${response.status} ${errorText}`)
      } else {
        console.log(`✅ Saved purchase: ${player.name} → ${team.name} (₹${soldPrice}Cr)`)
      }
    } catch (error) {
      console.error(`❌ Error saving player purchase:`, error.message)
    }
  }

  getRoomInfo() {
    return {
      roomCode: this.roomCode,
      hostName: this.hostName,
      hostId: this.hostId,
      playerCount: this.clients.size,
      maxPlayers: 10,
      minTeams: this.minTeams,
      phase: this.auctionState.phase,
      takenTeams: Array.from(this.takenTeams),
      availableTeams: this.teams.filter(t => !this.takenTeams.has(t.id)),
      createdAt: this.createdAt,
      canStart: this.clients.size >= this.minTeams,
    }
  }

  cleanup() {
    if (this.tickInterval) {
      clearInterval(this.tickInterval)
      this.tickInterval = null
    }
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval)
      this.countdownInterval = null
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
    
    case 'select-team':
      handleSelectTeam(ws, payload)
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
  const { hostName, userId } = payload
  const roomCode = generateRoomCode()
  const hostId = userId || `host-${Date.now()}`
  const room = new AuctionRoom(roomCode, hostName || 'Host', hostId)
  
  rooms.set(roomCode, room)
  clientRooms.set(ws, roomCode)

  console.log(`✅ Room ${roomCode} created by ${hostName}`)

  // Save room to database
  saveRoomToDatabase(room).catch(err => {
    console.error(`Failed to save room ${roomCode} to database:`, err.message)
  })

  ws.send(JSON.stringify({
    type: 'room-created',
    payload: {
      roomCode,
      hostId,
      roomInfo: room.getRoomInfo(),
      availableTeams: room.teams,
    },
  }))
}

function handleJoinRoom(ws, payload) {
  const { roomCode, userName, userId } = payload

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

  if (room.auctionState.phase !== 'lobby') {
    ws.send(JSON.stringify({
      type: 'error',
      payload: { message: 'Auction already in progress' },
    }))
    return
  }

  const playerId = userId || `player-${Date.now()}`
  room.addClient(ws, null, userName || 'Player', playerId)
  clientRooms.set(ws, roomCode)

  console.log(`${userName} joined room ${roomCode}`)

  // Send welcome message
  ws.send(JSON.stringify({
    type: 'joined-room',
    payload: {
      roomCode,
      userId: playerId,
      teams: room.teams,
      auctionState: room.auctionState,
      roomInfo: room.getRoomInfo(),
    },
  }))

  // Notify all clients
  room.broadcastState()
}

function handleSelectTeam(ws, payload) {
  const roomCode = clientRooms.get(ws)
  if (!roomCode) return

  const room = rooms.get(roomCode)
  if (!room) return

  const { teamId } = payload

  const success = room.selectTeam(ws, teamId)
  
  if (success) {
    const client = room.clients.get(ws)
    const team = room.teams.find(t => t.id === teamId)
    
    console.log(`${client.userName} selected team: ${team.name}`)
    
    ws.send(JSON.stringify({
      type: 'team-selected',
      payload: {
        teamId,
        teamName: team.name,
        success: true
      }
    }))
    
    room.broadcastState()
  } else {
    ws.send(JSON.stringify({
      type: 'error',
      payload: { message: 'Team already taken or unavailable' }
    }))
  }
}

function handleStartAuction(ws) {
  const roomCode = clientRooms.get(ws)
  if (!roomCode) return

  const room = rooms.get(roomCode)
  if (!room) return

  const client = room.clients.get(ws)
  
  // Only host can start the auction
  if (!client || !client.isHost) {
    ws.send(JSON.stringify({
      type: 'error',
      payload: { message: 'Only the host can start the auction' },
    }))
    return
  }

  // Need minimum teams
  if (room.clients.size < room.minTeams) {
    ws.send(JSON.stringify({
      type: 'error',
      payload: { message: `Need at least ${room.minTeams} teams to start` },
    }))
    return
  }

  // Check if all players have selected teams
  let allTeamsSelected = true
  room.clients.forEach((client) => {
    if (!client.teamId) {
      allTeamsSelected = false
    }
  })

  if (!allTeamsSelected) {
    ws.send(JSON.stringify({
      type: 'error',
      payload: { message: 'All players must select a team before starting' },
    }))
    return
  }

  // Start 10-second countdown
  const started = room.startCountdownTimer()
  if (!started) {
    ws.send(JSON.stringify({
      type: 'error',
      payload: { message: 'Unable to start auction' },
    }))
    return
  }

  console.log(`Auction countdown started in room ${roomCode}`)
  
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
    .filter(room => room.auctionState.phase === 'lobby') // Only show joinable rooms
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
