"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import AuctionArena from "@/components/auction-arena"
import TeamShowcase from "@/components/team-showcase"
import Header from "@/components/header"
import PointsTable from "@/components/points-table"

type GamePhase = "lobby" | "auction" | "results" | "rankings"

export default function Home() {
  const [gamePhase, setGamePhase] = useState<GamePhase>("lobby")
  
  // Load saved state from sessionStorage on mount
  useEffect(() => {
    const savedPhase = sessionStorage.getItem('gamePhase')
    if (savedPhase && ['lobby', 'auction', 'results', 'rankings'].includes(savedPhase)) {
      setGamePhase(savedPhase as GamePhase)
    }
  }, [])
  
  // Save state to sessionStorage whenever it changes
  useEffect(() => {
    sessionStorage.setItem('gamePhase', gamePhase)
  }, [gamePhase])
  
  // Function to reset game
  const resetGame = () => {
    sessionStorage.removeItem('gamePhase')
    sessionStorage.removeItem('auctionState')
    setGamePhase('lobby')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-foreground overflow-hidden">
      {/* Enhanced 3D background with animated elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Animated gradient orbs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
            x: [0, -100, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            x: [0, -80, 0],
            y: [0, 80, 0],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 5
          }}
          className="absolute top-1/2 left-1/2 w-[700px] h-[700px] bg-purple-500/8 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.4, 1],
            rotate: [0, 180, 0],
          }}
          transition={{
            duration: 35,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3
          }}
          className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-green-500/8 rounded-full blur-3xl"
        />
        
        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [-20, -100, -20],
              x: [0, Math.random() * 100 - 50, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
            className="absolute w-2 h-2 bg-orange-500/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <Header gamePhase={gamePhase} onReset={gamePhase !== 'lobby' ? resetGame : undefined} />

      <main className="relative z-10">
        <AnimatePresence mode="wait">
          {gamePhase === "lobby" && (
            <LobbyScreen
              key="lobby"
              onStart={() => {
                setGamePhase("auction")
              }}
              onNewGame={resetGame}
            />
          )}

          {gamePhase === "auction" && (
            <motion.div
              key="auction"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
            >
              <AuctionArena onComplete={() => setGamePhase("results")} />
            </motion.div>
          )}

          {gamePhase === "results" && (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.5 }}
            >
              <TeamShowcase onViewRankings={() => setGamePhase("rankings")} />
            </motion.div>
          )}

          {gamePhase === "rankings" && (
            <motion.div
              key="rankings"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.5 }}
            >
              <PointsTable />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}

function LobbyScreen({ onStart, onNewGame }: { onStart: () => void; onNewGame: () => void }) {
  const [hasSavedGame, setHasSavedGame] = useState(false)
  
  useEffect(() => {
    // Check if there's a saved game
    const savedState = sessionStorage.getItem('auctionState')
    setHasSavedGame(!!savedState)
  }, [])
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex items-center justify-center px-4"
    >
      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
          className="mb-12"
        >
          {/* 3D Cricket Icon */}
          <motion.div
            animate={{
              rotateY: [0, 360],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear"
            }}
            className="text-7xl font-black text-orange-500 mb-4 inline-block"
            style={{ transformStyle: "preserve-3d" }}
          >
            🏏
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-500 to-red-500 mb-4"
            style={{
              textShadow: "0 0 40px rgba(251, 146, 60, 0.3)"
            }}
          >
            CRICKET AUCTION
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-gray-300"
          >
            The Ultimate Franchise Building Game
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-3 gap-4 mb-12 max-w-2xl mx-auto">
          {[
            { icon: "👥", label: "10 Teams", value: "Compete", color: "from-blue-600 to-blue-800" },
            { icon: "🏏", label: "250+ Players", value: "Available", color: "from-orange-600 to-red-800" },
            { icon: "💎", label: "25 per Team", value: "Squad Size", color: "from-purple-600 to-purple-800" },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20, rotateX: -30 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ delay: idx * 0.1 + 0.5 }}
              whileHover={{
                scale: 1.05,
                rotateY: 10,
                transition: { duration: 0.2 }
              }}
              className={`bg-gradient-to-br ${stat.color} rounded-xl p-6 border border-white/10 shadow-2xl backdrop-blur-sm`}
              style={{ transformStyle: "preserve-3d" }}
            >
              <div className="text-4xl mb-2">{stat.icon}</div>
              <p className="text-sm text-gray-200">{stat.label}</p>
              <p className="text-lg font-bold text-white">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        <div className="space-y-4">
          {hasSavedGame && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-4 backdrop-blur-sm"
            >
              <p className="text-green-400 text-sm text-center font-semibold">
                Previous game found! You can continue or start a new game.
              </p>
            </motion.div>
          )}
          
          <motion.button
            onClick={onStart}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            whileHover={{
              scale: 1.05,
              boxShadow: "0 20px 40px rgba(251, 146, 60, 0.4)",
            }}
            whileTap={{ scale: 0.95 }}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-4 px-12 rounded-xl text-xl shadow-2xl transition-all duration-300"
          >
            {hasSavedGame ? 'CONTINUE SOLO AUCTION' : 'START SOLO AUCTION'}
          </motion.button>

          <motion.a
            href="/rooms"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            whileHover={{
              scale: 1.05,
              boxShadow: "0 20px 40px rgba(59, 130, 246, 0.4)",
            }}
            whileTap={{ scale: 0.95 }}
            className="block w-full text-center bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-4 px-12 rounded-xl text-xl shadow-2xl transition-all duration-300"
          >
            JOIN MULTIPLAYER LOBBY
          </motion.a>
          
          {hasSavedGame && (
            <motion.button
              onClick={() => {
                if (confirm('Are you sure you want to start a new game? Your current progress will be lost.')) {
                  onNewGame()
                }
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              whileHover={{
                scale: 1.05,
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
              }}
              whileTap={{ scale: 0.95 }}
              className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold py-3 px-8 rounded-xl text-base shadow-xl border border-gray-500 transition-all duration-300"
            >
              NEW GAME (Reset Progress)
            </motion.button>
          )}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: 1.1 }}
          className="mt-8 text-gray-400 text-sm"
        >
          Building the perfect team awaits...
        </motion.p>
      </div>
    </motion.div>
  )
}
