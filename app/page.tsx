"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import AuctionArena from "@/components/auction-arena"
import TeamShowcase from "@/components/team-showcase"
import Header from "@/components/header"
import PointsTable from "@/components/points-table"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Users, Zap, Trophy, Play, RotateCcw, LogIn, X } from "lucide-react"

type GamePhase = "lobby" | "auction" | "results" | "rankings"

export default function Home() {
  const [gamePhase, setGamePhase] = useState<GamePhase>("lobby")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedPhase = sessionStorage.getItem('gamePhase')
    if (savedPhase && ['lobby', 'auction', 'results', 'rankings'].includes(savedPhase)) {
      setGamePhase(savedPhase as GamePhase)
    }
  }, [])

  useEffect(() => {
    sessionStorage.setItem('gamePhase', gamePhase)
  }, [gamePhase])

  const resetGame = () => {
    sessionStorage.removeItem('gamePhase')
    sessionStorage.removeItem('auctionState')
    setGamePhase('lobby')
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Header gamePhase={gamePhase} onReset={gamePhase !== 'lobby' ? resetGame : undefined} />

      <main className="relative z-10">
        {gamePhase === "lobby" && (
          <LobbyScreen onStart={() => setGamePhase("auction")} onNewGame={resetGame} />
        )}
        {gamePhase === "auction" && (
          <AuctionArena onComplete={() => setGamePhase("results")} />
        )}
        {gamePhase === "results" && (
          <TeamShowcase onViewRankings={() => setGamePhase("rankings")} />
        )}
        {gamePhase === "rankings" && <PointsTable />}
      </main>
    </div>
  )
}

function LobbyScreen({ onStart, onNewGame }: { onStart: () => void; onNewGame: () => void }) {
  const router = useRouter()
  const [hasSavedGame, setHasSavedGame] = useState(false)
  const [hasRoomConnection, setHasRoomConnection] = useState(false)
  const [roomInfo, setRoomInfo] = useState<{ roomCode: string; userName: string; timestamp: number } | null>(null)

  useEffect(() => {
    const savedState = sessionStorage.getItem('auctionState')
    setHasSavedGame(!!savedState)

    const storedConnection = localStorage.getItem('auctionConnection')
    if (storedConnection) {
      try {
        const connectionInfo = JSON.parse(storedConnection)
        const timeSinceDisconnect = Date.now() - connectionInfo.timestamp
        if (timeSinceDisconnect < 2 * 60 * 1000) {
          setHasRoomConnection(true)
          setRoomInfo(connectionInfo)
        } else {
          localStorage.removeItem('auctionConnection')
        }
      } catch (e) {
        console.error('Error parsing connection info:', e)
      }
    }
  }, [])

  const handleRejoinRoom = () => {
    if (roomInfo) router.push(`/room/${roomInfo.roomCode}`)
  }

  const handleClearRoomConnection = () => {
    localStorage.removeItem('auctionConnection')
    setHasRoomConnection(false)
    setRoomInfo(null)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-md mx-auto w-full">
        {/* Hero */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 mb-4 shadow-lg shadow-orange-500/20">
            <Trophy className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent mb-2">
            Cricket Auction
          </h1>
          <p className="text-gray-400">Build your championship team</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-3 text-center">
              <Users className="w-5 h-5 text-blue-400 mx-auto mb-1" />
              <p className="text-xl font-bold text-white">10</p>
              <p className="text-xs text-gray-500">Teams</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-3 text-center">
              <Zap className="w-5 h-5 text-orange-400 mx-auto mb-1" />
              <p className="text-xl font-bold text-white">250+</p>
              <p className="text-xs text-gray-500">Players</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="p-3 text-center">
              <Trophy className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
              <p className="text-xl font-bold text-white">25</p>
              <p className="text-xs text-gray-500">Per Squad</p>
            </CardContent>
          </Card>
        </div>

        {/* Rejoin Alert */}
        {hasRoomConnection && roomInfo && (
          <Card className="bg-orange-500/10 border-orange-500/30 mb-3">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-orange-400 font-medium text-sm">Active Room</p>
                  <p className="text-xs text-gray-400">
                    <span className="font-mono">{roomInfo.roomCode}</span> • {roomInfo.userName}
                  </p>
                </div>
                <button onClick={handleClearRoomConnection} className="text-gray-500 hover:text-white p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <Button onClick={handleRejoinRoom} size="sm" className="w-full bg-orange-500 hover:bg-orange-600">
                <LogIn className="w-4 h-4 mr-1" /> Rejoin
              </Button>
            </CardContent>
          </Card>
        )}

        {hasSavedGame && (
          <Card className="bg-green-500/10 border-green-500/30 mb-3">
            <CardContent className="p-2">
              <p className="text-green-400 text-xs text-center">Previous game found</p>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="space-y-2">
          <Button onClick={onStart} size="lg" className="w-full h-12 font-semibold bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
            <Play className="w-5 h-5 mr-2" />
            {hasSavedGame ? 'Continue Auction' : 'Start Solo Auction'}
          </Button>

          <Button onClick={() => router.push('/rooms')} size="lg" variant="outline" className="w-full h-12 border-blue-500/50 text-blue-400 hover:bg-blue-500/10">
            <Users className="w-5 h-5 mr-2" /> Join Multiplayer
          </Button>

          <Button onClick={() => router.push('/players')} size="lg" variant="outline" className="w-full h-12 border-purple-500/50 text-purple-400 hover:bg-purple-500/10">
            <Zap className="w-5 h-5 mr-2" /> View All Players
          </Button>

          {hasSavedGame && (
            <Button onClick={() => confirm('Reset progress?') && onNewGame()} variant="ghost" className="w-full text-gray-500 hover:text-white text-sm">
              <RotateCcw className="w-4 h-4 mr-1" /> New Game
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
