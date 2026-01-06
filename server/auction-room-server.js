const WebSocket = require("ws")
const http = require("http")
//const { calculateTeamRating } = require("./team-rating")
const { calculateCortexScore } = require("./cortex-scorer")
const { createPlayers: fetchRealPlayers } = require("../lib/fetch-players")
const fetch = require("node-fetch")
const os = require("os")

// ============ AUCTION CONFIGURATION ============
// Modify these values to customize the auction

// BIDDING TIME (in seconds)
const ROUND_1_BID_TIME = 15  // Time per player in Round 1
const ROUND_2_BID_TIME = 10  // Time per player in Round 2

// BREAK TIME (in seconds)
const CATEGORY_BREAK_TIME = 10  // Break between categories
const ROUND_BREAK_TIME = 20     // Break between rounds

// ============ END CONFIGURATION ============

// Port configuration for both local and Render deployment
const PORT = process.env.PORT || process.env.AUCTION_PORT || 8080
const API_BASE_URL = process.env.API_URL || "http://localhost:3000"
const IS_PRODUCTION = process.env.NODE_ENV === 'production'

// Create HTTP server for compatibility with Render and ngrok
const server = http.createServer((req, res) => {
  // Health check endpoint for Render
  if (req.url === '/health' || req.url === '/') {
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    })
    res.end(JSON.stringify({
      status: 'ok',
      service: 'IPL Auction WebSocket Server',
      timestamp: new Date().toISOString(),
      activeRooms: rooms.size,
      activeConnections: wss.clients.size
    }))
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' })
    res.end('Not Found')
  }
})

const wss = new WebSocket.Server({
  server: server // Attach to HTTP server instead of port directly
})

// Helper function to get local IP addresses
function getLocalIPs() {
  const interfaces = os.networkInterfaces()
  const ips = []

  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal (loopback) and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        ips.push(iface.address)
      }
    }
  }

  return ips
}

console.log(`\nIPL Auction Room Server Started`)
console.log(`-------------------------------------------`)
console.log(`WebSocket Server Running on Port: ${PORT}`)
console.log(`Environment: ${IS_PRODUCTION ? 'PRODUCTION' : 'DEVELOPMENT'}`)
console.log(`-------------------------------------------\n`)

if (IS_PRODUCTION) {
  console.log(`Production Mode - Ready for deployment`)
  console.log(`   WebSocket URL: wss://your-app.onrender.com`)
} else {
  console.log(`Development Access Points:\n`)
  console.log(`   Local: ws://localhost:${PORT}\n`)

  const localIPs = getLocalIPs()
  if (localIPs.length > 0) {
    console.log(`   Network:`)
    localIPs.forEach(ip => {
      console.log(`   - ws://${ip}:${PORT}`)
    })
    console.log(`\n   Web App: http://${localIPs[0]}:3000`)
  } else {
    console.log(`   Warning: No network interfaces found.`)
  }

  console.log(`\n-------------------------------------------`)
  console.log(`Tip: Run Next.js dev server on port 3000`)
  console.log(`    Command: npm run dev`)
}

console.log(`\nReady to accept connections!\n`)

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

// Use real IPL players from fetch-players.js and categorize them
function createPlayers() {
  const allPlayers = fetchRealPlayers()

  // Categorize players by Auction Sets (IPL Style)
  // Sets: Marquee, Capped Batters, Capped All-rounders, Capped Wicket-keepers, Capped Fast Bowlers, Capped Spinners
  //       Uncapped Batters, Uncapped All-rounders, ...

  const categorized = {
    marquee: [],

    // Set 1: Capped Batters (BA1)
    capped_batters: [],
    // Set 2: Capped All-rounders (AL1)
    capped_allrounders: [],
    // Set 3: Capped Wicket-keepers (WK1)
    capped_wicketkeepers: [],
    // Set 4: Capped Fast Bowlers (FA1)
    capped_fastbowlers: [],
    // Set 5: Capped Spin Bowlers (SP1)
    capped_spinbowlers: [],

    // Uncapped Sets
    uncapped_batters: [],
    uncapped_allrounders: [],
    uncapped_wicketkeepers: [],
    uncapped_fastbowlers: [],
    uncapped_spinbowlers: []
  }

  allPlayers.forEach(player => {
    const role = player.role.toLowerCase()
    const isMarquee = player.basePrice >= 2 || player.isMarquee
    const isUncapped = player.basePrice <= 0.4 || player.isUncapped // Assuming < 40L is uncapped behavior for game logic if flag missing

    // Marquee list (Top tier only)
    if (isMarquee && !player.isRetained) {
      categorized.marquee.push(player)
      return
    }

    // Determine Role Type
    let type = 'batter'
    if (role.includes('all')) type = 'allrounder'
    else if (role.includes('keep') || role.includes('wk')) type = 'wicketkeeper'
    else if (role.includes('bowl')) {
      // Simple heuristic for Spin vs Fast if data missing: 
      // If name implies spinner (Rashid, Chahal, etc) or has 'spin' in detailed role. 
      // For now, randomly split or put all in fast/spin buckets if specific data absent.
      // Defaulting all bowlers to 'Fast' bucket for now unless we add specific data.
      // Or split randomly for variety? Let's treat all as 'Fast' for simplicity or 'Bowlers' general category.
      // Wait, user asked for "batsmen bowlers". Let's stick to standard 5 roles.
      type = 'bowler'
    }

    // Assign to Category
    if (isUncapped) {
      if (type === 'batter') categorized.uncapped_batters.push(player)
      else if (type === 'allrounder') categorized.uncapped_allrounders.push(player)
      else if (type === 'wicketkeeper') categorized.uncapped_wicketkeepers.push(player)
      else categorized.uncapped_fastbowlers.push(player) // Using fastbowlers as generic Uncapped Bowlers
    } else {
      if (type === 'batter') categorized.capped_batters.push(player)
      else if (type === 'allrounder') categorized.capped_allrounders.push(player)
      else if (type === 'wicketkeeper') categorized.capped_wicketkeepers.push(player)
      else categorized.capped_fastbowlers.push(player) // Using fastbowlers as generic Capped Bowlers
    }
  })

  return categorized
}

