"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Users, Target, Zap, TrendingUp, Award, Activity, Info, Star, DollarSign } from "lucide-react"

interface PlayerDetails {
  id: string
  name: string
  role: string
  basePrice: number
  rating: number
  stats?: {
    matches?: number
    runs?: number
    wickets?: number
    average?: number
    strikeRate?: number
    economy?: number
  }
  // API data
  country?: string
  battingStyle?: string
  bowlingStyle?: string
  bio?: string
  imageUrl?: string
}

export default function PlayerDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [player, setPlayer] = useState<PlayerDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingApiInfo, setLoadingApiInfo] = useState(false)

  useEffect(() => {
    // Get player from sessionStorage
    const storedPlayer = sessionStorage.getItem('currentPlayer')
    if (storedPlayer) {
      try {
        const playerData = JSON.parse(storedPlayer)
        setPlayer(playerData)
        setLoading(false)
        
        // Fetch additional API info
        fetchPlayerInfo(playerData.name)
      } catch (e) {
        console.error('Error parsing player:', e)
        setLoading(false)
      }
    } else {
      setLoading(false)
    }
  }, [params.playerId])

  const fetchPlayerInfo = async (playerName: string) => {
    setLoadingApiInfo(true)
    try {
      const apiKey = process.env.NEXT_PUBLIC_RAPIDAPI_KEY
      const apiHost = process.env.NEXT_PUBLIC_API_HOST
      
      if (!apiKey || !apiHost) {
        console.log("API credentials not configured")
        setLoadingApiInfo(false)
        return
      }

      // Search for player
      const searchResponse = await fetch(
        `https://cricbuzz-cricket.p.rapidapi.com/stats/v1/player/search?plrN=${encodeURIComponent(playerName)}`,
        {
          method: 'GET',
          headers: {
            'X-RapidAPI-Key': apiKey,
            'X-RapidAPI-Host': apiHost,
          },
        }
      )

      if (searchResponse.ok) {
        const searchData = await searchResponse.json()
        if (searchData?.player && searchData.player.length > 0) {
          const playerId = searchData.player[0].id
          
          // Get player details
          const detailsResponse = await fetch(
            `https://cricbuzz-cricket.p.rapidapi.com/stats/v1/player/${playerId}`,
            {
              method: 'GET',
              headers: {
                'X-RapidAPI-Key': apiKey,
                'X-RapidAPI-Host': apiHost,
              },
            }
          )

          if (detailsResponse.ok) {
            const detailsData = await detailsResponse.json()
            setPlayer(prev => prev ? {
              ...prev,
              country: detailsData.intlTeam || "India",
              battingStyle: detailsData.bat || "",
              bowlingStyle: detailsData.bowl || "",
              bio: detailsData.bio || "",
              imageUrl: detailsData.faceImageId 
                ? `https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_160,q_50/lsci/${detailsData.faceImageId}`
                : undefined
            } : null)
          }
        }
      }
    } catch (error) {
      console.error("Error fetching player info:", error)
    } finally {
      setLoadingApiInfo(false)
    }
  }

  const getRoleColor = (role: string) => {
    const roleLower = role.toLowerCase()
    if (roleLower.includes('batsman') || roleLower.includes('batter')) return "bg-blue-500/20 text-blue-400 border-blue-500/30"
    if (roleLower.includes('bowler')) return "bg-red-500/20 text-red-400 border-red-500/30"
    if (roleLower.includes('all-rounder') || roleLower.includes('allrounder')) return "bg-purple-500/20 text-purple-400 border-purple-500/30"
    if (roleLower.includes('keeper')) return "bg-green-500/20 text-green-400 border-green-500/30"
    return "bg-gray-500/20 text-gray-400 border-gray-500/30"
  }

  const getRoleIcon = (role: string) => {
    const roleLower = role.toLowerCase()
    if (roleLower.includes('batsman') || roleLower.includes('batter')) return <Target className="w-4 h-4" />
    if (roleLower.includes('bowler')) return <Zap className="w-4 h-4" />
    if (roleLower.includes('all-rounder') || roleLower.includes('allrounder')) return <Award className="w-4 h-4" />
    if (roleLower.includes('keeper')) return <Users className="w-4 h-4" />
    return <Users className="w-4 h-4" />
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500" />
      </div>
    )
  }

  if (!player) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <Card className="bg-slate-800/50 border-slate-700 p-8 text-center">
          <p className="text-white text-lg mb-4">Player not found</p>
          <Button onClick={() => router.back()} className="bg-orange-500 hover:bg-orange-600">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-6 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Auction
          </Button>
          
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Player Details</h1>
          <p className="text-gray-400">Complete statistics and information</p>
        </div>

        {/* Player Card */}
        <Card className="bg-gradient-to-br from-slate-800 via-slate-800/80 to-slate-900 border-2 border-orange-500/50 shadow-2xl shadow-orange-500/20 mb-6">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row items-start gap-6 mb-6">
              {/* Player Image */}
              {player.imageUrl ? (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", duration: 0.6 }}
                  className="flex-shrink-0"
                >
                  <div className="w-40 h-40 rounded-xl overflow-hidden border-4 border-orange-500/50 shadow-lg">
                    <img
                      src={player.imageUrl}
                      alt={player.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                  </div>
                </motion.div>
              ) : (
                <div className="w-40 h-40 rounded-xl bg-slate-700/50 border-4 border-orange-500/50 flex items-center justify-center flex-shrink-0">
                  <Users className="w-20 h-20 text-gray-600" />
                </div>
              )}

              {/* Player Info */}
              <div className="flex-1">
                <h2 className="text-4xl font-black text-white mb-3 bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                  {player.name}
                </h2>
                
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <Badge className={`${getRoleColor(player.role)} border px-4 py-1.5 text-sm font-semibold`}>
                    <span className="flex items-center gap-2">
                      {getRoleIcon(player.role)}
                      {player.role}
                    </span>
                  </Badge>
                  <Badge className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-4 py-1.5">
                    <span className="flex items-center gap-2">
                      <Star className="w-4 h-4 fill-yellow-400" />
                      Rating: {player.rating}
                    </span>
                  </Badge>
                  {player.country && (
                    <Badge className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-4 py-1.5">
                      {player.country}
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-slate-900/50 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Base Price</p>
                    <p className="text-2xl font-bold text-green-400 flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      ₹{player.basePrice}Cr
                    </p>
                  </div>
                  {player.battingStyle && (
                    <div className="bg-slate-900/50 rounded-lg p-3">
                      <p className="text-xs text-gray-400 mb-1">Batting Style</p>
                      <p className="text-lg font-semibold text-white">{player.battingStyle}</p>
                    </div>
                  )}
                  {player.bowlingStyle && (
                    <div className="bg-slate-900/50 rounded-lg p-3">
                      <p className="text-xs text-gray-400 mb-1">Bowling Style</p>
                      <p className="text-lg font-semibold text-white">{player.bowlingStyle}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bio Section */}
            {player.bio && (
              <div className="bg-slate-900/50 rounded-lg p-4 mb-6">
                <h4 className="text-orange-400 font-semibold mb-2 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  About
                </h4>
                <p className="text-gray-300 text-sm leading-relaxed">{player.bio}</p>
              </div>
            )}

            {/* Loading API Info */}
            {loadingApiInfo && !player.country && (
              <div className="flex items-center justify-center gap-2 text-gray-400 py-4">
                <Activity className="w-5 h-5 animate-spin" />
                <span>Loading additional details...</span>
              </div>
            )}

            {/* Career Statistics */}
            {player.stats && (
              <div>
                <h4 className="text-orange-400 font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Career Statistics
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-500/30 rounded-lg p-4 text-center"
                  >
                    <Users className="w-5 h-5 text-blue-400 mx-auto mb-2" />
                    <p className="text-gray-400 text-xs mb-1">Matches</p>
                    <p className="text-white text-2xl font-black">{player.stats.matches || 0}</p>
                  </motion.div>

                  {player.stats.runs !== undefined && (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="bg-gradient-to-br from-green-600/20 to-green-800/20 border border-green-500/30 rounded-lg p-4 text-center"
                    >
                      <Target className="w-5 h-5 text-green-400 mx-auto mb-2" />
                      <p className="text-gray-400 text-xs mb-1">Total Runs</p>
                      <p className="text-white text-2xl font-black">{player.stats.runs}</p>
                    </motion.div>
                  )}

                  {player.stats.wickets !== undefined && (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="bg-gradient-to-br from-red-600/20 to-red-800/20 border border-red-500/30 rounded-lg p-4 text-center"
                    >
                      <Zap className="w-5 h-5 text-red-400 mx-auto mb-2" />
                      <p className="text-gray-400 text-xs mb-1">Wickets</p>
                      <p className="text-white text-2xl font-black">{player.stats.wickets}</p>
                    </motion.div>
                  )}

                  {player.stats.average !== undefined && (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-500/30 rounded-lg p-4 text-center"
                    >
                      <TrendingUp className="w-5 h-5 text-purple-400 mx-auto mb-2" />
                      <p className="text-gray-400 text-xs mb-1">Average</p>
                      <p className="text-white text-2xl font-black">{typeof player.stats.average === 'number' ? player.stats.average.toFixed(1) : parseFloat(player.stats.average).toFixed(1)}</p>
                    </motion.div>
                  )}

                  {player.stats.strikeRate !== undefined && (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="bg-gradient-to-br from-orange-600/20 to-orange-800/20 border border-orange-500/30 rounded-lg p-4 text-center"
                    >
                      <Award className="w-5 h-5 text-orange-400 mx-auto mb-2" />
                      <p className="text-gray-400 text-xs mb-1">Strike Rate</p>
                      <p className="text-white text-2xl font-black">{typeof player.stats.strikeRate === 'number' ? player.stats.strikeRate.toFixed(1) : parseFloat(player.stats.strikeRate).toFixed(1)}</p>
                    </motion.div>
                  )}

                  {player.stats.economy !== undefined && (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      className="bg-gradient-to-br from-yellow-600/20 to-yellow-800/20 border border-yellow-500/30 rounded-lg p-4 text-center"
                    >
                      <Activity className="w-5 h-5 text-yellow-400 mx-auto mb-2" />
                      <p className="text-gray-400 text-xs mb-1">Economy</p>
                      <p className="text-white text-2xl font-black">{typeof player.stats.economy === 'number' ? player.stats.economy.toFixed(2) : parseFloat(player.stats.economy).toFixed(2)}</p>
                    </motion.div>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
