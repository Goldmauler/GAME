"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Trophy, Home, RotateCcw } from "lucide-react"

interface HeaderProps {
  gamePhase: string
  onReset?: () => void
}

export default function Header({ gamePhase, onReset }: HeaderProps) {
  const phases = {
    lobby: "Welcome",
    auction: "Live Auction",
    results: "Team Analysis",
    rankings: "Final Rankings",
  }

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 backdrop-blur-md bg-gradient-to-b from-slate-950/80 to-slate-950/0 border-b border-orange-500/20 py-4"
    >
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-3xl">🏏</div>
          <div>
            <h1 className="font-black text-2xl text-orange-500">IPL AUCTION</h1>
            <p className="text-xs text-gray-400">Franchise Building Game</p>
          </div>
        </div>

        <div className="flex gap-4 items-center">
          {onReset && (
            <button
              onClick={onReset}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all"
            >
              <Home className="h-4 w-4" />
              <span className="text-sm font-semibold">Back to Menu</span>
            </button>
          )}
          
          <Link 
            href="/leaderboard"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/20 transition-all"
          >
            <Trophy className="h-4 w-4" />
            <span className="text-sm font-semibold">Leaderboard</span>
          </Link>
          
          <div className="flex gap-2">
            {Object.entries(phases).map(([key, label]) => (
              <motion.div
                key={key}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  gamePhase === key
                    ? "bg-orange-500/30 border border-orange-500 text-orange-300"
                    : "text-gray-500 border border-gray-700"
                }`}
              >
                {label}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.header>
  )
}
