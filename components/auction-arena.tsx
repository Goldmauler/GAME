"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useInterval } from "@/hooks/use-interval"
import TeamSelection from "./team-selection"
import AuctioneerController from "./auctioneer-controller"
import PlayerAnalysisEnhanced from "./player-analysis-enhanced"
import BiddingStrategyDisplay from "./bidding-strategy-display"
import AuctionLeaderboard from "./auction-leaderboard"

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any
    }
  }
}

interface Team {
  id: string
  name: string
  color: string
  budget: number
  players: Player[]
  maxPlayers: number
  recentBids: number
}

interface Player {
  id: string
  name: string
  role: "Batsman" | "Bowler" | "All-rounder" | "Wicket-keeper"
  basePrice: number
  soldTo?: string
  soldPrice?: number
}

interface CurrentBid {
  playerIndex: number
  currentPrice: number
  highestBidder: string
  bidHistory: BidRecord[]
  timeLeft: number
}

interface BidRecord {
  team: string
  price: number
  timestamp: number
}

const TEAMS: Team[] = [
  {
    id: "1",
    name: "Mumbai Indians",
    color: "from-blue-600 to-blue-800",
    budget: 100,
    players: [],
    maxPlayers: 25,
    recentBids: 0,
  },
  {
    id: "2",
    name: "Chennai Super Kings",
    color: "from-yellow-600 to-yellow-800",
    budget: 100,
    players: [],
    maxPlayers: 25,
    recentBids: 0,
  },
  {
    id: "3",
    name: "Delhi Capitals",
    color: "from-purple-600 to-purple-800",
    budget: 100,
    players: [],
    maxPlayers: 25,
    recentBids: 0,
  },
  {
    id: "4",
    name: "Rajasthan Royals",
    color: "from-pink-600 to-pink-800",
    budget: 100,
    players: [],
    maxPlayers: 25,
    recentBids: 0,
  },
  {
    id: "5",
    name: "Kolkata Knight Riders",
    color: "from-slate-600 to-slate-800",
    budget: 100,
    players: [],
    maxPlayers: 25,
    recentBids: 0,
  },
  {
    id: "6",
    name: "Punjab Kings",
    color: "from-red-600 to-red-800",
    budget: 100,
    players: [],
    maxPlayers: 25,
    recentBids: 0,
  },
  {
    id: "7",
    name: "Sunrisers Hyderabad",
    color: "from-orange-600 to-orange-800",
    budget: 100,
    players: [],
    maxPlayers: 25,
    recentBids: 0,
  },
  {
    id: "8",
    name: "Lucknow Super Giants",
    color: "from-cyan-600 to-cyan-800",
    budget: 100,
    players: [],
    maxPlayers: 25,
    recentBids: 0,
  },
  {
    id: "9",
    name: "Bangalore Royals",
    color: "from-red-600 to-rose-800",
    budget: 100,
    players: [],
    maxPlayers: 25,
    recentBids: 0,
  },
  {
    id: "10",
    name: "Hyderabad Chargers",
    color: "from-emerald-600 to-emerald-800",
    budget: 100,
    players: [],
    maxPlayers: 25,
    recentBids: 0,
  },
]

const PLAYERS: Player[] = [
  ...Array.from({ length: 100 }, (_, i) => ({
    id: `player-${i}`,
    name:
      [
        "Virat Kohli",
        "Rohit Sharma",
        "MS Dhoni",
        "Rishabh Pant",
        "Suryakumar Yadav",
        "Jasprit Bumrah",
        "Yuzvendra Chahal",
        "Hardik Pandya",
      ][i % 8] || `Player ${i}`,
    role: ["Batsman", "Bowler", "All-rounder", "Wicket-keeper"][i % 4] as any,
    basePrice: 20 + Math.floor(Math.random() * 80),
  })),
]

