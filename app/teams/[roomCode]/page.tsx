"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  Trophy, 
  Users, 
  DollarSign, 
  Target, 
  Zap, 
  Award,
  RefreshCw
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface Player {
  id: string
  name: string
  role: string
  basePrice: number
  soldPrice?: number
}

interface Team {
  id: string
  name: string
  budget: number
  maxPlayers: number
  players: Player[]
  owner?: string
}

export default function TeamsViewPage() {
  const params = useParams()
  const router = useRouter()
  const roomCode = params.roomCode as string
  
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [wsConnected, setWsConnected] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  useEffect(() => {
    // Try to get teams from WebSocket connection
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080'
    const ws = new WebSocket(wsUrl)

    ws.onopen = () => {
      setWsConnected(true)
      // Request room state
      ws.send(JSON.stringify({
        type: 'get-room-state',
        roomCode: roomCode
      }))
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'room-state' || data.type === 'auction-state') {
          if (data.teams) {
            setTeams(data.teams)
            setLastUpdated(new Date())
          }
          setLoading(false)
        }
      } catch (e) {
        console.error('Error parsing WS message:', e)
      }
    }

    ws.onerror = () => {
      setWsConnected(false)
      // Try to get from session storage as fallback
      const storedTeams = sessionStorage.getItem(`teams_${roomCode}`)
      if (storedTeams) {
        setTeams(JSON.parse(storedTeams))
      }
      setLoading(false)
    }

    ws.onclose = () => {
      setWsConnected(false)
    }

    return () => {
      ws.close()
    }
  }, [roomCode])

  // Save teams to session storage
  useEffect(() => {
    if (teams.length > 0) {
      sessionStorage.setItem(`teams_${roomCode}`, JSON.stringify(teams))
    }
  }, [teams, roomCode])

  const getRoleColor = (role: string) => {
    const r = role.toLowerCase()
    if (r.includes('bat')) return "bg-blue-500/20 text-blue-400 border-blue-500/30"
    if (r.includes('bowl')) return "bg-red-500/20 text-red-400 border-red-500/30"
    if (r.includes('all')) return "bg-purple-500/20 text-purple-400 border-purple-500/30"
    if (r.includes('keeper') || r.includes('wk')) return "bg-green-500/20 text-green-400 border-green-500/30"
    return "bg-gray-500/20 text-gray-400"
  }

  const getRoleIcon = (role: string) => {
    const r = role.toLowerCase()
    if (r.includes('bat')) return <Target className="w-3 h-3" />
    if (r.includes('bowl')) return <Zap className="w-3 h-3" />
    if (r.includes('all')) return <Award className="w-3 h-3" />
    return <Users className="w-3 h-3" />
  }

  const getTotalSpent = (team: Team) => {
    return team.players.reduce((sum, p) => sum + (p.soldPrice || p.basePrice), 0)
  }

  const getInitialBudget = (team: Team) => {
    return team.budget + getTotalSpent(team)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4" />
          <p className="text-gray-400">Loading teams...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => router.back()}
              variant="outline"
              size="sm"
              className="border-orange-500/30 text-orange-400"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-orange-500" />
              <h1 className="text-xl font-bold text-white">Team Squads</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={wsConnected ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}>
              {wsConnected ? "Live" : "Offline"}
            </Badge>
            <Badge className="bg-slate-700 text-gray-300">
              Room: {roomCode}
            </Badge>
          </div>
        </div>

        {/* Last Updated */}
        <p className="text-gray-500 text-xs mb-4 flex items-center gap-1">
          <RefreshCw className="w-3 h-3" />
          Last updated: {lastUpdated.toLocaleTimeString()}
        </p>

        {teams.length === 0 ? (
          <Card className="bg-slate-800/50 border-slate-700 p-8 text-center">
            <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-white text-lg mb-2">No teams found</p>
            <p className="text-gray-400 text-sm">Teams will appear here once the auction starts.</p>
          </Card>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <Card className="bg-slate-800/50 border-slate-700 p-3 text-center">
                <p className="text-gray-400 text-xs">Teams</p>
                <p className="text-2xl font-bold text-white">{teams.length}</p>
              </Card>
              <Card className="bg-slate-800/50 border-slate-700 p-3 text-center">
                <p className="text-gray-400 text-xs">Players Bought</p>
                <p className="text-2xl font-bold text-green-400">
                  {teams.reduce((sum, t) => sum + t.players.length, 0)}
                </p>
              </Card>
              <Card className="bg-slate-800/50 border-slate-700 p-3 text-center">
                <p className="text-gray-400 text-xs">Total Spent</p>
                <p className="text-2xl font-bold text-orange-400">
                  ₹{teams.reduce((sum, t) => sum + getTotalSpent(t), 0).toFixed(1)}Cr
                </p>
              </Card>
              <Card className="bg-slate-800/50 border-slate-700 p-3 text-center">
                <p className="text-gray-400 text-xs">Remaining Purse</p>
                <p className="text-2xl font-bold text-blue-400">
                  ₹{teams.reduce((sum, t) => sum + t.budget, 0).toFixed(1)}Cr
                </p>
              </Card>
            </div>

            {/* Teams Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teams.map((team, idx) => (
                <motion.div
                  key={team.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card 
                    className={`bg-slate-800/50 border-slate-700 overflow-hidden cursor-pointer transition-all hover:border-orange-500/50 ${
                      selectedTeam === team.id ? 'border-orange-500 ring-1 ring-orange-500/50' : ''
                    }`}
                    onClick={() => setSelectedTeam(selectedTeam === team.id ? null : team.id)}
                  >
                    {/* Team Header */}
                    <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border-b border-slate-700 p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-bold text-white text-lg">{team.name}</h3>
                          {team.owner && (
                            <p className="text-gray-400 text-xs">Owner: {team.owner}</p>
                          )}
                        </div>
                        <Badge className="bg-orange-500/20 text-orange-400">
                          #{idx + 1}
                        </Badge>
                      </div>
                    </div>

                    {/* Budget Info */}
                    <div className="p-3 border-b border-slate-700/50">
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <p className="text-[10px] text-gray-500">Remaining</p>
                          <p className="text-lg font-bold text-green-400">₹{team.budget.toFixed(1)}Cr</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-500">Spent</p>
                          <p className="text-lg font-bold text-red-400">₹{getTotalSpent(team).toFixed(1)}Cr</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-500">Squad</p>
                          <p className="text-lg font-bold text-blue-400">{team.players.length}/{team.maxPlayers}</p>
                        </div>
                      </div>
                      
                      {/* Budget Progress Bar */}
                      <div className="mt-2 w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-orange-500 h-2 rounded-full transition-all"
                          style={{ width: `${(team.budget / getInitialBudget(team)) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Players List */}
                    <AnimatePresence>
                      {selectedTeam === team.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="p-3 max-h-64 overflow-y-auto">
                            {team.players.length === 0 ? (
                              <p className="text-gray-500 text-sm text-center py-4">No players bought yet</p>
                            ) : (
                              <div className="space-y-2">
                                {team.players.map((player, pIdx) => (
                                  <div 
                                    key={player.id}
                                    className="flex items-center justify-between bg-slate-900/50 rounded-lg p-2"
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="text-gray-500 text-xs w-4">{pIdx + 1}</span>
                                      <div>
                                        <p className="text-white text-sm font-medium">{player.name}</p>
                                        <Badge className={`${getRoleColor(player.role)} text-[10px] px-1.5 py-0`}>
                                          {getRoleIcon(player.role)}
                                          <span className="ml-1">{player.role}</span>
                                        </Badge>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-green-400 font-bold text-sm">
                                        ₹{(player.soldPrice || player.basePrice).toFixed(1)}Cr
                                      </p>
                                      {player.soldPrice && player.soldPrice > player.basePrice && (
                                        <p className="text-gray-500 text-[10px] line-through">
                                          ₹{player.basePrice}Cr
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Expand Indicator */}
                    <div className="p-2 text-center border-t border-slate-700/50">
                      <p className="text-gray-500 text-xs">
                        {selectedTeam === team.id ? 'Click to collapse' : `Click to view ${team.players.length} players`}
                      </p>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
