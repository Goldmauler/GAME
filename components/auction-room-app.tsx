"use client"

import React, { useState, useEffect, useRef } from "react"
import dynamic from "next/dynamic"
import RoomLobby from "./room-lobby"
import TeamSelection from "./team-selection"
import WaitingLobby from "./waiting-lobby"

// Lazy-load the heavy auction arena to reduce initial bundle size
// Disabled preload to prevent loading until actually needed
const MultiplayerAuctionArena = dynamic(
  () => import("./multiplayer-auction-arena"),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto mb-4" />
          <p className="text-white text-xl font-bold">Loading Auction Arena...</p>
          <p className="text-gray-400 text-sm mt-2">Please wait while we prepare the auction</p>
        </div>
      </div>
    )
  }
)

type AppPhase = "lobby" | "team-selection" | "waiting-lobby" | "auction"

export default function AuctionRoomApp() {
  const [phase, setPhase] = useState<AppPhase>("lobby")
  const [roomCode, setRoomCode] = useState("")
  const [userName, setUserName] = useState("")
  const [localTeamId, setLocalTeamId] = useState("")
  const [wsConnected, setWsConnected] = useState(false)
  const [isHost, setIsHost] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [takenTeams, setTakenTeams] = useState<string[]>([])
  const [lobbyPlayers, setLobbyPlayers] = useState<Array<{
    teamId: string
    teamName: string
    userName: string
    ready: boolean
    isHost: boolean
  }>>([])
  const wsRef = useRef<WebSocket | null>(null)

  // Connect to WebSocket on mount
  useEffect(() => {
    connectToServer()
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [])

  const connectToServer = () => {
    try {
      let url = 'ws://localhost:8080'
      
      if (typeof window !== 'undefined') {
        const hostname = window.location.hostname
        
        console.log('Detecting WebSocket URL for rooms page...')
        console.log('   Current hostname:', hostname)
        
        // If accessing via localhost
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
          url = 'ws://localhost:8080'
          console.log('   Using local WebSocket:', url)
        }
        // If accessing via Render (production)
        else if (hostname.includes('onrender.com')) {
          url = process.env.NEXT_PUBLIC_WS_URL || 'wss://ipl-auction-websocket.onrender.com'
          console.log('   Using Render WebSocket:', url)
        }
        // If accessing via ngrok (tunnel/testing)
        else if (hostname.includes('ngrok')) {
          url = 'wss://sheathier-achromatous-meredith.ngrok-free.dev'
          console.log('   Using ngrok WebSocket:', url)
        } 
        // If accessing via local network IP
        else {
          url = 'ws://192.168.56.1:8080'
          console.log('   Using network WebSocket:', url)
        }
      }
      
      console.log('Connecting to WebSocket:', url)
      const ws = new WebSocket(url)
      wsRef.current = ws

      ws.onopen = () => {
        console.log('Connected to auction room server:', url)
        setWsConnected(true)
      }

      ws.onmessage = (evt: MessageEvent) => {
        try {
          const msg = JSON.parse(evt.data)
          
          if (msg.type === "room-created") {
            // Room created successfully, room code is in payload
            const { roomCode: code, isHost: host, takenTeams: taken } = msg.payload
            setRoomCode(code)
            setIsHost(host ?? true)
            setTakenTeams(taken || [])
            setPhase("team-selection")
          }
          
          if (msg.type === "joined-room") {
            // Successfully joined room
            const { isHost: host, takenTeams: taken } = msg.payload
            setIsHost(host ?? false)
            setTakenTeams(taken || [])
            setPhase("team-selection")
          }

          if (msg.type === "room-update") {
            // Update room info including taken teams
            const { takenTeams: taken } = msg.payload
            if (taken) {
              setTakenTeams(taken)
            }
          }

          if (msg.type === "lobby-update") {
            // Update lobby players list
            const { players } = msg.payload
            setLobbyPlayers(players)
          }

          if (msg.type === "team-selected") {
            // Confirmation that team was selected successfully
            const { success } = msg.payload
            if (success) {
              setPhase("waiting-lobby")
            }
          }

          if (msg.type === "team-taken-error") {
            // Team is already taken
            alert(`This team is already taken! Please select another team.`)
          }

          if (msg.type === "start-auction") {
            // Auction is starting
            setPhase("auction")
          }
          
          if (msg.type === "player_removed") {
            // Check if it's the current user who was removed
            const { userName: removedUser, message } = msg.payload
            if (removedUser === userName) {
              console.log(" You were removed from the room:", message)
              localStorage.removeItem('auctionConnection')
              alert("You have been removed from the room due to inactivity. Please rejoin from the home page.")
              window.location.href = "/"
            }
          }

          if (msg.type === "error") {
            alert(`Error: ${msg.payload.message}`)
          }
        } catch (e) {
          console.error("WS message parse error", e)
        }
      }

      ws.onclose = (event) => {
        console.log("Disconnected from auction room server", {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean
        })
        setWsConnected(false)
        wsRef.current = null
        
        // If connection closed abnormally, check for grace period expiry
        if (!event.wasClean && roomCode) {
          const storedConnection = localStorage.getItem('auctionConnection')
          if (storedConnection) {
            const connectionInfo = JSON.parse(storedConnection)
            const timeSinceDisconnect = Date.now() - connectionInfo.timestamp
            const twoMinutes = 2 * 60 * 1000
            
            if (timeSinceDisconnect > twoMinutes) {
              console.log(" Grace period expired - clearing stored connection")
              localStorage.removeItem('auctionConnection')
              alert("Your session has expired. You have been removed from the room. Please rejoin from the home page.")
              window.location.href = "/"
            }
          }
        }
      }

      ws.onerror = (error) => {
        console.error("WebSocket error:", error)
        // Don't show error to user - onclose will handle it
      }
    } catch (e) {
      console.warn("WebSocket connection failed", e)
    }
  }

  const handleRoomJoined = (code: string, teamId: string, name: string) => {
    setRoomCode(code)
    setUserName(name)
    
    // Always send join-room message to server
    if (wsRef.current && wsConnected) {
      wsRef.current.send(JSON.stringify({
        type: "join-room",
        payload: { roomCode: code, userName: name },
      }))
    }
    
    if (teamId) {
      setLocalTeamId(teamId)
    } else {
      // Need to select team first
      setPhase("team-selection")
    }
  }

  const handleTeamSelected = (teamId: string) => {
    setLocalTeamId(teamId)
    
    // Send team selection to server
    if (wsRef.current && wsConnected) {
      wsRef.current.send(JSON.stringify({
        type: "select-team",
        payload: { roomCode, teamId, userName },
      }))
    }

    // Don't move to waiting lobby immediately - wait for server confirmation
  }

  const handleReady = () => {
    setIsReady(!isReady)
    
    // Send ready status to server
    if (wsRef.current && wsConnected) {
      wsRef.current.send(JSON.stringify({
        type: "player-ready",
        payload: { roomCode, teamId: localTeamId, ready: !isReady },
      }))
    }
  }

  const handleStartAuction = () => {
    // This will be handled by the WaitingLobby component
    // which sends start-auction message to server
  }

  const handleAuctionComplete = () => {
    // Could show results screen or return to lobby
    console.log("Auction completed!")
  }

  return (
    <>
      {phase === "lobby" && (
        <RoomLobby
          onRoomJoined={handleRoomJoined}
          wsConnected={wsConnected}
          wsRef={wsRef}
        />
      )}
      
      {phase === "team-selection" && (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-4 sm:py-6 md:py-8 px-3 sm:px-4">
          <div className="max-w-7xl mx-auto">
            {/* Room Code Display */}
            <div className="text-center mb-4 sm:mb-6 md:mb-8">
              <div className="inline-block bg-slate-800/50 border border-orange-500/50 rounded-xl px-4 sm:px-6 py-2 sm:py-3">
                <p className="text-xs sm:text-sm text-gray-400 mb-1">Room Code</p>
                <p className="text-2xl sm:text-3xl font-black text-orange-400 tracking-widest">{roomCode}</p>
              </div>
            </div>
            
            <TeamSelection
              teams={[
                { id: "1", name: "Mumbai Indians", color: "from-blue-600 to-blue-800", budget: 100, players: [], maxPlayers: 25, recentBids: 0 },
                { id: "2", name: "Chennai Super Kings", color: "from-yellow-600 to-yellow-800", budget: 100, players: [], maxPlayers: 25, recentBids: 0 },
                { id: "3", name: "Delhi Capitals", color: "from-purple-600 to-purple-800", budget: 100, players: [], maxPlayers: 25, recentBids: 0 },
                { id: "4", name: "Rajasthan Royals", color: "from-pink-600 to-pink-800", budget: 100, players: [], maxPlayers: 25, recentBids: 0 },
                { id: "5", name: "Kolkata Knight Riders", color: "from-slate-600 to-slate-800", budget: 100, players: [], maxPlayers: 25, recentBids: 0 },
                { id: "6", name: "Punjab Kings", color: "from-red-600 to-red-800", budget: 100, players: [], maxPlayers: 25, recentBids: 0 },
                { id: "7", name: "Sunrisers Hyderabad", color: "from-orange-600 to-orange-800", budget: 100, players: [], maxPlayers: 25, recentBids: 0 },
                { id: "8", name: "Lucknow Super Giants", color: "from-cyan-600 to-cyan-800", budget: 100, players: [], maxPlayers: 25, recentBids: 0 },
                { id: "9", name: "Bangalore Royals", color: "from-red-600 to-rose-800", budget: 100, players: [], maxPlayers: 25, recentBids: 0 },
                { id: "10", name: "Hyderabad Chargers", color: "from-emerald-600 to-emerald-800", budget: 100, players: [], maxPlayers: 25, recentBids: 0 },
              ]}
              takenTeams={takenTeams}
              onTeamSelect={handleTeamSelected}
            />
          </div>
        </div>
      )}
      
      {phase === "waiting-lobby" && (
        <WaitingLobby
          roomCode={roomCode}
          localTeamId={localTeamId}
          userName={userName}
          players={lobbyPlayers}
          isHost={isHost}
          isReady={isReady}
          wsRef={wsRef}
          wsConnected={wsConnected}
          onReady={handleReady}
          onStartAuction={handleStartAuction}
        />
      )}
      
      {phase === "auction" && (
        <MultiplayerAuctionArena
          roomCode={roomCode}
          localTeamId={localTeamId}
          userName={userName}
          wsRef={wsRef}
          wsConnected={wsConnected}
          onComplete={handleAuctionComplete}
        />
      )}
    </>
  )
}
