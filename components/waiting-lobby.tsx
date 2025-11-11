"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Crown, CheckCircle2, Clock, Play } from "lucide-react"

interface Player {
  teamId: string
  teamName: string
  userName: string
  ready: boolean
  isHost: boolean
}

interface WaitingLobbyProps {
  roomCode: string
  localTeamId: string
  userName: string
  players: Player[]
  isHost: boolean
  isReady: boolean
  wsRef: React.MutableRefObject<WebSocket | null>
  wsConnected: boolean
  onReady: () => void
  onStartAuction: () => void
}

export default function WaitingLobby({
  roomCode,
  localTeamId,
  userName,
  players,
  isHost,
  isReady,
  wsRef,
  wsConnected,
  onReady,
  onStartAuction,
}: WaitingLobbyProps) {
  const [countdown, setCountdown] = useState<number | null>(null)
  const allReady = players.length > 0 && players.every((p) => p.ready)
  const readyCount = players.filter((p) => p.ready).length

  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else if (countdown === 0) {
      onStartAuction()
    }
  }, [countdown, onStartAuction])

  const handleStartAuction = () => {
    if (isHost && allReady && players.length >= 2) {
      // Send start-auction message to server
      if (wsRef.current && wsConnected) {
        wsRef.current.send(
          JSON.stringify({
            type: "start-auction",
            payload: { roomCode },
          })
        )
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 mb-4">
            🏏 WAITING LOBBY
          </h1>
          
          {/* Room Code Display */}
          <div className="inline-block bg-slate-800/50 border border-orange-500/50 rounded-xl px-8 py-4 mb-4">
            <p className="text-sm text-gray-400 mb-1">Room Code</p>
            <p className="text-4xl font-black text-orange-400 tracking-widest">{roomCode}</p>
          </div>

          <p className="text-gray-300 text-lg">
            {allReady
              ? "All players ready! Host can start the auction."
              : "Waiting for all players to be ready..."}
          </p>
        </motion.div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="bg-slate-800/50 border-slate-700 p-4">
            <div className="flex items-center gap-3">
              <Users className="text-blue-400 w-8 h-8" />
              <div>
                <p className="text-sm text-gray-400">Players</p>
                <p className="text-2xl font-bold text-white">{players.length}</p>
              </div>
            </div>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="text-green-400 w-8 h-8" />
              <div>
                <p className="text-sm text-gray-400">Ready</p>
                <p className="text-2xl font-bold text-white">
                  {readyCount}/{players.length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 p-4">
            <div className="flex items-center gap-3">
              <Clock className="text-orange-400 w-8 h-8" />
              <div>
                <p className="text-sm text-gray-400">Status</p>
                <p className="text-xl font-bold text-white">
                  {countdown !== null ? `Starting in ${countdown}s` : "Waiting"}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Players List */}
        <Card className="bg-slate-800/30 border-slate-700 p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Users className="w-6 h-6 text-orange-400" />
            Players in Lobby
          </h2>

          <div className="space-y-3">
            <AnimatePresence>
              {players.map((player, idx) => (
                <motion.div
                  key={player.teamId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                    player.teamId === localTeamId
                      ? "bg-orange-500/20 border-orange-500"
                      : "bg-slate-700/30 border-slate-600"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Player Avatar/Icon */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold text-xl">
                      {player.userName.charAt(0).toUpperCase()}
                    </div>

                    {/* Player Info */}
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-white text-lg">{player.userName}</p>
                        {player.isHost && (
                          <Badge className="bg-yellow-500 text-slate-900 hover:bg-yellow-500">
                            <Crown className="w-3 h-3 mr-1" />
                            Host
                          </Badge>
                        )}
                        {player.teamId === localTeamId && (
                          <Badge className="bg-blue-500 hover:bg-blue-500">You</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-400">{player.teamName}</p>
                    </div>
                  </div>

                  {/* Ready Status */}
                  <div>
                    {player.ready ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex items-center gap-2 text-green-400 font-semibold"
                      >
                        <CheckCircle2 className="w-6 h-6" />
                        Ready
                      </motion.div>
                    ) : (
                      <div className="flex items-center gap-2 text-gray-500 font-semibold">
                        <Clock className="w-6 h-6" />
                        Not Ready
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {players.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-16 h-16 mx-auto mb-3 opacity-50" />
                <p>No players in the lobby yet...</p>
              </div>
            )}
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          {/* Ready Button - for all players including host */}
          <Button
            onClick={onReady}
            disabled={!wsConnected}
            size="lg"
            className={`text-xl px-8 py-6 ${
              isReady
                ? "bg-green-600 hover:bg-green-700"
                : "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            }`}
          >
            {isReady ? (
              <>
                <CheckCircle2 className="w-6 h-6 mr-2" />
                Ready!
              </>
            ) : (
              <>
                <Clock className="w-6 h-6 mr-2" />
                Mark as Ready
              </>
            )}
          </Button>

          {/* Start Button - only for host */}
          {isHost && (
            <Button
              onClick={handleStartAuction}
              disabled={!allReady || players.length < 2 || !wsConnected}
              size="lg"
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-xl px-8 py-6"
            >
              <Play className="w-6 h-6 mr-2" />
              Start Auction
            </Button>
          )}
        </div>

        {/* Info Messages */}
        <div className="mt-6 text-center">
          {isHost && players.length < 2 && (
            <p className="text-yellow-400 text-sm">
              ⚠️ Need at least 2 players to start the auction
            </p>
          )}
          {isHost && !allReady && players.length >= 2 && (
            <p className="text-yellow-400 text-sm">
              ⚠️ All players must be ready before starting
            </p>
          )}
          {!wsConnected && (
            <p className="text-red-400 text-sm">
              ⚠️ WebSocket disconnected - reconnecting...
            </p>
          )}
        </div>

        {/* Countdown Overlay */}
        <AnimatePresence>
          {countdown !== null && countdown > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.5 }}
                className="text-center"
              >
                <p className="text-white text-2xl mb-4">Starting Auction In...</p>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5, repeat: Number.POSITIVE_INFINITY }}
                  className="text-9xl font-black text-orange-500"
                >
                  {countdown}
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
