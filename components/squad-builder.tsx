"use client"

import { useState } from "react"
import { motion } from "framer-motion"

interface Player {
  id: string
  name: string
  role: "Batsman" | "Bowler" | "All-rounder" | "Wicket-keeper"
  basePrice: number
}

interface Team {
  id: string
  name: string
  players: Player[]
  budget: number
}

interface SquadBuilderProps {
  team: Team
  allPlayers: Player[]
}

/**
 * Squad builder component showing team composition analysis
 */
export default function SquadBuilder({ team, allPlayers }: SquadBuilderProps) {
  const [sortBy, setSortBy] = useState<"name" | "role" | "price">("name")

  const roleRequirements = {
    Batsman: 6,
    Bowler: 5,
    "All-rounder": 4,
    "Wicket-keeper": 1,
  }

  const roleDistribution = {
    Batsman: team.players.filter((p) => p.role === "Batsman").length,
    Bowler: team.players.filter((p) => p.role === "Bowler").length,
    "All-rounder": team.players.filter((p) => p.role === "All-rounder").length,
    "Wicket-keeper": team.players.filter((p) => p.role === "Wicket-keeper").length,
  }

  const getSortedPlayers = () => {
    const sorted = [...team.players]
    switch (sortBy) {
      case "role":
        return sorted.sort((a, b) => a.role.localeCompare(b.role))
      case "price":
        return sorted.sort((a, b) => (b.basePrice || 0) - (a.basePrice || 0))
      case "name":
      default:
        return sorted.sort((a, b) => a.name.localeCompare(b.name))
    }
  }

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-orange-500/20">
      <h3 className="font-bold text-white mb-4 text-lg">Squad Composition</h3>

      {/* Role Requirements */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {Object.entries(roleRequirements).map(([role, required]) => {
          const current = roleDistribution[role as keyof typeof roleDistribution]
          const fulfilled = current >= required
          const percentage = (current / required) * 100

          return (
            <motion.div
              key={role}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-lg p-3 ${fulfilled ? "bg-green-500/20 border border-green-500/50" : "bg-orange-500/20 border border-orange-500/50"}`}
            >
              <p className="text-sm font-bold text-white mb-1">{role}</p>
              <p className={`text-lg font-black ${fulfilled ? "text-green-400" : "text-orange-400"}`}>
                {current}/{required}
              </p>
              <div className="w-full h-1 bg-white/20 rounded-full mt-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(percentage, 100)}%` }}
                  transition={{ duration: 0.5 }}
                  className={`h-full ${fulfilled ? "bg-green-400" : "bg-orange-400"}`}
                ></motion.div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Sort Controls */}
      <div className="flex gap-2 mb-4">
        {["name", "role", "price"].map((option) => (
          <button
            key={option}
            onClick={() => setSortBy(option as any)}
            className={`px-3 py-1 rounded text-sm font-bold transition-all ${
              sortBy === option ? "bg-orange-500 text-white" : "bg-slate-700 text-gray-300 hover:bg-slate-600"
            }`}
          >
            {option.charAt(0).toUpperCase() + option.slice(1)}
          </button>
        ))}
      </div>

      {/* Players List */}
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {getSortedPlayers().map((player, idx) => (
          <motion.div
            key={player.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.02 }}
            className="flex items-center justify-between bg-slate-700/50 p-2 rounded text-sm"
          >
            <span className="text-gray-300">{player.name}</span>
            <div className="flex items-center gap-3">
              <span className="text-xs bg-slate-600 px-2 py-1 rounded text-gray-300">{player.role}</span>
              <span className="text-orange-400 font-bold min-w-12 text-right">₹{player.basePrice}L</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
