"use client"

import React, { useState, useEffect, useRef } from "react"
import dynamic from "next/dynamic"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Crown, Gavel, TrendingUp, Users, Zap, Clock, DollarSign, Trophy, Target, Award, Activity, Info, Star, TrendingDown, ExternalLink, History, XCircle, MessageCircle, Pause, Play, Plus, Send, Settings } from "lucide-react"
import { Input } from "@/components/ui/input"
import AuctionLeaderboard from "./auction-leaderboard"

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
  const [showAllTeamsModal, setShowAllTeamsModal] = useState(false)

  // New auction features state
  const [currentRound, setCurrentRound] = useState<number>(1)
  const [maxRounds, setMaxRounds] = useState<number>(2)
  const [currentCategory, setCurrentCategory] = useState<string>('marquee')
  const [categoryName, setCategoryName] = useState<string>('Marquee Players')
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
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [isHost, setIsHost] = useState(isHostProp)

  // Withdraw and End Auction state
  const [hasWithdrawn, setHasWithdrawn] = useState(false)
  const [showEndAuctionModal, setShowEndAuctionModal] = useState(false)
  const [endConfirmText, setEndConfirmText] = useState("")

  // Chat and Pause state
  const [chatMessages, setChatMessages] = useState<Array<{id: string, userName: string, message: string, timestamp: number, type: string}>>([])
  const [chatInput, setChatInput] = useState("")
  const [showChat, setShowChat] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [pausedBy, setPausedBy] = useState<{teamId: string, userName: string} | null>(null)
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false)
  const [newPlayerName, setNewPlayerName] = useState("")
  const [newPlayerRole, setNewPlayerRole] = useState("Batsman")
  const [newPlayerBasePrice, setNewPlayerBasePrice] = useState(2)
  const chatEndRef = useRef<HTMLDivElement>(null)

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
      const backUrl = encodeURIComponent(window.location.pathname)
      window.open(`/player/${currentPlayer.id}?from=${backUrl}`, '_blank')
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
        saleHistory: history_sales,
        isPaused: paused,
        pausedBy: pausedByData,
        chatMessages: chatMsgs
      } = payload

      if (updatedTeams) {
        setTeams(updatedTeams)
        // Store teams in sessionStorage for /teams page
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('auctionTeams', JSON.stringify(updatedTeams))
        }
      }
      if (player !== undefined) {
        setCurrentPlayer(player)
        setHasWithdrawn(false) // Reset withdraw state when new player comes up
      }
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
      if (paused !== undefined) setIsPaused(paused)
      if (pausedByData !== undefined) setPausedBy(pausedByData)
      if (chatMsgs !== undefined) setChatMessages(chatMsgs || [])
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
          setShowLeaderboard(true) // Show leaderboard first
          return
        }

        // Handle reconnection success
        if (msg.type === "reconnected") {
          console.log(" Successfully reconnected to room")
          setIsReconnecting(false)
          setShowReconnectPrompt(false)
          setReconnectAttempts(0)

          // Apply the synced state
          applyPayload(msg.payload)
          return
        }

        // Handle player disconnected
        if (msg.type === "player_disconnected") {
          console.log(`WARNING: ${msg.payload.userName} disconnected`)
          return
        }

        // Handle player reconnected
        if (msg.type === "player_reconnected") {
          console.log(` ${msg.payload.userName} reconnected`)
          return
        }

        // Handle chat message
        if (msg.type === "chat-message") {
          setChatMessages(prev => [...prev.slice(-99), msg.payload])
          return
        }

        // Handle auction paused
        if (msg.type === "auction-paused") {
          setIsPaused(true)
          setPausedBy({ teamId: '', userName: msg.payload.pausedBy })
          return
        }

        // Handle auction resumed
        if (msg.type === "auction-resumed") {
          setIsPaused(false)
          setPausedBy(null)
          return
        }

        // Handle player added
        if (msg.type === "player-added") {
          console.log("New player added:", msg.payload.player)
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
      console.log("WARNING: WebSocket disconnected, attempting reconnection...")
      setShowReconnectPrompt(true)
      attemptReconnect()
    }
  }, [wsConnected])

  const attemptReconnect = () => {
    if (reconnectAttempts >= maxReconnectAttempts) {
      console.log("ERROR: Max reconnection attempts reached")
      setShowReconnectPrompt(false)
      return
    }

    setIsReconnecting(true)
    setReconnectAttempts(prev => prev + 1)

    // Try to reconnect after a delay (exponential backoff)
    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 10000)

    reconnectIntervalRef.current = setTimeout(() => {
      console.log(` Reconnection attempt ${reconnectAttempts + 1}/${maxReconnectAttempts}`)

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

  // Handle pause auction
  const handlePauseAuction = () => {
    if (!wsRef.current || !wsConnected || phase !== 'active' || isPaused) return

    wsRef.current.send(JSON.stringify({
      type: "pause-auction",
      payload: {
        roomCode,
        teamId: localTeamId,
      },
    }))
  }

  // Handle resume auction
  const handleResumeAuction = () => {
    if (!wsRef.current || !wsConnected || !isPaused) return

    wsRef.current.send(JSON.stringify({
      type: "resume-auction",
      payload: {
        roomCode,
        teamId: localTeamId,
      },
    }))
  }

  // Handle send chat message
  const handleSendChat = () => {
    if (!wsRef.current || !wsConnected || !chatInput.trim()) return

    wsRef.current.send(JSON.stringify({
      type: "chat-message",
      payload: {
        message: chatInput.trim(),
      },
    }))
    setChatInput("")
  }

  // Handle add custom player
  const handleAddPlayer = () => {
    if (!wsRef.current || !wsConnected || !newPlayerName.trim() || !isHost) return

    wsRef.current.send(JSON.stringify({
      type: "add-player",
      payload: {
        player: {
          name: newPlayerName.trim(),
          role: newPlayerRole,
          basePrice: newPlayerBasePrice,
          rating: 75,
        },
      },
    }))
    setNewPlayerName("")
    setNewPlayerBasePrice(2)
    setShowAddPlayerModal(false)
  }

  // Auto scroll chat to bottom
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [chatMessages])

  // Handle withdraw from current bidding
  const handleWithdraw = () => {
    setHasWithdrawn(true)
    // If we're the highest bidder, we can't withdraw
    if (highestBidder === localTeamId) {
      return // Can't withdraw if you're winning
    }
  }

  // Handle end auction confirmation
  const handleEndAuction = () => {
    if (endConfirmText.toLowerCase() === "end") {
      setShowEndAuctionModal(false)
      setEndConfirmText("")
      setShowLeaderboard(true)
    }
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

  // Show leaderboard when auction is complete
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-2 sm:py-6 px-2 sm:px-4">
      {/* Reconnection Prompt */}
      {showReconnectPrompt && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-2 left-2 right-2 sm:left-1/2 sm:right-auto sm:transform sm:-translate-x-1/2 z-50 bg-orange-600/95 backdrop-blur-sm border-2 border-orange-400 rounded-xl px-4 py-3 shadow-2xl"
        >
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <div className="flex-1">
              <p className="text-white font-bold text-sm">Connection Lost</p>
              <p className="text-orange-100 text-xs">
                {isReconnecting
                  ? `Reconnecting... (${reconnectAttempts}/${maxReconnectAttempts})`
                  : "Trying to reconnect..."
                }
              </p>
            </div>
            <Button
              onClick={handleManualReconnect}
              size="sm"
              variant="outline"
              className="border-white text-white hover:bg-white/20 text-xs px-2 py-1"
            >
              Retry
            </Button>
          </div>
        </motion.div>
      )}

      {/* Paused Banner - Always Visible at Top */}
      <AnimatePresence>
        {isPaused && phase === 'active' && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-yellow-600 to-orange-600 border-b-4 border-yellow-400 shadow-2xl"
          >
            <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <Pause className="w-6 h-6 text-white" />
                </motion.div>
                <div>
                  <p className="text-white font-bold text-sm sm:text-base">AUCTION PAUSED</p>
                  {pausedBy && <p className="text-yellow-200 text-xs">by {pausedBy.userName}</p>}
                </div>
              </div>
              <Button
                onClick={handleResumeAuction}
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg"
              >
                <Play className="w-4 h-4 mr-1" />
                Resume
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`max-w-[1600px] mx-auto ${isPaused ? 'pt-16' : ''}`}>
        {/* Mobile Header - Compact */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3 sm:mb-6">
          {/* Room Info - Compact for Mobile */}
          <div className="flex items-center justify-between sm:block">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-slate-800/50 border border-orange-500/50 rounded-lg px-3 py-2">
                <Trophy className="w-4 h-4 text-orange-500" />
                <span className="text-xs text-gray-400">Room:</span>
                <span className="text-white font-bold text-sm">{roomCode}</span>
              </div>
              <a 
                href={`/players?from=${encodeURIComponent(window?.location?.pathname || '/rooms')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 bg-purple-500/20 border border-purple-500/50 rounded-lg px-2 py-2 text-purple-400 hover:bg-purple-500/30 transition-colors"
              >
                <Users className="w-4 h-4" />
                <span className="text-xs font-medium hidden sm:inline">All Players</span>
              </a>
              <a 
                href={`/teams/${roomCode}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 bg-green-500/20 border border-green-500/50 rounded-lg px-2 py-2 text-green-400 hover:bg-green-500/30 transition-colors"
              >
                <Trophy className="w-4 h-4" />
                <span className="text-xs font-medium hidden sm:inline">View Teams</span>
              </a>
            </div>
            <div className="sm:hidden flex items-center gap-2">
              <Badge className="bg-slate-800 text-gray-300 text-xs">
                {playerIndex + 1}/{totalPlayers}
              </Badge>
            </div>
          </div>

          {/* Your Team Card - Mobile Compact */}
          {localTeam && (
            <div className="bg-gradient-to-r from-blue-600/20 to-blue-800/20 border border-blue-500/50 rounded-lg p-2 sm:p-3 flex items-center gap-3 sm:min-w-[250px]">
              <div className="flex-1 min-w-0">
                <p className="text-blue-400 text-xs font-semibold truncate">{localTeam.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-green-400 font-bold text-sm">₹{localTeam.budget}Cr</span>
                  <span className="text-gray-500 text-xs">|</span>
                  <span className="text-white text-xs">{localTeam.players.length}/{localTeam.maxPlayers} players</span>
                </div>
              </div>
              {isMyBid && (
                <Badge className="bg-orange-500 text-white text-xs animate-pulse">LEADING</Badge>
              )}
            </div>
          )}
        </div>

        {/* Stats Bar - Compact Mobile */}
        <div className="grid grid-cols-5 gap-1 sm:gap-3 mb-3 sm:mb-6 bg-slate-800/30 rounded-lg p-2">
          <div className="text-center">
            <p className="text-[10px] text-gray-500">Round</p>
            <p className="text-sm font-bold text-white">{currentRound}/{maxRounds}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-gray-500">Category</p>
            <p className="text-[10px] sm:text-xs font-bold text-purple-400 truncate">{categoryName}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-gray-500">Sold</p>
            <p className="text-sm font-bold text-green-400">{totalPlayersSold}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-gray-500">Spent</p>
            <p className="text-sm font-bold text-orange-400">₹{totalMoneySpent}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-gray-500">Unsold</p>
            <p className="text-sm font-bold text-red-400">{unsoldPlayersCount}</p>
          </div>
        </div>

        {/* Break Screen Overlay */}
        <AnimatePresence>
          {(phase === 'break' || phase === 'strategic_timeout') && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            >
              <motion.div
                initial={{ scale: 0.5, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.5, y: 50 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="w-full max-w-md"
              >
                <Card className="bg-gradient-to-br from-slate-800 via-slate-900 to-black border-2 border-orange-500 shadow-2xl shadow-orange-500/50">
                  <div className="p-6 sm:p-10 text-center">
                    {/* Break Icon */}
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-5xl sm:text-7xl mb-4"
                    >
                      {breakType === 'snack' && '☕'}
                      {breakType === 'category' && '✅'}
                      {breakType === 'strategic' && '⏸️'}
                    </motion.div>

                    <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 mb-3">
                      {breakType === 'snack' && 'Snack Break!'}
                      {breakType === 'category' && 'Category Complete!'}
                      {breakType === 'strategic' && 'Strategic Timeout'}
                    </h2>

                    <p className="text-sm sm:text-base text-white mb-4">{breakMessage}</p>

                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 mb-4"
                    >
                      {breakTimeLeft}s
                    </motion.div>

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

        {/* Main Content - Mobile First Layout */}
        <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-6">
          {/* Player & Bidding Section */}
          <div className="sm:col-span-2 space-y-3">
            {/* Timer - Mobile Compact */}
            <Card className="bg-gradient-to-r from-slate-800 to-slate-900 border-slate-700/50">
              <div className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: timeLeft <= 10 ? [0, 10, -10, 0] : 0 }}
                      transition={{ duration: 0.5, repeat: timeLeft <= 10 ? Infinity : 0 }}
                    >
                      <Clock className={`w-5 h-5 ${timeLeft <= 10 ? 'text-red-500' : 'text-orange-500'}`} />
                    </motion.div>
                    <span className="text-gray-400 text-sm">Time Left</span>
                  </div>
                  <motion.span
                    animate={{ scale: timeLeft <= 10 ? [1, 1.1, 1] : 1 }}
                    transition={{ duration: 0.5, repeat: timeLeft <= 10 ? Infinity : 0 }}
                    className={`text-3xl sm:text-4xl font-black ${
                      timeLeft <= 10 
                        ? "text-red-500" 
                        : timeLeft <= 20 
                        ? "text-orange-500" 
                        : "text-white"
                    }`}
                  >
                    {timeLeft}s
                  </motion.span>
                </div>
                <div className="mt-2 w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className={`h-2 rounded-full ${
                      timeLeft <= 10 ? "bg-red-500" : "bg-gradient-to-r from-orange-500 to-yellow-500"
                    }`}
                    animate={{ width: `${(timeLeft / 60) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            </Card>

            {/* Current Player Card - Mobile Optimized */}
            <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-orange-500/50">
              <div className="p-3 sm:p-5">
                {/* Player Name & Info */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <motion.h2
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 truncate"
                    >
                      {currentPlayer.name}
                    </motion.h2>
                    <div className="flex flex-wrap items-center gap-1 mt-1">
                      <Badge className={`${getRoleColor(currentPlayer.role)} text-xs px-2 py-0.5`}>
                        {currentPlayer.role}
                      </Badge>
                      <Badge className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-0.5">
                        ⭐ {currentPlayer.rating}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    onClick={handleViewPlayerDetails}
                    size="sm"
                    variant="outline"
                    className="border-orange-500/50 text-orange-400 text-xs"
                  >
                    <Info className="w-3 h-3 mr-1" />
                    Stats
                  </Button>
                </div>

                {/* Quick Stats - Horizontal on Mobile */}
                {currentPlayer.stats && (
                  <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
                    <div className="flex-shrink-0 bg-blue-600/20 border border-blue-500/30 rounded-lg px-3 py-1.5 text-center">
                      <p className="text-[10px] text-gray-400">Matches</p>
                      <p className="text-white font-bold">{currentPlayer.stats.matches || 0}</p>
                    </div>
                    {currentPlayer.stats.runs !== undefined && (
                      <div className="flex-shrink-0 bg-green-600/20 border border-green-500/30 rounded-lg px-3 py-1.5 text-center">
                        <p className="text-[10px] text-gray-400">Runs</p>
                        <p className="text-white font-bold">{currentPlayer.stats.runs}</p>
                      </div>
                    )}
                    {currentPlayer.stats.wickets !== undefined && (
                      <div className="flex-shrink-0 bg-red-600/20 border border-red-500/30 rounded-lg px-3 py-1.5 text-center">
                        <p className="text-[10px] text-gray-400">Wickets</p>
                        <p className="text-white font-bold">{currentPlayer.stats.wickets}</p>
                      </div>
                    )}
                    {currentPlayer.stats.average !== undefined && (
                      <div className="flex-shrink-0 bg-purple-600/20 border border-purple-500/30 rounded-lg px-3 py-1.5 text-center">
                        <p className="text-[10px] text-gray-400">Avg</p>
                        <p className="text-white font-bold">{currentPlayer.stats.average}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Current Bid Section - Mobile Optimized */}
                <div className="bg-slate-900/80 rounded-xl p-3 sm:p-4 border border-orange-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Gavel className="w-4 h-4 text-orange-400" />
                      <span className="text-gray-400 text-sm">Current Bid</span>
                    </div>
                    <span className="text-gray-500 text-xs">Base: ₹{currentPlayer.basePrice}Cr</span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <motion.p
                        key={currentPrice}
                        initial={{ scale: 1.2, color: "#f97316" }}
                        animate={{ scale: 1, color: "#ffffff" }}
                        className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500"
                      >
                        ₹{currentPrice}Cr
                      </motion.p>
                      {highestBidderTeam && (
                        <p className="text-xs text-gray-400 mt-1">
                          <Crown className="w-3 h-3 inline text-yellow-400 mr-1" />
                          {highestBidderTeam.name}
                        </p>
                      )}
                    </div>

                    {/* Bid Button - Large for Mobile */}
                    <Button
                      onClick={handleBid}
                      disabled={!canBid || isPaused}
                      size="lg"
                      className={`
                        px-6 py-4 text-base font-bold shadow-xl min-w-[120px]
                        ${isMyBid
                          ? "bg-gradient-to-r from-green-600 to-green-700"
                          : "bg-gradient-to-r from-orange-600 to-red-600"
                        }
                        ${(!canBid || isPaused) ? "opacity-50 cursor-not-allowed" : "hover:scale-105 active:scale-95"}
                        transition-all duration-200
                      `}
                    >
                      <Gavel className="w-5 h-5 mr-2" />
                      {isMyBid ? `+₹1Cr` : `₹${currentPrice + 1}Cr`}
                    </Button>
                  </div>

                  {/* Budget Warning */}
                  {localTeam && localTeam.budget < currentPrice + 5 && (
                    <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
                      <TrendingDown className="w-3 h-3" />
                      Low budget! ₹{localTeam.budget}Cr left
                    </p>
                  )}
                </div>

                {/* Action Buttons Row - Mobile */}
                <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                  {/* Pause/Resume Button */}
                  {phase === 'active' && !isPaused && (
                    <Button
                      onClick={handlePauseAuction}
                      size="sm"
                      variant="outline"
                      className="flex-shrink-0 border-yellow-500/50 text-yellow-400 text-xs"
                    >
                      <Pause className="w-3 h-3 mr-1" />
                      Pause
                    </Button>
                  )}
                  
                  {/* Strategic Timeout */}
                  {strategicTimeouts[localTeamId] > 0 && phase === 'active' && !isPaused && (
                    <Button
                      onClick={handleStrategicTimeout}
                      size="sm"
                      variant="outline"
                      className="flex-shrink-0 border-purple-500/50 text-purple-400 text-xs"
                    >
                      <Clock className="w-3 h-3 mr-1" />
                      Timeout ({strategicTimeouts[localTeamId]})
                    </Button>
                  )}

                  {/* Mark Unsold - Host Only */}
                  {isHost && phase === 'active' && !isPaused && (
                    <Button
                      onClick={handleMarkUnsold}
                      size="sm"
                      variant="outline"
                      className="flex-shrink-0 border-red-500/50 text-red-400 text-xs"
                    >
                      <XCircle className="w-3 h-3 mr-1" />
                      Unsold
                    </Button>
                  )}

                  {/* View History */}
                  <Button
                    onClick={() => setShowSaleHistory(true)}
                    size="sm"
                    variant="outline"
                    className="flex-shrink-0 border-blue-500/50 text-blue-400 text-xs"
                  >
                    <History className="w-3 h-3 mr-1" />
                    History
                  </Button>

                  {/* Add Player - Host Only */}
                  {isHost && (
                    <Button
                      onClick={() => setShowAddPlayerModal(true)}
                      size="sm"
                      variant="outline"
                      className="flex-shrink-0 border-green-500/50 text-green-400 text-xs"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Player
                    </Button>
                  )}
                </div>

                {/* Bid History - Compact */}
                {bidHistory.length > 0 && (
                  <div className="mt-3 bg-slate-800/50 rounded-lg p-2">
                    <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      Recent Bids ({bidHistory.length})
                    </p>
                    <div className="space-y-1 max-h-24 overflow-y-auto">
                      {bidHistory.slice().reverse().slice(0, 5).map((bid, idx) => (
                        <div
                          key={idx}
                          className={`flex items-center justify-between text-xs px-2 py-1 rounded ${
                            idx === 0 ? 'bg-orange-500/20 border border-orange-500/30' : 'bg-slate-700/30'
                          }`}
                        >
                          <span className="text-white truncate">{bid.teamName}</span>
                          <span className={`font-bold ${idx === 0 ? 'text-orange-400' : 'text-gray-400'}`}>
                            ₹{bid.price}Cr
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Right Panel - Teams & Chat */}
          <div className="space-y-3">
            {/* View Teams Button */}
            <Button
              onClick={() => setShowAllTeamsModal(true)}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-3 text-sm shadow-lg"
            >
              <Users className="w-4 h-4 mr-2" />
              View All Teams
            </Button>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-800/50 rounded-lg p-2 text-center">
                <p className="text-[10px] text-gray-500">Total Players</p>
                <p className="text-lg font-bold text-white">
                  {teams.reduce((sum, team) => sum + team.players.length, 0)}
                </p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-2 text-center">
                <p className="text-[10px] text-gray-500">Total Spent</p>
                <p className="text-lg font-bold text-orange-400">
                  ₹{teams.reduce((sum, team) => sum + (100 - team.budget), 0).toFixed(0)}Cr
                </p>
              </div>
            </div>

            {/* Chat Toggle */}
            <Button
              onClick={() => setShowChat(!showChat)}
              variant="outline"
              className={`w-full text-xs ${showChat ? 'bg-blue-600/20 border-blue-500' : 'border-slate-600'}`}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              {showChat ? 'Hide Chat' : 'Show Chat'}
              {chatMessages.length > 0 && !showChat && (
                <Badge className="ml-2 bg-red-500 text-white text-[10px]">{chatMessages.length}</Badge>
              )}
            </Button>

            {/* Chat Panel */}
            <AnimatePresence>
              {showChat && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Card className="bg-slate-800/80 border-slate-600/50">
                    <div className="p-2">
                      <div className="h-32 sm:h-40 overflow-y-auto space-y-1 mb-2 bg-slate-900/50 rounded p-1">
                        {chatMessages.length === 0 ? (
                          <p className="text-center text-gray-500 text-xs py-4">No messages yet</p>
                        ) : (
                          chatMessages.map((msg) => (
                            <div
                              key={msg.id}
                              className={`rounded p-1.5 text-xs ${
                                msg.type === 'system'
                                  ? 'bg-blue-500/20 text-blue-300 text-center'
                                  : 'bg-slate-700/50'
                              }`}
                            >
                              {msg.type !== 'system' && (
                                <span className="text-orange-400 font-semibold">{msg.userName}: </span>
                              )}
                              <span className="text-white">{msg.message}</span>
                            </div>
                          ))
                        )}
                        <div ref={chatEndRef} />
                      </div>
                      <div className="flex gap-1">
                        <Input
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}
                          placeholder="Message..."
                          className="bg-slate-900/50 border-slate-600 text-white text-xs h-8"
                        />
                        <Button
                          onClick={handleSendChat}
                          disabled={!chatInput.trim()}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 h-8 px-2"
                        >
                          <Send className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pause/Resume Controls */}
            {phase === 'active' && (
              <Card className="bg-slate-800/50 border-slate-600/50 p-2">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-3 h-3 text-blue-400" />
                  <p className="text-blue-400 font-semibold text-xs">Auction Controls</p>
                </div>
                {!isPaused ? (
                  <Button
                    onClick={handlePauseAuction}
                    size="sm"
                    className="w-full bg-yellow-600 hover:bg-yellow-700 text-white text-xs py-2"
                  >
                    <Pause className="w-3 h-3 mr-1" />
                    Pause Auction
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <div className="bg-yellow-500/20 border border-yellow-500/50 rounded p-2 text-center">
                      <p className="text-yellow-400 text-xs font-bold animate-pulse">⏸️ PAUSED</p>
                      {pausedBy && <p className="text-yellow-300 text-[10px]">by {pausedBy.userName}</p>}
                    </div>
                    <Button
                      onClick={handleResumeAuction}
                      size="sm"
                      className="w-full bg-green-600 hover:bg-green-700 text-white text-xs py-2"
                    >
                      <Play className="w-3 h-3 mr-1" />
                      Resume Auction
                    </Button>
                  </div>
                )}
              </Card>
            )}

            {/* Host Controls - Add Player */}
            {isHost && phase === 'active' && (
              <Card className="bg-amber-900/20 border-amber-500/50 p-2">
                <div className="flex items-center gap-2 mb-2">
                  <Settings className="w-3 h-3 text-amber-400" />
                  <p className="text-amber-400 font-semibold text-xs">Host Controls</p>
                </div>
                <Button
                  onClick={() => setShowAddPlayerModal(true)}
                  size="sm"
                  className="w-full bg-green-600 hover:bg-green-700 text-xs py-2"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Player
                </Button>
              </Card>
            )}

            {/* End Auction Button */}
            <Button
              onClick={() => setShowEndAuctionModal(true)}
              variant="outline"
              size="sm"
              className="w-full border-red-500/50 text-red-400 text-xs"
            >
              🛑 End Auction
            </Button>
          </div>
        </div>
      </div>

      {/* Sold Animation */}
      <AnimatePresence>
        {showSoldAnimation && soldPlayerInfo && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          >
            <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl border-4 border-green-400 shadow-2xl px-12 py-8 text-center">
              <Gavel className="w-16 h-16 text-white mx-auto mb-4" />
              <h2 className="text-4xl font-black text-white mb-2">SOLD!</h2>
              <p className="text-2xl text-white font-bold">{soldPlayerInfo.name}</p>
              <p className="text-xl text-green-200 mt-2">to {soldPlayerInfo.team}</p>
              <p className="text-3xl font-black text-white mt-4">₹{soldPlayerInfo.price} Cr</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Player Modal */}
      <AnimatePresence>
        {showAddPlayerModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddPlayerModal(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-2xl border-2 border-green-500/50 shadow-2xl max-w-md w-full"
            >
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6">
                <h2 className="text-2xl font-black text-white flex items-center gap-2">
                  <Plus className="w-6 h-6" />
                  Add Custom Player
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Player Name *</label>
                  <Input
                    value={newPlayerName}
                    onChange={(e) => setNewPlayerName(e.target.value)}
                    placeholder="Enter player name"
                    className="bg-slate-900/50 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Role</label>
                  <select
                    value={newPlayerRole}
                    onChange={(e) => setNewPlayerRole(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-600 text-white rounded-md px-3 py-2"
                  >
                    <option value="Batsman">Batsman</option>
                    <option value="Bowler">Bowler</option>
                    <option value="All-rounder">All-rounder</option>
                    <option value="Wicket-keeper">Wicket-keeper</option>
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Base Price (Cr)</label>
                  <Input
                    type="number"
                    value={newPlayerBasePrice}
                    onChange={(e) => setNewPlayerBasePrice(Number(e.target.value))}
                    min={0.5}
                    max={20}
                    step={0.5}
                    className="bg-slate-900/50 border-slate-600 text-white"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => setShowAddPlayerModal(false)}
                    variant="outline"
                    className="flex-1 border-slate-600 text-gray-300 hover:bg-slate-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddPlayer}
                    disabled={!newPlayerName.trim()}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Player
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
                  ×
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
                  <div className="text-6xl"></div>
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
                <Button
                  onClick={() => setShowEndAuctionModal(false)}
                  variant="outline"
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleEndAuction}
                  disabled={endConfirmText.toLowerCase() !== 'end'}
                  className={`flex-1 ${
                    endConfirmText.toLowerCase() === 'end'
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  End Auction
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
