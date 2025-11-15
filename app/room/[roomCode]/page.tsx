'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Users, Clock, Trophy, DollarSign, User, LogOut, Play } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Team {
  id: string
  name: string
  budget: number
  players: any[]
  maxPlayers: number
}

interface Player {
  id: string
  name: string
  role: string
  basePrice: number
  soldTo?: string
  soldPrice?: number
}

interface RoomState {
  roomCode: string
  hostName: string
  hostId: string
  playerCount: number
  maxPlayers: number
  minTeams: number
  phase: 'lobby' | 'countdown' | 'active' | 'completed'
  takenTeams: string[]
  availableTeams: Team[]
  players?: Array<{userName: string, userId: string, teamId?: string, teamName?: string, isHost: boolean}>
  canStart: boolean
}

interface AuctionState {
  playerIndex: number
  currentPrice: number
  highestBidder: string | null
  bidHistory: any[]
  timeLeft: number
  phase: string
  countdownSeconds?: number
}

export default function RoomPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const roomCode = params?.roomCode as string

  // Connection state
  const wsRef = useRef<WebSocket | null>(null)
  const [connected, setConnected] = useState(false)
  const [reconnecting, setReconnecting] = useState(false)

  // User state
  const [userName, setUserName] = useState('')
  const [userId, setUserId] = useState('')
  const [isHost, setIsHost] = useState(false)
  const [hasJoined, setHasJoined] = useState(false)
  const [inWaitingLobby, setInWaitingLobby] = useState(false)

  // Room state
  const [roomState, setRoomState] = useState<RoomState | null>(null)
  const [selectedTeamId, setSelectedTeamId] = useState<string>('')
  const [teams, setTeams] = useState<Team[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [joinedPlayers, setJoinedPlayers] = useState<Array<{userName: string, userId: string, teamId?: string, teamName?: string, isHost: boolean}>>([])
  
  // Auction state
  const [auctionState, setAuctionState] = useState<AuctionState | null>(null)
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null)

  // Results
  const [results, setResults] = useState<any>(null)

  // Generate or retrieve userId
  useEffect(() => {
    let id = localStorage.getItem('userId')
    if (!id) {
      id = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('userId', id)
    }
    setUserId(id)

    const savedName = localStorage.getItem('userName')
    if (savedName) {
      setUserName(savedName)
    }
    
    // Check for stored connection info for auto-rejoin
    const storedConnection = localStorage.getItem('auctionConnection')
    if (storedConnection) {
      try {
        const connectionInfo = JSON.parse(storedConnection)
        // If this is the same room, prepare for reconnection
        if (connectionInfo.roomCode === roomCode) {
          console.log('🔄 Found stored connection for this room, preparing to rejoin...')
          setUserName(connectionInfo.userName)
          // Auto-join will be triggered after WebSocket connects
        }
      } catch (e) {
        console.error('Error parsing connection info:', e)
      }
    }
  }, [])

  // Connect to WebSocket
  useEffect(() => {
    if (!roomCode || !userId) return

    connectToRoom()

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [roomCode, userId])

  const connectToRoom = () => {
    try {
      // Determine WebSocket URL based on how user is accessing the app
      let wsUrl: string
      
      if (typeof window !== 'undefined') {
        const hostname = window.location.hostname
        
        console.log('🔍 Detecting WebSocket URL...')
        console.log('   Current hostname:', hostname)
        
        // If accessing via localhost
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
          wsUrl = 'ws://localhost:8080'
          console.log('   ✅ Using local WebSocket:', wsUrl)
        } 
        // If accessing via ngrok (internet)
        else if (hostname.includes('ngrok')) {
          // Use the WebSocket ngrok tunnel
          wsUrl = 'wss://sheathier-achromatous-meredith.ngrok-free.dev'
          console.log('   ✅ Using ngrok WebSocket:', wsUrl)
        } 
        // If accessing via local network IP
        else {
          wsUrl = 'ws://192.168.56.1:8080'
          console.log('   ✅ Using network WebSocket:', wsUrl)
        }
      } else {
        wsUrl = 'ws://localhost:8080'
      }
      
      console.log('Connecting to WebSocket:', wsUrl)
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = () => {
        console.log('Connected to auction server')
        setConnected(true)
        setReconnecting(false)
        
        // Check if we should auto-rejoin
        const storedConnection = localStorage.getItem('auctionConnection')
        if (storedConnection && userName) {
          try {
            const connectionInfo = JSON.parse(storedConnection)
            const timeSinceDisconnect = Date.now() - connectionInfo.timestamp
            
            // If same room and within 2 minutes, auto-rejoin
            if (connectionInfo.roomCode === roomCode && timeSinceDisconnect < 2 * 60 * 1000) {
              console.log('🔄 Auto-rejoining room...')
              setTimeout(() => {
                ws.send(JSON.stringify({
                  type: 'join-room',
                  payload: {
                    roomCode,
                    userName: connectionInfo.userName,
                    userId: connectionInfo.userId,
                    isReconnecting: true
                  },
                }))
              }, 500) // Small delay to ensure connection is stable
            }
          } catch (e) {
            console.error('Error during auto-rejoin:', e)
          }
        }
      }

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data)
          handleWebSocketMessage(msg)
        } catch (error) {
          console.error('Failed to parse message:', error)
        }
      }

      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error)
        console.error('   Tried to connect to:', wsUrl)
        toast({
          title: 'Connection Error',
          description: `Failed to connect to auction server. Check console for details.`,
          variant: 'destructive',
        })
      }

      ws.onclose = () => {
        console.log('Disconnected from auction server')
        setConnected(false)
        
        // Attempt reconnection
        if (!reconnecting) {
          setReconnecting(true)
          setTimeout(() => {
            connectToRoom()
          }, 3000)
        }
      }
    } catch (error) {
      console.error('Failed to create WebSocket:', error)
    }
  }

  const handleWebSocketMessage = (msg: any) => {
    console.log('Received:', msg.type, msg.payload)

    switch (msg.type) {
      case 'room-joined':
        setHasJoined(true)
        setRoomState(msg.payload.roomInfo)
        setTeams(msg.payload.availableTeams || [])
        setIsHost(msg.payload.isHost || false)
        // Store joined players list
        if (msg.payload.roomInfo.players) {
          setJoinedPlayers(msg.payload.roomInfo.players)
        }
        toast({
          title: 'Joined Room',
          description: `Welcome to room ${roomCode}!`,
        })
        break
        
      case 'reconnected':
        console.log('✅ Successfully reconnected!')
        setHasJoined(true)
        setRoomState(msg.payload.roomInfo)
        setTeams(msg.payload.availableTeams || [])
        setIsHost(msg.payload.isHost || false)
        setSelectedTeamId(msg.payload.teamId || '')
        setInWaitingLobby(!!msg.payload.teamId)
        
        // Restore auction state if active
        if (msg.payload.auctionState) {
          setAuctionState(msg.payload.auctionState)
          if (msg.payload.currentPlayer) {
            setCurrentPlayer(msg.payload.currentPlayer)
          }
        }
        
        // Store joined players list
        if (msg.payload.roomInfo.players) {
          setJoinedPlayers(msg.payload.roomInfo.players)
        }
        
        toast({
          title: 'Reconnected!',
          description: msg.payload.message || 'Successfully rejoined the room',
        })
        break

      case 'room-update':
        setRoomState(msg.payload.roomInfo)
        setTeams(msg.payload.availableTeams || [])
        // Update joined players list
        if (msg.payload.roomInfo.players) {
          setJoinedPlayers(msg.payload.roomInfo.players)
        }
        break

      case 'team-selected':
        console.log('📨 Received team-selected message:', msg.payload)
        setSelectedTeamId(msg.payload.teamId)
        setInWaitingLobby(true) // Move to waiting lobby after team selection
        localStorage.setItem('selectedTeamId', msg.payload.teamId)
        toast({
          title: 'Team Selected!',
          description: `You are now ${msg.payload.teamName}! Waiting for other players...`,
        })
        break

      case 'ready_to_start':
        toast({
          title: 'Ready to Start',
          description: msg.payload.message,
        })
        break

      case 'countdown':
        if (auctionState) {
          setAuctionState({
            ...auctionState,
            countdownSeconds: msg.payload.seconds,
          })
        } else {
          setAuctionState({
            playerIndex: 0,
            currentPrice: 0,
            highestBidder: null,
            bidHistory: [],
            timeLeft: 30,
            phase: 'countdown',
            countdownSeconds: msg.payload.seconds,
          })
        }
        toast({
          title: 'Starting Soon',
          description: msg.payload.message,
        })
        break

      case 'auction_started':
        toast({
          title: 'Auction Started!',
          description: 'Good luck bidding!',
        })
        break

      case 'state':
        const { teams: serverTeams, auctionState: serverAuction, roomCode: rc } = msg.payload
        setTeams(serverTeams || [])
        setAuctionState(serverAuction)
        
        if (serverAuction && serverAuction.phase === 'active') {
          setRoomState(prev => prev ? { ...prev, phase: 'active' } : null)
        }
        break

      case 'results':
        setResults(msg.payload)
        setRoomState(prev => prev ? { ...prev, phase: 'completed' } : null)
        toast({
          title: 'Auction Complete',
          description: 'View your final team!',
        })
        break

      case 'error':
        toast({
          title: 'Error',
          description: msg.payload.message,
          variant: 'destructive',
        })
        break
        
      case 'player_disconnected':
        toast({
          title: 'Player Disconnected',
          description: msg.payload.message,
          variant: 'default',
        })
        break
        
      case 'player_reconnected':
        toast({
          title: 'Player Reconnected',
          description: msg.payload.message,
        })
        break
        
      case 'player_removed':
        toast({
          title: 'Player Removed',
          description: msg.payload.message,
          variant: 'destructive',
        })
        break
    }
  }

  const handleJoinRoom = () => {
    if (!userName.trim()) {
      toast({
        title: 'Name Required',
        description: 'Please enter your name',
        variant: 'destructive',
      })
      return
    }

    localStorage.setItem('userName', userName)

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      // Check if this is a reconnection attempt
      const storedConnection = localStorage.getItem('auctionConnection')
      let isReconnecting = false
      
      if (storedConnection) {
        try {
          const connectionInfo = JSON.parse(storedConnection)
          const timeSinceDisconnect = Date.now() - connectionInfo.timestamp
          
          // If same room and within 2 minutes, this is a reconnection
          if (connectionInfo.roomCode === roomCode && 
              connectionInfo.userId === userId &&
              timeSinceDisconnect < 2 * 60 * 1000) {
            isReconnecting = true
            console.log('🔄 Rejoining room with reconnection flag')
          }
        } catch (e) {
          console.error('Error checking reconnection status:', e)
        }
      }
      
      wsRef.current.send(JSON.stringify({
        type: 'join-room',
        payload: {
          roomCode,
          userName,
          userId,
          isReconnecting
        },
      }))
    }
  }

  // Team selection handler
  const handleSelectTeam = (teamId: string) => {
    console.log('🎯 handleSelectTeam called with teamId:', teamId)
    console.log('🔌 WebSocket state:', wsRef.current?.readyState)
    
    if (!wsRef.current) {
      console.error('❌ No WebSocket connection!')
      toast({
        title: 'Connection Error',
        description: 'Not connected to server',
        variant: 'destructive',
      })
      return
    }
    
    if (wsRef.current.readyState !== WebSocket.OPEN) {
      console.error('❌ WebSocket not open! State:', wsRef.current.readyState)
      toast({
        title: 'Connection Error',
        description: 'WebSocket not ready',
        variant: 'destructive',
      })
      return
    }
    
    console.log('✅ Sending select-team message...')
    wsRef.current.send(JSON.stringify({
      type: 'select-team',
      payload: { teamId },
    }))
  }

  const handleStartAuction = () => {
    if (!isHost) {
      toast({
        title: 'Not Allowed',
        description: 'Only the host can start the auction',
        variant: 'destructive',
      })
      return
    }

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'start-auction',
        payload: {},
      }))
    }
  }

  const handlePlaceBid = (amount: number) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'bid',
        payload: { amount },
      }))
    }
  }

  const handleLeaveRoom = () => {
    if (wsRef.current) {
      wsRef.current.close()
    }
    router.push('/')
  }

  // Get current player
  useEffect(() => {
    if (auctionState && players.length > 0) {
      setCurrentPlayer(players[auctionState.playerIndex] || null)
    }
  }, [auctionState, players])

  // Render: Not connected
  if (!connected && !reconnecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <h2 className="text-xl font-bold mb-2">Connecting...</h2>
            <p className="text-muted-foreground">Establishing connection to auction server</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Render: Reconnecting
  if (reconnecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <h2 className="text-xl font-bold mb-2">Reconnecting...</h2>
            <p className="text-muted-foreground">Lost connection, attempting to reconnect</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Render: Join room screen
  if (!hasJoined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card>
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <div className="text-5xl mb-4">🏏</div>
                <h1 className="text-3xl font-bold mb-2">Join Auction Room</h1>
                <p className="text-muted-foreground">Room Code: <span className="font-mono font-bold text-orange-500">{roomCode}</span></p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Your Name</label>
                  <Input
                    placeholder="Enter your name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom()}
                  />
                </div>

                <Button onClick={handleJoinRoom} className="w-full" size="lg">
                  <Users className="mr-2 h-5 w-5" />
                  Join Room
                </Button>

                <Button onClick={() => router.push('/')} variant="outline" className="w-full">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  // Render: Lobby - Team Selection OR Waiting
  if (roomState?.phase === 'lobby' || roomState?.phase === 'countdown') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <span className="text-4xl">🏏</span>
                {inWaitingLobby ? 'Waiting Lobby' : 'Select Your Team'}
              </h1>
              <p className="text-muted-foreground">Room: <span className="font-mono font-bold text-orange-500">{roomCode}</span></p>
            </div>
            <Button onClick={handleLeaveRoom} variant="outline">
              <LogOut className="mr-2 h-4 w-4" />
              Leave Room
            </Button>
          </div>

          {/* Screen 1: Team Selection */}
          {!inWaitingLobby && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">Choose Your IPL Team</h2>
                <p className="text-muted-foreground mb-6">Select a team to represent in the auction</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {teams.map((team) => {
                    const isTaken = roomState.takenTeams.includes(team.id)
                    const isSelected = selectedTeamId === team.id

                    return (
                      <motion.div
                        key={team.id}
                        whileHover={!isTaken ? { scale: 1.05 } : {}}
                        whileTap={!isTaken ? { scale: 0.95 } : {}}
                      >
                        <Card
                          className={`cursor-pointer transition-all ${
                            isSelected
                              ? 'border-green-500 border-2 bg-green-500/10'
                              : isTaken
                              ? 'opacity-50 cursor-not-allowed border-red-500'
                              : 'hover:border-orange-500'
                          }`}
                          onClick={() => !isTaken && handleSelectTeam(team.id)}
                        >
                          <CardContent className="p-4 text-center">
                            <div className="mb-2">
                              {isSelected && <Badge className="mb-2 bg-green-500">Your Team</Badge>}
                              {isTaken && !isSelected && <Badge variant="destructive" className="mb-2">Taken</Badge>}
                            </div>
                            <h3 className="font-bold">{team.name}</h3>
                            <p className="text-sm text-muted-foreground">₹{team.budget}Cr</p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )
                  })}
                </div>

                {/* Join Lobby Button */}
                {selectedTeamId && (
                  <div className="mt-8 text-center">
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-4">
                      <p className="text-green-500 font-semibold">
                        ✓ Team selected! Click below to join the waiting lobby
                      </p>
                    </div>
                    <Button
                      onClick={() => router.push(`/room/${roomCode}/lobby`)}
                      size="lg"
                      className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-xl px-8 py-6"
                    >
                      <Users className="mr-2 h-6 w-6" />
                      Join Waiting Lobby
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Waiting Lobby */}
          {inWaitingLobby && (
            <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Users className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Players</p>
                    <p className="text-2xl font-bold">{roomState.playerCount}/{roomState.maxPlayers}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Trophy className="h-8 w-8 text-yellow-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Min Teams</p>
                    <p className="text-2xl font-bold">{roomState.minTeams}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <User className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Host</p>
                    <p className="text-lg font-bold truncate">{roomState.hostName}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-8 w-8 text-orange-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="text-lg font-bold">
                      {roomState.phase === 'countdown' ? `Starting in ${auctionState?.countdownSeconds}s` : 'Waiting'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Players List */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Users className="h-6 w-6" />
                Players in Lobby ({roomState.playerCount}/{roomState.maxPlayers})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {joinedPlayers.length > 0 ? (
                  // Show actual players from server data
                  joinedPlayers.map((player, i) => (
                    <div
                      key={player.userId}
                      className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg border border-slate-700"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center font-bold text-white">
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{player.userName}</p>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="text-xs">
                            {player.isHost ? '👑 Host' : 'Guest'}
                          </Badge>
                          {player.teamName && (
                            <Badge className="text-xs bg-blue-500">
                              {player.teamName}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  // Fallback to generic list if players data not yet loaded
                  Array.from({ length: roomState.playerCount }, (_, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg border border-slate-700"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center font-bold text-white">
                        {i + 1}
                      </div>
                      <div>
                        <p className="font-semibold">Player {i + 1}</p>
                        <Badge variant="outline" className="text-xs">
                          {i === 0 ? 'Host' : 'Guest'}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
                {/* Empty slots */}
                {Array.from({ length: roomState.maxPlayers - roomState.playerCount }, (_, i) => (
                  <div
                    key={`empty-${i}`}
                    className="flex items-center gap-3 p-3 bg-slate-900 rounded-lg border border-dashed border-slate-700"
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-600">
                      {roomState.playerCount + i + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-600">Waiting...</p>
                      <Badge variant="outline" className="text-xs text-slate-600">Empty</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Team Selection - Only show if player hasn't selected a team yet */}

          {/* Start Button Section - Placed directly after player list */}
          <div className="mt-6">
            {/* Host sees start button when minimum players joined */}
            {isHost && (
              <div className="text-center">
                {roomState.playerCount >= roomState.minTeams ? (
                  <div className="space-y-4">
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-4">
                      <p className="text-green-500 font-semibold">
                        ✓ Ready to start! {roomState.playerCount} players joined (minimum: {roomState.minTeams})
                      </p>
                    </div>
                    <Button
                      onClick={handleStartAuction}
                      size="lg"
                      className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-xl px-8 py-6"
                      disabled={roomState.phase === 'countdown'}
                    >
                      <Play className="mr-2 h-6 w-6" />
                      {roomState.phase === 'countdown' ? `Starting in ${auctionState?.countdownSeconds}s...` : 'Start Auction'}
                    </Button>
                  </div>
                ) : (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                    <p className="text-yellow-500 font-semibold">
                      Waiting for players... ({roomState.playerCount}/{roomState.minTeams} minimum)
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Need at least {roomState.minTeams} players to start the auction
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Non-host sees waiting message */}
            {!isHost && (
              <div className="text-center">
                {roomState.playerCount >= roomState.minTeams ? (
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                    <p className="text-blue-500 font-semibold">
                      {roomState.phase === 'countdown' 
                        ? `Auction starting in ${auctionState?.countdownSeconds}s...`
                        : 'Waiting for host to start the auction...'}
                    </p>
                  </div>
                ) : (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                    <p className="text-yellow-500 font-semibold">
                      Waiting for more players... ({roomState.playerCount}/{roomState.minTeams} minimum)
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Render: Active Auction
  if (roomState?.phase === 'active') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold mb-2">🏏 Live Auction</h1>
            <p className="text-muted-foreground">Room: {roomCode}</p>
          </div>

          {currentPlayer && auctionState && (
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="text-center mb-4">
                  <h2 className="text-3xl font-bold mb-2">{currentPlayer.name}</h2>
                  <Badge className="text-lg px-4 py-1">{currentPlayer.role}</Badge>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Base Price</p>
                    <p className="text-2xl font-bold">₹{currentPlayer.basePrice}Cr</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Current Bid</p>
                    <p className="text-3xl font-bold text-green-500">₹{auctionState.currentPrice}Cr</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Time Left</p>
                    <p className="text-2xl font-bold text-orange-500">{auctionState.timeLeft}s</p>
                  </div>
                </div>

                {/* Bid Buttons */}
                <div className="flex gap-2 justify-center">
                  {[1, 5, 10, 20].map((increment) => (
                    <Button
                      key={increment}
                      onClick={() => handlePlaceBid(auctionState.currentPrice + increment)}
                      variant="outline"
                    >
                      +₹{increment}Cr
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Teams Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {teams.map((team) => (
              <Card key={team.id}>
                <CardContent className="p-4">
                  <h3 className="font-bold mb-2 truncate">{team.name}</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Budget:</span>
                      <span className="font-bold">₹{team.budget}Cr</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Players:</span>
                      <span className="font-bold">{team.players.length}/{team.maxPlayers}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Render: Completed
  if (roomState?.phase === 'completed' && results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-6">🏆 Auction Complete!</h1>
          
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">Final Standings</h2>
              {results.ratings && results.ratings.map((rating: any, index: number) => {
                const team = teams.find(t => t.id === rating.teamId)
                return (
                  <div key={rating.teamId} className="p-4 border-b last:border-b-0">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-2xl font-bold mr-3">#{index + 1}</span>
                        <span className="font-bold">{team?.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-500">{rating.overallRating.toFixed(1)}</p>
                        <p className="text-sm text-muted-foreground">Rating</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          <div className="mt-6 space-x-4">
            <Button onClick={() => router.push('/leaderboard')} size="lg">
              <Trophy className="mr-2 h-5 w-5" />
              View Leaderboard
            </Button>
            <Button onClick={() => router.push('/')} variant="outline" size="lg">
              New Auction
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
