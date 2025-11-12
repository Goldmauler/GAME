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
  takenTeams?: string[]
  onTeamSelect: (teamId: string) => void
}

export default function TeamSelection({ teams, takenTeams = [], onTeamSelect }: TeamSelectionProps) {
  const [selectedTeam, setSelectedTeam] = React.useState<string>("")
  const [error, setError] = React.useState<string>("")

  const handleTeamClick = (teamId: string) => {
    if (takenTeams.includes(teamId)) {
      setError(`This team is already taken! Please select another team.`)
      setTimeout(() => setError(""), 3000)
      return
    }
    setSelectedTeam(teamId)
    setError("")
  }

  const handleConfirm = () => {
    if (selectedTeam) {
      if (takenTeams.includes(selectedTeam)) {
        setError(`This team is already taken! Please select another team.`)
        return
      }
      onTeamSelect(selectedTeam)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-4 sm:py-8 md:py-12 px-3 sm:px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 sm:mb-8 md:mb-12"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 mb-2 sm:mb-4 leading-tight px-2">
            IPL AUCTION 2025
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-1 sm:mb-2 px-2">Select Your Team</p>
          <p className="text-sm sm:text-base text-gray-400 px-4">Choose wisely - you cannot change teams once the auction begins!</p>
          
          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-3 sm:mt-4 bg-red-500/20 border-2 border-red-500 rounded-lg px-4 sm:px-6 py-2 sm:py-3 inline-block mx-2"
            >
              <p className="text-red-400 font-bold text-sm sm:text-base">{error}</p>
            </motion.div>
          )}
        </motion.div>

        {/* Teams Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
          {teams.map((team, idx) => {
            const isTaken = takenTeams.includes(team.id)
            
            return (
              <motion.div
                key={team.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => handleTeamClick(team.id)}
                className={`rounded-xl p-4 sm:p-6 border-2 sm:border-4 transition-all transform ${
                  isTaken
                    ? "opacity-50 cursor-not-allowed border-red-500 grayscale"
                    : selectedTeam === team.id
                    ? "cursor-pointer border-yellow-400 shadow-2xl shadow-yellow-400/50 scale-105 sm:hover:scale-105"
                    : "cursor-pointer border-slate-700 hover:border-slate-500 active:scale-95 sm:hover:scale-105"
                } bg-gradient-to-br ${team.color}`}
              >
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-black text-white leading-tight">{team.name}</h3>
                  {isTaken && (
                    <div className="bg-red-500 text-white rounded-full px-2 sm:px-3 py-0.5 sm:py-1 text-xs font-bold shrink-0">
                      TAKEN
                    </div>
                  )}
                  {selectedTeam === team.id && !isTaken && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="bg-yellow-400 text-slate-900 rounded-full w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center font-bold text-sm sm:text-base shrink-0"
                    >
                      ✓
                    </motion.div>
                  )}
                </div>
                
                <div className="space-y-1.5 sm:space-y-2 text-white/90">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm">Starting Budget:</span>
                    <span className="font-bold text-sm sm:text-base">₹{team.budget}Cr</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm">Squad Slots:</span>
                    <span className="font-bold text-sm sm:text-base">{team.maxPlayers} Players</span>
                  </div>
                </div>

                <div className="mt-3 sm:mt-4 h-1.5 sm:h-2 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    animate={{ width: selectedTeam === team.id && !isTaken ? "100%" : "0%" }}
                    transition={{ duration: 0.3 }}
                    className="h-full bg-yellow-400"
                  />
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Confirm Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center px-3"
        >
          <button
            onClick={handleConfirm}
            disabled={!selectedTeam}
            className={`px-6 sm:px-10 md:px-12 py-3 sm:py-4 rounded-xl font-black text-base sm:text-lg md:text-xl transition-all transform w-full sm:w-auto ${
              selectedTeam
                ? "bg-gradient-to-r from-orange-500 to-red-500 text-white active:scale-95 sm:hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/50"
                : "bg-slate-700 text-slate-500 cursor-not-allowed"
            }`}
          >
            {selectedTeam ? "START AUCTION" : "SELECT A TEAM FIRST"}
          </button>

          {selectedTeam && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3 sm:mt-4 text-yellow-400 font-bold text-sm sm:text-base px-2"
            >
              Team selection is final and cannot be changed!
            </motion.p>
          )}
        </motion.div>
      </div>
    </div>
  )
}