export default function AuctionArena({ onComplete }: { onComplete: () => void }) {
  // Game phase: 'team-selection' -> 'active' -> 'completed'
  const [gamePhase, setGamePhase] = useState<"team-selection" | "active" | "completed">("team-selection")

  // Local fallback state (used before WS connects)
  const [teams, setTeams] = useState<Team[]>(TEAMS)
  const [playerIndex, setPlayerIndex] = useState(0)
  const [currentBid, setCurrentBid] = useState<CurrentBid>({
    playerIndex: 0,
    currentPrice: PLAYERS[0]?.basePrice || 1,
    highestBidder: "",
    bidHistory: [],
    timeLeft: 30,
  })
  const [auctionPhase, setAuctionPhase] = useState<"active" | "completed">("active")
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [lastBidTeam, setLastBidTeam] = useState<string>("")

  // End auction confirmation modal
  const [showEndAuctionModal, setShowEndAuctionModal] = useState(false)
  const [endConfirmText, setEndConfirmText] = useState("")

  // Withdraw state - tracks if user has withdrawn from current bidding
  const [hasWithdrawn, setHasWithdrawn] = useState(false)

  // WebSocket connection to auction server (optional)
  const wsRef = useRef<WebSocket | null>(null)
  const [wsConnected, setWsConnected] = useState(false)
  const [localTeamId, setLocalTeamId] = useState<string>("")
  const [results, setResults] = useState<any | null>(null)
  const [showTeamsTable, setShowTeamsTable] = useState(false)
  const [selectedTeamForAnalysis, setSelectedTeamForAnalysis] = useState<string | null>(null)

  // Set default team for analysis when teams table is opened
  useEffect(() => {
    if (showTeamsTable && !selectedTeamForAnalysis) {
      setSelectedTeamForAnalysis(localTeamId || teams[0].id)
    }
  }, [showTeamsTable, selectedTeamForAnalysis, localTeamId, teams])

  // Reset withdraw state when player changes
  useEffect(() => {
    setHasWithdrawn(false)
  }, [playerIndex])

  // Player analysis modal
  const [selectedPlayerForAnalysis, setSelectedPlayerForAnalysis] = useState<Player | null>(null)

  // Load saved auction state from sessionStorage on mount
  useEffect(() => {
    const savedState = sessionStorage.getItem('auctionState')
    if (savedState) {
      try {
        const state = JSON.parse(savedState)
        if (state.gamePhase) setGamePhase(state.gamePhase)
        if (state.teams) setTeams(state.teams)
        if (state.playerIndex !== undefined) setPlayerIndex(state.playerIndex)
        if (state.currentBid) setCurrentBid(state.currentBid)
        if (state.localTeamId) {
          setLocalTeamId(state.localTeamId)
        }
        if (state.auctionPhase) setAuctionPhase(state.auctionPhase)
        if (state.results) setResults(state.results)
      } catch (e) {
        console.error('Failed to load saved auction state:', e)
      }
    }
  }, [])

  // Save auction state to sessionStorage whenever key values change
  useEffect(() => {
    const stateToSave = {
      gamePhase,
      teams,
      playerIndex,
      currentBid,
      localTeamId,
      auctionPhase,
      results
    }
    sessionStorage.setItem('auctionState', JSON.stringify(stateToSave))
    // Also save teams separately for the Teams page to read
    sessionStorage.setItem('auctionTeams', JSON.stringify(teams))
  }, [gamePhase, teams, playerIndex, currentBid, localTeamId, auctionPhase, results])

  // Handle team selection
  const handleTeamSelect = (teamId: string) => {
    setLocalTeamId(teamId)
    setGamePhase("active")

    // Connect to WebSocket after team selection
    connectToServer(teamId)
  }

  // Allow team switching during auction
  const handleTeamSwitch = (teamId: string) => {
    setLocalTeamId(teamId)
  }

  const connectToServer = (teamId: string) => {
    // Attempt to connect to local auction server on port 8080
    try {
      const protocol = window.location.protocol === "https:" ? "wss" : "ws"
      const host = window.location.hostname || "localhost"
      const url = `${protocol}://${host}:8080`
      const ws = new WebSocket(url)
      wsRef.current = ws

      ws.onopen = () => {
        console.log("Connected to auction server", url)
        setWsConnected(true)
        ws.send(JSON.stringify({ type: "join", teamId: teamId }))
      }

      ws.onmessage = (evt: MessageEvent) => {
        try {
          const msg = JSON.parse(evt.data)
          if (msg.type === "welcome") {
            const { teams: sTeams, auctionState } = msg.payload
            setTeams(sTeams)
            setPlayerIndex(auctionState.playerIndex)
            setCurrentBid((prev: CurrentBid) => ({
              ...prev,
              playerIndex: auctionState.playerIndex,
              currentPrice: auctionState.currentPrice,
              highestBidder: auctionState.highestBidder || "",
              bidHistory: auctionState.bidHistory || [],
              timeLeft: auctionState.timeLeft || 30,
            }))
          }

          if (msg.type === 'state') {
            const { teams: sTeams, auctionState } = msg.payload
            setTeams(sTeams)
            setPlayerIndex(auctionState.playerIndex)
            setCurrentBid((prev: CurrentBid) => ({
              ...prev,
              playerIndex: auctionState.playerIndex,
              currentPrice: auctionState.currentPrice,
              highestBidder: auctionState.highestBidder || "",
              bidHistory: auctionState.bidHistory || [],
              timeLeft: auctionState.timeLeft || 30,
            }))
            if (auctionState.phase === 'completed') {
              setAuctionPhase('completed')
              setGamePhase('completed')
            }
          }

          if (msg.type === 'results') {
            // final ratings and analytics from server
            setResults(msg.payload)
          }
        } catch (e) {
          console.error("WS message parse error", e)
        }
      }

      ws.onclose = () => {
        console.log("Disconnected from auction server")
        setWsConnected(false)
        wsRef.current = null
      }
    } catch (e) {
      console.warn("WebSocket connection failed", e)
    }
  }

  // Removed: team change detection - team is now locked after selection

  const handlePlayerSold = () => {
    // If connected to a server, let server decide and broadcast next player
    if (wsRef.current && wsConnected) {
      // server will handle closing logic; client just updates UI when server broadcasts
      return
    }

    // Fallback local auctioneer (single-client simulation)
    if (currentBid.highestBidder) {
      const bidderTeam = teams.find((t: Team) => t.id === currentBid.highestBidder)
      if (bidderTeam) {
        const newTeams = teams.map((t: Team) =>
          t.id === currentBid.highestBidder
            ? {
              ...t,
              players: [...t.players, { ...PLAYERS[playerIndex], soldPrice: currentBid.currentPrice, soldTo: t.id }],
              budget: t.budget - currentBid.currentPrice,
              recentBids: 0,
            }
            : { ...t, recentBids: 0 },
        )
        setTeams(newTeams)
      }
    }

    if (playerIndex < PLAYERS.length - 1) {
      const nextIndex = playerIndex + 1
      setPlayerIndex(nextIndex)
      setCurrentBid((_: CurrentBid) => ({
        playerIndex: nextIndex,
        currentPrice: PLAYERS[nextIndex]?.basePrice || 20,
        highestBidder: "",
        bidHistory: [],
        timeLeft: 30,
      }))
      setLastBidTeam("")
    } else {
      setAuctionPhase("completed")
      setShowLeaderboard(true) // Show leaderboard when auction ends
    }
  }

  const handleBid = (teamId: string, amount: number) => {
    // If connected, forward to server and return (server will broadcast update)
    if (wsRef.current && wsConnected) {
      try {
        wsRef.current.send(JSON.stringify({ type: "bid", payload: { teamId, amount } }))
      } catch (e) {
        console.warn("Failed to send bid to server", e)
      }
      return
    }

    // Fallback client-side bidding
    const team = teams.find((t: Team) => t.id === teamId)
    if (team && team.budget >= amount && team.players.length < 25) {
      setCurrentBid((prev: CurrentBid) => ({
        ...prev,
        currentPrice: amount,
        highestBidder: teamId,
        bidHistory: [...prev.bidHistory, { team: teamId, price: amount, timestamp: Date.now() }],
        timeLeft: Math.max(5, 30), // Reset timer on new bid
      }))
      setLastBidTeam(teamId)
      setTeams((prev: Team[]) => prev.map((t: Team) => (t.id === teamId ? { ...t, recentBids: t.recentBids + 1 } : t)))
    }
  }

  // Handle withdraw from current bidding
  const handleWithdraw = () => {
    setHasWithdrawn(true)
    // If we're the highest bidder, we can't withdraw
    if (currentBid.highestBidder === localTeamId) {
      return // Can't withdraw if you're winning
    }
  }

  // Handle end auction confirmation
  const handleEndAuction = () => {
    if (endConfirmText.toLowerCase() === "end") {
      setShowEndAuctionModal(false)
      setEndConfirmText("")
      setAuctionPhase("completed")
      setShowLeaderboard(true)
    }
  }

  const currentPlayer = PLAYERS[playerIndex]
  const highestBidderTeam = teams.find((t: Team) => t.id === currentBid.highestBidder)

  // Show team selection screen first
  if (gamePhase === "team-selection") {
    return <TeamSelection teams={teams} onTeamSelect={handleTeamSelect} />
  }

  // Show leaderboard when auction is completed
  if (showLeaderboard) {
    return (
      <AuctionLeaderboard 
        teams={teams} 
        onClose={() => {
          setShowLeaderboard(false)
          onComplete()
        }}
        showAnimation={true}
      />
    )
  }

  return (
    <>
      {/* Player Analysis Modal */}
      <AnimatePresence>
        {selectedPlayerForAnalysis && (
          <PlayerAnalysisEnhanced
            player={selectedPlayerForAnalysis}
            onClose={() => setSelectedPlayerForAnalysis(null)}
          />
        )}
      </AnimatePresence>

      {/* End Auction Confirmation Modal */}
      <AnimatePresence>
        {showEndAuctionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setShowEndAuctionModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border border-red-500/50 shadow-2xl max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">🛑</div>
                <h2 className="text-2xl font-bold text-white mb-2">End Auction Early?</h2>
                <p className="text-gray-400 text-sm">
                  This will end the auction with your current team. Your team will be scored and shown on the leaderboard.
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm text-gray-400 mb-2">
                  Type <span className="text-red-400 font-bold">"end"</span> to confirm:
                </label>
                <input
                  type="text"
                  value={endConfirmText}
                  onChange={(e) => setEndConfirmText(e.target.value)}
                  placeholder="Type 'end' here..."
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
                  autoFocus
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowEndAuctionModal(false)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-4 py-3 rounded-lg font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEndAuction}
                  disabled={endConfirmText.toLowerCase() !== 'end'}
                  className={`flex-1 px-4 py-3 rounded-lg font-bold transition-all ${
                    endConfirmText.toLowerCase() === 'end'
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  End Auction
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Auction UI */}
      <div className="min-h-screen py-4 px-2 sm:py-8 sm:px-4">
        <div className="max-w-[1600px] mx-auto">
          {/* Main Auction Stage */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl sm:rounded-2xl p-3 sm:p-6 lg:p-8 border border-orange-500/30 mb-4 sm:mb-8 shadow-2xl"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Player Card */}
              <motion.div
                key={playerIndex}
                initial={{ opacity: 0, rotateY: 90 }}
                animate={{ opacity: 1, rotateY: 0 }}
                transition={{ duration: 0.6 }}
                className="lg:col-span-1"
              >
                <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl overflow-hidden shadow-2xl">
                  <div
                    className="aspect-video bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center relative overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setSelectedPlayerForAnalysis(currentPlayer)}
                    title="Click to view player details"
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-9xl animate-pulse"></div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                    <div className="absolute bottom-4 right-4 bg-orange-500/90 text-white px-3 py-1 rounded-full text-sm font-bold">
                      View Details
                    </div>
                  </div>
                  <div className="p-3 sm:p-6 bg-slate-900">
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white mb-1 sm:mb-2 truncate">{currentPlayer?.name}</h2>
                    <div className="flex items-center justify-between mb-2 sm:mb-4">
                      <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-orange-500/30 border border-orange-500 text-orange-300 rounded-full text-xs sm:text-sm font-bold">
                        {currentPlayer?.role}
                      </span>
                      <span className="text-gray-300 text-xs sm:text-sm">#{playerIndex + 1}/100</span>
                    </div>
                    <div className="text-xs sm:text-sm text-gray-400">
                      Base: <span className="text-orange-400 font-bold">₹{currentPlayer?.basePrice}Cr</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Bidding Info */}
              <div className="lg:col-span-2 space-y-6">
                {/* Current Bid */}
                <motion.div
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 0.5, repeat: Number.POSITIVE_INFINITY }}
                  className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-4 sm:p-6 lg:p-8 border border-orange-500/50"
                >
                  <p className="text-gray-400 text-xs sm:text-sm mb-1 sm:mb-2">CURRENT BID</p>
                  <motion.div
                    key={currentBid.currentPrice}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-3xl sm:text-5xl lg:text-6xl font-black text-orange-500 mb-2 sm:mb-4"
                  >
                    ₹{currentBid.currentPrice}Cr
                  </motion.div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2 sm:mb-4">
                    {highestBidderTeam ? (
                      <motion.div
                        key={highestBidderTeam.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3"
                      >
                        <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${highestBidderTeam.color}`}></div>
                        <span className="font-bold text-white">{highestBidderTeam.name}</span>
                        <motion.span
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.5, repeat: Number.POSITIVE_INFINITY }}
                          className="text-orange-400 font-bold"
                        >
                          LEADING
                        </motion.span>
                      </motion.div>
                    ) : (
                      <span className="text-gray-500">No bids yet</span>
                    )}
                  </div>

                  {/* Timer */}
                  <div className="relative">
                    <motion.div
                      initial={{ width: "100%" }}
                      animate={{ width: `${(currentBid.timeLeft / 30) * 100}%` }}
                      transition={{ duration: 1, ease: "linear" }}
                      className={`h-3 rounded-full transition-all ${currentBid.timeLeft > 10
                          ? "bg-gradient-to-r from-green-500 to-emerald-500"
                          : currentBid.timeLeft > 5
                            ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                            : "bg-gradient-to-r from-red-500 to-rose-500"
                        }`}
                    ></motion.div>
                    <div className="text-center mt-2 text-lg font-bold">
                      <span className={currentBid.timeLeft <= 5 ? "text-red-500 animate-pulse" : "text-gray-300"}>
                        {currentBid.timeLeft}s
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* Bid Buttons */}
                {/* Your Team Controls */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                    <label className="text-xs sm:text-sm text-gray-400 hidden sm:inline">Your Team:</label>
                    <div className="bg-slate-800 text-white px-2 sm:px-4 py-1.5 sm:py-2 rounded font-bold border border-orange-500/30 text-xs sm:text-sm truncate max-w-[120px] sm:max-w-none">
                      {teams.find((t: Team) => t.id === localTeamId)?.name || "Not Selected"}
                    </div>
                  </div>
                  {!hasWithdrawn && currentBid.highestBidder !== localTeamId ? (
                    <button
                      onClick={() => {
                        const bidAmount = currentBid.currentPrice + 5
                        handleBid(localTeamId, bidAmount)
                      }}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded font-bold transition-all text-xs sm:text-sm"
                      disabled={!localTeamId}
                    >
                      +₹5Cr
                    </button>
                  ) : hasWithdrawn ? (
                    <span className="text-yellow-400 text-xs font-medium px-2 py-1.5 bg-yellow-500/10 border border-yellow-500/30 rounded">
                      ⏸️ Withdrawn
                    </span>
                  ) : (
                    <span className="text-green-400 text-xs font-medium px-2 py-1.5 bg-green-500/10 border border-green-500/30 rounded">
                      ✓ Winning!
                    </span>
                  )}
                  <div className="ml-auto text-xs text-gray-400 hidden sm:block">WS: {wsConnected ? "✓" : "✗"}</div>
                </div>

                {/* Withdraw & End Auction Controls */}
                <div className="flex gap-2 sm:gap-3 mb-3 sm:mb-4">
                  {/* Withdraw Button */}
                  <button
                    onClick={handleWithdraw}
                    disabled={hasWithdrawn || currentBid.highestBidder === localTeamId}
                    className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded font-bold transition-all text-xs sm:text-sm ${
                      hasWithdrawn || currentBid.highestBidder === localTeamId
                        ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                        : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                    }`}
                  >
                    <span className="text-sm">⏸️</span>
                    <span className="hidden sm:inline">{hasWithdrawn ? 'Withdrawn' : currentBid.highestBidder === localTeamId ? "Can't" : 'Withdraw'}</span>
                  </button>

                  {/* End Auction Button */}
                  <button
                    onClick={() => setShowEndAuctionModal(true)}
                    className="flex items-center gap-1 sm:gap-2 bg-red-600 hover:bg-red-700 text-white px-2 sm:px-4 py-1.5 sm:py-2 rounded font-bold transition-all text-xs sm:text-sm ml-auto"
                  >
                    <span className="text-sm">🛑</span>
                    <span className="hidden sm:inline">End Auction</span>
                    <span className="sm:hidden">End</span>
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-1.5 sm:gap-3">
                  {[1, 2, 3, 4].map((multiplier) => (
                    <motion.button
                      key={multiplier}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        const bidAmount = currentBid.currentPrice + multiplier * 5
                        const eligibleTeams = teams.filter((t) => t.budget >= bidAmount && t.players.length < 25)
                        if (eligibleTeams.length > 0) {
                          const randomTeam = eligibleTeams[Math.floor(Math.random() * eligibleTeams.length)]
                          handleBid(randomTeam.id, bidAmount)
                        }
                      }}
                      className="bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 border border-orange-500/30 hover:border-orange-500 rounded-lg py-2 sm:py-3 px-2 sm:px-4 font-bold text-orange-400 transition-all text-xs sm:text-sm"
                    >
                      +₹{multiplier * 5}L
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
          {/* Results (shown when server broadcasts results) */}
          {results && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-indigo-900/80 rounded-lg p-6 border border-indigo-500/30 mt-6 text-white"
            >
              <div className="flex items-start justify-between">
                <h3 className="text-xl font-bold">Auction Results & Ratings</h3>
                <button
                  onClick={() => setResults(null)}
                  className="bg-white/10 text-white px-3 py-1 rounded"
                >
                  Close
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {results.ratings?.map((r: any) => {
                  const team = teams.find((t: Team) => t.id === r.teamId)
                  return (
                    <div key={r.teamId} className="bg-indigo-800/40 p-4 rounded">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold">{team?.name || r.teamId}</div>
                          <div className="text-sm text-indigo-200">Overall: {r.overallScore}</div>
                        </div>
                        <div className="text-sm text-indigo-100">Bat: {r.battingScore} • Bowl: {r.bowlingScore}</div>
                      </div>
                      <div className="mt-2 text-sm text-indigo-200">
                        Strengths: {r.strengths?.join(", ")}
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* Teams Grid with Activity Indicator */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4 mb-4 sm:mb-8">
            {teams.map((team: Team, idx: number) => {
              const isLeading = team.id === currentBid.highestBidder
              const justBid = team.id === lastBidTeam
              return (
                <motion.div
                  key={team.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`bg-gradient-to-br ${team.color} rounded-lg p-2 sm:p-4 border-2 transition-all relative overflow-hidden ${isLeading
                      ? "border-yellow-400 shadow-2xl shadow-yellow-400/50"
                      : justBid
                        ? "border-orange-400 shadow-lg shadow-orange-400/30"
                        : "border-slate-700"
                    }`}
                >
                  {justBid && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 1 }}
                      animate={{ scale: 1.2, opacity: 0 }}
                      transition={{ duration: 0.6 }}
                      className="absolute top-2 right-2 w-3 h-3 bg-orange-400 rounded-full"
                    />
                  )}
                  <h3 className="font-bold text-white text-xs sm:text-sm truncate mb-1 sm:mb-2 pr-6">{team.name}</h3>
                  <div className="space-y-0.5 sm:space-y-1 text-[10px] sm:text-xs text-white/80">
                    <p>
                      <span className="font-bold">{team.players.length}/25</span>
                    </p>
                    <p>
                      <span className="font-bold">₹{team.budget}Cr</span>
                    </p>
                    {team.id === localTeamId && (
                      <div className="absolute top-1 sm:top-2 left-1 sm:left-2 bg-indigo-700 text-white text-[8px] sm:text-xs font-bold px-1 sm:px-2 py-0.5 sm:py-1 rounded">YOU</div>
                    )}
                    {isLeading && (
                      <motion.p
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                        className="text-yellow-300 font-bold"
                      >
                        LEADING
                      </motion.p>
                    )}
                  </div>
                  <motion.div
                    animate={{ width: `${(team.budget / 1600) * 100}%` }}
                    transition={{ duration: 0.5 }}
                    className="h-2 bg-white/20 rounded-full mt-2 overflow-hidden"
                  >
                    <div className="h-full bg-white/60"></div>
                  </motion.div>
                </motion.div>
              )
            })}
          </div>

          {/* Bidding History Panel */}
          {currentBid.bidHistory.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-800 rounded-lg p-3 sm:p-6 border border-orange-500/20 mb-4 sm:mb-8"
            >
              <h3 className="font-bold text-orange-400 mb-2 sm:mb-4 text-sm sm:text-base">Bid History</h3>
              <div className="space-y-1.5 sm:space-y-2 max-h-32 sm:max-h-40 overflow-y-auto">
                <AnimatePresence>
                  {currentBid.bidHistory.map((bid: BidRecord, idx: number) => {
                    const bidTeam = teams.find((t: Team) => t.id === bid.team)
                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex items-center justify-between bg-slate-700/50 p-2 sm:p-3 rounded-lg text-xs sm:text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${bidTeam?.color}`}></div>
                          <span className="text-gray-300">{bidTeam?.name}</span>
                        </div>
                        <span className="text-orange-400 font-bold">₹{bid.price}Cr</span>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* Progress */}
          <motion.div className="bg-slate-800 rounded-lg p-3 sm:p-4 border border-orange-500/20 mb-4 sm:mb-8">
            <div className="flex items-center justify-between mb-1 sm:mb-2">
              <span className="text-gray-400 text-xs sm:text-sm">Progress</span>
              <span className="text-orange-500 font-bold text-xs sm:text-sm">{playerIndex + 1}/100</span>
            </div>
            <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${((playerIndex + 1) / 100) * 100}%` }}
                transition={{ duration: 0.5 }}
                className="h-full bg-gradient-to-r from-orange-500 to-red-500"
              ></motion.div>
            </div>
          </motion.div>

          {/* Teams Overview Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl sm:rounded-2xl p-3 sm:p-6 border border-orange-500/30 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-3 sm:mb-6">
              <h2 className="text-lg sm:text-2xl font-black text-white flex items-center gap-2 sm:gap-3">
                <span className="text-xl sm:text-3xl">🏆</span>
                <span className="hidden sm:inline">Teams Overview</span>
                <span className="sm:hidden">Teams</span>
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowTeamsTable(!showTeamsTable)}
                  className="px-2 sm:px-4 py-1.5 sm:py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-bold transition-all text-xs sm:text-sm"
                >
                  {showTeamsTable ? 'Hide Details' : 'Show Details'}
                </button>
              </div>
            </div>

            {/* Compact Teams Table - Hidden on mobile, shown on tablet+ */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-2 sm:py-3 px-2 sm:px-4 text-gray-400 font-semibold text-xs sm:text-sm">Team</th>
                    <th className="text-center py-2 sm:py-3 px-2 sm:px-4 text-gray-400 font-semibold text-xs sm:text-sm">Players</th>
                    <th className="text-right py-2 sm:py-3 px-2 sm:px-4 text-gray-400 font-semibold text-xs sm:text-sm">Budget</th>
                    <th className="text-right py-2 sm:py-3 px-2 sm:px-4 text-gray-400 font-semibold text-xs sm:text-sm">Spent</th>
                    <th className="text-center py-2 sm:py-3 px-2 sm:px-4 text-gray-400 font-semibold text-xs sm:text-sm">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map((team) => {
                    const isSelected = localTeamId === team.id
                    const spent = 100 - team.budget
                    return (
                      <motion.tr
                        key={team.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`border-b border-slate-700/50 hover:bg-slate-700/30 transition-all ${isSelected ? 'bg-orange-500/10' : ''
                          }`}
                      >
                        <td className="py-2 sm:py-3 px-2 sm:px-4">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className={`w-2 sm:w-3 h-2 sm:h-3 rounded-full bg-gradient-to-r ${team.color}`}></div>
                            <span className={`font-semibold text-xs sm:text-sm ${isSelected ? 'text-orange-400' : 'text-white'}`}>
                              {team.name}
                              {isSelected && <span className="ml-1 sm:ml-2 text-[10px] sm:text-xs text-orange-500">(You)</span>}
                            </span>
                          </div>
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-center">
                          <span className="text-white font-bold text-xs sm:text-sm">{team.players.length}</span>
                          <span className="text-gray-500 text-[10px] sm:text-sm">/{team.maxPlayers}</span>
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-right">
                          <span className={`font-bold text-xs sm:text-sm ${team.budget < 20 ? 'text-red-400' : 'text-green-400'}`}>
                            ₹{team.budget}Cr
                          </span>
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-right">
                          <span className="text-orange-400 font-bold text-xs sm:text-sm">₹{spent}Cr</span>
                        </td>
                        <td className="py-2 sm:py-3 px-2 sm:px-4 text-center">
                          {!isSelected && (
                            <button
                              onClick={() => handleTeamSwitch(team.id)}
                              className="px-2 sm:px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs sm:text-sm rounded-lg font-semibold transition-all"
                            >
                              Switch
                            </button>
                          )}
                          {isSelected && (
                            <span className="text-orange-500 text-xs sm:text-sm font-semibold">Active</span>
                          )}
                        </td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Teams List - Shown only on mobile */}
            <div className="sm:hidden space-y-2">
              {teams.map((team) => {
                const isSelected = localTeamId === team.id
                const spent = 100 - team.budget
                return (
                  <div
                    key={team.id}
                    className={`bg-slate-800/50 rounded-lg p-3 border ${isSelected ? 'border-orange-500' : 'border-slate-700'}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${team.color}`}></div>
                        <span className={`font-semibold text-sm ${isSelected ? 'text-orange-400' : 'text-white'}`}>
                          {team.name}
                          {isSelected && <span className="ml-1 text-[10px] text-orange-500">(You)</span>}
                        </span>
                      </div>
                      {!isSelected && (
                        <button
                          onClick={() => handleTeamSwitch(team.id)}
                          className="px-2 py-1 bg-blue-500 text-white text-[10px] rounded font-semibold"
                        >
                          Switch
                        </button>
                      )}
                    </div>
                    <div className="flex justify-between text-[11px] text-gray-400">
                      <span>Players: <span className="text-white font-bold">{team.players.length}/25</span></span>
                      <span>Budget: <span className="text-green-400 font-bold">₹{team.budget}Cr</span></span>
                      <span>Spent: <span className="text-orange-400 font-bold">₹{spent}Cr</span></span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Detailed Teams View */}
            <AnimatePresence>
              {showTeamsTable && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 sm:mt-6"
                >
                  {/* Team Selection Tabs */}
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-6 p-2 bg-slate-900/50 rounded-xl border border-slate-700">
                    {teams.map((team) => (
                      <button
                        key={team.id}
                        onClick={() => setSelectedTeamForAnalysis(team.id)}
                        className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold transition-all text-xs sm:text-sm ${selectedTeamForAnalysis === team.id
                            ? 'bg-gradient-to-r ' + team.color + ' text-white shadow-lg'
                            : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
                          }`}
                      >
                        <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${team.color}`}></div>
                        <span className="text-sm">{team.name}</span>
                        {localTeamId === team.id && (
                          <span className="text-xs bg-orange-500/30 px-1.5 py-0.5 rounded">YOU</span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Selected Team Analysis */}
                  <AnimatePresence mode="wait">
                    {selectedTeamForAnalysis && (() => {
                      const team = teams.find(t => t.id === selectedTeamForAnalysis)
                      if (!team) return null

                      const batsmen = team.players.filter(p => p.role === "Batsman")
                      const bowlers = team.players.filter(p => p.role === "Bowler")
                      const allRounders = team.players.filter(p => p.role === "All-rounder")
                      const wicketKeepers = team.players.filter(p => p.role === "Wicket-keeper")

                      return (
                        <motion.div
                          key={team.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3 }}
                          className="space-y-4 sm:space-y-6"
                        >
                          {/* Team Summary Card */}
                          <div className={`bg-gradient-to-br ${team.color} rounded-xl p-4 sm:p-6 shadow-2xl`}>
                            <div className="flex items-center justify-between mb-3 sm:mb-4">
                              <div>
                                <h2 className="text-xl sm:text-3xl font-black text-white mb-1 sm:mb-2">{team.name}</h2>
                                {localTeamId === team.id && (
                                  <span className="bg-orange-500 text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-bold">
                                    Your Team
                                  </span>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="text-white/80 text-[10px] sm:text-sm">Players</p>
                                <p className="text-2xl sm:text-4xl font-black text-white">{team.players.length}</p>
                                <p className="text-white/60 text-[10px] sm:text-xs">of {team.maxPlayers}</p>
                              </div>
                            </div>

                            {/* Budget and Stats */}
                            <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-4 sm:mt-6">
                              <div className="bg-white/10 backdrop-blur rounded-lg p-2 sm:p-4 text-center">
                                <p className="text-white/80 text-[10px] sm:text-xs mb-0.5 sm:mb-1">Budget</p>
                                <p className="text-lg sm:text-2xl font-black text-white">₹{team.budget}</p>
                                <p className="text-white/60 text-[9px] sm:text-xs">Crores</p>
                              </div>
                              <div className="bg-white/10 backdrop-blur rounded-lg p-2 sm:p-4 text-center">
                                <p className="text-white/80 text-[10px] sm:text-xs mb-0.5 sm:mb-1">Spent</p>
                                <p className="text-lg sm:text-2xl font-black text-white">₹{100 - team.budget}</p>
                                <p className="text-white/60 text-[9px] sm:text-xs">Crores</p>
                              </div>
                              <div className="bg-white/10 backdrop-blur rounded-lg p-2 sm:p-4 text-center">
                                <p className="text-white/80 text-[10px] sm:text-xs mb-0.5 sm:mb-1">Avg.</p>
                                <p className="text-lg sm:text-2xl font-black text-white">
                                  ₹{team.players.length > 0 ? ((100 - team.budget) / team.players.length).toFixed(1) : '0'}
                                </p>
                                <p className="text-white/60 text-[9px] sm:text-xs">Per Player</p>
                              </div>
                            </div>

                            {/* Squad Composition */}
                            <div className="grid grid-cols-4 gap-1.5 sm:gap-3 mt-4 sm:mt-6">
                              <div className="bg-blue-500/20 backdrop-blur rounded-lg p-1.5 sm:p-3 text-center border border-blue-400/30">
                                <p className="text-blue-200 text-[9px] sm:text-xs mb-0.5 sm:mb-1">Bat</p>
                                <p className="text-lg sm:text-2xl font-black text-white">{batsmen.length}</p>
                              </div>
                              <div className="bg-red-500/20 backdrop-blur rounded-lg p-1.5 sm:p-3 text-center border border-red-400/30">
                                <p className="text-red-200 text-[9px] sm:text-xs mb-0.5 sm:mb-1">Bowl</p>
                                <p className="text-lg sm:text-2xl font-black text-white">{bowlers.length}</p>
                              </div>
                              <div className="bg-purple-500/20 backdrop-blur rounded-lg p-1.5 sm:p-3 text-center border border-purple-400/30">
                                <p className="text-purple-200 text-[9px] sm:text-xs mb-0.5 sm:mb-1">AR</p>
                                <p className="text-lg sm:text-2xl font-black text-white">{allRounders.length}</p>
                              </div>
                              <div className="bg-green-500/20 backdrop-blur rounded-lg p-1.5 sm:p-3 text-center border border-green-400/30">
                                <p className="text-green-200 text-[9px] sm:text-xs mb-0.5 sm:mb-1">WK</p>
                                <p className="text-lg sm:text-2xl font-black text-white">{wicketKeepers.length}</p>
                              </div>
                            </div>
                          </div>

                          {/* Squad List by Role */}
                          {team.players.length > 0 ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
                              {/* Batsmen */}
                              {batsmen.length > 0 && (
                                <div className="bg-slate-800 rounded-xl p-3 sm:p-5 border border-blue-500/30">
                                  <h3 className="text-base sm:text-xl font-bold text-blue-400 mb-2 sm:mb-4 flex items-center gap-2">
                                    <span className="text-lg sm:text-2xl">🏏</span>
                                    Batsmen ({batsmen.length})
                                  </h3>
                                  <div className="space-y-1.5 sm:space-y-2 max-h-48 overflow-y-auto">
                                    {batsmen.map((player, idx) => (
                                      <div
                                        key={idx}
                                        className="bg-slate-700/50 rounded-lg p-2 sm:p-3 hover:bg-slate-700 transition-all"
                                      >
                                        <div className="flex justify-between items-center">
                                          <div>
                                            <p className="text-white font-semibold text-xs sm:text-sm truncate max-w-[120px] sm:max-w-none">{player.name}</p>
                                            <p className="text-gray-400 text-[10px] sm:text-xs">Base: ₹{player.basePrice}Cr</p>
                                          </div>
                                          <div className="text-right">
                                            <p className="text-orange-400 font-bold text-xs sm:text-sm">₹{player.soldPrice}Cr</p>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Bowlers */}
                              {bowlers.length > 0 && (
                                <div className="bg-slate-800 rounded-xl p-3 sm:p-5 border border-red-500/30">
                                  <h3 className="text-base sm:text-xl font-bold text-red-400 mb-2 sm:mb-4 flex items-center gap-2">
                                    <span className="text-lg sm:text-2xl">🎯</span>
                                    Bowlers ({bowlers.length})
                                  </h3>
                                  <div className="space-y-1.5 sm:space-y-2 max-h-48 overflow-y-auto">
                                    {bowlers.map((player, idx) => (
                                      <div
                                        key={idx}
                                        className="bg-slate-700/50 rounded-lg p-2 sm:p-3 hover:bg-slate-700 transition-all"
                                      >
                                        <div className="flex justify-between items-center">
                                          <div>
                                            <p className="text-white font-semibold text-xs sm:text-sm truncate max-w-[120px] sm:max-w-none">{player.name}</p>
                                            <p className="text-gray-400 text-[10px] sm:text-xs">Base: ₹{player.basePrice}Cr</p>
                                          </div>
                                          <div className="text-right">
                                            <p className="text-orange-400 font-bold text-xs sm:text-sm">₹{player.soldPrice}Cr</p>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* All-Rounders */}
                              {allRounders.length > 0 && (
                                <div className="bg-slate-800 rounded-xl p-3 sm:p-5 border border-purple-500/30">
                                  <h3 className="text-base sm:text-xl font-bold text-purple-400 mb-2 sm:mb-4 flex items-center gap-2">
                                    <span className="text-lg sm:text-2xl">⭐</span>
                                    All-Rounders ({allRounders.length})
                                  </h3>
                                  <div className="space-y-1.5 sm:space-y-2 max-h-48 overflow-y-auto">
                                    {allRounders.map((player, idx) => (
                                      <div
                                        key={idx}
                                        className="bg-slate-700/50 rounded-lg p-2 sm:p-3 hover:bg-slate-700 transition-all"
                                      >
                                        <div className="flex justify-between items-center">
                                          <div>
                                            <p className="text-white font-semibold text-xs sm:text-sm truncate max-w-[120px] sm:max-w-none">{player.name}</p>
                                            <p className="text-gray-400 text-[10px] sm:text-xs">Base: ₹{player.basePrice}Cr</p>
                                          </div>
                                          <div className="text-right">
                                            <p className="text-orange-400 font-bold text-xs sm:text-sm">₹{player.soldPrice}Cr</p>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Wicket-Keepers */}
                              {wicketKeepers.length > 0 && (
                                <div className="bg-slate-800 rounded-xl p-3 sm:p-5 border border-green-500/30">
                                  <h3 className="text-base sm:text-xl font-bold text-green-400 mb-2 sm:mb-4 flex items-center gap-2">
                                    <span className="text-lg sm:text-2xl">🧤</span>
                                    WK ({wicketKeepers.length})
                                  </h3>
                                  <div className="space-y-1.5 sm:space-y-2 max-h-48 overflow-y-auto">
                                    {wicketKeepers.map((player, idx) => (
                                      <div
                                        key={idx}
                                        className="bg-slate-700/50 rounded-lg p-2 sm:p-3 hover:bg-slate-700 transition-all"
                                      >
                                        <div className="flex justify-between items-center">
                                          <div>
                                            <p className="text-white font-semibold text-xs sm:text-sm truncate max-w-[120px] sm:max-w-none">{player.name}</p>
                                            <p className="text-gray-400 text-[10px] sm:text-xs">Base: ₹{player.basePrice}Cr</p>
                                          </div>
                                          <div className="text-right">
                                            <p className="text-orange-400 font-bold text-xs sm:text-sm">₹{player.soldPrice}Cr</p>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="bg-slate-800 rounded-xl p-6 sm:p-12 text-center border border-slate-700">
                              <p className="text-2xl sm:text-4xl mb-2 sm:mb-4">🏏</p>
                              <p className="text-gray-400 text-sm sm:text-lg">No players purchased yet</p>
                              <p className="text-gray-500 text-xs sm:text-sm mt-1 sm:mt-2">Start bidding to build your squad!</p>
                            </div>
                          )}
                        </motion.div>
                      )
                    })()}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </>
  )
}