// Database helper functions
async function saveRoomToDatabase(room) {
  try {
    // Flatten all players from categories for initial save
    const allPlayers = [
      ...room.playerCategories.marquee,
      ...room.playerCategories.batsmen,
      ...room.playerCategories.bowlers,
      ...room.playerCategories.allrounders,
      ...room.playerCategories.wicketkeepers
    ];

    console.log(`Saving room ${room.roomCode} with ${allPlayers.length} players`);

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
        players: allPlayers,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to save room: ${response.status} ${errorText}`)
    }

    const result = await response.json()
    console.log(`Room ${room.roomCode} saved to database`)
    return result
  } catch (error) {
    console.error(`ERROR: Error saving room ${room.roomCode}:`, error.message)
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
    this.playerCategories = createPlayers() // Categorized players
    this.players = [] // Flattened array for current round
    this.clients = new Map() // ws -> {teamId, userName, userId, isHost, ready}
    this.takenTeams = new Set() // Track which teams are taken
    this.minTeams = 2 // Minimum teams to start auction
    this.startCountdown = null // Countdown timer

    // Reconnection support
    this.disconnectedUsers = new Map() // userId -> {userName, teamId, disconnectTime, timeout}
    this.reconnectionGracePeriod = 24 * 60 * 60 * 1000 // 24 hours (Allow joining back anytime)

    // Voting state
    this.votingActive = false
    this.endAuctionVotes = new Set() // Set of userIds who voted to end

    // Enhanced auction state with realistic features
    this.auctionState = {
      playerIndex: 0,
      currentPrice: 0,
      highestBidder: null,
      bidHistory: [],
      timeLeft: ROUND_1_BID_TIME,
      phase: "lobby", // lobby, countdown, active, break, strategic_timeout, completed
      countdownSeconds: 10,

      // Round-based system
      currentRound: 1, // Round 1: Normal, Round 2: Accelerated for unsold
      maxRounds: 2,
      unsoldPlayers: [],

      // Category system
      currentCategory: 'marquee',
      categoryOrder: [
        'marquee',
        'capped_batters',
        'capped_allrounders',
        'capped_wicketkeepers',
        'capped_fastbowlers', // Using as general Capped Bowlers for now
        'capped_spinbowlers',
        'uncapped_batters',
        'uncapped_allrounders',
        'uncapped_wicketkeepers',
        'uncapped_fastbowlers'
      ],
      categoryIndex: 0,

      // Break system
      breakType: null, // 'category', 'strategic', 'snack'
      breakTimeLeft: 0,
      breakMessage: '',

      // Strategic timeouts (2 per team)
      strategicTimeouts: {}, // teamId -> remaining timeouts

      // RTM (Right to Match) - 1 per team
      rtmAvailable: {}, // teamId -> has RTM

      // Stats
      totalPlayersSold: 0,
      totalMoneySpent: 0,

      // Pause state
      isPaused: false,
      pausedBy: null,
      pausedAt: null,

      // Chat messages
      chatMessages: [], // Array of {userName, message, timestamp, type: 'chat'|'system'|'bid'}

      // Sale History - Track all player sales
      saleHistory: [] // Array of {playerName, teamName, price, round, timestamp, status: 'sold'/'unsold'}
    }

    // Initialize strategic timeouts and RTM for all teams
    this.teams.forEach(team => {
      this.auctionState.strategicTimeouts[team.id] = 2
      this.auctionState.rtmAvailable[team.id] = true
    })

    this.tickInterval = null
    this.countdownInterval = null
    this.createdAt = Date.now()

    // Build initial player list (Marquee players first)
    this.buildPlayerList()
  }

  buildPlayerList() {
    // Build player list based on current round and category
    const category = this.auctionState.categoryOrder[this.auctionState.categoryIndex]

    if (this.auctionState.currentRound === 1) {
      // Round 1: All players from current category
      this.players = [...this.playerCategories[category]]
    } else {
      // Round 2: Unsold players (accelerated auction with reduced base price)
      this.players = this.auctionState.unsoldPlayers.map(p => ({
        ...p,
        basePrice: Math.max(0.5, p.basePrice * 0.5) // 50% reduced base price
      }))
    }

    if (this.players.length > 0) {
      this.auctionState.currentPrice = this.players[0].basePrice
      this.auctionState.playerIndex = 0
    }
  }

  addClient(ws, teamId, userName, userId, isReconnecting = false) {
    const isHost = userId === this.hostId
    this.clients.set(ws, { teamId, userName, userId, isHost, ready: false })

    // Only add to takenTeams if teamId is not null
    if (teamId) {
      this.takenTeams.add(teamId)
    }

    // If reconnecting, remove from disconnected users and clear timeout
    if (isReconnecting && this.disconnectedUsers.has(userId)) {
      const disconnectedUser = this.disconnectedUsers.get(userId)
      if (disconnectedUser.timeout) {
        clearTimeout(disconnectedUser.timeout)
      }
      this.disconnectedUsers.delete(userId)
      console.log(`${userName} reconnected to room ${this.roomCode}`)

      // Notify others about reconnection
      this.broadcastMessage({
        type: 'player_reconnected',
        payload: {
          userName,
          teamId,
          message: `${userName} has reconnected`
        }
      })
    }

    // Check if minimum teams reached and host hasn't started yet
    if (this.auctionState.phase === 'lobby' && this.clients.size >= this.minTeams) {
      this.notifyReadyToStart()
    }
  }

  handleDisconnect(ws) {
    const client = this.clients.get(ws)
    if (!client) return

    const { userId, userName, teamId, isHost } = client

    // Remove client from active connections
    this.clients.delete(ws)

    // HOST MIGRATION LOGIC
    if (isHost && this.clients.size > 0) {
      console.log(`Host ${userName} disconnected. Migrating host privileges...`)

      // Pick new host (first available client)
      const iterator = this.clients.values()
      const newHostClient = iterator.next().value

      if (newHostClient) {
        this.hostId = newHostClient.userId
        this.hostName = newHostClient.userName
        newHostClient.isHost = true
        // Client object is a reference in the Map, so this update persists

        console.log(`New Host is: ${newHostClient.userName} (${newHostClient.userId})`)

        this.broadcastMessage({
          type: 'host-migration',
          payload: {
            oldHost: userName,
            newHost: newHostClient.userName,
            newHostId: newHostClient.userId,
            message: `Host disconnected. ${newHostClient.userName} is now the Auction Leader.`
          }
        })

        // Explicitly update the new host's client with a targeted message
        // We need to find the WS for this client again since we only have the value from iterator
        this.clients.forEach((c, cWs) => {
          if (c.userId === newHostClient.userId && cWs.readyState === WebSocket.OPEN) {
            cWs.send(JSON.stringify({
              type: 'you-are-host',
              payload: { isHost: true }
            }))
          }
        })
      }
    }

    // Store disconnected user info for reconnection
    const timeout = setTimeout(() => {
      // After grace period, remove team reservation
      if (this.disconnectedUsers.has(userId)) {
        console.log(`Grace period expired for ${userName} in room ${this.roomCode}`)
        this.disconnectedUsers.delete(userId)
        if (teamId) {
          this.takenTeams.delete(teamId)
        }

        // Notify others
        this.broadcastMessage({
          type: 'player_removed',
          payload: {
            userName,
            teamId,
            message: `${userName} failed to reconnect and was removed`
          }
        })
      }
    }, this.reconnectionGracePeriod)

    this.disconnectedUsers.set(userId, {
      userName,
      teamId,
      disconnectTime: Date.now(),
      timeout
    })

    console.log(`WARNING: ${userName} disconnected from room ${this.roomCode}. Grace period: 2 minutes`)

    // Notify others about disconnection
    this.broadcastMessage({
      type: 'player_disconnected',
      payload: {
        userName,
        teamId,
        message: `${userName} disconnected. Waiting for reconnection...`
      }
    })
  }

  canUserReconnect(userId) {
    return this.disconnectedUsers.has(userId)
  }

  isTeamTakenButDisconnected(teamId) {
    // Check if team is taken but user is disconnected
    for (const [uid, user] of this.disconnectedUsers.entries()) {
      if (user.teamId === teamId) return uid
    }
    return null
  }

  getDisconnectedUserInfo(userId) {
    return this.disconnectedUsers.get(userId)
  }

  broadcastMessage(messageObj) {
    const message = JSON.stringify(messageObj)
    this.clients.forEach((_, ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message)
      }
    })
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

  setPlayerReady(ws, ready) {
    const client = this.clients.get(ws)
    if (!client) return false

    client.ready = ready
    this.clients.set(ws, client)

    return true
  }

  getLobbyPlayers() {
    const players = []
    this.clients.forEach((client, ws) => {
      if (client.teamId) {
        const team = this.teams.find(t => t.id === client.teamId)
        players.push({
          teamId: client.teamId,
          teamName: team ? team.name : 'Unknown Team',
          userName: client.userName,
          ready: client.ready || false,
          isHost: client.isHost || false,
        })
      }
    })
    return players
  }

  broadcastLobbyUpdate() {
    const players = this.getLobbyPlayers()
    const message = JSON.stringify({
      type: 'lobby-update',
      payload: { players }
    })

    this.clients.forEach((_, ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message)
      }
    })
  }

  startCountdownTimer() {
    if (this.auctionState.phase !== 'lobby') return false
    if (this.clients.size < this.minTeams) return false

    this.auctionState.phase = 'countdown'
    this.auctionState.countdownSeconds = 10

    // Broadcast initial countdown immediately
    this.broadcastCountdown()

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

  startAuction() {
    if (this.auctionState.phase === 'lobby' || this.auctionState.phase === 'countdown') {
      // Auto-assign teams to players who haven't selected one
      let availableTeamIds = this.teams.map(t => t.id).filter(id => !this.takenTeams.has(id))
      let teamIndex = 0

      this.clients.forEach((client, ws) => {
        if (!client.teamId && availableTeamIds.length > 0) {
          const assignedTeamId = availableTeamIds[teamIndex % availableTeamIds.length]
          client.teamId = assignedTeamId
          this.takenTeams.add(assignedTeamId)
          this.clients.set(ws, client)
          teamIndex++
          console.log(`Auto-assigned ${client.userName} to team ${assignedTeamId}`)
        }
      })

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

      // Broadcast initial state
      this.broadcastState()
    }
  }

  startTicking() {
    if (this.tickInterval) return

    this.tickInterval = setInterval(() => {
      if (this.auctionState.phase !== 'active' || this.auctionState.isPaused) {
        this.stopTicking()
        return
      }

      this.auctionState.timeLeft -= 1

      // AI bidding
      this.aiTick()

      // Time expired
      if (this.auctionState.timeLeft <= 0) {
        this.startSoldProcessing()
      }

      this.broadcastState()
    }, 1000)
  }

  startSoldProcessing() {
    this.stopTicking()
    this.auctionState.phase = 'sold_celebration'

    // Broadcast immediately to show "Sold/Unsold" state
    this.broadcastState()

    // Wait for celebration animation (3 seconds)
    setTimeout(() => {
      this.resolvePlayerSale()
    }, 4000)
  }

  resolvePlayerSale() {
    this.auctionState.phase = 'active'
    this.nextPlayer()
    // Resume ticking for the next player (unless round is over, handled in nextPlayer -> handleCategoryComplete)
    if (this.auctionState.phase === 'active') {
      this.startTicking()
    }
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
    // Phase check
    if (this.auctionState.phase !== 'active' && this.auctionState.phase !== 'countdown') return false

    const team = this.teams.find(t => t.id === teamId)
    if (!team) return false

    // 1. Basic Budget Check
    if (team.budget < amount) return false

    // 2. Max Squad Size Check
    if (team.players.length >= 25) return false

    // 3. Minimum Squad Size Budget Protection
    // Teams must strictly maintain enough budget to reach a minimum of 18 players
    // Minimum base price is 0.2 Cr
    const minSquadSize = 18
    const currentCount = team.players.length
    // We are buying 1 player now, so we need to fill (minSquadSize - (currentCount + 1)) more slots
    const slotsToFill = Math.max(0, minSquadSize - (currentCount + 1))
    const minPricePerPlayer = 0.2 // 20 Lakhs
    const fundsNeededForOthers = slotsToFill * minPricePerPlayer

    if ((team.budget - amount) < fundsNeededForOthers) {
      // Reject bid: Not enough funds left to complete squad
      return false
    }

    this.auctionState.currentPrice = amount
    this.auctionState.highestBidder = teamId
    this.auctionState.bidHistory.push({ team: teamId, price: amount, timestamp: Date.now() })

    // Broadcast immediate bid event for faster UI response
    this.broadcastMessage({
      type: 'bid_placed',
      payload: {
        teamId: team.id,
        teamName: team.name,
        amount: amount,
        message: `New bid: ₹${amount}Cr by ${team.name}`
      }
    })
    this.auctionState.timeLeft = Math.max(10, Math.min(20, this.auctionState.timeLeft + 5)) // Increased time extension

    return true
  }

  markUnsold() {
    // Mark current player as unsold and move to next player
    const currentPlayer = this.players[this.auctionState.playerIndex]

    // Add to unsold list if in round 1
    if (this.auctionState.currentRound === 1) {
      this.auctionState.unsoldPlayers.push(currentPlayer)
    }

    // Add to sale history as manually marked unsold
    this.auctionState.saleHistory.push({
      playerName: currentPlayer.name,
      playerRole: currentPlayer.role,
      teamName: null,
      teamId: null,
      price: null,
      basePrice: currentPlayer.basePrice,
      round: this.auctionState.currentRound,
      category: this.auctionState.currentCategory,
      timestamp: new Date().toISOString(),
      status: 'unsold'
    })

    // Reset bidding state
    this.auctionState.highestBidder = null
    this.auctionState.bidHistory = []

    // Move to next player
    if (this.auctionState.playerIndex < this.players.length - 1) {
      this.auctionState.playerIndex += 1
      this.auctionState.currentPrice = this.players[this.auctionState.playerIndex].basePrice
      this.auctionState.timeLeft = this.auctionState.currentRound === 1 ? ROUND_1_BID_TIME : ROUND_2_BID_TIME
    } else {
      // Category complete
      this.handleCategoryComplete()
    }

    // Broadcast updated state
    this.broadcastState()

    return true
  }

  nextPlayer() {
    const currentPlayer = this.players[this.auctionState.playerIndex]

    // Check if currentPlayer exists
    if (!currentPlayer) {
      console.error('ERROR: No current player found at index:', this.auctionState.playerIndex)
      this.endAuction()
      return
    }

    // Award player to highest bidder
    if (this.auctionState.highestBidder) {
      const team = this.teams.find(t => t.id === this.auctionState.highestBidder)
      if (team) {
        team.players.push({ ...currentPlayer, soldPrice: this.auctionState.currentPrice, soldTo: team.id })
        team.budget -= this.auctionState.currentPrice

        // Update stats
        this.auctionState.totalPlayersSold += 1
        this.auctionState.totalMoneySpent += this.auctionState.currentPrice

        // Add to sale history
        this.auctionState.saleHistory.push({
          playerName: currentPlayer.name,
          playerRole: currentPlayer.role,
          teamName: team.name,
          teamId: team.id,
          price: this.auctionState.currentPrice,
          basePrice: currentPlayer.basePrice,
          round: this.auctionState.currentRound,
          category: this.auctionState.currentCategory,
          timestamp: new Date().toISOString(),
          status: 'sold'
        })

        // Broadcast player sold event
        const soldMessage = JSON.stringify({
          type: 'player-sold',
          payload: {
            player: currentPlayer,
            soldTo: team.id,
            soldToName: team.name,
            soldPrice: this.auctionState.currentPrice,
          }
        })

        this.clients.forEach((_, ws) => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(soldMessage)
          }
        })

        // Save player purchase to database (only for human-controlled teams)
        if (this.takenTeams.has(team.id)) {
          this.savePlayerPurchase(team, currentPlayer, this.auctionState.currentPrice).catch(err => {
            console.error(`Failed to save player purchase:`, err.message)
          })
        }
      }
    } else {
      // Player unsold - add to unsold list and sale history
      if (this.auctionState.currentRound === 1) {
        this.auctionState.unsoldPlayers.push(currentPlayer)
      }

      // Add to sale history as unsold
      this.auctionState.saleHistory.push({
        playerName: currentPlayer.name,
        playerRole: currentPlayer.role,
        teamName: null,
        teamId: null,
        price: null,
        basePrice: currentPlayer.basePrice,
        round: this.auctionState.currentRound,
        category: this.auctionState.currentCategory,
        timestamp: new Date().toISOString(),
        status: 'unsold'
      })
    }

    // Move to next player or category
    if (this.auctionState.playerIndex < this.players.length - 1) {
      this.auctionState.playerIndex += 1
      this.auctionState.currentPrice = this.players[this.auctionState.playerIndex].basePrice
      this.auctionState.highestBidder = null
      this.auctionState.bidHistory = []
      this.auctionState.timeLeft = this.auctionState.currentRound === 1 ? ROUND_1_BID_TIME : ROUND_2_BID_TIME
    } else {
      // Category complete - check for break or next category
      this.handleCategoryComplete()
    }
  }

  handleCategoryComplete() {
    const categoryName = this.auctionState.categoryOrder[this.auctionState.categoryIndex]
    const nextCategoryIndex = this.auctionState.categoryIndex + 1

    // Check if more categories in current round
    if (nextCategoryIndex < this.auctionState.categoryOrder.length) {
      // Start category break
      this.startCategoryBreak(categoryName, this.auctionState.categoryOrder[nextCategoryIndex])
    } else {
      // Round complete - check for next round
      if (this.auctionState.currentRound < this.auctionState.maxRounds && this.auctionState.unsoldPlayers.length > 0) {
        // Start snack break before round 2
        this.startSnackBreak()
      } else {
        // Auction complete
        this.completeAuction()
      }
    }
  }

  startCategoryBreak(completedCategory, nextCategory) {
    this.auctionState.phase = 'break'
    this.auctionState.breakType = 'category'
    this.auctionState.breakTimeLeft = CATEGORY_BREAK_TIME
    this.auctionState.breakMessage = `${this.getCategoryDisplayName(completedCategory)} auction complete! Next up: ${this.getCategoryDisplayName(nextCategory)}`

    this.stopTicking()
    this.broadcastState()

    // Start break countdown
    const breakInterval = setInterval(() => {
      this.auctionState.breakTimeLeft -= 1
      this.broadcastState()

      if (this.auctionState.breakTimeLeft <= 0) {
        clearInterval(breakInterval)
        this.endBreak()
      }
    }, 1000)
  }

  startSnackBreak() {
    this.auctionState.phase = 'break'
    this.auctionState.breakType = 'snack'
    this.auctionState.breakTimeLeft = ROUND_BREAK_TIME
    this.auctionState.breakMessage = `Round 1 Complete! Strategic Break - Get ready for Accelerated Auction Round 2!`

    this.stopTicking()
    this.broadcastState()

    // Start break countdown
    const breakInterval = setInterval(() => {
      this.auctionState.breakTimeLeft -= 1
      this.broadcastState()

      if (this.auctionState.breakTimeLeft <= 0) {
        clearInterval(breakInterval)
        // Move to round 2
        this.auctionState.currentRound = 2
        this.auctionState.categoryIndex = 0
        this.buildPlayerList()
        this.endBreak()
      }
    }, 1000)
  }

  endBreak() {
    // Move to next category
    this.auctionState.categoryIndex += 1
    if (this.auctionState.categoryIndex >= this.auctionState.categoryOrder.length) {
      this.auctionState.categoryIndex = 0
    }

    this.buildPlayerList()
    this.auctionState.phase = 'active'
    this.auctionState.breakType = null
    this.auctionState.breakTimeLeft = 0
    this.auctionState.breakMessage = ''

    // Broadcast category change
    const categoryMessage = JSON.stringify({
      type: 'category-change',
      payload: {
        category: this.auctionState.currentCategory,
        categoryName: this.getCategoryDisplayName(this.auctionState.currentCategory),
        round: this.auctionState.currentRound,
        message: `Now auctioning: ${this.getCategoryDisplayName(this.auctionState.currentCategory)}`
      }
    })

    this.clients.forEach((_, ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(categoryMessage)
      }
    })

    this.startTicking()
    this.broadcastState()
  }

  getCategoryDisplayName(category) {
    const names = {
      'marquee': 'Set M: Marquee Players',
      'capped_batters': 'Set BA1: Capped Batters',
      'capped_allrounders': 'Set AL1: Capped All-rounders',
      'capped_wicketkeepers': 'Set WK1: Capped Wicket-keepers',
      'capped_fastbowlers': 'Set FA1: Capped Payers - Bowlers',
      'capped_spinbowlers': 'Set SP1: Capped Payers - Spinners',
      'uncapped_batters': 'Set UBA1: Uncapped Batters',
      'uncapped_allrounders': 'Set UAL1: Uncapped All-rounders',
      'uncapped_wicketkeepers': 'Set UWK1: Uncapped Wicket-keepers',
      'uncapped_fastbowlers': 'Set UFA1: Uncapped Bowlers',
      'uncapped_spinbowlers': 'Set USP1: Uncapped Spinners'
    }
    return names[category] || category
  }

  // Strategic timeout
  requestStrategicTimeout(teamId) {
    if (this.auctionState.phase !== 'active') return false
    if (this.auctionState.strategicTimeouts[teamId] <= 0) return false

    this.auctionState.strategicTimeouts[teamId] -= 1
    this.startStrategicTimeout(teamId)
    return true
  }

  startStrategicTimeout(teamId) {
    const team = this.teams.find(t => t.id === teamId)

    this.auctionState.phase = 'strategic_timeout'
    this.auctionState.breakType = 'strategic'
    this.auctionState.breakTimeLeft = 90 // 90 seconds strategic timeout
    this.auctionState.breakMessage = `Strategic Timeout called by ${team ? team.name : 'Team'}`

    this.stopTicking()
    this.broadcastState()

    // Start timeout countdown
    const timeoutInterval = setInterval(() => {
      this.auctionState.breakTimeLeft -= 1
      this.broadcastState()

      if (this.auctionState.breakTimeLeft <= 0) {
        clearInterval(timeoutInterval)
        this.auctionState.phase = 'active'
        this.auctionState.breakType = null
        this.auctionState.breakTimeLeft = 0
        this.auctionState.breakMessage = ''
        this.startTicking()
        this.broadcastState()
      }
    }, 1000)
  }

  // Pause auction
  pauseAuction(teamId, userName) {
    if (this.auctionState.phase !== 'active' || this.auctionState.isPaused) return false

    this.auctionState.isPaused = true
    this.auctionState.pausedBy = { teamId, userName }
    this.auctionState.pausedAt = Date.now()
    this.stopTicking()

    // Add system message
    this.addChatMessage(null, `⏸️ Auction paused by ${userName}`, 'system')

    // Broadcast pause event
    this.broadcastMessage({
      type: 'auction-paused',
      payload: {
        pausedBy: userName,
        message: `Auction paused by ${userName}`
      }
    })

    this.broadcastState()
    return true
  }

  // Resume auction
  resumeAuction(teamId, userName) {
    if (this.auctionState.phase !== 'active' || !this.auctionState.isPaused) return false

    this.auctionState.isPaused = false
    this.auctionState.pausedBy = null
    this.auctionState.pausedAt = null
    this.startTicking()

    // Add system message
    this.addChatMessage(null, `▶️ Auction resumed by ${userName}`, 'system')

    // Broadcast resume event
    this.broadcastMessage({
      type: 'auction-resumed',
      payload: {
        resumedBy: userName,
        message: `Auction resumed by ${userName}`
      }
    })

    this.broadcastState()
    return true
  }

  // Add chat message
  addChatMessage(userName, message, type = 'chat') {
    const chatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userName: userName || 'System',
      message,
      timestamp: Date.now(),
      type
    }

    // Keep only last 100 messages
    this.auctionState.chatMessages.push(chatMessage)
    if (this.auctionState.chatMessages.length > 100) {
      this.auctionState.chatMessages = this.auctionState.chatMessages.slice(-100)
    }

    // Broadcast new message
    this.broadcastMessage({
      type: 'chat-message',
      payload: chatMessage
    })

    return chatMessage
  }

  // Add custom player
  addCustomPlayer(player) {
    // Add to current player list
    const newPlayer = {
      id: `custom-${Date.now()}`,
      name: player.name,
      role: player.role || 'Batsman',
      basePrice: player.basePrice || 2,
      rating: player.rating || 75,
      stats: player.stats || { matches: 0, runs: 0, wickets: 0 },
      isCustom: true
    }

    // Add to the appropriate category
    const category = this.getCategoryFromRole(newPlayer.role)
    if (this.playerCategories[category]) {
      this.playerCategories[category].push(newPlayer)
    }

    // If current category matches, add to current players list
    const currentCategory = this.auctionState.categoryOrder[this.auctionState.categoryIndex]
    if (currentCategory === category) {
      this.players.push(newPlayer)
    }

    // Add system message
    this.addChatMessage(null, `✨ New player added: ${newPlayer.name} (${newPlayer.role}) - Base: ₹${newPlayer.basePrice}Cr`, 'system')

    this.broadcastState()
    return newPlayer
  }

  getCategoryFromRole(role) {
    const roleLower = role.toLowerCase()

    // Default to Capped sets for custom players
    if (roleLower.includes('bat')) return 'capped_batters'
    if (roleLower.includes('bowl')) return 'capped_fastbowlers'
    if (roleLower.includes('all')) return 'capped_allrounders'
    if (roleLower.includes('keep') || roleLower.includes('wicket')) return 'capped_wicketkeepers'

    return 'capped_batters'
  }

  completeAuction() {
    this.auctionState.phase = 'completed'
    this.stopTicking()

    // Calculate ratings
    const ratings = this.teams.map(team => ({
      teamId: team.id,
      teamName: team.name,
      ...calculateTeamRating(team),
    }))

    // Broadcast auction complete event
    const completeMessage = JSON.stringify({
      type: 'auction-complete',
      payload: {
        message: 'Auction completed!',
        ratings: ratings,
        finalTeams: this.teams
      }
    })

    this.clients.forEach((_, ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(completeMessage)
      }
    })

    this.broadcastResults(ratings)

    // Save results to database
    this.saveAuctionResults(ratings).catch(err => {
      console.error(`Failed to save results for room ${this.roomCode}:`, err.message)
    })
  }

  broadcastState() {
    const currentPlayer = this.players[this.auctionState.playerIndex]
    const currentCategory = this.auctionState.categoryOrder[this.auctionState.categoryIndex]

    // Build bid history with team names
    const enrichedBidHistory = this.auctionState.bidHistory.map(bid => {
      const team = this.teams.find(t => t.id === bid.team)
      return {
        teamId: bid.team,
        teamName: team ? team.name : 'Unknown',
        price: bid.price,
        timestamp: bid.timestamp
      }
    })

    const message = JSON.stringify({
      type: 'auction-state',
      payload: {
        teams: this.teams,
        currentPlayer: currentPlayer,
        currentPrice: this.auctionState.currentPrice,
        highestBidder: this.auctionState.highestBidder,
        bidHistory: enrichedBidHistory,
        timeLeft: this.auctionState.timeLeft,
        playerIndex: this.auctionState.playerIndex,
        totalPlayers: this.players.length,
        phase: this.auctionState.phase,
        roomCode: this.roomCode,

        // Enhanced auction info
        currentRound: this.auctionState.currentRound,
        maxRounds: this.auctionState.maxRounds,
        currentCategory: currentCategory,
        categoryName: this.getCategoryDisplayName(currentCategory),
        breakType: this.auctionState.breakType,
        breakTimeLeft: this.auctionState.breakTimeLeft,
        breakMessage: this.auctionState.breakMessage,
        strategicTimeouts: this.auctionState.strategicTimeouts,
        rtmAvailable: this.auctionState.rtmAvailable,
        totalPlayersSold: this.auctionState.totalPlayersSold,
        totalMoneySpent: this.auctionState.totalMoneySpent,
        unsoldPlayersCount: this.auctionState.unsoldPlayers.length,
        saleHistory: this.auctionState.saleHistory, // Include sale history
        isPaused: this.auctionState.isPaused,
        pausedBy: this.auctionState.pausedBy,
        chatMessages: this.auctionState.chatMessages.slice(-50), // Send last 50 messages

        // Voting info
        votingActive: this.votingActive,
        votesCount: this.endAuctionVotes.size,
        totalVoters: this.clients.size,
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
      console.log(`Results saved for room ${this.roomCode}`)
      return result
    } catch (error) {
      console.error(`ERROR: Error saving results for room ${this.roomCode}:`, error.message)
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
        console.log(`Saved purchase: ${player.name} → ${team.name} (₹${soldPrice}Cr)`)
      }
    } catch (error) {
      console.error(`ERROR: Error saving player purchase:`, error.message)
    }
  }

  getRoomInfo() {
    // Build player list
    const playersList = []
    this.clients.forEach((client) => {
      const team = this.teams.find(t => t.id === client.teamId)
      playersList.push({
        userName: client.userName,
        userId: client.userId,
        teamId: client.teamId,
        teamName: team ? team.name : null,
        isHost: client.isHost
      })
    })

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
      players: playersList,
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
        // Handle disconnection with grace period
        room.handleDisconnect(ws)
        room.broadcastState()

        // Don't delete room immediately, wait for potential reconnection
        // Room will only be deleted if it's truly empty (no active or disconnected users)
        const hasActiveClients = room.clients.size > 0
        const hasDisconnectedUsers = room.disconnectedUsers.size > 0

        if (!hasActiveClients && !hasDisconnectedUsers) {
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
  console.log(`Received message type: ${type}`)

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

    case 'player-ready':
      handlePlayerReady(ws, payload)
      break

    case 'start-auction':
      handleStartAuction(ws)
      break

    case 'bid':
      handleBid(ws, payload)
      break

    case 'strategic-timeout':
      handleStrategicTimeout(ws, payload)
      break

    case 'mark-unsold':
      handleMarkUnsold(ws, payload)
      break

    case 'pause-auction':
      handlePauseAuction(ws, payload)
      break

    case 'resume-auction':
      handleResumeAuction(ws, payload)
      break

    case 'chat-message':
      handleChatMessage(ws, payload)
      break

    case 'add-player':
      handleAddPlayer(ws, payload)
      break

    case 'list-rooms':
      handleListRooms(ws)
      break

    case 'leave-room':
      handleLeaveRoom(ws)
      break

    case 'get-room-state':
      handleGetRoomState(ws, payload)
      break

    case 'propose-end-auction':
      handleProposeEndAuction(ws)
      break

    case 'vote-end-auction':
      handleVoteEndAuction(ws, payload)
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

  // Add host as a client in the room
  room.addClient(ws, null, hostName || 'Host', hostId)

  console.log(`Room ${roomCode} created by ${hostName}`)

  // Save room to database
  saveRoomToDatabase(room).catch(err => {
    console.error(`Failed to save room ${roomCode} to database:`, err.message)
  })

  ws.send(JSON.stringify({
    type: 'room-created',
    payload: {
      roomCode,
      hostId,
      isHost: true,
      roomInfo: room.getRoomInfo(),
      availableTeams: room.teams,
      takenTeams: Array.from(room.takenTeams),
    },
  }))

  // Send initial lobby state (empty at creation)
  room.broadcastLobbyUpdate()
}

function handleJoinRoom(ws, payload) {
  const { roomCode, userName, userId, isReconnecting } = payload

  const room = rooms.get(roomCode)
  if (!room) {
    ws.send(JSON.stringify({
      type: 'error',
      payload: { message: 'Room not found' },
    }))
    return
  }

  // Check if this is a reconnection attempt
  if (isReconnecting && userId && room.canUserReconnect(userId)) {
    const disconnectedUser = room.getDisconnectedUserInfo(userId)

    // Restore user's previous state
    room.addClient(ws, disconnectedUser.teamId, userName, userId, true)
    clientRooms.set(ws, roomCode)

    console.log(`${userName} reconnecting to room ${roomCode}`)

    // Send full room state for sync
    ws.send(JSON.stringify({
      type: 'reconnected',
      payload: {
        roomCode,
        userId,
        teamId: disconnectedUser.teamId,
        roomInfo: room.getRoomInfo(),
        availableTeams: room.teams,
        isHost: userId === room.hostId,
        takenTeams: Array.from(room.takenTeams),
        auctionState: room.auctionState,
        currentPlayer: room.players[room.auctionState.playerIndex],
        message: 'Successfully reconnected! Syncing game state...'
      },
    }))

    // Broadcast updated state to all clients
    room.broadcastState()
    room.broadcastLobbyUpdate()
    return
  }

  // Check if this client is already in the room
  const existingClient = room.clients.get(ws)
  if (existingClient) {
    console.log(`${userName} already in room ${roomCode}, sending room-joined confirmation`)

    // Just send confirmation, don't add again
    ws.send(JSON.stringify({
      type: 'room-joined',
      payload: {
        roomCode,
        userId: existingClient.userId,
        roomInfo: room.getRoomInfo(),
        availableTeams: room.teams,
        isHost: existingClient.isHost,
        takenTeams: Array.from(room.takenTeams),
      },
    }))

    // Send current lobby state
    room.broadcastLobbyUpdate()
    return
  }

  if (room.clients.size >= 10) {
    ws.send(JSON.stringify({
      type: 'error',
      payload: { message: 'Room is full (max 10 players)' },
    }))
    return
  }

  // Check if this is a reconnection attempt OR a reclaim attempt
  let isTeamUnclaimed = false;
  if (isReconnecting && userId && !room.canUserReconnect(userId)) {
    // User isn't in disconnected list (maybe server restarted), check if their team is free
    // Actually, if server restarted, room.takenTeams is empty/fresh. 
    // But if user lost connection and reconnection period expired, team might be released.
    // If team is still marked 'taken' but no client has it, it's weird state.
    // Simpler: Allow joining if phase is not lobby?
  }

  // ALLOW LATE JOINING (Spectator or Reclaim)
  /* 
     If the room is active, we should allow users to join.
     If they have a valid teamID that is 'taken' but no active socket, give it back.
     Otherwise, join as spectator.
  */

  if (room.auctionState.phase !== 'lobby') {
    // Check if trying to reclaim a team
    const teamIdToReclaim = room.isTeamTakenButDisconnected(payload.teamId || userId) // Hypothetical

    // For now, simply allow joining. The client handles 'spectator' vs 'team' logic.
    // If they send a userId that matches a disconnected user, they get their seat back (handled above).
    // If they are new, they join as spectator.
    console.log(`User ${userName} joining active room ${roomCode} (Late Join / Spectator)`)
  }

  const playerId = userId || `player-${Date.now()}`
  room.addClient(ws, null, userName || 'Player', playerId, false)
  clientRooms.set(ws, roomCode)

  console.log(`${userName} joined room ${roomCode}`)

  // Send welcome message
  ws.send(JSON.stringify({
    type: 'room-joined',
    payload: {
      roomCode,
      userId: playerId,
      roomInfo: room.getRoomInfo(),
      availableTeams: room.teams,
      isHost: playerId === room.hostId,
      takenTeams: Array.from(room.takenTeams),
    },
  }))

  // Send initial lobby state to the new player
  room.broadcastLobbyUpdate()

  // Notify all clients about room update
  const updateMessage = JSON.stringify({
    type: 'room-update',
    payload: {
      roomInfo: room.getRoomInfo(),
      availableTeams: room.teams,
      takenTeams: Array.from(room.takenTeams),
    },
  })

  room.clients.forEach((_, clientWs) => {
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(updateMessage)
    }
  })
}

function handleSelectTeam(ws, payload) {
  const roomCode = clientRooms.get(ws)
  if (!roomCode) {
    console.log('ERROR: Select team: No room code found')
    return
  }

  const room = rooms.get(roomCode)
  if (!room) {
    console.log('ERROR: Select team: Room not found')
    return
  }

  const { teamId } = payload

  console.log(`Team selection attempt: teamId=${teamId}`)

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

    // Broadcast lobby update to all clients
    room.broadcastLobbyUpdate()

    // Broadcast room update to all clients
    const updateMessage = JSON.stringify({
      type: 'room-update',
      payload: {
        roomInfo: room.getRoomInfo(),
        availableTeams: room.teams,
        takenTeams: Array.from(room.takenTeams),
      },
    })

    room.clients.forEach((_, clientWs) => {
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(updateMessage)
      }
    })

    // Check if ready to start after team selection
    if (room.auctionState.phase === 'lobby' && room.clients.size >= room.minTeams) {
      room.notifyReadyToStart()
    }
  } else {
    console.log(`ERROR: Team ${teamId} is already taken or unavailable`)
    ws.send(JSON.stringify({
      type: 'team-taken-error',
      payload: {
        message: 'This team is already taken! Please select another team.',
        teamId
      }
    }))
  }
}

function handlePlayerReady(ws, payload) {
  const roomCode = clientRooms.get(ws)
  if (!roomCode) {
    console.log('ERROR: Player ready: No room code found')
    return
  }

  const room = rooms.get(roomCode)
  if (!room) {
    console.log('ERROR: Player ready: Room not found')
    return
  }

  const { ready } = payload
  const success = room.setPlayerReady(ws, ready)

  if (success) {
    const client = room.clients.get(ws)
    console.log(`${client.userName} is ${ready ? 'ready' : 'not ready'}`)

    // Broadcast lobby update to all clients
    room.broadcastLobbyUpdate()
  } else {
    ws.send(JSON.stringify({
      type: 'error',
      payload: { message: 'Could not set ready status' }
    }))
  }
}

function handleStartAuction(ws) {
  const roomCode = clientRooms.get(ws)
  if (!roomCode) {
    console.log('ERROR: No room code found for client')
    return
  }

  const room = rooms.get(roomCode)
  if (!room) {
    console.log('ERROR: Room not found:', roomCode)
    return
  }

  const client = room.clients.get(ws)

  console.log(`Start auction requested by ${client?.userName} in room ${roomCode}`)
  console.log(`   Players in room: ${room.clients.size}, Min teams: ${room.minTeams}`)

  // Only host can start the auction
  if (!client || !client.isHost) {
    console.log('ERROR: Not host or client not found')
    ws.send(JSON.stringify({
      type: 'error',
      payload: { message: 'Only the host can start the auction' },
    }))
    return
  }

  // Need minimum teams
  if (room.clients.size < room.minTeams) {
    console.log(`ERROR: Not enough teams: ${room.clients.size} < ${room.minTeams}`)
    ws.send(JSON.stringify({
      type: 'error',
      payload: { message: `Need at least ${room.minTeams} teams to start` },
    }))
    return
  }

  console.log('All validations passed, starting auction...')

  // Notify all clients that auction is starting
  const startMessage = JSON.stringify({
    type: 'start-auction',
    payload: { message: 'Auction is starting!' }
  })

  room.clients.forEach((_, clientWs) => {
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(startMessage)
    }
  })

  // Start the auction countdown
  const started = room.startCountdownTimer()
  if (!started) {
    console.log('ERROR: Failed to start countdown timer')
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

  // Prevent consecutive bids by the same team
  if (room.auctionState.highestBidder === teamId) {
    ws.send(JSON.stringify({
      type: 'error',
      payload: { message: 'You already hold the highest bid! Wait for another team to bid.' },
    }))
    return
  }

  const success = room.placeBid(teamId, amount)
  if (success) {
    room.broadcastState()
  }
}

function handleMarkUnsold(ws, payload) {
  const roomCode = clientRooms.get(ws)
  if (!roomCode) return

  const room = rooms.get(roomCode)
  if (!room) return

  const client = room.clients.get(ws)

  // Only host can mark players as unsold
  if (!client || !client.isHost) {
    ws.send(JSON.stringify({
      type: 'error',
      payload: { message: 'Only the host can mark players as unsold' },
    }))
    return
  }

  // Can only mark unsold during active phase
  if (room.auctionState.phase !== 'active') {
    ws.send(JSON.stringify({
      type: 'error',
      payload: { message: 'Can only mark players as unsold during active auction' },
    }))
    return
  }

  const success = room.markUnsold()
  if (success) {
    console.log(`Player marked as unsold by host in room ${roomCode}`)
  }
}

function handleStrategicTimeout(ws, payload) {
  const roomCode = clientRooms.get(ws)
  if (!roomCode) return

  const room = rooms.get(roomCode)
  if (!room) return

  const { teamId } = payload
  const client = room.clients.get(ws)

  if (!client || client.teamId !== teamId) {
    ws.send(JSON.stringify({
      type: 'error',
      payload: { message: 'You can only use timeout for your own team' },
    }))
    return
  }

  const success = room.requestStrategicTimeout(teamId)
  if (success) {
    ws.send(JSON.stringify({
      type: 'timeout-used',
      payload: {
        teamId,
        remaining: room.auctionState.strategicTimeouts[teamId]
      }
    }))
    room.broadcastState()
  } else {
    ws.send(JSON.stringify({
      type: 'error',
      payload: { message: 'No strategic timeouts remaining or auction not active' },
    }))
  }
}

function handlePauseAuction(ws, payload) {
  const roomCode = clientRooms.get(ws)
  if (!roomCode) return

  const room = rooms.get(roomCode)
  if (!room) return

  const client = room.clients.get(ws)
  if (!client) return

  // Only host can pause
  if (!client.isHost) {
    ws.send(JSON.stringify({
      type: 'error',
      payload: { message: 'Only the host can pause the auction' }
    }))
    return
  }

  const success = room.pauseAuction(client.teamId, client.userName)
  if (success) {
    console.log(`Auction paused by ${client.userName} in room ${roomCode}`)
  } else {
    ws.send(JSON.stringify({
      type: 'error',
      payload: { message: 'Cannot pause auction at this time' }
    }))
  }
}

function handleResumeAuction(ws, payload) {
  const roomCode = clientRooms.get(ws)
  if (!roomCode) return

  const room = rooms.get(roomCode)
  if (!room) return

  const client = room.clients.get(ws)
  if (!client) return

  // Only host can resume
  if (!client.isHost) {
    ws.send(JSON.stringify({
      type: 'error',
      payload: { message: 'Only the host can resume the auction' }
    }))
    return
  }

  // Allow anyone to resume the auction
  const success = room.resumeAuction(client.teamId, client.userName)
  if (success) {
    console.log(`Auction resumed by ${client.userName} in room ${roomCode}`)
  } else {
    ws.send(JSON.stringify({
      type: 'error',
      payload: { message: 'Cannot resume auction at this time' }
    }))
  }
}

function handleChatMessage(ws, payload) {
  const roomCode = clientRooms.get(ws)
  if (!roomCode) return

  const room = rooms.get(roomCode)
  if (!room) return

  const client = room.clients.get(ws)
  if (!client) return

  const { message } = payload
  if (!message || message.trim().length === 0) return
  if (message.length > 500) {
    ws.send(JSON.stringify({
      type: 'error',
      payload: { message: 'Message too long (max 500 characters)' }
    }))
    return
  }

  room.addChatMessage(client.userName, message.trim(), 'chat')
}

function handleAddPlayer(ws, payload) {
  const roomCode = clientRooms.get(ws)
  if (!roomCode) return

  const room = rooms.get(roomCode)
  if (!room) return

  const client = room.clients.get(ws)
  if (!client || !client.isHost) {
    ws.send(JSON.stringify({
      type: 'error',
      payload: { message: 'Only the host can add players' }
    }))
    return
  }

  const { player } = payload
  if (!player || !player.name) {
    ws.send(JSON.stringify({
      type: 'error',
      payload: { message: 'Player name is required' }
    }))
    return
  }

  const newPlayer = room.addCustomPlayer(player)

  ws.send(JSON.stringify({
    type: 'player-added',
    payload: {
      success: true,
      player: newPlayer
    }
  }))

  console.log(`Custom player ${player.name} added by ${client.userName} in room ${roomCode}`)
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
    // Use handleDisconnect for graceful disconnection with reconnection grace period
    room.handleDisconnect(ws)
    room.broadcastState()

    // Check if room should be deleted
    const hasActiveClients = room.clients.size > 0
    const hasDisconnectedUsers = room.disconnectedUsers.size > 0

    if (!hasActiveClients && !hasDisconnectedUsers) {
      rooms.delete(roomCode)
      console.log(`Room ${roomCode} deleted (empty)`)
    }
  }

  clientRooms.delete(ws)

  ws.send(JSON.stringify({
    type: 'left-room',
    payload: { success: true },
  }))
}

// Handle get-room-state request (for teams view page)
function handleGetRoomState(ws, payload) {
  const { roomCode } = payload || {}

  if (!roomCode) {
    ws.send(JSON.stringify({
      type: 'error',
      payload: { message: 'Room code required' }
    }))
    return
  }

  const room = rooms.get(roomCode)
  if (!room) {
    ws.send(JSON.stringify({
      type: 'error',
      payload: { message: 'Room not found' }
    }))
    return
  }

  // Send room state with teams data
  ws.send(JSON.stringify({
    type: 'room-state',
    teams: room.teams.map(t => ({
      id: t.id,
      name: t.name,
      budget: t.budget,
      maxPlayers: t.maxPlayers,
      players: t.players.map(p => ({
        id: p.id,
        name: p.name,
        role: p.role,
        basePrice: p.basePrice,
        soldPrice: p.soldPrice
      })),
      owner: room.teamOwners?.[t.id]?.userName || null
    })),
    phase: room.auctionPhase,
    currentRound: room.currentRound,
    totalPlayersSold: room.soldPlayers?.length || 0,
    totalMoneySpent: room.teams.reduce((sum, t) => {
      return sum + t.players.reduce((pSum, p) => pSum + (p.soldPrice || p.basePrice), 0)
    }, 0)
  }))
}

function handleProposeEndAuction(ws) {
  const roomCode = clientRooms.get(ws)
  if (!roomCode) return

  const room = rooms.get(roomCode)
  if (!room) return

  const client = room.clients.get(ws)
  if (!client || !client.isHost) {
    ws.send(JSON.stringify({
      type: 'error',
      payload: { message: 'Only the host can propose to end the auction' }
    }))
    return
  }

  if (room.votingActive) {
    ws.send(JSON.stringify({
      type: 'error',
      payload: { message: 'Voting is already in progress' }
    }))
    return
  }

  // Start voting
  room.votingActive = true
  room.endAuctionVotes.clear()

  // Auto-vote for host
  room.endAuctionVotes.add(client.userId)

  console.log(`End auction vote started in room ${roomCode} by ${client.userName}`)

  // Broadcast vote start
  room.broadcastMessage({
    type: 'vote-start',
    payload: {
      initiator: client.userName,
      votesNeeded: Math.ceil(room.clients.size / 2),
      currentVotes: 1,
      totalVoters: room.clients.size
    }
  })

  room.broadcastState()
}

function handleVoteEndAuction(ws, payload) {
  const roomCode = clientRooms.get(ws)
  if (!roomCode) return

  const room = rooms.get(roomCode)
  if (!room) return

  const client = room.clients.get(ws)
  if (!client) return

  if (!room.votingActive) {
    ws.send(JSON.stringify({
      type: 'error',
      payload: { message: 'No voting in progress' }
    }))
    return
  }

  const { vote } = payload // true = yes, false = no

  if (vote) {
    room.endAuctionVotes.add(client.userId)
  } else {
    room.endAuctionVotes.delete(client.userId)
  }

  const votesNeeded = Math.ceil(room.clients.size / 2)
  const currentVotes = room.endAuctionVotes.size

  console.log(`Vote update in room ${roomCode}: ${currentVotes}/${votesNeeded}`)

  if (currentVotes >= votesNeeded) {
    console.log(`Vote passed! Ending auction in room ${roomCode}`)
    room.votingActive = false
    room.completeAuction()
  } else {
    // Broadcast vote update
    room.broadcastMessage({
      type: 'vote-update',
      payload: {
        votesNeeded,
        currentVotes,
        totalVoters: room.clients.size
      }
    })
    room.broadcastState()
  }
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

// Start HTTP server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`\nIPL Auction Server is LIVE!`)
  console.log(`-----------------------------------------------------`)
  console.log(`HTTP Server: http://0.0.0.0:${PORT}`)
  console.log(`WebSocket Server: ws://0.0.0.0:${PORT}`)
  console.log(`Health Check: http://0.0.0.0:${PORT}/health`)
  console.log(`-----------------------------------------------------\n`)
  console.log(`Server is ready to accept connections!`)
})
