"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import PointsTableAdvanced from "./points-table-advanced"

const MOCK_TEAMS = [
  { id: "1", name: "Mumbai Indians", color: "from-blue-600 to-blue-800", budget: 0, players: [] },
  { id: "2", name: "Chennai Super Kings", color: "from-yellow-600 to-yellow-800", budget: 0, players: [] },
  { id: "3", name: "Delhi Capitals", color: "from-purple-600 to-purple-800", budget: 0, players: [] },
  { id: "4", name: "Rajasthan Royals", color: "from-pink-600 to-pink-800", budget: 0, players: [] },
  { id: "5", name: "Kolkata Knight Riders", color: "from-slate-600 to-slate-800", budget: 0, players: [] },
  { id: "6", name: "Punjab Kings", color: "from-red-600 to-red-800", budget: 0, players: [] },
  { id: "7", name: "Sunrisers Hyderabad", color: "from-orange-600 to-orange-800", budget: 0, players: [] },
  { id: "8", name: "Lucknow Super Giants", color: "from-cyan-600 to-cyan-800", budget: 0, players: [] },
  { id: "9", name: "Bangalore Royals", color: "from-red-600 to-rose-800", budget: 0, players: [] },
  { id: "10", name: "Hyderabad Chargers", color: "from-emerald-600 to-emerald-800", budget: 0, players: [] },
]

export default function PointsTable() {
  const teams = useMemo(() => MOCK_TEAMS, [])

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12 text-center">
          <h2 className="text-5xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">
            Final Rankings
          </h2>
          <p className="text-gray-400">Comprehensive team standings and performance metrics</p>
        </motion.div>

        {/* Leaderboard */}
        <PointsTableAdvanced teams={teams} />
      </div>
    </div>
  )
}
