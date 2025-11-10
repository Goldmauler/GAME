"use client"

import React from "react"
import { motion } from "framer-motion"

interface Team {
  id: string
  name: string
  color: string
  budget: number
  players: any[]
  maxPlayers: number
  recentBids: number
}

interface TeamSelectionProps {
  teams: Team[]
  onTeamSelect: (teamId: string) => void
}

export default function TeamSelection({ teams, onTeamSelect }: TeamSelectionProps) {
  const [selectedTeam, setSelectedTeam] = React.useState<string>("")

  const handleConfirm = () => {
    if (selectedTeam) {
      onTeamSelect(selectedTeam)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 mb-4">
            🏏 IPL AUCTION 2025
          </h1>
          <p className="text-2xl text-gray-300 mb-2">Select Your Team</p>
          <p className="text-gray-400">Choose wisely - you cannot change teams once the auction begins!</p>
        </motion.div>

        {/* Teams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {teams.map((team, idx) => (
            <motion.div
              key={team.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => setSelectedTeam(team.id)}
              className={`cursor-pointer rounded-xl p-6 border-4 transition-all transform hover:scale-105 ${
                selectedTeam === team.id
                  ? "border-yellow-400 shadow-2xl shadow-yellow-400/50"
                  : "border-slate-700 hover:border-slate-500"
              } bg-gradient-to-br ${team.color}`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-black text-white">{team.name}</h3>
                {selectedTeam === team.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="bg-yellow-400 text-slate-900 rounded-full w-8 h-8 flex items-center justify-center font-bold"
                  >
                    ✓
                  </motion.div>
                )}
              </div>
              
              <div className="space-y-2 text-white/90">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Starting Budget:</span>
                  <span className="font-bold">₹{team.budget}Cr</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Squad Slots:</span>
                  <span className="font-bold">{team.maxPlayers} Players</span>
                </div>
              </div>

              <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  animate={{ width: selectedTeam === team.id ? "100%" : "0%" }}
                  transition={{ duration: 0.3 }}
                  className="h-full bg-yellow-400"
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Confirm Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <button
            onClick={handleConfirm}
            disabled={!selectedTeam}
            className={`px-12 py-4 rounded-xl font-black text-xl transition-all transform ${
              selectedTeam
                ? "bg-gradient-to-r from-orange-500 to-red-500 text-white hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/50"
                : "bg-slate-700 text-slate-500 cursor-not-allowed"
            }`}
          >
            {selectedTeam ? "START AUCTION 🚀" : "SELECT A TEAM FIRST"}
          </button>

          {selectedTeam && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 text-yellow-400 font-bold"
            >
              ⚠️ Team selection is final and cannot be changed!
            </motion.p>
          )}
        </motion.div>
      </div>
    </div>
  )
}
