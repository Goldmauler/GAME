"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Trophy, Home, Users } from "lucide-react"
import MobileMenu from "./mobile-menu"

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
      className="sticky top-0 z-50 backdrop-blur-md bg-gradient-to-b from-slate-950/80 to-slate-950/0 border-b border-orange-500/20 py-3 sm:py-4"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
            <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
          </div>
          <div>
            <h1 className="font-black text-lg sm:text-2xl text-orange-500">IPL AUCTION</h1>
            <p className="text-xs text-gray-400 hidden sm:block">Franchise Building Game</p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex gap-4 items-center">
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
            href="/teams"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 transition-all"
          >
            <Users className="h-4 w-4" />
            <span className="text-sm font-semibold">Teams</span>
          </Link>
          
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

        {/* Mobile Menu */}
        <MobileMenu onReset={onReset} />
      </div>
    </motion.header>
  )
}
