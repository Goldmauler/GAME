"use client"

import { motion } from "framer-motion"
import type { TeamBiddingProfile } from "@/lib/auctioneer-logic"

interface BiddingStrategyDisplayProps {
  teams: any[]
  teamProfiles: Map<string, TeamBiddingProfile>
}

/**
 * Displays bidding strategies and AI logic for educational purposes
 */
export default function BiddingStrategyDisplay({ teams, teamProfiles }: BiddingStrategyDisplayProps) {
  const getStrategyColor = (strategy: string) => {
    switch (strategy) {
      case "aggressive":
        return "text-red-400"
      case "conservative":
        return "text-blue-400"
      case "opportunistic":
        return "text-orange-400"
      case "patient":
        return "text-green-400"
      default:
        return "text-gray-400"
    }
  }

  const getStrategyDescription = (strategy: string) => {
    switch (strategy) {
      case "aggressive":
        return "Going all-in for quality"
      case "conservative":
        return "Cautious and calculated"
      case "opportunistic":
        return "Looking for deals"
      case "patient":
        return "Waiting for bargains"
      default:
        return "Unknown strategy"
    }
  }

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-orange-500/20">
      <h3 className="font-bold text-orange-400 mb-4">Team Strategies</h3>
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {teams.map((team) => {
          const profile = teamProfiles.get(team.id)
          if (!profile) return null

          return (
            <motion.div
              key={team.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-between bg-slate-700/50 p-3 rounded-lg"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{team.name}</p>
                <p className={`text-xs ${getStrategyColor(profile.strategy)}`}>
                  {getStrategyDescription(profile.strategy)}
                </p>
              </div>
              <div className="flex items-center gap-4 ml-4">
                <div className="text-right">
                  <p className="text-xs text-gray-400">Budget Left</p>
                  <p className="text-sm font-bold text-orange-400">₹{team.budget}L</p>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
