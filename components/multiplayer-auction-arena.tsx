"use client"

import React, { useState, useEffect, useRef } from "react"
import dynamic from "next/dynamic"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Crown, Gavel, TrendingUp, Users, Zap, Clock, DollarSign, Trophy, Target, Award, Activity, Info, Star, TrendingDown, ExternalLink, History, XCircle } from "lucide-react"

// Lazy-load heavy components only when needed
const SaleHistory = dynamic(() => import("./sale-history"), { ssr: false })

interface Player {
  id: string
  name: string
  role: "Batsman" | "Bowler" | "All-rounder" | "Wicket-keeper"
  basePrice: number
  rating: number
  stats?: {
    matches?: number
    runs?: number
    wickets?: number
    average?: number
    strikeRate?: number
    economy?: number
  }
  soldTo?: string
  soldPrice?: number
}

export default React.memo(MultiplayerAuctionArena)

interface Team {
  id: string
  name: string
  budget: number
  players: Player[]
  maxPlayers: number
}

interface BidHistoryItem {
  teamId: string
  teamName: string
  price: number
  timestamp: number
}

interface MultiplayerAuctionArenaProps {
  roomCode: string
  localTeamId: string
  userName: string
  wsRef: React.MutableRefObject<WebSocket | null>
  wsConnected: boolean
  onComplete: () => void
  isHost?: boolean
}

