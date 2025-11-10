const WebSocket = require("ws")
const { calculateTeamRating } = require("./team-rating")
const { createPlayers: fetchRealPlayers } = require("../lib/fetch-players")

const PORT = process.env.AUCTION_PORT || 8080

const wss = new WebSocket.Server({ port: PORT })

console.log(`Auction server starting on ws://localhost:${PORT}`)

// Create teams
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

const teams = TEAMS.map((name, i) => ({
  id: String(i + 1),
  name,
  budget: 100, // 100 Cr per team
  players: [],
  maxPlayers: 25,
}))

// Use real IPL players
const PLAYERS = fetchRealPlayers()

let clients = new Map() // ws -> {teamId}

let auctionState = {
  playerIndex: 0,
  currentPrice: PLAYERS[0].basePrice,
  highestBidder: null,
  bidHistory: [],
  timeLeft: 30,
  phase: "active",
}

let resultsBroadcasted = false

function broadcast(obj) {
  const msg = JSON.stringify(obj)
  wss.clients.forEach((c) => {
    if (c.readyState === WebSocket.OPEN) c.send(msg)
  })
}

function broadcastState() {
  broadcast({ type: "state", payload: { teams, players: PLAYERS, auctionState } })
}

function nextPlayer() {
  const soldTo = auctionState.highestBidder
  const price = auctionState.currentPrice

  if (soldTo) {
    const t = teams.find((x) => x.id === soldTo)
    if (t) {
      t.players.push({ ...PLAYERS[auctionState.playerIndex], soldPrice: price })
      t.budget = Math.max(0, Math.round((t.budget - price) * 10) / 10)
    }
  }

  if (auctionState.playerIndex < PLAYERS.length - 1) {
    auctionState.playerIndex += 1
    auctionState.currentPrice = PLAYERS[auctionState.playerIndex].basePrice
    auctionState.highestBidder = null
    auctionState.bidHistory = []
    auctionState.timeLeft = 30
  } else {
    auctionState.phase = "completed"
  }
  broadcastState()
}

function generateAuctionAnalytics(soldPlayers) {
  const analytics = {
    totalSpent: 0,
    averagePrice: 0,
    pricierPlayers: [],
    bargains: [],
    teamSpending: {},
  }

  soldPlayers.forEach(({ price, teamId, player }) => {
    analytics.totalSpent += price
    analytics.teamSpending[teamId] = (analytics.teamSpending[teamId] || 0) + price
  })

  analytics.averagePrice = soldPlayers.length ? analytics.totalSpent / soldPlayers.length : 0

  soldPlayers.forEach((item) => {
    if (item.price > analytics.averagePrice * 1.5) analytics.pricierPlayers.push(item)
    else if (item.price < analytics.averagePrice * 0.7) analytics.bargains.push(item)
  })

  return analytics
}

const { generateTeamBiddingProfile, calculateNextBid, getNextBidder } = require("./auction-logic")

// Prepare bidding profiles
let teamProfiles = {}
function initProfiles() {
  teamProfiles = {}
  teams.forEach((t) => {
    teamProfiles[t.id] = generateTeamBiddingProfile(t, PLAYERS)
  })
}
initProfiles()

// AI bidding using repository heuristics
function aiTick() {
  if (auctionState.phase !== "active") return
  const currentPrice = auctionState.currentPrice
  const currentPlayer = PLAYERS[auctionState.playerIndex]

  // update profiles periodically
  teams.forEach((t) => {
    teamProfiles[t.id] = generateTeamBiddingProfile(t, PLAYERS)
  })

  const context = {
    currentPrice,
    basePrice: currentPlayer.basePrice,
    highestBidder: auctionState.highestBidder,
    remainingTime: auctionState.timeLeft,
    player: currentPlayer,
  }

  const nextBidderId = getNextBidder(teams, context, teamProfiles)
  if (!nextBidderId) return

  const bidder = teams.find((t) => t.id === nextBidderId)
  const profile = teamProfiles[nextBidderId]
  if (!bidder || !profile) return

  const nextAmount = calculateNextBid(currentPrice, bidder, profile, context)
  if (nextAmount > currentPrice && bidder.budget >= nextAmount) {
    auctionState.currentPrice = nextAmount
    auctionState.highestBidder = bidder.id
    auctionState.bidHistory.push({ team: bidder.id, price: nextAmount, timestamp: Date.now() })
    auctionState.timeLeft = Math.max(5, 30)
    console.log(`AI ${bidder.name} bids ${nextAmount}Cr on ${currentPlayer.name}`)
  }
}

// Auction tick (1s)
setInterval(() => {
  if (auctionState.phase === "active") {
    auctionState.timeLeft -= 1
    if (auctionState.timeLeft <= 0) nextPlayer()
    aiTick()
    broadcastState()
  } else if (auctionState.phase === "completed" && !resultsBroadcasted) {
    // compute final ratings and analytics
    const sold = []
    teams.forEach((t) => {
      t.players.forEach((p) => sold.push({ teamId: t.id, teamName: t.name, player: p, price: p.soldPrice || 0 }))
    })
    const analytics = generateAuctionAnalytics(sold.map((s) => ({ price: s.price, teamId: s.teamId, player: s.player })))

    // compute ratings per team
    const ratings = teams.map((t) => calculateTeamRating(t))

    broadcast({ type: "results", payload: { ratings, analytics } })
    resultsBroadcasted = true
  }
}, 1000)

wss.on("connection", function connection(ws) {
  console.log("Client connected")
  clients.set(ws, { teamId: null })

  ws.on("message", function incoming(message) {
    try {
      const msg = JSON.parse(message)
      if (msg.type === "join") {
        clients.set(ws, { teamId: msg.teamId })
        ws.send(JSON.stringify({ type: "joined", payload: { teamId: msg.teamId } }))
        broadcastState()
      }

      if (msg.type === "bid") {
        const { teamId, amount } = msg.payload || {}
        // validate
        const team = teams.find((t) => t.id === teamId)
        if (!team) return
        if (team.budget < amount) return
        if (amount <= auctionState.currentPrice) return
        if (team.players.length >= team.maxPlayers) return

        auctionState.currentPrice = amount
        auctionState.highestBidder = teamId
        auctionState.bidHistory.push({ team: teamId, price: amount, timestamp: Date.now() })
        auctionState.timeLeft = Math.max(5, 30)

        console.log(`Received bid from ${team.name}: ${amount}Cr`)
        broadcastState()
      }
    } catch (e) {
      console.error("Invalid message", e)
    }
  })

  ws.on("close", () => {
    console.log("Client disconnected")
    clients.delete(ws)
  })

  // Send initial state
  ws.send(JSON.stringify({ type: "welcome", payload: { teams, players: PLAYERS, auctionState } }))
})

process.on("SIGINT", () => {
  console.log("Shutting down server...")
  wss.close(() => process.exit(0))
})
