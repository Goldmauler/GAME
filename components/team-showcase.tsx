"use client"

import { useState } from "react"
import { motion } from "framer-motion"

interface Team {
  name: string
  players: number
  rating: number
  remarks: string
  color: string
  strengths: string[]
  weaknesses: string[]
}

const TEAMS_DATA: Team[] = [
  {
    name: "Mumbai Indians",
    players: 25,
    rating: 8.5,
    remarks: "Strong batting lineup with exceptional bowlers. Well-balanced squad.",
    color: "from-blue-600 to-blue-800",
    strengths: ["Batting", "Bowling", "Experience"],
    weaknesses: ["Youth"],
  },
  {
    name: "Chennai Super Kings",
    players: 25,
    rating: 8.8,
    remarks: "Outstanding leadership and consistency. Top-tier batting and bowling.",
    color: "from-yellow-600 to-yellow-800",
    strengths: ["Batting", "Leadership", "Consistency"],
    weaknesses: ["Age"],
  },
  {
    name: "Delhi Capitals",
    players: 25,
    rating: 7.9,
    remarks: "Young squad with explosive batting talent. Promising all-rounders.",
    color: "from-purple-600 to-purple-800",
    strengths: ["Youth", "Batting", "Potential"],
    weaknesses: ["Experience"],
  },
  {
    name: "Rajasthan Royals",
    players: 25,
    rating: 7.6,
    remarks: "Balanced squad with good investment strategy.",
    color: "from-pink-600 to-pink-800",
    strengths: ["Balance", "Strategy", "Bowling"],
    weaknesses: ["Star Power"],
  },
  {
    name: "Kolkata Knight Riders",
    players: 25,
    rating: 8.2,
    remarks: "Strong core with quality spinners and aggressive batters.",
    color: "from-slate-600 to-slate-800",
    strengths: ["Bowling", "Batting", "Strategy"],
    weaknesses: ["Consistency"],
  },
]

export default function TeamShowcase({ onViewRankings }: { onViewRankings: () => void }) {
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(TEAMS_DATA[0])

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-[1600px] mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12 text-center">
          <h2 className="text-5xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">
            Team Analysis
          </h2>
          <p className="text-gray-400">AI-Powered Team Rating & Performance Metrics</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Team List */}
          <div className="lg:col-span-1 space-y-3">
            {TEAMS_DATA.map((team, idx) => (
              <motion.button
                key={idx}
                onClick={() => setSelectedTeam(team)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  selectedTeam?.name === team.name
                    ? `bg-gradient-to-r ${team.color} border-yellow-400`
                    : "bg-slate-800 border-slate-700 hover:border-slate-600"
                }`}
              >
                <h3 className="font-bold text-white mb-1">{team.name}</h3>
                <div className="text-sm text-gray-300 flex items-center justify-between">
                  <span>
                    Rating: <span className="text-orange-400 font-bold">{team.rating}/10</span>
                  </span>
                  <span></span>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Team Details */}
          {selectedTeam && (
            <motion.div
              key={selectedTeam.name}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2 space-y-6"
            >
              {/* Rating Card */}
              <div className={`bg-gradient-to-br ${selectedTeam.color} rounded-xl p-8 shadow-2xl`}>
                <h3 className="text-3xl font-black text-white mb-4">{selectedTeam.name}</h3>

                {/* Rating Visualization */}
                <div className="grid grid-cols-3 gap-6 mb-8">
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring" }}
                      className="text-5xl font-black text-white mb-2"
                    >
                      {selectedTeam.rating}
                    </motion.div>
                    <p className="text-white/80 text-sm">Overall Rating</p>
                  </div>
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3, type: "spring" }}
                      className="text-5xl font-black text-white mb-2"
                    >
                      {selectedTeam.players}
                    </motion.div>
                    <p className="text-white/80 text-sm">Players</p>
                  </div>
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.4, type: "spring" }}
                      className="text-5xl font-black text-white mb-2"
                    >
                      {Math.floor(selectedTeam.rating * 100)}%
                    </motion.div>
                    <p className="text-white/80 text-sm">Strength</p>
                  </div>
                </div>

                <p className="text-white/90 text-lg italic">{selectedTeam.remarks}</p>
              </div>

              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800 border border-green-500/30 rounded-lg p-6">
                  <h4 className="font-black text-green-400 mb-4 flex items-center gap-2">✓ Strengths</h4>
                  <div className="space-y-2">
                    {selectedTeam.strengths.map((strength, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex items-center gap-2 text-green-300 text-sm"
                      >
                        <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                        {strength}
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-800 border border-red-500/30 rounded-lg p-6">
                  <h4 className="font-black text-red-400 mb-4 flex items-center gap-2">✗ Weaknesses</h4>
                  <div className="space-y-2">
                    {selectedTeam.weaknesses.map((weakness, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex items-center gap-2 text-red-300 text-sm"
                      >
                        <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                        {weakness}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onViewRankings}
          className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-4 rounded-lg"
        >
          View Final Rankings
        </motion.button>
      </div>
    </div>
  )
}
