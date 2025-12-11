"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import PlayerAnalysisEnhanced from "./player-analysis-enhanced"

interface Team {
  id: string
  name: string
  color?: string
  budget: number
  players: Player[]
  maxPlayers: number
  recentBids?: number
}

export default React.memo(AuctionArena)

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

interface AuctionArenaProps {
  roomCode: string
  localTeamId: string
  userName: string
  wsRef: React.MutableRefObject<WebSocket | null>
  wsConnected: boolean
  onComplete: () => void
}

const TEAM_COLORS: Record<string, string> = {
  "1": "from-blue-600 to-blue-800",
  "2": "from-yellow-600 to-yellow-800",
  "3": "from-purple-600 to-purple-800",
  "4": "from-pink-600 to-pink-800",
  "5": "from-slate-600 to-slate-800",
  "6": "from-red-600 to-red-800",
  "7": "from-orange-600 to-orange-800",
  "8": "from-cyan-600 to-cyan-800",
  "9": "from-red-600 to-rose-800",
  "10": "from-emerald-600 to-emerald-800",
}

function AuctionArena({
  roomCode,
  localTeamId,
  userName,
  wsRef,
  wsConnected,
  onComplete,
}: AuctionArenaProps) {
  const [teams, setTeams] = useState<Team[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [playerIndex, setPlayerIndex] = useState(0)
  const [currentBid, setCurrentBid] = useState<CurrentBid>({
    playerIndex: 0,
    currentPrice: 1,
    highestBidder: "",
    bidHistory: [],
    timeLeft: 30,
  })
  const [auctionPhase, setAuctionPhase] = useState<"waiting" | "active" | "completed">("waiting")
  const [lastBidTeam, setLastBidTeam] = useState<string>("")
  const [results, setResults] = useState<any | null>(null)
  const [selectedPlayerForAnalysis, setSelectedPlayerForAnalysis] = useState<Player | null>(null)
  const [playerCount, setPlayerCount] = useState(1)

  useEffect(() => {
    if (!wsRef.current || !wsConnected) return

    const handleMessage = (evt: MessageEvent) => {
      try {
        const msg = JSON.parse(evt.data)

        if (msg.type === "state") {
          const { teams: sTeams, auctionState, playerCount: pCount } = msg.payload
          setTeams(sTeams.map((t: Team) => ({ ...t, color: TEAM_COLORS[t.id] || "from-gray-600 to-gray-800" })))
          setPlayerIndex(auctionState.playerIndex)
          setCurrentBid({
            playerIndex: auctionState.playerIndex,
            currentPrice: auctionState.currentPrice,
            highestBidder: auctionState.highestBidder || "",
            bidHistory: auctionState.bidHistory || [],
            timeLeft: auctionState.timeLeft || 30,
          })
          setAuctionPhase(auctionState.phase)
          setPlayerCount(pCount || 1)
          
          // Track last bid for animation
          if (auctionState.bidHistory && auctionState.bidHistory.length > 0) {
            const lastBid = auctionState.bidHistory[auctionState.bidHistory.length - 1]
            setLastBidTeam(lastBid.team)
            setTimeout(() => setLastBidTeam(""), 1000)
          }
        }

        if (msg.type === "joined-room") {
          const { teams: sTeams, auctionState } = msg.payload
          setTeams(sTeams.map((t: Team) => ({ ...t, color: TEAM_COLORS[t.id] || "from-gray-600 to-gray-800" })))
          setPlayerIndex(auctionState.playerIndex)
          setCurrentBid({
            playerIndex: auctionState.playerIndex,
            currentPrice: auctionState.currentPrice,
            highestBidder: auctionState.highestBidder || "",
            bidHistory: auctionState.bidHistory || [],
            timeLeft: auctionState.timeLeft || 30,
          })
          setAuctionPhase(auctionState.phase)
        }

        if (msg.type === "results") {
          setResults(msg.payload)
          setAuctionPhase("completed")
          onComplete()
        }

        if (msg.type === "error") {
          console.error("Server error:", msg.payload.message)
        }
      } catch (e) {
        console.error("WS message parse error", e)
      }
    }

    wsRef.current.addEventListener("message", handleMessage)
    return () => {
      wsRef.current?.removeEventListener("message", handleMessage)
    }
  }, [wsConnected, wsRef, onComplete])

  // Generate mock players for display (will be replaced by server data)
  useEffect(() => {
    setPlayers(
      Array.from({ length: 120 }, (_, i) => ({
        id: `player-${i}`,
        name: [`Virat Kohli`, `Rohit Sharma`, `MS Dhoni`, `Rishabh Pant`, `Suryakumar Yadav`, `Jasprit Bumrah`, `Yuzvendra Chahal`, `Hardik Pandya`][i % 8] || `Player ${i}`,
        role: ["Batsman", "Bowler", "All-rounder", "Wicket-keeper"][i % 4] as any,
        basePrice: Math.max(1, Math.round(1 + Math.random() * 9)),
      }))
    )
  }, [])

  const handleBid = (teamId: string, amount: number) => {
    if (wsRef.current && wsConnected) {
      wsRef.current.send(
        JSON.stringify({
          type: "bid",
          payload: { teamId, amount },
        })
      )
    }
  }

  const handleStartAuction = () => {
    if (wsRef.current && wsConnected) {
      wsRef.current.send(JSON.stringify({ type: "start-auction" }))
    }
  }

  const currentPlayer = players[playerIndex]
  const highestBidderTeam = teams.find((t: Team) => t.id === currentBid.highestBidder)

  return (
    <>
      {/* Player Analysis Modal */}
      <AnimatePresence>
        {selectedPlayerForAnalysis && (
          <PlayerAnalysisEnhanced player={selectedPlayerForAnalysis} onClose={() => setSelectedPlayerForAnalysis(null)} />
        )}
      </AnimatePresence>

      {/* Main Auction UI */}
      <div className="min-h-screen py-8 px-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-7xl mx-auto">
          {/* Room Header */}
          <div className="bg-slate-800/50 rounded-xl p-4 mb-6 border border-orange-500/30 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-sm text-gray-400">Room Code</p>
                <p className="text-2xl font-black text-orange-400 tracking-wider">{roomCode}</p>
              </div>
              <div className="h-8 w-px bg-gray-600"></div>
              <div>
                <p className="text-sm text-gray-400">Your Team</p>
                <p className="text-lg font-bold text-white">{teams.find((t) => t.id === localTeamId)?.name || "Loading..."}</p>
              </div>
              <div className="h-8 w-px bg-gray-600"></div>
              <div>
                <p className="text-sm text-gray-400">Players in Room</p>
                <p className="text-lg font-bold text-green-400"> {playerCount}/10</p>
              </div>
            </div>
            <div className="text-right">
              {auctionPhase === "waiting" && (
                <button
                  onClick={handleStartAuction}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-lg font-bold transition-all"
                >
                   Start Auction
                </button>
              )}
              {auctionPhase === "active" && <div className="text-green-400 font-bold">LIVE</div>}
              {auctionPhase === "completed" && <div className="text-blue-400 font-bold">Completed</div>}
            </div>
          </div>
          {auctionPhase === "waiting" ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-slate-800/50 rounded-2xl p-12 border border-slate-700 text-center"
            >
              <div className="text-8xl mb-6">⏳</div>
              <h2 className="text-4xl font-black text-white mb-4">Waiting for Auction to Start</h2>
              <p className="text-gray-400 text-lg mb-6">The host will start the auction when ready</p>
              <p className="text-gray-500">Share the room code <span className="text-orange-400 font-bold">{roomCode}</span> with other players!</p>
            </motion.div>
          ) : (
            <>
              {/* Main Auction Stage - Similar to original auction-arena.tsx but simplified */}
              <motion.div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border border-orange-500/30 mb-8 shadow-2xl">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Player Card */}
                  <motion.div key={playerIndex} initial={{ opacity: 0, rotateY: 90 }} animate={{ opacity: 1, rotateY: 0 }} transition={{ duration: 0.6 }} className="lg:col-span-1">
                    <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl overflow-hidden shadow-2xl">
                      <div
                        className="aspect-video bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center relative overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => currentPlayer && setSelectedPlayerForAnalysis(currentPlayer)}
                        title="Click to view player details"
                      >
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-9xl animate-pulse font-bold text-orange-500">*</div>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                        <div className="absolute bottom-4 right-4 bg-orange-500/90 text-white px-3 py-1 rounded-full text-sm font-bold">View Details</div>
                      </div>
                      <div className="p-6 bg-slate-900">
                        <h2 className="text-3xl font-black text-white mb-2">{currentPlayer?.name}</h2>
                        <div className="flex items-center justify-between mb-4">
                          <span className="px-3 py-1 bg-orange-500/30 border border-orange-500 text-orange-300 rounded-full text-sm font-bold">{currentPlayer?.role}</span>
                          <span className="text-gray-300">#{playerIndex + 1}/120</span>
                        </div>
                        <div className="text-sm text-gray-400">
                          Base Price: <span className="text-orange-400 font-bold">₹{currentPlayer?.basePrice}Cr</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Bidding Info */}
                  <div className="lg:col-span-2 space-y-6">
                    <motion.div animate={{ scale: [1, 1.02, 1] }} transition={{ duration: 0.5, repeat: Infinity }} className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-8 border border-orange-500/50">
                      <p className="text-gray-400 text-sm mb-2">CURRENT BID</p>
                      <motion.div key={currentBid.currentPrice} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-6xl font-black text-orange-500 mb-4">
                        ₹{currentBid.currentPrice}Cr
                      </motion.div>
                      <div className="flex items-center justify-between mb-4">
                        {highestBidderTeam ? (
                          <motion.div key={highestBidderTeam.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${highestBidderTeam.color}`}></div>
                            <span className="font-bold text-white">{highestBidderTeam.name}</span>
                            <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.5, repeat: Infinity }} className="text-orange-400 font-bold">
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
                          className={`h-3 rounded-full transition-all ${
                            currentBid.timeLeft > 10 ? "bg-gradient-to-r from-green-500 to-emerald-500" : currentBid.timeLeft > 5 ? "bg-gradient-to-r from-yellow-500 to-orange-500" : "bg-gradient-to-r from-red-500 to-rose-500"
                          }`}
                        ></motion.div>
                        <div className="text-center mt-2 text-lg font-bold">
                          <span className={currentBid.timeLeft <= 5 ? "text-red-500 animate-pulse" : "text-gray-300"}>{currentBid.timeLeft}s</span>
                        </div>
                      </div>
                    </motion.div>

                    {/* Bid Button */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          const bidAmount = currentBid.currentPrice + 1
                          handleBid(localTeamId, bidAmount)
                        }}
                        className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-4 rounded-lg font-bold text-xl transition-all"
                      >
                        Bid ₹{currentBid.currentPrice + 1}Cr
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Results */}
              {results && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-indigo-900/80 rounded-lg p-6 border border-indigo-500/30 mt-6 text-white">
                  <h3 className="text-xl font-bold mb-4">Auction Results & Ratings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {results.ratings?.map((r: any) => {
                      const team = teams.find((t: Team) => t.id === r.teamId)
                      return (
                        <div key={r.teamId} className="bg-indigo-800/40 p-4 rounded">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-bold">{team?.name || r.teamId}</div>
                              <div className="text-sm text-indigo-200">Overall: {r.overallScore}</div>
                            </div>
                            <div className="text-sm text-indigo-100">
                              Bat: {r.battingScore} • Bowl: {r.bowlingScore}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </motion.div>
              )}

              {/* Teams Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {teams.map((team: Team, idx: number) => {
                  const isLeading = team.id === currentBid.highestBidder
                  const justBid = team.id === lastBidTeam
                  return (
                    <motion.div
                      key={team.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`bg-gradient-to-br ${team.color} rounded-lg p-4 border-2 transition-all relative overflow-hidden ${
                        isLeading ? "border-yellow-400 shadow-2xl shadow-yellow-400/50" : justBid ? "border-orange-400 shadow-lg shadow-orange-400/30" : "border-slate-700"
                      }`}
                    >
                      <h3 className="font-bold text-white text-sm truncate mb-2">{team.name}</h3>
                      <div className="space-y-1 text-xs text-white/80">
                        <p>
                          Players: <span className="font-bold">{team.players.length}/25</span>
                        </p>
                        <p>
                          Budget: <span className="font-bold">₹{team.budget}Cr</span>
                        </p>
                        {team.id === localTeamId && <div className="absolute top-2 left-2 bg-indigo-700 text-white text-xs font-bold px-2 py-1 rounded">YOU</div>}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
