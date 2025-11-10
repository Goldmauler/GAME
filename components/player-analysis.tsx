"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface Player {
  id: string
  name: string
  role: "Batsman" | "Bowler" | "All-rounder" | "Wicket-keeper"
  basePrice: number
  soldTo?: string
  soldPrice?: number
}

interface PlayerDetails {
  name: string
  role: string
  age?: number
  nationality?: string
  battingStyle?: string
  bowlingStyle?: string
  recentStats?: {
    matches?: number
    runs?: number
    wickets?: number
    average?: number
    strikeRate?: number
  }
  careerHighlights?: string[]
  analysis?: string
}

interface PlayerAnalysisProps {
  player: Player
  onClose: () => void
}

export default function PlayerAnalysis({ player, onClose }: PlayerAnalysisProps) {
  const [details, setDetails] = useState<PlayerDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPlayerDetails()
  }, [player.id])

  const fetchPlayerDetails = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Check if API key is configured
      const apiKey = process.env.NEXT_PUBLIC_CRICKET_API_KEY
      const apiUrl = process.env.NEXT_PUBLIC_CRICKET_API_URL
      
      if (apiKey && apiKey !== 'your_api_key_here' && apiUrl) {
        // Real API call (example for CricAPI)
        const response = await fetch(`${apiUrl}/players_info?apikey=${apiKey}&name=${encodeURIComponent(player.name)}`)
        
        if (response.ok) {
          const data = await response.json()
          // Parse real API data here based on your API provider
          // This is an example structure - adjust based on actual API response
          if (data.data && data.data.length > 0) {
            const playerData = data.data[0]
            setDetails({
              name: player.name,
              role: player.role,
              age: playerData.age,
              nationality: playerData.country || "India",
              battingStyle: playerData.battingStyle || "Right-handed",
              bowlingStyle: playerData.bowlingStyle || "N/A",
              recentStats: {
                matches: playerData.matches || 50,
                runs: playerData.runs || 1000,
                wickets: playerData.wickets || 0,
                average: playerData.battingAverage || 25,
                strikeRate: playerData.strikeRate || 120,
              },
              careerHighlights: playerData.achievements || [
                "Player of the Match - 3 times",
                "Fastest 50 in tournament history",
              ],
              analysis: playerData.profile || `${player.name} is a ${player.role.toLowerCase()} known for exceptional performance.`
            })
            setLoading(false)
            return
          }
        }
      }
      
      // Fallback to mock data if API is not configured or fails
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockDetails: PlayerDetails = {
        name: player.name,
        role: player.role,
        age: 25 + Math.floor(Math.random() * 10),
        nationality: "India",
        battingStyle: player.role.includes("Batsman") || player.role === "All-rounder" 
          ? ["Right-handed", "Left-handed"][Math.floor(Math.random() * 2)]
          : "N/A",
        bowlingStyle: player.role.includes("Bowler") || player.role === "All-rounder"
          ? ["Fast", "Medium", "Spin"][Math.floor(Math.random() * 3)]
          : "N/A",
        recentStats: {
          matches: 50 + Math.floor(Math.random() * 100),
          runs: player.role.includes("Batsman") || player.role === "All-rounder" 
            ? 1000 + Math.floor(Math.random() * 3000) 
            : 200 + Math.floor(Math.random() * 500),
          wickets: player.role.includes("Bowler") || player.role === "All-rounder"
            ? 20 + Math.floor(Math.random() * 80)
            : 0,
          average: 25 + Math.floor(Math.random() * 30),
          strikeRate: 120 + Math.floor(Math.random() * 60),
        },
        careerHighlights: [
          "Player of the Match - 3 times",
          "Fastest 50 in tournament history",
          "Hat-trick in finals 2024",
        ],
        analysis: `${player.name} is a ${player.role.toLowerCase()} known for exceptional performance under pressure. With consistent form in recent seasons, they bring both experience and energy to any team.`
      }
      
      setDetails(mockDetails)
    } catch (err) {
      setError("Failed to load player details. Please try again.")
      console.error("Error fetching player details:", err)
    } finally {
      setLoading(false)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "Batsman": return "🏏"
      case "Bowler": return "⚡"
      case "All-rounder": return "⭐"
      case "Wicket-keeper": return "🧤"
      default: return "👤"
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-orange-500/30 shadow-2xl"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 rounded-t-2xl">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-5xl mb-2">{getRoleIcon(player.role)}</div>
              <h2 className="text-3xl font-black text-white mb-1">{player.name}</h2>
              <p className="text-white/80 text-lg">{player.role}</p>
            </div>
            <button
              onClick={onClose}
              className="bg-white/20 hover:bg-white/30 text-white rounded-full w-10 h-10 flex items-center justify-center transition-all"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="inline-block text-6xl mb-4"
              >
                🏏
              </motion.div>
              <p className="text-gray-400">Loading player details...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-400 mb-4">{error}</p>
              <button
                onClick={fetchPlayerDetails}
                className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-all"
              >
                Retry
              </button>
            </div>
          ) : details ? (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Age</p>
                  <p className="text-white font-bold text-xl">{details.age} years</p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Nationality</p>
                  <p className="text-white font-bold text-xl">{details.nationality}</p>
                </div>
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Base Price</p>
                  <p className="text-orange-400 font-bold text-xl">₹{player.basePrice}Cr</p>
                </div>
                {player.soldPrice && (
                  <div className="bg-green-900/30 rounded-lg p-4 border border-green-500/30">
                    <p className="text-gray-400 text-sm mb-1">Sold Price</p>
                    <p className="text-green-400 font-bold text-xl">₹{player.soldPrice}Cr</p>
                  </div>
                )}
              </div>

              {/* Playing Style */}
              <div className="bg-slate-700/30 rounded-lg p-6">
                <h3 className="text-xl font-bold text-orange-400 mb-4">Playing Style</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Batting Style</p>
                    <p className="text-white font-semibold">{details.battingStyle}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Bowling Style</p>
                    <p className="text-white font-semibold">{details.bowlingStyle}</p>
                  </div>
                </div>
              </div>

              {/* Recent Stats */}
              {details.recentStats && (
                <div className="bg-slate-700/30 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-orange-400 mb-4">Recent Performance</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center">
                      <p className="text-3xl font-black text-white mb-1">{details.recentStats.matches}</p>
                      <p className="text-gray-400 text-sm">Matches</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-black text-orange-400 mb-1">{details.recentStats.runs}</p>
                      <p className="text-gray-400 text-sm">Runs</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-black text-red-400 mb-1">{details.recentStats.wickets}</p>
                      <p className="text-gray-400 text-sm">Wickets</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-black text-blue-400 mb-1">{details.recentStats.average}</p>
                      <p className="text-gray-400 text-sm">Average</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-black text-green-400 mb-1">{details.recentStats.strikeRate}</p>
                      <p className="text-gray-400 text-sm">Strike Rate</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Career Highlights */}
              {details.careerHighlights && details.careerHighlights.length > 0 && (
                <div className="bg-slate-700/30 rounded-lg p-6">
                  <h3 className="text-xl font-bold text-orange-400 mb-4">Career Highlights</h3>
                  <ul className="space-y-2">
                    {details.careerHighlights.map((highlight, idx) => (
                      <motion.li
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex items-center gap-3 text-gray-300"
                      >
                        <span className="text-yellow-400">⭐</span>
                        {highlight}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              )}

              {/* AI Analysis */}
              {details.analysis && (
                <div className="bg-gradient-to-br from-orange-900/20 to-red-900/20 rounded-lg p-6 border border-orange-500/30">
                  <h3 className="text-xl font-bold text-orange-400 mb-3">AI Analysis</h3>
                  <p className="text-gray-300 leading-relaxed">{details.analysis}</p>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </motion.div>
    </motion.div>
  )
}
