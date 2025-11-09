"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface Player {
  id: string
  name: string
  role: "Batsman" | "Bowler" | "All-rounder" | "Wicket-keeper"
  basePrice: number
  soldPrice?: number
}

interface Team {
  id: string
  name: string
  color: string
  budget: number
  players: Player[]
  maxPlayers: number
}

interface TeamRosterProps {
  teams: Team[]
  selectedTeamId?: string
  onTeamSelect?: (teamId: string) => void
}

export default function TeamRoster({ teams, selectedTeamId, onTeamSelect }: TeamRosterProps) {
  const [expandedTeam, setExpandedTeam] = useState<string | null>(selectedTeamId || teams[0]?.id)
  const selectedTeam = teams.find((t) => t.id === expandedTeam)

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "Batsman":
        return "🏏"
      case "Bowler":
        return "⚾"
      case "All-rounder":
        return "🌟"
      case "Wicket-keeper":
        return "🧤"
      default:
        return "👤"
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Batsman":
        return "from-blue-600 to-blue-800"
      case "Bowler":
        return "from-red-600 to-red-800"
      case "All-rounder":
        return "from-purple-600 to-purple-800"
      case "Wicket-keeper":
        return "from-green-600 to-green-800"
      default:
        return "from-gray-600 to-gray-800"
    }
  }

  const roleDistribution = {
    Batsman: selectedTeam?.players.filter((p) => p.role === "Batsman").length || 0,
    Bowler: selectedTeam?.players.filter((p) => p.role === "Bowler").length || 0,
    "All-rounder": selectedTeam?.players.filter((p) => p.role === "All-rounder").length || 0,
    "Wicket-keeper": selectedTeam?.players.filter((p) => p.role === "Wicket-keeper").length || 0,
  }

  return (
    <div className="space-y-6">
      {/* Team Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        {teams.map((team) => {
          const isExpanded = expandedTeam === team.id
          const spendTotal = team.players.reduce((acc, p) => acc + (p.soldPrice || 0), 0)

          return (
            <motion.button
              key={team.id}
              onClick={() => {
                setExpandedTeam(isExpanded ? null : team.id)
                onTeamSelect?.(team.id)
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`bg-gradient-to-br ${team.color} rounded-lg p-4 border-2 transition-all text-left ${
                isExpanded ? "border-yellow-400 shadow-xl shadow-yellow-400/50" : "border-slate-700"
              }`}
            >
              <h3 className="font-bold text-white text-sm truncate mb-3">{team.name}</h3>
              <div className="space-y-2 text-xs text-white/80">
                <div className="flex justify-between">
                  <span>Squad:</span>
                  <span className="font-bold">{team.players.length}/25</span>
                </div>
                <div className="flex justify-between">
                  <span>Spent:</span>
                  <span className="font-bold">₹{spendTotal}L</span>
                </div>
                <div className="flex justify-between">
                  <span>Left:</span>
                  <span className="font-bold text-green-300">₹{team.budget}L</span>
                </div>
              </div>
              <motion.div
                animate={{ width: `${(team.players.length / 25) * 100}%` }}
                transition={{ duration: 0.5 }}
                className="h-2 bg-white/20 rounded-full mt-3 overflow-hidden"
              >
                <div className="h-full bg-white/60"></div>
              </motion.div>
            </motion.button>
          )
        })}
      </div>

      {/* Detailed Team View */}
      <AnimatePresence mode="wait">
        {selectedTeam && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`bg-gradient-to-br ${selectedTeam.color} rounded-xl overflow-hidden shadow-2xl`}
          >
            {/* Header */}
            <div className="bg-black/30 p-6 border-b border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-3xl font-black text-white">{selectedTeam.name}</h2>
                <motion.button
                  onClick={() => setExpandedTeam(null)}
                  className="text-white/60 hover:text-white text-2xl"
                >
                  ✕
                </motion.button>
              </div>

              {/* Team Stats */}
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <p className="text-white/60 text-xs mb-1">Players</p>
                  <p className="text-2xl font-black text-white">{selectedTeam.players.length}/25</p>
                </div>
                <div>
                  <p className="text-white/60 text-xs mb-1">Budget Left</p>
                  <p className="text-2xl font-black text-green-300">₹{selectedTeam.budget}L</p>
                </div>
                <div>
                  <p className="text-white/60 text-xs mb-1">Avg Price</p>
                  <p className="text-2xl font-black text-orange-300">
                    ₹
                    {selectedTeam.players.length > 0
                      ? Math.round(
                          selectedTeam.players.reduce((acc, p) => acc + (p.soldPrice || 0), 0) /
                            selectedTeam.players.length,
                        )
                      : 0}
                    L
                  </p>
                </div>
                <div>
                  <p className="text-white/60 text-xs mb-1">Total Spent</p>
                  <p className="text-2xl font-black text-blue-300">
                    ₹{selectedTeam.players.reduce((acc, p) => acc + (p.soldPrice || 0), 0)}L
                  </p>
                </div>
              </div>
            </div>

            {/* Role Distribution */}
            <div className="bg-black/20 p-6 border-b border-white/10">
              <h3 className="font-bold text-white mb-4">Role Distribution</h3>
              <div className="grid grid-cols-4 gap-3">
                {Object.entries(roleDistribution).map(([role, count]) => (
                  <div key={role} className="text-center">
                    <p className="text-2xl mb-2">{getRoleIcon(role)}</p>
                    <p className="text-white font-bold">{count}</p>
                    <p className="text-xs text-white/60">{role}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Players List */}
            <div className="p-6">
              <h3 className="font-bold text-white mb-4">Squad</h3>
              {selectedTeam.players.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {selectedTeam.players.map((player, idx) => (
                    <motion.div
                      key={player.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`bg-gradient-to-r ${getRoleColor(player.role)} rounded-lg p-4 flex items-center justify-between`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getRoleIcon(player.role)}</span>
                        <div>
                          <p className="font-bold text-white">{player.name}</p>
                          <p className="text-xs text-white/70">{player.role}</p>
                        </div>
                      </div>
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-right">
                        <p className="text-sm text-white/80">Bought at</p>
                        <p className="font-black text-white text-lg">₹{player.soldPrice}L</p>
                      </motion.div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-white/60 text-center py-8">No players purchased yet</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
