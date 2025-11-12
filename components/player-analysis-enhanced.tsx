"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { X, TrendingUp, Award, Target, Activity } from "lucide-react"
import { fetchPlayerStats, getCountryFlag, type PlayerStats } from "@/lib/cricket-api"

interface Player {
  id: string
  name: string
  role: "Batsman" | "Bowler" | "All-rounder" | "Wicket-keeper"
  basePrice: number
  soldTo?: string
  soldPrice?: number
}

interface PlayerAnalysisEnhancedProps {
  player: Player
  onClose: () => void
}

export default function PlayerAnalysisEnhanced({ player, onClose }: PlayerAnalysisEnhancedProps) {
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    loadPlayerData()
  }, [player.id])

  const loadPlayerData = async () => {
    setLoading(true)
    setError(null)
    setImageError(false)
    
    try {
      console.log(`🔍 Fetching stats for: ${player.name}`)
      
      // Fetch player stats
      const stats = await fetchPlayerStats(player.name, player.role, player.basePrice)
      setPlayerStats(stats)
      console.log('✅ Player stats loaded:', stats)
      
      setLoading(false)
    } catch (err) {
      console.error('❌ Error loading player data:', err)
      setError('Failed to load player data')
      setLoading(false)
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Batsman": return "bg-blue-500"
      case "Bowler": return "bg-red-500"
      case "All-rounder": return "bg-purple-500"
      case "Wicket-keeper": return "bg-green-500"
      default: return "bg-gray-500"
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "Batsman": return "🏏"
      case "Bowler": return "⚡"
      case "All-rounder": return "💪"
      case "Wicket-keeper": return "🧤"
      default: return "🎯"
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-slate-700"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with Close Button */}
          <div className="relative bg-gradient-to-r from-orange-600 to-orange-500 p-6">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            <h2 className="text-2xl font-bold text-white mb-2">Player Analysis</h2>
            <p className="text-orange-100 text-sm">Detailed statistics and performance metrics</p>
          </div>

          <div className="overflow-y-auto max-h-[calc(90vh-120px)] custom-scrollbar">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full"
                />
                <p className="text-gray-400 mt-4">Loading player data...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-20">
                <p className="text-red-400 text-lg">{error}</p>
                <button
                  onClick={loadPlayerData}
                  className="mt-4 px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : playerStats ? (
              <div className="p-6 space-y-6">
                {/* Player Header */}
                <div className="flex items-start gap-6 bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                  {/* Player Image */}
                  <div className="relative">
                    <div className="w-32 h-32 rounded-xl overflow-hidden bg-slate-700 border-4 border-orange-500 shadow-xl">
                      {!imageError ? (
                        <Image
                          src={playerStats.image || ''}
                          alt={playerStats.name}
                          width={128}
                          height={128}
                          className="w-full h-full object-cover"
                          onError={() => setImageError(true)}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-orange-500">
                          {playerStats.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                      )}
                    </div>
                    <div className={`absolute -bottom-2 -right-2 ${getRoleColor(playerStats.role)} text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg`}>
                      {getRoleIcon(playerStats.role)} {playerStats.role}
                    </div>
                  </div>

                  {/* Player Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-3xl font-bold text-white mb-2">{playerStats.name}</h3>
                        <div className="flex items-center gap-3 text-gray-300">
                          <span className="text-2xl">{getCountryFlag(playerStats.country)}</span>
                          <span className="font-semibold">{playerStats.country}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                      {playerStats.battingStyle && (
                        <div className="bg-slate-700/50 rounded-lg p-3">
                          <p className="text-gray-400 text-xs mb-1">Batting Style</p>
                          <p className="text-white font-semibold">{playerStats.battingStyle}</p>
                        </div>
                      )}
                      {playerStats.bowlingStyle && (
                        <div className="bg-slate-700/50 rounded-lg p-3">
                          <p className="text-gray-400 text-xs mb-1">Bowling Style</p>
                          <p className="text-white font-semibold">{playerStats.bowlingStyle}</p>
                        </div>
                      )}
                    </div>

                    {/* Auction Info */}
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3">
                        <p className="text-blue-200 text-xs mb-1">Base Price</p>
                        <p className="text-blue-100 font-bold text-xl">₹{player.basePrice} Cr</p>
                      </div>
                      {player.soldPrice && (
                        <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3">
                          <p className="text-green-200 text-xs mb-1">Sold Price</p>
                          <p className="text-green-100 font-bold text-xl">₹{player.soldPrice} Cr</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Career Statistics */}
                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                  <div className="flex items-center gap-2 mb-4">
                    <Activity className="w-5 h-5 text-orange-500" />
                    <h4 className="text-xl font-bold text-white">Career Statistics</h4>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                      <p className="text-gray-400 text-sm mb-2">Matches</p>
                      <p className="text-3xl font-bold text-orange-500">{playerStats.stats.matches}</p>
                    </div>
                    <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                      <p className="text-gray-400 text-sm mb-2">Innings</p>
                      <p className="text-3xl font-bold text-blue-500">{playerStats.stats.innings}</p>
                    </div>
                    {playerStats.stats.runs > 0 && (
                      <>
                        <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                          <p className="text-gray-400 text-sm mb-2">Runs</p>
                          <p className="text-3xl font-bold text-green-500">{playerStats.stats.runs}</p>
                        </div>
                        <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                          <p className="text-gray-400 text-sm mb-2">Average</p>
                          <p className="text-3xl font-bold text-purple-500">{playerStats.stats.average}</p>
                        </div>
                        <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                          <p className="text-gray-400 text-sm mb-2">Strike Rate</p>
                          <p className="text-3xl font-bold text-yellow-500">{playerStats.stats.strikeRate}</p>
                        </div>
                        {playerStats.stats.bestScore && (
                          <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                            <p className="text-gray-400 text-sm mb-2">Best Score</p>
                            <p className="text-3xl font-bold text-orange-500">{playerStats.stats.bestScore}</p>
                          </div>
                        )}
                      </>
                    )}
                    {playerStats.stats.wickets > 0 && (
                      <>
                        <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                          <p className="text-gray-400 text-sm mb-2">Wickets</p>
                          <p className="text-3xl font-bold text-red-500">{playerStats.stats.wickets}</p>
                        </div>
                        {playerStats.stats.economy && (
                          <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                            <p className="text-gray-400 text-sm mb-2">Economy</p>
                            <p className="text-3xl font-bold text-cyan-500">{playerStats.stats.economy}</p>
                          </div>
                        )}
                        {playerStats.stats.bestBowling && (
                          <div className="bg-slate-700/50 rounded-lg p-4 text-center">
                            <p className="text-gray-400 text-sm mb-2">Best Bowling</p>
                            <p className="text-2xl font-bold text-pink-500">{playerStats.stats.bestBowling}</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Recent Form */}
                {playerStats.recentForm && playerStats.recentForm.length > 0 && (
                  <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp className="w-5 h-5 text-orange-500" />
                      <h4 className="text-xl font-bold text-white">Recent Form</h4>
                    </div>
                    
                    <div className="space-y-2">
                      {playerStats.recentForm.map((match, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-slate-700/30 rounded-lg p-3 hover:bg-slate-700/50 transition-colors">
                          <span className="text-gray-300">{match.match}</span>
                          <div className="flex items-center gap-4">
                            {match.score && (
                              <span className="text-green-400 font-bold">{match.score} runs</span>
                            )}
                            {match.wickets && (
                              <span className="text-red-400 font-bold">{match.wickets}</span>
                            )}
                            <span className="text-gray-500 text-sm">{match.date}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Value Assessment */}
                <div className="bg-gradient-to-r from-orange-500/20 to-orange-600/20 rounded-xl p-6 border border-orange-500/30">
                  <div className="flex items-center gap-2 mb-4">
                    <Award className="w-5 h-5 text-orange-500" />
                    <h4 className="text-xl font-bold text-white">Value Assessment</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-300 text-sm mb-2">Experience Level</p>
                      <div className="bg-slate-700/50 rounded-lg p-3">
                        <p className="text-white font-semibold">
                          {playerStats.stats.matches > 100 ? 'Veteran' : playerStats.stats.matches > 50 ? 'Experienced' : 'Emerging'}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-300 text-sm mb-2">Value Rating</p>
                      <div className="bg-slate-700/50 rounded-lg p-3">
                        <p className="text-white font-semibold">
                          {player.basePrice > 12 ? 'Premium' : player.basePrice > 8 ? 'High Value' : player.basePrice > 4 ? 'Good Value' : 'Budget Pick'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
