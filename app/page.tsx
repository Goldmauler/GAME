"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import AuctionArena from "@/components/auction-arena"
import TeamShowcase from "@/components/team-showcase"
import Header from "@/components/header"
import PointsTable from "@/components/points-table"

type GamePhase = "lobby" | "auction" | "results" | "rankings"

export default function Home() {
  const [gamePhase, setGamePhase] = useState<GamePhase>("lobby")
  const [auctionStarted, setAuctionStarted] = useState(false)

  useEffect(() => {
    // Auto-transition phases for demo
    const timer = setTimeout(() => {
      if (!auctionStarted) {
        setGamePhase("auction")
        setAuctionStarted(true)
      }
    }, 5000)
    return () => clearTimeout(timer)
  }, [auctionStarted])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-foreground overflow-x-hidden">
      {/* Cricket-themed background pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-green-500/5 rounded-full blur-3xl"></div>
      </div>

      <Header gamePhase={gamePhase} />

      <main className="relative z-10">
        {gamePhase === "lobby" && (
          <LobbyScreen
            onStart={() => {
              setGamePhase("auction")
              setAuctionStarted(true)
            }}
          />
        )}

        {gamePhase === "auction" && <AuctionArena onComplete={() => setGamePhase("results")} />}

        {gamePhase === "results" && <TeamShowcase onViewRankings={() => setGamePhase("rankings")} />}

        {gamePhase === "rankings" && <PointsTable />}
      </main>
    </div>
  )
}

function LobbyScreen({ onStart }: { onStart: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex items-center justify-center px-4"
    >
      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
          className="mb-12"
        >
          <div className="text-7xl font-black text-orange-500 mb-4">🏏</div>
          <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-500 to-red-500 mb-4">
            CRICKET AUCTION
          </h1>
          <p className="text-xl text-gray-300">The Ultimate Franchise Building Game</p>
        </motion.div>

        <div className="grid grid-cols-3 gap-4 mb-12 max-w-2xl mx-auto">
          {[
            { icon: "👥", label: "10 Teams", value: "Compete" },
            { icon: "🏏", label: "250+ Players", value: "Available" },
            { icon: "💎", label: "25 per Team", value: "Squad Size" },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-6 border border-orange-500/30"
            >
              <div className="text-4xl mb-2">{stat.icon}</div>
              <p className="text-sm text-gray-400">{stat.label}</p>
              <p className="text-lg font-bold text-orange-500">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        <motion.button
          onClick={onStart}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-4 px-12 rounded-lg text-xl shadow-2xl"
        >
          START AUCTION
        </motion.button>

        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          className="mt-8 text-gray-400 text-sm"
        >
          Building the perfect team awaits...
        </motion.p>
      </div>
    </motion.div>
  )
}
