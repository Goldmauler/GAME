"use client"

import { motion } from "framer-motion"
import type { TeamRating } from "@/lib/team-rating"

interface TeamRatingCardProps {
  rating: TeamRating
  teamName: string
  teamColor: string
}

export default function TeamRatingCard({ rating, teamName, teamColor }: TeamRatingCardProps) {
  const getRatingColor = (score: number) => {
    if (score >= 8) return "text-green-400"
    if (score >= 6) return "text-blue-400"
    if (score >= 4) return "text-orange-400"
    return "text-red-400"
  }

  const getRatingBgColor = (score: number) => {
    if (score >= 8) return "bg-green-500/10 border-green-500/30"
    if (score >= 6) return "bg-blue-500/10 border-blue-500/30"
    if (score >= 4) return "bg-orange-500/10 border-orange-500/30"
    return "bg-red-500/10 border-red-500/30"
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br ${teamColor} rounded-xl p-6 border border-white/10 shadow-xl`}
    >
      {/* Header */}
      <h3 className="text-2xl font-black text-white mb-6">{teamName}</h3>

      {/* Overall Rating */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", delay: 0.1 }}
        className="text-center mb-8 p-4 bg-black/30 rounded-lg"
      >
        <p className="text-white/60 text-sm mb-2">OVERALL RATING</p>
        <p className={`text-5xl font-black ${getRatingColor(rating.overallScore)}`}>{rating.overallScore}</p>
        <p className="text-white/60 text-xs mt-2">out of 10</p>
      </motion.div>

      {/* Category Scores */}
      <div className="space-y-3 mb-6">
        {[
          { label: "Batting", score: rating.battingScore, icon: "" },
          { label: "Bowling", score: rating.bowlingScore, icon: "⚾" },
          { label: "Balance", score: rating.balanceScore, icon: "" },
          { label: "Value", score: rating.valueScore, icon: "" },
        ].map((category) => (
          <motion.div
            key={category.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <span className="text-2xl">{category.icon}</span>
            <div className="flex-1">
              <p className="text-white text-sm font-bold">{category.label}</p>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden mt-1">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(category.score / 10) * 100}%` }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className={`h-full ${category.score >= 7 ? "bg-green-400" : category.score >= 5 ? "bg-blue-400" : "bg-orange-400"}`}
                ></motion.div>
              </div>
            </div>
            <span className={`text-sm font-bold ${getRatingColor(category.score)}`}>{category.score}/10</span>
          </motion.div>
        ))}
      </div>

      {/* Strengths */}
      {rating.strengths.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-4"
        >
          <h4 className="font-bold text-green-400 text-sm mb-2">✓ Strengths</h4>
          <ul className="space-y-1">
            {rating.strengths.slice(0, 2).map((strength, idx) => (
              <li key={idx} className="text-xs text-green-300 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                {strength}
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Weaknesses */}
      {rating.weaknesses.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4"
        >
          <h4 className="font-bold text-red-400 text-sm mb-2">✗ Weaknesses</h4>
          <ul className="space-y-1">
            {rating.weaknesses.slice(0, 2).map((weakness, idx) => (
              <li key={idx} className="text-xs text-red-300 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                {weakness}
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Insights */}
      {rating.insights.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4"
        >
          <h4 className="font-bold text-blue-400 text-sm mb-2">Key Insight</h4>
          <p className="text-xs text-blue-300">{rating.insights[0]}</p>
        </motion.div>
      )}
    </motion.div>
  )
}
