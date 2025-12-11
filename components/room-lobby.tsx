"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface RoomInfo {
  roomCode: string
  hostName: string
  playerCount: number
  maxPlayers: number
  phase: string
  takenTeams: string[]
  createdAt: number
}

interface RoomLobbyProps {
  onRoomJoined: (roomCode: string, teamId: string, userName: string) => void
  wsConnected: boolean
  wsRef: React.MutableRefObject<WebSocket | null>
}

export default function RoomLobby({ onRoomJoined, wsConnected, wsRef }: RoomLobbyProps) {
  const [view, setView] = useState<"menu" | "create" | "join" | "browse" | "room-created">("menu")
  const [userName, setUserName] = useState("")
  const [roomCode, setRoomCode] = useState("")
  const [availableRooms, setAvailableRooms] = useState<RoomInfo[]>([])
  const [error, setError] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    if (!wsRef.current || !wsConnected) return

    const handleMessage = (evt: MessageEvent) => {
      try {
        const msg = JSON.parse(evt.data)
        
        if (msg.type === "room-created") {
          const { roomCode: code } = msg.payload
          // Show room code to host before proceeding
          setRoomCode(code)
          setView("room-created")
          setIsCreating(false)
        }
        
        if (msg.type === "room-list") {
          setAvailableRooms(msg.payload.rooms)
        }
        
        if (msg.type === "error") {
          setError(msg.payload.message)
          setIsCreating(false)
        }
      } catch (e) {
        console.error("Message parse error:", e)
      }
    }

    wsRef.current.addEventListener("message", handleMessage)
    return () => {
      wsRef.current?.removeEventListener("message", handleMessage)
    }
  }, [wsConnected, wsRef])

  const handleCreateRoom = () => {
    if (!userName.trim()) {
      setError("Please enter your name")
      return
    }

    if (!wsConnected) {
      setError("Not connected to server. Please wait...")
      return
    }

    setError("")
    setIsCreating(true)
    
    if (wsRef.current && wsConnected) {
      try {
        wsRef.current.send(JSON.stringify({
          type: "create-room",
          payload: { hostName: userName },
        }))
      } catch (e) {
        console.error("Failed to send create-room message:", e)
        setError("Failed to create room. Please try again.")
        setIsCreating(false)
      }
    }
  }

  const handleJoinRoom = () => {
    if (!userName.trim()) {
      setError("Please enter your name")
      return
    }
    
    if (!roomCode.trim()) {
      setError("Please enter a room code")
      return
    }

    setError("")
    // Signal to parent that we want to join this room
    // Parent will handle team selection
    onRoomJoined(roomCode.toUpperCase(), "", userName)
  }

  const handleBrowseRooms = () => {
    setView("browse")
    if (wsRef.current && wsConnected) {
      wsRef.current.send(JSON.stringify({ type: "list-rooms" }))
    }
  }

  const handleQuickJoinRoom = (room: RoomInfo) => {
    setRoomCode(room.roomCode)
    setView("join")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-4 sm:py-8 md:py-12 px-3 sm:px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 sm:mb-8 md:mb-12"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 mb-2 sm:mb-4 leading-tight">
            IPL AUCTION ROOMS
          </h1>
          <p className="text-sm sm:text-lg md:text-xl text-gray-300 px-2">Create or join a room to start your auction</p>
          {!wsConnected && (
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="mt-3 sm:mt-4 text-yellow-400 font-semibold text-sm sm:text-base"
            >
              Connecting to server...
            </motion.div>
          )}
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Main Menu */}
          {view === "menu" && (
            <motion.div
              key="menu"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="space-y-4 sm:space-y-6"
            >
              {/* Name Input */}
              <div className="bg-slate-800/50 rounded-xl p-4 sm:p-6 border border-slate-700">
                <label className="block text-gray-300 mb-2 sm:mb-3 text-base sm:text-lg font-semibold">Your Name</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Enter your name..."
                  className="w-full bg-slate-900 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-slate-600 focus:border-orange-500 focus:outline-none text-base sm:text-lg"
                  maxLength={20}
                />
              </div>

              {/* Menu Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                <motion.button
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setView("create")}
                  disabled={!wsConnected || !userName.trim()}
                  className="bg-gradient-to-br from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed rounded-xl p-6 sm:p-8 border-2 border-green-500/50 disabled:border-gray-600 transition-all"
                >
                  <div className="text-4xl sm:text-5xl mb-2 sm:mb-3 font-bold text-white">+</div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2">Create Room</h3>
                  <p className="text-xs sm:text-sm text-white/70">Start a new auction</p>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setView("join")}
                  disabled={!wsConnected || !userName.trim()}
                  className="bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed rounded-xl p-6 sm:p-8 border-2 border-blue-500/50 disabled:border-gray-600 transition-all"
                >
                  <div className="text-4xl sm:text-5xl mb-2 sm:mb-3 font-bold text-white">→</div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2">Join Room</h3>
                  <p className="text-xs sm:text-sm text-white/70">Enter a room code</p>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleBrowseRooms}
                  disabled={!wsConnected || !userName.trim()}
                  className="bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed rounded-xl p-6 sm:p-8 border-2 border-purple-500/50 disabled:border-gray-600 transition-all sm:col-span-2 md:col-span-1"
                >
                  <div className="text-4xl sm:text-5xl mb-2 sm:mb-3 font-bold text-white">☰</div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2">Browse Rooms</h3>
                  <p className="text-xs sm:text-sm text-white/70">See active rooms</p>
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Create Room */}
          {view === "create" && (
            <motion.div
              key="create"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-slate-800/50 rounded-xl p-4 sm:p-6 md:p-8 border border-slate-700"
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">Create New Room</h2>
              
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-gray-300 mb-2 text-sm sm:text-base">Host Name</label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full bg-slate-900 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-slate-600 text-base"
                    disabled={isCreating}
                  />
                </div>

                <div className="bg-slate-900/50 rounded-lg p-3 sm:p-4 border border-slate-700">
                  <h3 className="font-semibold text-orange-400 mb-2 text-sm sm:text-base">Room Settings</h3>
                  <ul className="text-gray-300 space-y-1 text-xs sm:text-sm">
                    <li>✓ Maximum 10 players per room</li>
                    <li>✓ 100 players to auction</li>
                    <li>✓ AI teams fill remaining slots</li>
                    <li>✓ Unique 6-character room code</li>
                  </ul>
                </div>

                {error && (
                  <div className="bg-red-900/30 border border-red-500 text-red-300 rounded-lg p-3 text-sm">
                    {error}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setView("menu")}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-bold transition-all text-sm sm:text-base"
                    disabled={isCreating}
                  >
                    Back
                  </button>
                  <button
                    onClick={handleCreateRoom}
                    disabled={isCreating || !userName.trim()}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-gray-600 disabled:to-gray-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-bold transition-all disabled:cursor-not-allowed text-sm sm:text-base"
                  >
                    {isCreating ? "Creating..." : "Create Room"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Join Room */}
          {view === "join" && (
            <motion.div
              key="join"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-slate-800/50 rounded-xl p-4 sm:p-6 md:p-8 border border-slate-700"
            >
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">Join Room</h2>
              
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-gray-300 mb-2 text-sm sm:text-base">Your Name</label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full bg-slate-900 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-slate-600 text-base"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2 text-sm sm:text-base">Room Code</label>
                  <input
                    type="text"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    placeholder="Enter 6-character code..."
                    className="w-full bg-slate-900 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-slate-600 uppercase tracking-widest text-xl sm:text-2xl font-bold text-center"
                    maxLength={6}
                  />
                </div>

                {error && (
                  <div className="bg-red-900/30 border border-red-500 text-red-300 rounded-lg p-3">
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setView("menu")}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-bold transition-all"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleJoinRoom}
                    disabled={!userName.trim() || !roomCode.trim()}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white px-6 py-3 rounded-lg font-bold transition-all disabled:cursor-not-allowed"
                  >
                    Join Room
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Browse Rooms */}
          {view === "browse" && (
            <motion.div
              key="browse"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-white">Available Rooms</h2>
                <button
                  onClick={() => setView("menu")}
                  className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-bold transition-all"
                >
                  Back
                </button>
              </div>

              {availableRooms.length === 0 ? (
                <div className="bg-slate-800/50 rounded-xl p-12 border border-slate-700 text-center">
                  <div className="text-6xl mb-4 font-bold text-orange-500">—</div>
                  <p className="text-gray-400 text-lg">No active rooms found</p>
                  <p className="text-gray-500 text-sm mt-2">Create a new room to get started!</p>
                  <button
                    onClick={() => setView("create")}
                    className="mt-6 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg font-bold hover:from-orange-600 hover:to-red-600 transition-all"
                  >
                    Create Room
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableRooms.map((room) => (
                    <motion.div
                      key={room.roomCode}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.02 }}
                      className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 hover:border-orange-500/50 transition-all cursor-pointer"
                      onClick={() => handleQuickJoinRoom(room)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-2xl font-bold text-orange-400 tracking-wider">{room.roomCode}</h3>
                          <p className="text-gray-400 text-sm">Host: {room.hostName}</p>
                        </div>
                        <div className="bg-green-900/30 border border-green-500 text-green-300 px-3 py-1 rounded-full text-xs font-bold">
                          WAITING
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">
                           {room.playerCount}/{room.maxPlayers} players
                        </span>
                        <span className="text-blue-400 font-semibold">Click to Join →</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Room Created Success */}
          {view === "room-created" && (
            <motion.div
              key="room-created"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-gradient-to-br from-green-900/30 to-green-800/30 rounded-xl p-8 border-2 border-green-500"
            >
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.5 }}
                  className="text-7xl mb-4"
                >
                  
                </motion.div>
                <h2 className="text-4xl font-black text-green-400 mb-2">Room Created!</h2>
                <p className="text-gray-300">Share this code with your friends</p>
              </div>

              <div className="bg-slate-900/50 rounded-xl p-8 border border-green-500/30 mb-6">
                <p className="text-gray-400 text-sm mb-3 text-center">Room Code</p>
                <div className="flex items-center justify-center gap-4">
                  <div className="text-6xl font-black text-green-400 tracking-widest">{roomCode}</div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(roomCode)
                      alert("Room code copied to clipboard!")
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold transition-all"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700 mb-6">
                <h3 className="font-semibold text-orange-400 mb-2">Next Steps:</h3>
                <ol className="text-gray-300 space-y-1 text-sm list-decimal list-inside">
                  <li>Share the room code with friends</li>
                  <li>Select your team</li>
                  <li>Wait for others to join</li>
                  <li>Start the auction when ready!</li>
                </ol>
              </div>

              <button
                onClick={() => onRoomJoined(roomCode, "", userName)}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-4 rounded-lg font-bold text-xl transition-all"
              >
                Continue to Team Selection →
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
