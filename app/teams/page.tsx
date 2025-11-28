"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Users, DollarSign, TrendingUp, Award } from "lucide-react"

interface Team {
  id: string
  name: string
  budget: number
  players: Player[]
  maxPlayers: number
}

interface Player {
  id: string
  name: string
  role: string
  basePrice: number
  soldPrice?: number
}

export default function TeamsPage() {
  const router = useRouter()
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Try to get teams from sessionStorage (if coming from auction)
    const storedTeams = sessionStorage.getItem('auctionTeams')
    if (storedTeams) {
      try {
        const allTeams = JSON.parse(storedTeams)
        // Filter to show only teams that have players (active teams)
        const activeTeams = allTeams.filter((team: Team) => team.players && team.players.length > 0)
        setTeams(activeTeams)
      } catch (e) {
        console.error('Error parsing teams:', e)
      }
    }
    setLoading(false)
  }, [])

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "batsman": case "batter": return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "bowler": return "bg-red-500/20 text-red-400 border-red-500/30"
      case "all-rounder": case "allrounder": return "bg-purple-500/20 text-purple-400 border-purple-500/30"
      case "wicket-keeper": case "wicketkeeper": return "bg-green-500/20 text-green-400 border-green-500/30"
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getTeamStats = (team: Team) => {
    const spent = 100 - team.budget
    const avgPrice = team.players.length > 0 ? spent / team.players.length : 0
    const batsmen = team.players.filter(p => p.role.toLowerCase().includes('batsman') || p.role.toLowerCase().includes('batter')).length
    const bowlers = team.players.filter(p => p.role.toLowerCase().includes('bowler')).length
    const allRounders = team.players.filter(p => p.role.toLowerCase().includes('all-rounder') || p.role.toLowerCase().includes('allrounder')).length
    const keepers = team.players.filter(p => p.role.toLowerCase().includes('keeper')).length
    
    return { spent, avgPrice, batsmen, bowlers, allRounders, keepers }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-6 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            onClick={() => {
              // Check if we should return to auction
              const returnToAuction = sessionStorage.getItem('returnToAuction')
              const auctionRoomCode = sessionStorage.getItem('auctionRoomCode')
              
              if (returnToAuction === 'true' && auctionRoomCode) {
                // Clear the flag
                sessionStorage.removeItem('returnToAuction')
                // Go back in browser history to return to the active auction
                window.history.back()
              } else if (auctionRoomCode) {
                // Navigate to room if no flag set
                router.push(`/room/${auctionRoomCode}`)
              } else {
                // Fall back to browser back
                router.back()
              }
            }}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Auction
          </Button>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white">All Teams</h1>
            <p className="text-gray-400 text-sm sm:text-base">Complete overview of all teams and their squads</p>
          </div>
        </div>

        {teams.length === 0 ? (
          <Card className="bg-slate-800/50 border-slate-700 p-8 text-center">
            <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No team data available</p>
            <p className="text-gray-500 text-sm mt-2">Join or create an auction to see teams here</p>
            <Button
              onClick={() => router.push('/rooms')}
              className="mt-4 bg-orange-500 hover:bg-orange-600"
            >
              Go to Rooms
            </Button>
          </Card>
        ) : (
          <div className="space-y-6">
            {teams.map((team) => {
              const stats = getTeamStats(team)
              
              return (
                <motion.div
                  key={team.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="bg-slate-800/50 border-slate-700 overflow-hidden">
                    {/* Team Header */}
                    <div className="bg-gradient-to-r from-orange-600/20 to-red-600/20 border-b border-slate-700 p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">{team.name}</h2>
                          <div className="flex flex-wrap gap-3 text-sm">
                            <div className="flex items-center gap-1 text-green-400">
                              <DollarSign className="w-4 h-4" />
                              <span className="font-semibold">Budget: ₹{team.budget}Cr</span>
                            </div>
                            <div className="flex items-center gap-1 text-orange-400">
                              <TrendingUp className="w-4 h-4" />
                              <span className="font-semibold">Spent: ₹{stats.spent.toFixed(1)}Cr</span>
                            </div>
                            <div className="flex items-center gap-1 text-blue-400">
                              <Users className="w-4 h-4" />
                              <span className="font-semibold">{team.players.length}/{team.maxPlayers} Players</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Squad Composition */}
                        <div className="bg-slate-900/50 rounded-lg p-3 sm:p-4">
                          <p className="text-xs text-gray-400 mb-2">Squad Composition</p>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 rounded-full bg-blue-500" />
                              <span className="text-gray-300">{stats.batsmen} BAT</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 rounded-full bg-red-500" />
                              <span className="text-gray-300">{stats.bowlers} BWL</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 rounded-full bg-purple-500" />
                              <span className="text-gray-300">{stats.allRounders} AR</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 rounded-full bg-green-500" />
                              <span className="text-gray-300">{stats.keepers} WK</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Players Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-slate-900/50 border-b border-slate-700">
                          <tr>
                            <th className="text-left p-3 sm:p-4 text-xs sm:text-sm font-semibold text-gray-400">#</th>
                            <th className="text-left p-3 sm:p-4 text-xs sm:text-sm font-semibold text-gray-400">Player</th>
                            <th className="text-left p-3 sm:p-4 text-xs sm:text-sm font-semibold text-gray-400">Role</th>
                            <th className="text-right p-3 sm:p-4 text-xs sm:text-sm font-semibold text-gray-400">Base</th>
                            <th className="text-right p-3 sm:p-4 text-xs sm:text-sm font-semibold text-gray-400">Sold</th>
                          </tr>
                        </thead>
                        <tbody>
                          {team.players.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="text-center p-8 text-gray-500">
                                No players in squad yet
                              </td>
                            </tr>
                          ) : (
                            team.players.map((player, idx) => (
                              <tr key={player.id} className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                                <td className="p-3 sm:p-4 text-gray-400 text-sm">{idx + 1}</td>
                                <td className="p-3 sm:p-4">
                                  <span className="text-white font-medium text-sm sm:text-base">{player.name}</span>
                                </td>
                                <td className="p-3 sm:p-4">
                                  <span className={`inline-flex items-center px-2 py-1 rounded-md border text-xs font-medium ${getRoleColor(player.role)}`}>
                                    {player.role}
                                  </span>
                                </td>
                                <td className="p-3 sm:p-4 text-right text-gray-400 text-sm">₹{player.basePrice}Cr</td>
                                <td className="p-3 sm:p-4 text-right text-orange-400 font-semibold text-sm sm:text-base">
                                  ₹{player.soldPrice || player.basePrice}Cr
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
