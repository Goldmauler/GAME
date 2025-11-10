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

  // Room state
  const [roomState, setRoomState] = useState<RoomState | null>(null)
  const [selectedTeamId, setSelectedTeamId] = useState<string>('')
  const [teams, setTeams] = useState<Team[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  
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
      const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
      const host = window.location.hostname || 'localhost'
      const ws = new WebSocket(`${protocol}://${host}:8080`)
      wsRef.current = ws

      ws.onopen = () => {
        console.log('Connected to auction server')
        setConnected(true)
        setReconnecting(false)
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
        console.error('WebSocket error:', error)
        toast({
          title: 'Connection Error',
          description: 'Failed to connect to auction server',
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
        toast({
          title: 'Joined Room',
          description: `Welcome to room ${roomCode}!`,
        })
        break

      case 'room-update':
        setRoomState(msg.payload.roomInfo)
        setTeams(msg.payload.availableTeams || [])
        break

      case 'team-selected':
        toast({
          title: 'Team Selected',
          description: `You are now ${msg.payload.teamName}`,
        })
        break

      case 'team-selection-failed':
        toast({
          title: 'Selection Failed',
          description: msg.payload.message || 'Team is already taken',
          variant: 'destructive',
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
      wsRef.current.send(JSON.stringify({
        type: 'join-room',
        payload: {
          roomCode,
          userName,
          userId,
        },
      }))
    }
  }

  const handleSelectTeam = (teamId: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      setSelectedTeamId(teamId)
      wsRef.current.send(JSON.stringify({
        type: 'select-team',
        payload: { teamId },
      }))
    }
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

    if (!selectedTeamId) {
      toast({
        title: 'Select Team',
        description: 'Please select your team before starting',
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

  // Render: Lobby (Team Selection)
  if (roomState?.phase === 'lobby' || roomState?.phase === 'countdown') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <span className="text-4xl">🏏</span>
                Auction Lobby
              </h1>
              <p className="text-muted-foreground">Room: <span className="font-mono font-bold text-orange-500">{roomCode}</span></p>
            </div>
            <Button onClick={handleLeaveRoom} variant="outline">
              <LogOut className="mr-2 h-4 w-4" />
              Leave Room
            </Button>
          </div>

          {/* Room Info */}
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

          {/* Team Selection */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4">Select Your Team</h2>
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
            </CardContent>
          </Card>

          {/* Start Button */}
          {isHost && roomState.canStart && (
            <div className="mt-6 text-center">
              <Button
                onClick={handleStartAuction}
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                disabled={!selectedTeamId || roomState.phase === 'countdown'}
              >
                <Play className="mr-2 h-5 w-5" />
                {roomState.phase === 'countdown' ? 'Starting...' : 'Start Auction'}
              </Button>
            </div>
          )}

          {!isHost && roomState.canStart && (
            <div className="mt-6 text-center">
              <p className="text-muted-foreground">Waiting for host to start the auction...</p>
            </div>
          )}

          {!roomState.canStart && (
            <div className="mt-6 text-center">
              <p className="text-muted-foreground">Waiting for minimum {roomState.minTeams} teams to join...</p>
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
              <Card key={team.id} className={selectedTeamId === team.id ? 'border-green-500 border-2' : ''}>
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
