"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useInterval } from "@/hooks/use-interval"

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
    budget: 1600,
    players: [],
    maxPlayers: 25,
    recentBids: 0,
  },
  {
    id: "2",
    name: "Chennai Super Kings",
    color: "from-yellow-600 to-yellow-800",
    budget: 1600,
    players: [],
    maxPlayers: 25,
    recentBids: 0,
  },
  {
    id: "3",
    name: "Delhi Capitals",
    color: "from-purple-600 to-purple-800",
    budget: 1600,
    players: [],
    maxPlayers: 25,
    recentBids: 0,
  },
  {
    id: "4",
    name: "Rajasthan Royals",
    color: "from-pink-600 to-pink-800",
    budget: 1600,
    players: [],
    maxPlayers: 25,
    recentBids: 0,
  },
  {
    id: "5",
    name: "Kolkata Knight Riders",
    color: "from-slate-600 to-slate-800",
    budget: 1600,
    players: [],
    maxPlayers: 25,
    recentBids: 0,
  },
  {
    id: "6",
    name: "Punjab Kings",
    color: "from-red-600 to-red-800",
    budget: 1600,
    players: [],
    maxPlayers: 25,
    recentBids: 0,
  },
  {
    id: "7",
    name: "Sunrisers Hyderabad",
    color: "from-orange-600 to-orange-800",
    budget: 1600,
    players: [],
    maxPlayers: 25,
    recentBids: 0,
  },
  {
    id: "8",
    name: "Lucknow Super Giants",
    color: "from-cyan-600 to-cyan-800",
    budget: 1600,
    players: [],
    maxPlayers: 25,
    recentBids: 0,
  },
  {
    id: "9",
    name: "Bangalore Royals",
    color: "from-red-600 to-rose-800",
    budget: 1600,
    players: [],
    maxPlayers: 25,
    recentBids: 0,
  },
  {
    id: "10",
    name: "Hyderabad Chargers",
    color: "from-emerald-600 to-emerald-800",
    budget: 1600,
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
  const [teams, setTeams] = useState<Team[]>(TEAMS)
  const [playerIndex, setPlayerIndex] = useState(0)
  const [currentBid, setCurrentBid] = useState<CurrentBid>({
    playerIndex: 0,
    currentPrice: PLAYERS[0]?.basePrice || 20,
    highestBidder: "",
    bidHistory: [],
    timeLeft: 30,
  })
  const [auctionPhase, setAuctionPhase] = useState<"active" | "completed">("active")
  const [lastBidTeam, setLastBidTeam] = useState<string>("")

  useInterval(() => {
    if (auctionPhase === "active" && currentBid.timeLeft > 0) {
      setCurrentBid((prev) => ({ ...prev, timeLeft: prev.timeLeft - 1 }))
    } else if (auctionPhase === "active" && currentBid.timeLeft === 0) {
      handlePlayerSold()
    }
  }, 1000)

  useInterval(() => {
    if (auctionPhase === "active" && currentBid.timeLeft > 5 && Math.random() > 0.5) {
      const currentPrice = currentBid.currentPrice
      const potentialBidders = teams.filter((t) => {
        const hasEnoughBudget = t.budget >= currentPrice + 5
        const hasSlots = t.players.length < 25
        const isNotCurrentBidder = t.id !== currentBid.highestBidder
        return hasEnoughBudget && hasSlots && isNotCurrentBidder
      })

      if (potentialBidders.length > 0) {
        const randomTeam = potentialBidders[Math.floor(Math.random() * potentialBidders.length)]
        const bidAmount = currentPrice + 5
        handleBid(randomTeam.id, bidAmount)
      }
    }
  }, 2000)

  const handlePlayerSold = () => {
    if (currentBid.highestBidder) {
      const bidderTeam = teams.find((t) => t.id === currentBid.highestBidder)
      if (bidderTeam) {
        const newTeams = teams.map((t) =>
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
      setCurrentBid({
        playerIndex: nextIndex,
        currentPrice: PLAYERS[nextIndex]?.basePrice || 20,
        highestBidder: "",
        bidHistory: [],
        timeLeft: 30,
      })
      setLastBidTeam("")
    } else {
      setAuctionPhase("completed")
      onComplete()
    }
  }

  const handleBid = (teamId: string, amount: number) => {
    const team = teams.find((t) => t.id === teamId)
    if (team && team.budget >= amount && team.players.length < 25) {
      setCurrentBid((prev) => ({
        ...prev,
        currentPrice: amount,
        highestBidder: teamId,
        bidHistory: [...prev.bidHistory, { team: teamId, price: amount, timestamp: Date.now() }],
        timeLeft: Math.max(5, 30), // Reset timer on new bid
      }))
      setLastBidTeam(teamId)
      setTeams((prev) => prev.map((t) => (t.id === teamId ? { ...t, recentBids: t.recentBids + 1 } : t)))
    }
  }

  const currentPlayer = PLAYERS[playerIndex]
  const highestBidderTeam = teams.find((t) => t.id === currentBid.highestBidder)

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Main Auction Stage */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border border-orange-500/30 mb-8 shadow-2xl"
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
                <div className="aspect-video bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-9xl animate-pulse">🏏</div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                </div>
                <div className="p-6 bg-slate-900">
                  <h2 className="text-3xl font-black text-white mb-2">{currentPlayer?.name}</h2>
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 bg-orange-500/30 border border-orange-500 text-orange-300 rounded-full text-sm font-bold">
                      {currentPlayer?.role}
                    </span>
                    <span className="text-gray-300">#{playerIndex + 1}/100</span>
                  </div>
                  <div className="text-sm text-gray-400">
                    Base Price: <span className="text-orange-400 font-bold">₹{currentPlayer?.basePrice}L</span>
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
                className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-8 border border-orange-500/50"
              >
                <p className="text-gray-400 text-sm mb-2">CURRENT BID</p>
                <motion.div
                  key={currentBid.currentPrice}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-6xl font-black text-orange-500 mb-4"
                >
                  ₹{currentBid.currentPrice}L
                </motion.div>
                <div className="flex items-center justify-between mb-4">
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
                        🔴 LEADING
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
                    className={`h-3 rounded-full transition-all ${
                      currentBid.timeLeft > 10
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
              <div className="grid grid-cols-2 gap-3">
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
                    className="bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 border border-orange-500/30 hover:border-orange-500 rounded-lg py-3 px-4 font-bold text-orange-400 transition-all"
                  >
                    +₹{multiplier * 5}L
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Teams Grid with Activity Indicator */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {teams.map((team, idx) => {
            const isLeading = team.id === currentBid.highestBidder
            const justBid = team.id === lastBidTeam
            return (
              <motion.div
                key={team.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`bg-gradient-to-br ${team.color} rounded-lg p-4 border-2 transition-all relative overflow-hidden ${
                  isLeading
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
                <h3 className="font-bold text-white text-sm truncate mb-2">{team.name}</h3>
                <div className="space-y-1 text-xs text-white/80">
                  <p>
                    Players: <span className="font-bold">{team.players.length}/25</span>
                  </p>
                  <p>
                    Budget: <span className="font-bold">₹{team.budget}L</span>
                  </p>
                  {isLeading && (
                    <motion.p
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                      className="text-yellow-300 font-bold"
                    >
                      ⭐ LEADING
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
            className="bg-slate-800 rounded-lg p-6 border border-orange-500/20 mb-8"
          >
            <h3 className="font-bold text-orange-400 mb-4">Bid History</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              <AnimatePresence>
                {currentBid.bidHistory.map((bid, idx) => {
                  const bidTeam = teams.find((t) => t.id === bid.team)
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-center justify-between bg-slate-700/50 p-3 rounded-lg text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${bidTeam?.color}`}></div>
                        <span className="text-gray-300">{bidTeam?.name}</span>
                      </div>
                      <span className="text-orange-400 font-bold">₹{bid.price}L</span>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* Progress */}
        <motion.div className="bg-slate-800 rounded-lg p-4 border border-orange-500/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Auction Progress</span>
            <span className="text-orange-500 font-bold">{playerIndex + 1}/100</span>
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
      </div>
    </div>
  )
}
