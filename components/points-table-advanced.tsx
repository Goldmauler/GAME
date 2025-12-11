"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { generateRankings, generateAchievements, generateComparativeStats } from "@/lib/rankings"

interface PointsTableAdvancedProps {
  teams: any[]
}

type SortBy = "points" | "rating" | "players" | "avgPrice" | "budget"

export default function PointsTableAdvanced({ teams }: PointsTableAdvancedProps) {
  const [sortBy, setSortBy] = useState<SortBy>("points")
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null)

  const rankings = useMemo(() => generateRankings(teams), [teams])
  const achievements = useMemo(() => generateAchievements(rankings), [rankings])
  const comparativeStats = useMemo(() => generateComparativeStats(rankings), [rankings])

  const sortedRankings = useMemo(() => {
    const sorted = [...rankings]
    switch (sortBy) {
      case "rating":
        return sorted.sort((a, b) => b.overallRating - a.overallRating)
      case "players":
        return sorted.sort((a, b) => b.playersCount - a.playersCount)
      case "avgPrice":
        return sorted.sort((a, b) => b.averagePlayerPrice - a.averagePlayerPrice)
      case "budget":
        return sorted.sort((a, b) => b.budgetSpent - a.budgetSpent)
      case "points":
      default:
        return sorted.sort((a, b) => b.points - a.points)
    }
  }, [rankings, sortBy])

  return (
    <div className="space-y-8">
      {/* Comparative Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          { label: "Avg Rating", value: comparativeStats.averageRating, suffix: "/10" },
          { label: "Avg Points", value: comparativeStats.averagePoints, suffix: "" },
          { label: "Avg Player Price", value: `₹${comparativeStats.averagePlayerPrice}L`, suffix: "" },
          { label: "Highest Rating", value: comparativeStats.ratingRange.highest, suffix: "/10" },
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-4 border border-orange-500/20"
          >
            <p className="text-gray-400 text-sm mb-2">{stat.label}</p>
            <p className="text-2xl font-black text-orange-400">
              {stat.value}
              {stat.suffix}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* Sort Controls */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: "points", label: "Points" },
          { key: "rating", label: "Rating" },
          { key: "players", label: "Squad Size" },
          { key: "avgPrice", label: "Avg Price" },
          { key: "budget", label: "Budget Spent" },
        ].map((option) => (
          <button
            key={option.key}
            onClick={() => setSortBy(option.key as SortBy)}
            className={`px-4 py-2 rounded font-bold transition-all ${
              sortBy === option.key
                ? "bg-orange-500 text-white"
                : "bg-slate-800 text-gray-300 hover:bg-slate-700 border border-slate-700"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Rankings Table */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3 max-h-96 overflow-y-auto">
        {sortedRankings.map((team, idx) => {
          const isExpanded = expandedTeam === team.teamId
          const teamAchievements = achievements[team.teamId] || []

          return (
            <motion.div
              key={team.teamId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <button
                onClick={() => setExpandedTeam(isExpanded ? null : team.teamId)}
                className={`w-full bg-gradient-to-r ${team.teamColor} rounded-lg p-4 border-2 transition-all text-left ${
                  isExpanded
                    ? "border-yellow-400 shadow-lg shadow-yellow-400/30"
                    : "border-slate-700 hover:border-slate-600"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  {/* Rank Badge */}
                  <div className="flex items-center gap-4">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg ${
                        team.rank === 1
                          ? "bg-yellow-400 text-slate-900"
                          : team.rank === 2
                            ? "bg-gray-300 text-slate-900"
                            : team.rank === 3
                              ? "bg-orange-400 text-slate-900"
                              : "bg-white/20 text-white"
                      }`}
                    >
                      {team.rank === 1 ? "" : team.rank === 2 ? "" : team.rank === 3 ? "" : team.rank}
                    </motion.div>
                    <div>
                      <h3 className="font-black text-white text-lg">{team.teamName}</h3>
                      <p className="text-white/70 text-sm">{team.points} Points</p>
                    </div>
                  </div>

                  {/* Key Metrics */}
                  <div className="flex items-center gap-6 text-white">
                    <div className="text-right">
                      <p className="text-xs text-white/70">Rating</p>
                      <p className="font-black text-lg">{team.overallRating}/10</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-white/70">Squad</p>
                      <p className="font-black text-lg">{team.playersCount}/25</p>
                    </div>
                    <motion.span animate={{ rotate: isExpanded ? 180 : 0 }} className="text-xl">
                      ▼
                    </motion.span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(team.points / 100) * 100}%` }}
                    transition={{ duration: 0.6 }}
                    className="h-full bg-white/60"
                  ></motion.div>
                </div>
              </button>

              {/* Expanded Details */}
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`bg-gradient-to-r ${team.teamColor} rounded-b-lg p-4 border-2 border-t-0 border-yellow-400 space-y-4`}
                >
                  {/* Achievements */}
                  {teamAchievements.length > 0 && (
                    <div>
                      <p className="text-white/70 text-xs font-bold mb-2">ACHIEVEMENTS</p>
                      <div className="flex flex-wrap gap-2">
                        {teamAchievements.map((achievement, idx) => (
                          <motion.span
                            key={idx}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-black/30 px-3 py-1 rounded-full text-white text-sm font-bold"
                          >
                            {achievement}
                          </motion.span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Detailed Stats */}
                  <div className="grid grid-cols-2 gap-4 bg-black/20 p-3 rounded-lg">
                    <div>
                      <p className="text-white/70 text-xs">Budget Spent</p>
                      <p className="text-lg font-black text-white">₹{team.budgetSpent}L</p>
                    </div>
                    <div>
                      <p className="text-white/70 text-xs">Budget Remaining</p>
                      <p className="text-lg font-black text-green-300">₹{team.budgetRemaining}L</p>
                    </div>
                    <div>
                      <p className="text-white/70 text-xs">Avg Player Price</p>
                      <p className="text-lg font-black text-orange-300">₹{team.averagePlayerPrice}L</p>
                    </div>
                    <div>
                      <p className="text-white/70 text-xs">Total Investment</p>
                      <p className="text-lg font-black text-blue-300">₹{team.budgetSpent + team.budgetRemaining}L</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}
