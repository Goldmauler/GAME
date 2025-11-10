'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Trophy, Users, Plus, LogIn } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  const router = useRouter()
  const [roomCode, setRoomCode] = useState('')
  const [hostName, setHostName] = useState('')
  const [creating, setCreating] = useState(false)

  const handleCreateRoom = async () => {
    if (!hostName.trim()) {
      alert('Please enter your name')
      return
    }

    setCreating(true)
    localStorage.setItem('userName', hostName)

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
      const host = window.location.hostname || 'localhost'
      const ws = new WebSocket(`${protocol}://${host}:8080`)

      ws.onopen = () => {
        const userId = localStorage.getItem('userId') || `user-${Date.now()}`
        localStorage.setItem('userId', userId)

        ws.send(JSON.stringify({
          type: 'create-room',
          payload: { hostName, userId },
        }))
      }

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data)
        if (msg.type === 'room-created') {
          const newRoomCode = msg.payload.roomCode
          ws.close()
          router.push(`/room/${newRoomCode}`)
        }
      }

      ws.onerror = () => {
        alert('Failed to connect to server')
        setCreating(false)
      }
    } catch (error) {
      alert('Failed to create room')
      setCreating(false)
    }
  }

  const handleJoinRoom = () => {
    if (!roomCode.trim()) {
      alert('Please enter a room code')
      return
    }
    router.push(`/room/${roomCode.toUpperCase()}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-foreground overflow-x-hidden">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-green-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-orange-500/20 py-4">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🏏</div>
            <div>
              <h1 className="font-black text-2xl text-orange-500">IPL AUCTION</h1>
              <p className="text-xs text-gray-400">Franchise Building Game</p>
            </div>
          </div>
          <Link href="/leaderboard">
            <Button variant="outline" className="border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/10">
              <Trophy className="mr-2 h-4 w-4" />
              Leaderboard
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex items-center justify-center min-h-[calc(100vh-80px)] px-4 py-12">
        <div className="max-w-6xl mx-auto w-full">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-7xl mb-4"
            >
              🏏
            </motion.div>
            <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-500 to-red-500 mb-4">
              CRICKET AUCTION
            </h1>
            <p className="text-xl text-gray-300">The Ultimate Franchise Building Game</p>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-12 max-w-3xl mx-auto">
            {[
              { icon: "👥", label: "10 Teams", value: "Compete" },
              { icon: "🏏", label: "130+ Players", value: "Real IPL Stars" },
              { icon: "💎", label: "25 per Team", value: "Squad Size" },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-orange-500/30">
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-2">{stat.icon}</div>
                    <p className="text-sm text-gray-400">{stat.label}</p>
                    <p className="text-lg font-bold text-orange-500">{stat.value}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Action Cards */}
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Create Room */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-orange-500/30 hover:border-orange-500/60 transition-all">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Plus className="h-6 w-6 text-orange-500" />
                    Create Room
                  </CardTitle>
                  <CardDescription>Start a new auction and invite friends</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Your Name</label>
                    <Input
                      placeholder="Enter your name"
                      value={hostName}
                      onChange={(e) => setHostName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleCreateRoom()}
                    />
                  </div>
                  <Button
                    onClick={handleCreateRoom}
                    disabled={creating}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                    size="lg"
                  >
                    {creating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-5 w-5" />
                        Create Room
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Join Room */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-blue-500/30 hover:border-blue-500/60 transition-all">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <LogIn className="h-6 w-6 text-blue-500" />
                    Join Room
                  </CardTitle>
                  <CardDescription>Enter a room code to join an existing auction</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Room Code</label>
                    <Input
                      placeholder="Enter 6-character code"
                      value={roomCode}
                      onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                      onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom()}
                      maxLength={6}
                      className="uppercase font-mono"
                    />
                  </div>
                  <Button
                    onClick={handleJoinRoom}
                    variant="outline"
                    className="w-full border-blue-500/30 text-blue-500 hover:bg-blue-500/10"
                    size="lg"
                  >
                    <LogIn className="mr-2 h-5 w-5" />
                    Join Room
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 text-center"
          >
            <h2 className="text-2xl font-bold mb-6 text-gray-300">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                { step: "1", title: "Create or Join", desc: "Start a room or join with a code" },
                { step: "2", title: "Select Team", desc: "Choose your IPL franchise" },
                { step: "3", title: "Bid Smart", desc: "Build the best team within budget" },
              ].map((feature, idx) => (
                <div key={idx} className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-500/20 text-orange-500 font-bold text-xl mb-3">
                    {feature.step}
                  </div>
                  <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-400">{feature.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