function MultiplayerAuctionArena({
  roomCode,
  localTeamId,
  userName,
  wsRef,
  wsConnected,
  onComplete,
  isHost: isHostProp = false,
}: MultiplayerAuctionArenaProps) {
  const router = useRouter()
  const [teams, setTeams] = useState<Team[]>([])
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null)
  const [currentPrice, setCurrentPrice] = useState<number>(0)
  const [highestBidder, setHighestBidder] = useState<string>("")
  const [bidHistory, setBidHistory] = useState<BidHistoryItem[]>([])
  const [timeLeft, setTimeLeft] = useState<number>(60)
  const [playerIndex, setPlayerIndex] = useState<number>(0)
  const [totalPlayers, setTotalPlayers] = useState<number>(0)
  const [showSoldAnimation, setShowSoldAnimation] = useState(false)
  const [soldPlayerInfo, setSoldPlayerInfo] = useState<{ name: string; team: string; price: number } | null>(null)
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [showTeamModal, setShowTeamModal] = useState(false)
  
  // New auction features state
  const [currentRound, setCurrentRound] = useState<number>(1)
  const [maxRounds, setMaxRounds] = useState<number>(2)
  const [currentCategory, setCurrentCategory] = useState<string>('marquee')
  const [categoryName, setCategoryName] = useState<string>('⭐ Marquee Players')
  const [phase, setPhase] = useState<string>('lobby')
  const [breakType, setBreakType] = useState<string | null>(null)
  const [breakTimeLeft, setBreakTimeLeft] = useState<number>(0)
  const [breakMessage, setBreakMessage] = useState<string>('')
  const [strategicTimeouts, setStrategicTimeouts] = useState<Record<string, number>>({})
  const [rtmAvailable, setRtmAvailable] = useState<Record<string, boolean>>({})
  const [totalPlayersSold, setTotalPlayersSold] = useState<number>(0)
  const [totalMoneySpent, setTotalMoneySpent] = useState<number>(0)
  const [unsoldPlayersCount, setUnsoldPlayersCount] = useState<number>(0)
  const [saleHistory, setSaleHistory] = useState<any[]>([])
  const [showSaleHistory, setShowSaleHistory] = useState(false)
  const [isHost, setIsHost] = useState(isHostProp)
  
  // Reconnection state
  const [isReconnecting, setIsReconnecting] = useState(false)
  const [showReconnectPrompt, setShowReconnectPrompt] = useState(false)
  const [reconnectAttempts, setReconnectAttempts] = useState(0)
  const maxReconnectAttempts = 5
  const reconnectIntervalRef = useRef<NodeJS.Timeout | null>(null)
  
  // Update isHost when prop changes
  useEffect(() => {
    setIsHost(isHostProp)
  }, [isHostProp])

  // Get local team info
  const localTeam = teams.find((t) => t.id === localTeamId)
  const highestBidderTeam = teams.find((t) => t.id === highestBidder)
  const isMyBid = highestBidder === localTeamId
  const canBid = localTeam && localTeam.budget >= (currentPrice + 1) && localTeam.players.length < localTeam.maxPlayers
  
  // Handler to view player details in new tab
  const handleViewPlayerDetails = () => {
    if (currentPlayer && typeof window !== 'undefined') {
      sessionStorage.setItem('currentPlayer', JSON.stringify(currentPlayer))
      window.open(`/player/${currentPlayer.id}`, '_blank')
    }
  }

  // Batch high-frequency auction-state updates to reduce re-renders
  const pendingPayloadRef = useRef<any>(null)
  const scheduledRef = useRef<boolean>(false)

  useEffect(() => {
    if (!wsRef.current || !wsConnected) return

    const applyPayload = (payload: any) => {
      const {
        teams: updatedTeams,
        currentPlayer: player,
        currentPrice: price,
        highestBidder: bidder,
        bidHistory: history,
        timeLeft: time,
        playerIndex: idx,
        totalPlayers: total,
        currentRound: round,
        maxRounds: rounds,
        currentCategory: category,
        categoryName: catName,
        phase: auctionPhase,
        breakType: bType,
        breakTimeLeft: bTime,
        breakMessage: bMsg,
        strategicTimeouts: timeouts,
        rtmAvailable: rtm,
        totalPlayersSold: sold,
        totalMoneySpent: spent,
        unsoldPlayersCount: unsold,
        saleHistory: history_sales
      } = payload

      if (updatedTeams) {
        setTeams(updatedTeams)
        // Store teams in sessionStorage for /teams page
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('auctionTeams', JSON.stringify(updatedTeams))
        }
      }
      if (player !== undefined) setCurrentPlayer(player)
      if (price !== undefined) setCurrentPrice(price)
      setHighestBidder(bidder || "")
      if (history !== undefined) setBidHistory(history || [])
      if (time !== undefined) setTimeLeft(time)
      if (idx !== undefined) setPlayerIndex(idx)
      if (total !== undefined) setTotalPlayers(total)

      if (round !== undefined) setCurrentRound(round)
      if (rounds !== undefined) setMaxRounds(rounds)
      if (category !== undefined) setCurrentCategory(category)
      if (catName !== undefined) setCategoryName(catName)
      if (auctionPhase !== undefined) setPhase(auctionPhase)
      if (bType !== undefined) setBreakType(bType)
      if (bTime !== undefined) setBreakTimeLeft(bTime)
      if (bMsg !== undefined) setBreakMessage(bMsg)
      if (timeouts !== undefined) setStrategicTimeouts(timeouts)
      if (rtm !== undefined) setRtmAvailable(rtm)
      if (sold !== undefined) setTotalPlayersSold(sold)
      if (spent !== undefined) setTotalMoneySpent(spent)
      if (unsold !== undefined) setUnsoldPlayersCount(unsold)
      if (history_sales !== undefined) setSaleHistory(history_sales || [])
    }

    const scheduleApply = () => {
      if (scheduledRef.current) return
      scheduledRef.current = true
      // For production with potentially slower connections, use 100ms batching
      // This reduces state updates from ~60/sec to ~10/sec
      const delay = typeof window !== 'undefined' && window.location.hostname.includes('onrender.com') ? 100 : 0
      
      const callback = () => {
        scheduledRef.current = false
        const payload = pendingPayloadRef.current
        if (payload) applyPayload(payload)
        pendingPayloadRef.current = null
      }
      
      if (delay > 0) {
        setTimeout(callback, delay)
      } else {
        requestAnimationFrame(callback)
      }
    }

    const handleMessage = (evt: MessageEvent) => {
      try {
        const msg = JSON.parse(evt.data)

        // Batch auction-state messages
        if (msg.type === "auction-state") {
          pendingPayloadRef.current = msg.payload
          scheduleApply()
          return
        }

        // Handle player sold immediately (UI animation)
        if (msg.type === "player-sold") {
          const { player, soldToName, soldPrice } = msg.payload
          setSoldPlayerInfo({ name: player.name, team: soldToName, price: soldPrice })
          setShowSoldAnimation(true)

          // Confetti if you won the bid (lazy-loaded)
          if (msg.payload.soldTo === localTeamId) {
            import("canvas-confetti").then(module => {
              const confettiFunc = module.default
              confettiFunc({ particleCount: 100, spread: 70, origin: { y: 0.6 } })
            })
          }

          setTimeout(() => setShowSoldAnimation(false), 3000)
          return
        }

        // Auction complete
        if (msg.type === "auction-complete") {
          setTimeout(() => onComplete(), 2000)
          return
        }
        
        // Handle reconnection success
        if (msg.type === "reconnected") {
          console.log("✅ Successfully reconnected to room")
          setIsReconnecting(false)
          setShowReconnectPrompt(false)
          setReconnectAttempts(0)
          
          // Apply the synced state
          applyPayload(msg.payload)
          return
        }
        
        // Handle player disconnected
        if (msg.type === "player_disconnected") {
          console.log(`⚠️ ${msg.payload.userName} disconnected`)
          return
        }
        
        // Handle player reconnected
        if (msg.type === "player_reconnected") {
          console.log(`✅ ${msg.payload.userName} reconnected`)
          return
        }
      } catch (e) {
        console.error("Error parsing WebSocket message:", e)
      }
    }

    wsRef.current.addEventListener("message", handleMessage)

    return () => {
      wsRef.current?.removeEventListener("message", handleMessage)
    }
  }, [wsRef, wsConnected, localTeamId, onComplete])
  
  // Store connection info in localStorage for reconnection
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const connectionInfo = {
        roomCode,
        userName,
        userId: localTeamId,
        timestamp: Date.now()
      }
      localStorage.setItem('auctionConnection', JSON.stringify(connectionInfo))
    }
  }, [roomCode, userName, localTeamId])
  
  // Handle disconnection and attempt reconnection
  useEffect(() => {
    if (!wsConnected && !isReconnecting) {
      console.log("⚠️ WebSocket disconnected, attempting reconnection...")
      setShowReconnectPrompt(true)
      attemptReconnect()
    }
  }, [wsConnected])
  
  const attemptReconnect = () => {
    if (reconnectAttempts >= maxReconnectAttempts) {
      console.log("❌ Max reconnection attempts reached")
      setShowReconnectPrompt(false)
      return
    }
    
    setIsReconnecting(true)
    setReconnectAttempts(prev => prev + 1)
    
    // Try to reconnect after a delay (exponential backoff)
    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 10000)
    
    reconnectIntervalRef.current = setTimeout(() => {
      console.log(`🔄 Reconnection attempt ${reconnectAttempts + 1}/${maxReconnectAttempts}`)
      
      // The parent component should handle WebSocket reconnection
      // We just need to send the rejoin message when connection is restored
      if (wsConnected && wsRef.current) {
        const storedInfo = localStorage.getItem('auctionConnection')
        if (storedInfo) {
          const { roomCode: savedRoom, userName: savedName, userId: savedId } = JSON.parse(storedInfo)
          
          wsRef.current.send(JSON.stringify({
            type: "join-room",
            payload: {
              roomCode: savedRoom,
              userName: savedName,
              userId: savedId,
              isReconnecting: true
            },
          }))
        }
      } else {
        attemptReconnect()
      }
    }, delay)
  }
  
  const handleManualReconnect = () => {
    setReconnectAttempts(0)
    attemptReconnect()
  }
  
  // Cleanup reconnection interval
  useEffect(() => {
    return () => {
      if (reconnectIntervalRef.current) {
        clearTimeout(reconnectIntervalRef.current)
      }
    }
  }, [])

  const handleBid = () => {
    if (!canBid || !wsRef.current || !wsConnected) return

    const newBid = currentPrice + 1 // Changed from +5 to +1 Cr

    wsRef.current.send(JSON.stringify({
      type: "bid",
      payload: {
        roomCode,
        teamId: localTeamId,
        amount: newBid,
      },
    }))
  }
  
  const handleStrategicTimeout = () => {
    if (!wsRef.current || !wsConnected || phase !== 'active') return
    if (!strategicTimeouts[localTeamId] || strategicTimeouts[localTeamId] <= 0) return
    
    wsRef.current.send(JSON.stringify({
      type: "strategic-timeout",
      payload: {
        teamId: localTeamId,
      },
    }))
  }
  
  const handleMarkUnsold = () => {
    if (!wsRef.current || !wsConnected || phase !== 'active') return
    
    wsRef.current.send(JSON.stringify({
      type: "mark-unsold",
      payload: {
        roomCode,
      },
    }))
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Batsman":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "Bowler":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "All-rounder":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30"
      case "Wicket-keeper":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "Batsman":
        return <Target className="w-4 h-4" />
      case "Bowler":
        return <Zap className="w-4 h-4" />
      case "All-rounder":
        return <Award className="w-4 h-4" />
      case "Wicket-keeper":
        return <Crown className="w-4 h-4" />
      default:
        return <Users className="w-4 h-4" />
    }
  }

  if (!currentPlayer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading auction...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-6 px-4">
      {/* Reconnection Prompt */}
      {showReconnectPrompt && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-orange-600/95 backdrop-blur-sm border-2 border-orange-400 rounded-xl px-6 py-4 shadow-2xl max-w-md"
        >
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            <div>
              <p className="text-white font-bold">Connection Lost</p>
              <p className="text-orange-100 text-sm">
                {isReconnecting 
                  ? `Reconnecting... (Attempt ${reconnectAttempts}/${maxReconnectAttempts})`
                  : "Trying to reconnect to the game..."
                }
              </p>
            </div>
            <Button
              onClick={handleManualReconnect}
              size="sm"
              variant="outline"
              className="ml-auto border-white text-white hover:bg-white/20"
            >
              Retry
            </Button>
          </div>
        </motion.div>
      )}
      
      <div className="max-w-7xl mx-auto">
        {/* Header with User Team Info */}
        <div className="flex items-start justify-between mb-6">
          {/* Left: Room Info */}
          <div className="flex-1">
            <div className="inline-flex items-center gap-3 bg-slate-800/50 border border-orange-500/50 rounded-xl px-6 py-3 mb-3">
              <Trophy className="w-5 h-5 text-orange-500" />
              <p className="text-sm text-gray-400">Room Code: <span className="text-white font-bold text-lg ml-2">{roomCode}</span></p>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">IPL Auction Arena</h1>
            <p className="text-gray-400">Player {playerIndex + 1} of {totalPlayers}</p>
          </div>

          {/* Right: User's Team Card */}
          {localTeam && (
            <Card className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border-2 border-blue-500/50 shadow-xl shadow-blue-500/20 min-w-[280px]">
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Crown className="w-5 h-5 text-blue-400" />
                  <h3 className="text-lg font-bold text-white">Your Team</h3>
                </div>
                <div className="space-y-2">
                  <div className="bg-slate-900/50 rounded-lg p-2">
                    <p className="text-xs text-gray-400 mb-1">Team Name</p>
                    <p className="text-white font-bold truncate">{localTeam.name}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                      <p className="text-xs text-gray-400 mb-1">Budget</p>
                      <p className="text-green-400 font-bold text-lg">₹{localTeam.budget}</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                      <p className="text-xs text-gray-400 mb-1">Players</p>
                      <p className="text-white font-bold text-lg">{localTeam.players.length}/{localTeam.maxPlayers}</p>
                    </div>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-2">
                    <p className="text-xs text-gray-400 mb-1">Spent</p>
                    <div className="flex items-center justify-between">
                      <p className="text-orange-400 font-bold">₹{100 - localTeam.budget} Cr</p>
                      <p className="text-xs text-gray-500">{Math.round(((100 - localTeam.budget) / 100) * 100)}%</p>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-1.5 mt-2">
                      <div 
                        className="bg-gradient-to-r from-orange-500 to-red-500 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${((100 - localTeam.budget) / 100) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Auction Status Banner - Round, Category, Stats */}
        <div className="mb-6">
          <Card className="bg-gradient-to-r from-purple-900/30 via-slate-800/50 to-blue-900/30 border border-purple-500/30">
            <div className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <p className="text-xs text-gray-400 mb-1">Round</p>
                  <p className="text-xl font-bold text-white">{currentRound} / {maxRounds}</p>
                  {currentRound === 2 && (
                    <Badge className="mt-1 bg-red-500/20 text-red-400 text-[10px]">Accelerated</Badge>
                  )}
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-400 mb-1">Category</p>
                  <p className="text-sm font-bold text-purple-400">{categoryName}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-400 mb-1">Players Sold</p>
                  <p className="text-xl font-bold text-green-400">{totalPlayersSold}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-400 mb-1">Total Spent</p>
                  <p className="text-xl font-bold text-orange-400">₹{totalMoneySpent} Cr</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-400 mb-1">Unsold</p>
                  <p className="text-xl font-bold text-red-400">{unsoldPlayersCount}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Break Screen Overlay */}
        <AnimatePresence>
          {(phase === 'break' || phase === 'strategic_timeout') && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.5, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.5, y: 50 }}
                transition={{ type: "spring", duration: 0.5 }}
              >
                <Card className="bg-gradient-to-br from-slate-800 via-slate-900 to-black border-2 border-orange-500 shadow-2xl shadow-orange-500/50 max-w-2xl mx-4">
                  <div className="p-12 text-center">
                    {/* Break Icon */}
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 10, -10, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                      }}
                      className="mb-6"
                    >
                      {breakType === 'snack' && <span className="text-8xl">🍿</span>}
                      {breakType === 'category' && <span className="text-8xl">⏸️</span>}
                      {breakType === 'strategic' && <span className="text-8xl">🤔</span>}
                    </motion.div>
                    
                    {/* Break Title */}
                    <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 mb-4">
                      {breakType === 'snack' && 'Snack Break!'}
                      {breakType === 'category' && 'Category Complete!'}
                      {breakType === 'strategic' && 'Strategic Timeout'}
                    </h2>
                    
                    {/* Break Message */}
                    <p className="text-xl text-white mb-6">{breakMessage}</p>
                    
                    {/* Countdown */}
                    <div className="mb-6">
                      <motion.div
                        animate={{
                          scale: [1, 1.1, 1],
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                        }}
                        className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500"
                      >
                        {breakTimeLeft}s
                      </motion.div>
                      <p className="text-gray-400 mt-2">Resuming soon...</p>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <motion.div
                        className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full"
                        initial={{ width: "100%" }}
                        animate={{ width: `${(breakTimeLeft / (breakType === 'strategic' ? 90 : breakType === 'snack' ? 60 : 30)) * 100}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Current Player */}
          <div className="lg:col-span-2 space-y-6">
            {/* Timer and Status - Enhanced */}
            <Card className="bg-gradient-to-r from-slate-800 via-slate-800/90 to-slate-900 border-slate-700/50 shadow-xl">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={{
                        rotate: timeLeft <= 10 ? [0, 10, -10, 0] : 0,
                      }}
                      transition={{
                        duration: 0.5,
                        repeat: timeLeft <= 10 ? Infinity : 0,
                      }}
                    >
                      <Clock className={`w-6 h-6 ${timeLeft <= 10 ? 'text-red-500' : 'text-orange-500'}`} />
                    </motion.div>
                    <span className="text-gray-300 font-semibold text-lg">Time Remaining</span>
                  </div>
                  <motion.div
                    animate={{
                      scale: timeLeft <= 10 ? [1, 1.1, 1] : 1,
                    }}
                    transition={{
                      duration: 0.5,
                      repeat: timeLeft <= 10 ? Infinity : 0,
                    }}
                    className={`text-5xl font-black ${
                      timeLeft <= 10 
                        ? "text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500" 
                        : "text-white"
                    }`}
                  >
                    {timeLeft}s
                  </motion.div>
                </div>

                {/* Progress Bar */}
                <div className="relative">
                  <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                    <motion.div
                      className={`h-3 rounded-full ${
                        timeLeft <= 10 
                          ? "bg-gradient-to-r from-red-500 to-orange-500" 
                          : "bg-gradient-to-r from-orange-500 to-yellow-500"
                      }`}
                      initial={{ width: "100%" }}
                      animate={{ width: `${(timeLeft / 60) * 100}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  {/* Pulse effect for low time */}
                  {timeLeft <= 10 && (
                    <motion.div
                      className="absolute inset-0 bg-red-500/20 rounded-full"
                      animate={{
                        opacity: [0.5, 0, 0.5],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                      }}
                    />
                  )}
                </div>

                {/* Time warnings */}
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-gray-500">
                    {timeLeft > 30 ? "🟢 Plenty of time" : timeLeft > 10 ? "🟡 Time running out" : "🔴 Hurry up!"}
                  </span>
                  <span className="text-gray-500">
                    {Math.floor((timeLeft / 60) * 100)}% remaining
                  </span>
                </div>
              </div>
            </Card>

            {/* Current Player Card - Simplified */}
            <Card className="bg-gradient-to-br from-slate-800 via-slate-800/80 to-slate-900 border-2 border-orange-500/50 shadow-2xl shadow-orange-500/20">
              <div className="p-6">
                {/* Player Info - Compact */}
                <div className="mb-4">
                  <motion.h2
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    onClick={handleViewPlayerDetails}
                    className="text-3xl sm:text-4xl font-black text-white mb-3 bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent cursor-pointer hover:from-orange-300 hover:to-red-400 transition-all flex items-center gap-2"
                  >
                    {currentPlayer.name}
                    <Info className="w-6 h-6 text-orange-400 animate-pulse" />
                  </motion.h2>
                  
                  <p className="text-xs text-gray-400 mb-3">👆 Click name for detailed stats</p>
                  
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={`${getRoleColor(currentPlayer.role)} border px-4 py-1.5 text-sm font-semibold`}>
                      <span className="flex items-center gap-2">
                        {getRoleIcon(currentPlayer.role)}
                        {currentPlayer.role}
                      </span>
                    </Badge>
                    <Badge className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-4 py-1.5">
                      <span className="flex items-center gap-2">
                        <Star className="w-4 h-4 fill-yellow-400" />
                        Rating: {currentPlayer.rating}
                      </span>
                    </Badge>
                  </div>
                </div>

                {/* Stats Grid - Quick Overview Only */}
                {currentPlayer.stats && (
                  <div>
                    <h4 className="text-orange-400 font-semibold mb-3 flex items-center gap-2 text-sm">
                      <TrendingUp className="w-4 h-4" />
                      Quick Stats
                    </h4>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-500/30 rounded-lg p-3 text-center">
                        <Users className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                        <p className="text-gray-400 text-[10px] mb-1">Matches</p>
                        <p className="text-white text-xl font-black">{currentPlayer.stats.matches || 0}</p>
                      </div>

                      {currentPlayer.stats.runs !== undefined && (
                        <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 border border-green-500/30 rounded-lg p-3 text-center">
                          <Target className="w-4 h-4 text-green-400 mx-auto mb-1" />
                          <p className="text-gray-400 text-[10px] mb-1">Runs</p>
                          <p className="text-white text-xl font-black">{currentPlayer.stats.runs}</p>
                        </div>
                      )}

                      {currentPlayer.stats.wickets !== undefined && (
                        <div className="bg-gradient-to-br from-red-600/20 to-red-800/20 border border-red-500/30 rounded-lg p-3 text-center">
                          <Zap className="w-4 h-4 text-red-400 mx-auto mb-1" />
                          <p className="text-gray-400 text-[10px] mb-1">Wickets</p>
                          <p className="text-white text-xl font-black">{currentPlayer.stats.wickets}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Current Bid - Enhanced */}
                <motion.div
                  animate={{
                    scale: timeLeft <= 10 ? [1, 1.02, 1] : 1,
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: timeLeft <= 10 ? Infinity : 0,
                  }}
                  className="bg-gradient-to-br from-slate-900 via-slate-900/90 to-orange-900/20 rounded-2xl p-8 mb-4 border-2 border-orange-500/30"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Gavel className="w-5 h-5 text-orange-400" />
                      <span className="text-gray-400 font-semibold">Current Bid</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-500">Base:</span>
                      <Badge className="bg-slate-700/50 text-gray-300 border border-slate-600">
                        ₹{currentPlayer.basePrice}Cr
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-6">
                    <div className="flex-1">
                      <motion.div
                        key={currentPrice}
                        initial={{ scale: 1.2, color: "#f97316" }}
                        animate={{ scale: 1, color: "#ffffff" }}
                        transition={{ duration: 0.3 }}
                      >
                        <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-orange-600">
                          ₹{currentPrice}Cr
                        </p>
                      </motion.div>
                      
                      {highestBidderTeam && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="mt-2 flex items-center gap-2"
                        >
                          <Crown className="w-4 h-4 text-yellow-400" />
                          <p className="text-sm text-gray-400">
                            Leading: <span className="text-white font-bold">{highestBidderTeam.name}</span>
                          </p>
                        </motion.div>
                      )}

                      {/* Budget Warning */}
                      {localTeam && localTeam.budget < currentPrice + 5 && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="mt-2 flex items-center gap-2 text-red-400 text-sm"
                        >
                          <TrendingDown className="w-4 h-4" />
                          Low budget! ₹{localTeam.budget}Cr remaining
                        </motion.div>
                      )}
                    </div>

                    <div className="flex flex-col gap-3">
                      <Button
                        onClick={handleBid}
                        disabled={!canBid}
                        size="lg"
                        className={`
                          px-8 py-6 text-lg font-bold shadow-2xl
                          ${isMyBid
                            ? "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-green-500/50"
                            : "bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 shadow-orange-500/50"
                          }
                          ${!canBid ? "opacity-50 cursor-not-allowed grayscale" : "hover:scale-105 active:scale-95"}
                          transition-all duration-200
                        `}
                      >
                        <Gavel className="w-6 h-6 mr-2" />
                        {isMyBid ? `Raise +₹1Cr` : `Bid ₹${currentPrice + 1}Cr`}
                      </Button>

                      {/* Strategic Timeout Button */}
                      {strategicTimeouts[localTeamId] > 0 && phase === 'active' && (
                        <Button
                          onClick={handleStrategicTimeout}
                          variant="outline"
                          size="sm"
                          className="bg-purple-900/30 border-purple-500/50 text-purple-400 hover:bg-purple-900/50 hover:text-purple-300"
                        >
                          <Clock className="w-4 h-4 mr-2" />
                          Strategic Timeout ({strategicTimeouts[localTeamId]} left)
                        </Button>
                      )}
                      
                      {/* Mark Unsold Button - Host Only */}
                      {isHost && phase === 'active' && (
                        <Button
                          onClick={handleMarkUnsold}
                          variant="outline"
                          size="sm"
                          className="bg-red-900/30 border-red-500/50 text-red-400 hover:bg-red-900/50 hover:text-red-300"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Mark as Unsold
                        </Button>
                      )}
                      
                      {/* View Sale History Button */}
                      <Button
                        onClick={() => setShowSaleHistory(true)}
                        variant="outline"
                        size="sm"
                        className="bg-blue-900/30 border-blue-500/50 text-blue-400 hover:bg-blue-900/50 hover:text-blue-300"
                      >
                        <History className="w-4 h-4 mr-2" />
                        View Sale History ({saleHistory.length})
                      </Button>

                      {canBid && (
                        <p className="text-xs text-center text-gray-500">
                          Next: ₹{currentPrice + 1}Cr
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>

                {/* Bid History - Enhanced */}
                {bidHistory.length > 0 && (
                  <div className="bg-slate-800/30 rounded-xl p-5 backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp className="w-5 h-5 text-green-400" />
                      <h3 className="text-lg font-bold text-white">Bid History</h3>
                      <Badge className="bg-orange-500/20 text-orange-400 border border-orange-500/30">
                        {bidHistory.length} bids
                      </Badge>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                      {bidHistory.slice().reverse().map((bid, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className={`
                            flex items-center justify-between 
                            bg-gradient-to-r rounded-lg px-4 py-3
                            border transition-all hover:scale-102
                            ${idx === 0 
                              ? 'from-orange-900/30 to-orange-800/20 border-orange-500/50' 
                              : 'from-slate-700/30 to-slate-700/20 border-slate-600/30'
                            }
                          `}
                        >
                          <div className="flex items-center gap-3">
                            {idx === 0 && <Crown className="w-4 h-4 text-yellow-400" />}
                            <span className="text-white font-semibold">{bid.teamName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-lg font-bold ${idx === 0 ? 'text-orange-400' : 'text-gray-300'}`}>
                              ₹{bid.price}Cr
                            </span>
                            {idx === 0 && (
                              <Badge className="bg-green-500/20 text-green-400 border border-green-500/30 text-xs">
                                Latest
                              </Badge>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Right Panel - Teams Overview */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-orange-500" />
              Teams ({teams.filter(t => t.players.length > 0 || t.id === localTeamId).length})
            </h3>
            
            {/* View Teams Button */}
            <Button
              onClick={() => router.push('/teams')}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-6 text-base shadow-lg"
            >
              <ExternalLink className="w-5 h-5 mr-2" />
              View All Teams & Squads
            </Button>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-2">
              <Card className="bg-gradient-to-br from-purple-600/10 to-purple-800/10 border-purple-500/30 p-3">
                <div className="text-center">
                  <Users className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                  <p className="text-gray-400 text-[9px]">Teams</p>
                  <p className="text-white text-lg font-bold">
                    {teams.filter(team => team.players.length > 0 || team.id === localTeamId).length}
                  </p>
                </div>
              </Card>
              <Card className="bg-gradient-to-br from-orange-600/10 to-orange-800/10 border-orange-500/30 p-3">
                <div className="text-center">
                  <Trophy className="w-4 h-4 text-orange-400 mx-auto mb-1" />
                  <p className="text-gray-400 text-[9px]">Players</p>
                  <p className="text-white text-lg font-bold">
                    {teams.reduce((sum, team) => sum + team.players.length, 0)}
                  </p>
                </div>
              </Card>
              <Card className="bg-gradient-to-br from-green-600/10 to-green-800/10 border-green-500/30 p-3">
                <div className="text-center">
                  <DollarSign className="w-4 h-4 text-green-400 mx-auto mb-1" />
                  <p className="text-gray-400 text-[9px]">Spent</p>
                  <p className="text-white text-lg font-bold">
                    ₹{teams.reduce((sum, team) => sum + (100 - team.budget), 0).toFixed(0)}
                  </p>
                </div>
              </Card>
            </div>

            {/* Your Team Status */}
            {localTeam && (
              <Card className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border-blue-500/50 p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-blue-400" />
                    <p className="text-blue-400 font-semibold text-xs">Your Team</p>
                  </div>
                  {highestBidder === localTeamId && (
                    <Badge className="bg-orange-500/20 text-orange-400 text-[9px] animate-pulse">
                      🔨 BIDDING
                    </Badge>
                  )}
                </div>
                <p className="text-white font-bold text-sm truncate mb-2">{localTeam.name}</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-gray-400 text-[9px]">Players</p>
                    <p className="text-white font-bold">{localTeam.players.length}/{localTeam.maxPlayers}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-[9px]">Budget</p>
                    <p className="text-green-400 font-bold">₹{localTeam.budget}Cr</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Hint */}
            <div className="bg-slate-800/30 border border-slate-700/30 rounded-lg p-2">
              <p className="text-gray-400 text-[9px] text-center">
                💡 Tap "View All Teams" button for complete squad details
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Team Squad Modal */}
      <AnimatePresence>
        {showTeamModal && selectedTeam && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowTeamModal(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-2xl border-2 border-orange-500/50 shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-orange-600 to-red-600 p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-black text-white mb-2">{selectedTeam.name}</h2>
                  <div className="flex items-center gap-4 text-white/90">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      <span className="font-semibold">Budget: ₹{selectedTeam.budget}Cr</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      <span className="font-semibold">{selectedTeam.players.length}/{selectedTeam.maxPlayers} Players</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Trophy className="w-5 h-5" />
                      <span className="font-semibold">Spent: ₹{100 - selectedTeam.budget}Cr</span>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => setShowTeamModal(false)}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                >
                  ✕
                </Button>
              </div>

              {/* Squad List */}
              <div className="p-6 overflow-y-auto max-h-[calc(85vh-120px)] custom-scrollbar">
                {selectedTeam.players.length === 0 ? (
                  <div className="text-center py-16">
                    <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">No players bought yet</p>
                    <p className="text-gray-500 text-sm mt-2">Start bidding to build your squad!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Squad Summary */}
                    <div className="grid grid-cols-4 gap-4 mb-6">
                      <Card className="bg-blue-600/20 border-blue-500/30">
                        <div className="p-4 text-center">
                          <Target className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                          <p className="text-gray-400 text-xs mb-1">Batsmen</p>
                          <p className="text-white text-2xl font-bold">
                            {selectedTeam.players.filter(p => p.role === 'Batsman').length}
                          </p>
                        </div>
                      </Card>
                      <Card className="bg-red-600/20 border-red-500/30">
                        <div className="p-4 text-center">
                          <Zap className="w-6 h-6 text-red-400 mx-auto mb-2" />
                          <p className="text-gray-400 text-xs mb-1">Bowlers</p>
                          <p className="text-white text-2xl font-bold">
                            {selectedTeam.players.filter(p => p.role === 'Bowler').length}
                          </p>
                        </div>
                      </Card>
                      <Card className="bg-purple-600/20 border-purple-500/30">
                        <div className="p-4 text-center">
                          <Award className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                          <p className="text-gray-400 text-xs mb-1">All-rounders</p>
                          <p className="text-white text-2xl font-bold">
                            {selectedTeam.players.filter(p => p.role === 'All-rounder').length}
                          </p>
                        </div>
                      </Card>
                      <Card className="bg-green-600/20 border-green-500/30">
                        <div className="p-4 text-center">
                          <Crown className="w-6 h-6 text-green-400 mx-auto mb-2" />
                          <p className="text-gray-400 text-xs mb-1">Keepers</p>
                          <p className="text-white text-2xl font-bold">
                            {selectedTeam.players.filter(p => p.role === 'Wicket-keeper').length}
                          </p>
                        </div>
                      </Card>
                    </div>

                    {/* Player Cards */}
                    <div className="space-y-3">
                      {selectedTeam.players.map((player, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Card className="bg-slate-800/50 border-slate-700/50 hover:border-orange-500/50 transition-all">
                            <div className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-3">
                                    <h4 className="text-lg font-bold text-white">{player.name}</h4>
                                    <Badge className={`${getRoleColor(player.role)} border text-xs`}>
                                      <span className="flex items-center gap-1">
                                        {getRoleIcon(player.role)}
                                        {player.role}
                                      </span>
                                    </Badge>
                                    <Badge className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 text-xs">
                                      <Star className="w-3 h-3 mr-1 fill-yellow-400" />
                                      {player.rating}
                                    </Badge>
                                  </div>

                                  {/* Player Stats */}
                                  {player.stats && (
                                    <div className="grid grid-cols-6 gap-2 mt-3">
                                      <div className="bg-slate-900/50 rounded p-2 text-center">
                                        <p className="text-gray-400 text-[10px] mb-1">Matches</p>
                                        <p className="text-white text-sm font-bold">{player.stats.matches || 0}</p>
                                      </div>
                                      {player.stats.runs !== undefined && (
                                        <div className="bg-slate-900/50 rounded p-2 text-center">
                                          <p className="text-gray-400 text-[10px] mb-1">Runs</p>
                                          <p className="text-white text-sm font-bold">{player.stats.runs}</p>
                                        </div>
                                      )}
                                      {player.stats.wickets !== undefined && (
                                        <div className="bg-slate-900/50 rounded p-2 text-center">
                                          <p className="text-gray-400 text-[10px] mb-1">Wickets</p>
                                          <p className="text-white text-sm font-bold">{player.stats.wickets}</p>
                                        </div>
                                      )}
                                      {player.stats.average !== undefined && (
                                        <div className="bg-slate-900/50 rounded p-2 text-center">
                                          <p className="text-gray-400 text-[10px] mb-1">Avg</p>
                                          <p className="text-white text-sm font-bold">{player.stats.average}</p>
                                        </div>
                                      )}
                                      {player.stats.strikeRate !== undefined && (
                                        <div className="bg-slate-900/50 rounded p-2 text-center">
                                          <p className="text-gray-400 text-[10px] mb-1">SR</p>
                                          <p className="text-white text-sm font-bold">{player.stats.strikeRate}</p>
                                        </div>
                                      )}
                                      {player.stats.economy !== undefined && (
                                        <div className="bg-slate-900/50 rounded p-2 text-center">
                                          <p className="text-gray-400 text-[10px] mb-1">Econ</p>
                                          <p className="text-white text-sm font-bold">{player.stats.economy}</p>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>

                                {/* Price Tag */}
                                <div className="ml-4 text-right">
                                  <div className="bg-gradient-to-br from-orange-600 to-red-600 rounded-lg px-4 py-2">
                                    <p className="text-white/80 text-xs mb-1">Bought for</p>
                                    <p className="text-white text-xl font-black">₹{player.soldPrice || player.basePrice}Cr</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sold Animation - Enhanced */}
      <AnimatePresence>
        {showSoldAnimation && soldPlayerInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: "spring", duration: 0.7 }}
              className="relative"
            >
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl blur-3xl opacity-50 animate-pulse" />
              
              <motion.div
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative bg-gradient-to-br from-orange-600 via-red-600 to-orange-700 rounded-3xl p-16 text-center shadow-2xl border-4 border-yellow-400/50"
              >
                {/* Confetti burst animation */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.5, 0] }}
                  transition={{ duration: 1, repeat: Infinity, repeatDelay: 1 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="text-6xl">🎉</div>
                </motion.div>

                <motion.div
                  animate={{
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="relative"
                >
                  <Trophy className="w-32 h-32 text-yellow-300 mx-auto mb-8 drop-shadow-2xl" />
                </motion.div>

                <motion.h2
                  initial={{ scale: 0.5 }}
                  animate={{ scale: [0.5, 1.2, 1] }}
                  transition={{ duration: 0.5 }}
                  className="text-7xl font-black text-white mb-6 drop-shadow-2xl tracking-wider"
                  style={{
                    textShadow: "0 0 30px rgba(255, 255, 255, 0.5), 0 0 60px rgba(251, 146, 60, 0.5)",
                  }}
                >
                  SOLD!
                </motion.h2>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <p className="text-3xl text-white font-bold mb-3">{soldPlayerInfo.name}</p>
                  <div className="flex items-center justify-center gap-2 mb-6">
                    <Crown className="w-6 h-6 text-yellow-300" />
                    <p className="text-2xl text-yellow-100">to {soldPlayerInfo.team}</p>
                  </div>
                  <motion.div
                    animate={{
                      scale: [1, 1.05, 1],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                    }}
                    className="bg-white/20 rounded-2xl px-8 py-4 backdrop-blur-sm border-2 border-white/30"
                  >
                    <p className="text-5xl font-black text-yellow-300 drop-shadow-lg">
                      ₹{soldPlayerInfo.price}Cr
                    </p>
                  </motion.div>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Sale History Modal */}
      <SaleHistory
        saleHistory={saleHistory}
        isOpen={showSaleHistory}
        onClose={() => setShowSaleHistory(false)}
      />

      {/* Custom Scrollbar Styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(71, 85, 105, 0.2);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #f97316, #ea580c);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #ea580c, #dc2626);
        }
      `}</style>
    </div>
  )
}
