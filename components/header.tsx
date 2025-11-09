"use client"

import { motion } from "framer-motion"

interface HeaderProps {
  gamePhase: string
}

export default function Header({ gamePhase }: HeaderProps) {
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
    </motion.header>
  )
}
