"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Users, Target, Zap, TrendingUp, Award, Activity, Info, Star, DollarSign } from "lucide-react"

// IPL 2025 Player Stats Database (T20 career stats)
const PLAYER_STATS_DB: Record<string, {
  matches: number
  runs?: number
  wickets?: number
  average?: number
  strikeRate?: number
  economy?: number
  highestScore?: string
  bestBowling?: string
  fifties?: number
  hundreds?: number
  country: string
  battingStyle?: string
  bowlingStyle?: string
  team?: string
}> = {
  "rishabh pant": { matches: 111, runs: 2838, average: 34.60, strikeRate: 148.93, fifties: 18, hundreds: 1, highestScore: "128*", country: "India", battingStyle: "Left-hand bat", team: "Lucknow Super Giants" },
  "virat kohli": { matches: 252, runs: 8004, average: 41.47, strikeRate: 131.10, fifties: 55, hundreds: 8, highestScore: "113", country: "India", battingStyle: "Right-hand bat", team: "Royal Challengers Bengaluru" },
  "rohit sharma": { matches: 264, runs: 6628, average: 31.17, strikeRate: 131.32, fifties: 38, hundreds: 5, highestScore: "118", country: "India", battingStyle: "Right-hand bat", team: "Mumbai Indians" },
  "ms dhoni": { matches: 291, runs: 5243, average: 38.09, strikeRate: 135.91, fifties: 24, highestScore: "84*", country: "India", battingStyle: "Right-hand bat", team: "Chennai Super Kings" },
  "jasprit bumrah": { matches: 144, wickets: 181, average: 21.04, economy: 6.67, strikeRate: 18.91, bestBowling: "5/10", country: "India", bowlingStyle: "Right-arm fast", team: "Mumbai Indians" },
  "rashid khan": { matches: 400, wickets: 550, average: 17.29, economy: 6.24, strikeRate: 16.64, bestBowling: "5/3", country: "Afghanistan", bowlingStyle: "Leg-break googly", team: "Gujarat Titans" },
  "suryakumar yadav": { matches: 168, runs: 4912, average: 36.65, strikeRate: 150.71, fifties: 34, hundreds: 5, highestScore: "117", country: "India", battingStyle: "Right-hand bat", team: "Mumbai Indians" },
  "hardik pandya": { matches: 152, runs: 2340, wickets: 84, average: 28.53, strikeRate: 140.18, economy: 8.87, country: "India", battingStyle: "Right-hand bat", bowlingStyle: "Right-arm medium-fast", team: "Mumbai Indians" },
  "ravindra jadeja": { matches: 265, runs: 2892, wickets: 166, average: 26.29, strikeRate: 127.89, economy: 7.06, country: "India", battingStyle: "Left-hand bat", bowlingStyle: "Slow left-arm orthodox", team: "Chennai Super Kings" },
  "shubman gill": { matches: 95, runs: 2920, average: 37.43, strikeRate: 130.22, fifties: 20, hundreds: 3, highestScore: "129", country: "India", battingStyle: "Right-hand bat", team: "Gujarat Titans" },
  "yashasvi jaiswal": { matches: 36, runs: 1478, average: 48.93, strikeRate: 163.53, fifties: 10, hundreds: 2, highestScore: "124*", country: "India", battingStyle: "Left-hand bat", team: "Rajasthan Royals" },
  "sanju samson": { matches: 159, runs: 4399, average: 29.32, strikeRate: 137.54, fifties: 24, hundreds: 3, highestScore: "119", country: "India", battingStyle: "Right-hand bat", team: "Rajasthan Royals" },
  "kl rahul": { matches: 132, runs: 4683, average: 45.91, strikeRate: 134.61, fifties: 37, hundreds: 4, highestScore: "132*", country: "India", battingStyle: "Right-hand bat", team: "Delhi Capitals" },
  "jos buttler": { matches: 320, runs: 7714, average: 33.39, strikeRate: 144.47, fifties: 46, hundreds: 11, highestScore: "124", country: "England", battingStyle: "Right-hand bat", team: "Gujarat Titans" },
  "heinrich klaasen": { matches: 74, runs: 1789, average: 33.75, strikeRate: 147.28, fifties: 10, hundreds: 1, highestScore: "104", country: "South Africa", battingStyle: "Right-hand bat", team: "Sunrisers Hyderabad" },
  "nicholas pooran": { matches: 160, runs: 3247, average: 26.60, strikeRate: 146.18, fifties: 15, hundreds: 1, highestScore: "118", country: "West Indies", battingStyle: "Left-hand bat", team: "Lucknow Super Giants" },
  "pat cummins": { matches: 102, wickets: 125, average: 24.56, economy: 8.21, strikeRate: 17.95, bestBowling: "5/28", country: "Australia", bowlingStyle: "Right-arm fast", team: "Sunrisers Hyderabad" },
  "mitchell starc": { matches: 89, wickets: 115, average: 22.84, economy: 7.89, strikeRate: 17.37, bestBowling: "4/15", country: "Australia", bowlingStyle: "Left-arm fast", team: "Delhi Capitals" },
  "kagiso rabada": { matches: 120, wickets: 156, average: 21.45, economy: 8.12, strikeRate: 15.85, bestBowling: "4/21", country: "South Africa", bowlingStyle: "Right-arm fast", team: "Gujarat Titans" },
  "trent boult": { matches: 155, wickets: 189, average: 23.12, economy: 7.67, strikeRate: 18.08, bestBowling: "4/18", country: "New Zealand", bowlingStyle: "Left-arm fast", team: "Mumbai Indians" },
  "yuzvendra chahal": { matches: 180, wickets: 224, average: 22.68, economy: 7.89, strikeRate: 17.24, bestBowling: "5/40", country: "India", bowlingStyle: "Leg-break googly", team: "Punjab Kings" },
  "arshdeep singh": { matches: 65, wickets: 89, average: 22.15, economy: 8.65, strikeRate: 15.37, bestBowling: "5/32", country: "India", bowlingStyle: "Left-arm fast-medium", team: "Punjab Kings" },
  "mohammed shami": { matches: 95, wickets: 126, average: 23.45, economy: 8.12, strikeRate: 17.32, bestBowling: "4/11", country: "India", bowlingStyle: "Right-arm fast-medium", team: "Sunrisers Hyderabad" },
  "shreyas iyer": { matches: 115, runs: 3127, average: 32.57, strikeRate: 125.18, fifties: 20, hundreds: 1, highestScore: "101", country: "India", battingStyle: "Right-hand bat", team: "Punjab Kings" },
  "venkatesh iyer": { matches: 42, runs: 973, wickets: 11, average: 27.80, strikeRate: 128.42, economy: 9.12, country: "India", battingStyle: "Left-hand bat", bowlingStyle: "Right-arm medium", team: "Kolkata Knight Riders" },
  "rinku singh": { matches: 48, runs: 1197, average: 39.90, strikeRate: 149.62, fifties: 5, highestScore: "67*", country: "India", battingStyle: "Left-hand bat", team: "Kolkata Knight Riders" },
  "andre russell": { matches: 128, runs: 2465, wickets: 101, average: 26.77, strikeRate: 172.96, economy: 9.25, country: "West Indies", battingStyle: "Right-hand bat", bowlingStyle: "Right-arm fast", team: "Kolkata Knight Riders" },
  "sunil narine": { matches: 185, runs: 1420, wickets: 186, average: 17.53, strikeRate: 160.81, economy: 6.41, country: "West Indies", battingStyle: "Left-hand bat", bowlingStyle: "Off-break", team: "Kolkata Knight Riders" },
  "ruturaj gaikwad": { matches: 58, runs: 2231, average: 42.90, strikeRate: 136.24, fifties: 17, hundreds: 2, highestScore: "108*", country: "India", battingStyle: "Right-hand bat", team: "Chennai Super Kings" },
  "david miller": { matches: 130, runs: 2810, average: 35.56, strikeRate: 140.14, fifties: 16, highestScore: "94*", country: "South Africa", battingStyle: "Left-hand bat", team: "Gujarat Titans" },
  "glenn maxwell": { matches: 165, runs: 2817, wickets: 28, average: 24.27, strikeRate: 154.88, economy: 8.05, country: "Australia", battingStyle: "Right-hand bat", bowlingStyle: "Off-break", team: "Royal Challengers Bengaluru" },
  "axar patel": { matches: 95, runs: 785, wickets: 86, average: 24.18, economy: 6.92, strikeRate: 20.97, country: "India", battingStyle: "Left-hand bat", bowlingStyle: "Slow left-arm orthodox", team: "Delhi Capitals" },
  "kuldeep yadav": { matches: 75, wickets: 92, average: 23.45, economy: 8.12, strikeRate: 17.32, bestBowling: "5/25", country: "India", bowlingStyle: "Chinaman", team: "Delhi Capitals" },
  "varun chakravarthy": { matches: 52, wickets: 65, average: 23.12, economy: 7.15, strikeRate: 19.38, bestBowling: "5/17", country: "India", bowlingStyle: "Off-break", team: "Kolkata Knight Riders" },
  "ravi bishnoi": { matches: 55, wickets: 62, average: 24.68, economy: 7.45, strikeRate: 19.87, bestBowling: "4/16", country: "India", bowlingStyle: "Leg-break googly", team: "Lucknow Super Giants" },
  "josh hazlewood": { matches: 78, wickets: 95, average: 24.12, economy: 7.89, strikeRate: 18.34, bestBowling: "4/25", country: "Australia", bowlingStyle: "Right-arm fast", team: "Royal Challengers Bengaluru" },
  "jofra archer": { matches: 42, wickets: 58, average: 21.45, economy: 7.12, strikeRate: 18.06, bestBowling: "4/18", country: "England", bowlingStyle: "Right-arm fast", team: "Rajasthan Royals" },
  "travis head": { matches: 55, runs: 1456, average: 32.35, strikeRate: 152.45, fifties: 8, hundreds: 1, highestScore: "102", country: "Australia", battingStyle: "Left-hand bat", team: "Sunrisers Hyderabad" },
  "abhishek sharma": { matches: 28, runs: 804, average: 30.92, strikeRate: 170.55, fifties: 5, hundreds: 1, highestScore: "106", country: "India", battingStyle: "Left-hand bat", team: "Sunrisers Hyderabad" },
  "phil salt": { matches: 85, runs: 2145, average: 29.37, strikeRate: 158.76, fifties: 12, hundreds: 2, highestScore: "109", country: "England", battingStyle: "Right-hand bat", team: "Royal Challengers Bengaluru" },
  "ishan kishan": { matches: 95, runs: 2644, average: 28.74, strikeRate: 136.29, fifties: 15, hundreds: 1, highestScore: "110", country: "India", battingStyle: "Left-hand bat", team: "Sunrisers Hyderabad" },
  "tilak varma": { matches: 32, runs: 963, average: 37.03, strikeRate: 144.81, fifties: 7, highestScore: "84*", country: "India", battingStyle: "Left-hand bat", team: "Mumbai Indians" },
  "riyan parag": { matches: 58, runs: 891, average: 24.75, strikeRate: 136.18, fifties: 3, highestScore: "77*", country: "India", battingStyle: "Right-hand bat", bowlingStyle: "Right-arm leg-break", team: "Rajasthan Royals" },
  "shivam dube": { matches: 72, runs: 1245, wickets: 12, average: 27.67, strikeRate: 138.77, economy: 9.45, country: "India", battingStyle: "Left-hand bat", bowlingStyle: "Right-arm medium", team: "Chennai Super Kings" },
  "rajat patidar": { matches: 24, runs: 678, average: 33.90, strikeRate: 153.73, fifties: 4, hundreds: 1, highestScore: "112*", country: "India", battingStyle: "Right-hand bat", team: "Royal Challengers Bengaluru" },
  "mayank yadav": { matches: 8, wickets: 14, average: 14.21, economy: 7.12, strikeRate: 11.97, bestBowling: "3/14", country: "India", bowlingStyle: "Right-arm fast", team: "Lucknow Super Giants" },
  "matheesha pathirana": { matches: 18, wickets: 28, average: 20.89, economy: 8.12, strikeRate: 15.42, bestBowling: "4/28", country: "Sri Lanka", bowlingStyle: "Right-arm fast", team: "Chennai Super Kings" },
  "nitish kumar reddy": { matches: 12, runs: 303, wickets: 5, average: 30.30, strikeRate: 142.45, economy: 9.78, country: "India", battingStyle: "Right-hand bat", bowlingStyle: "Right-arm medium", team: "Sunrisers Hyderabad" },
  "dhruv jurel": { matches: 10, runs: 189, average: 31.50, strikeRate: 145.38, fifties: 1, highestScore: "52*", country: "India", battingStyle: "Right-hand bat", team: "Rajasthan Royals" },
}

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
    highestScore?: string
    bestBowling?: string
    fifties?: number
    hundreds?: number
  }
  // API data
  country?: string
  battingStyle?: string
  bowlingStyle?: string
  bio?: string
  imageUrl?: string
  team?: string
}

export default function PlayerDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [player, setPlayer] = useState<PlayerDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingApiInfo, setLoadingApiInfo] = useState(false)

  // Helper function to normalize player name for lookup
  const normalizePlayerName = (name: string): string => {
    return name.toLowerCase().trim().replace(/\s+/g, ' ')
  }

  // Find player stats with fuzzy matching
  const findPlayerStats = (name: string) => {
    const normalizedName = normalizePlayerName(name)
    
    // Direct match first
    if (PLAYER_STATS_DB[normalizedName]) {
      return PLAYER_STATS_DB[normalizedName]
    }
    
    // Try to find partial match
    const keys = Object.keys(PLAYER_STATS_DB)
    for (const key of keys) {
      if (normalizedName.includes(key) || key.includes(normalizedName)) {
        return PLAYER_STATS_DB[key]
      }
    }
    
    // Try matching by first and last name
    const nameParts = normalizedName.split(' ')
    if (nameParts.length >= 2) {
      for (const key of keys) {
        const keyParts = key.split(' ')
        if (keyParts.some(kp => nameParts.includes(kp)) && keyParts.length > 1) {
          // Check if at least first name or last name matches
          if (nameParts[0] === keyParts[0] || nameParts[nameParts.length - 1] === keyParts[keyParts.length - 1]) {
            return PLAYER_STATS_DB[key]
          }
        }
      }
    }
    
    return null
  }

  useEffect(() => {
    // Get player from sessionStorage
    const storedPlayer = sessionStorage.getItem('currentPlayer')
    if (storedPlayer) {
      try {
        const playerData = JSON.parse(storedPlayer)
        
        // Look up stats from our database with fuzzy matching
        const dbStats = findPlayerStats(playerData.name)
        
        console.log('Looking up stats for:', playerData.name, 'Found:', !!dbStats)
        
        if (dbStats) {
          // Merge database stats with player data
          setPlayer({
            ...playerData,
            stats: {
              matches: dbStats.matches,
              runs: dbStats.runs,
              wickets: dbStats.wickets,
              average: dbStats.average,
              strikeRate: dbStats.strikeRate,
              economy: dbStats.economy,
              highestScore: dbStats.highestScore,
              bestBowling: dbStats.bestBowling,
              fifties: dbStats.fifties,
              hundreds: dbStats.hundreds,
            },
            country: dbStats.country,
            battingStyle: dbStats.battingStyle,
            bowlingStyle: dbStats.bowlingStyle,
            team: dbStats.team,
          })
        } else {
          // No stats found, use basic player data
          setPlayer(playerData)
        }
        
        setLoading(false)
        
        // Try to fetch additional API info (images, bio)
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
            
            // Extract T20 stats from API response
            let apiStats: any = {}
            
            // Parse batting stats for T20
            if (detailsData.bat) {
              const t20Stats = detailsData.bat.find((b: any) => b.matchType === 't20' || b.matchType === 'T20I' || b.matchType === 't20i')
              if (t20Stats) {
                apiStats.runs = parseInt(t20Stats.runs) || undefined
                apiStats.matches = parseInt(t20Stats.matches) || undefined
                apiStats.average = parseFloat(t20Stats.avg) || undefined
                apiStats.strikeRate = parseFloat(t20Stats.sr) || undefined
                apiStats.fifties = parseInt(t20Stats.fifties) || undefined
                apiStats.hundreds = parseInt(t20Stats.hundreds) || undefined
                apiStats.highestScore = t20Stats.hs || undefined
              }
            }
            
            // Parse bowling stats for T20
            if (detailsData.bowl) {
              const t20BowlStats = detailsData.bowl.find((b: any) => b.matchType === 't20' || b.matchType === 'T20I' || b.matchType === 't20i')
              if (t20BowlStats) {
                apiStats.wickets = parseInt(t20BowlStats.wickets) || undefined
                apiStats.economy = parseFloat(t20BowlStats.economy) || undefined
                apiStats.bestBowling = t20BowlStats.bbm || t20BowlStats.bbi || undefined
                if (!apiStats.matches) {
                  apiStats.matches = parseInt(t20BowlStats.matches) || undefined
                }
              }
            }
            
            setPlayer(prev => prev ? {
              ...prev,
              country: detailsData.intlTeam || prev.country || "India",
              battingStyle: detailsData.bat ? (typeof detailsData.bat === 'string' ? detailsData.bat : detailsData.batStyle) : prev.battingStyle,
              bowlingStyle: detailsData.bowl ? (typeof detailsData.bowl === 'string' ? detailsData.bowl : detailsData.bowlStyle) : prev.bowlingStyle,
              bio: detailsData.bio || "",
              imageUrl: detailsData.faceImageId 
                ? `https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_160,q_50/lsci/${detailsData.faceImageId}`
                : prev.imageUrl,
              // Merge API stats with existing stats, preferring API data
              stats: {
                ...prev.stats,
                ...apiStats,
              }
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

  // Get the back URL from query param or sessionStorage
  const handleBack = () => {
    // Check URL query param first (for new tab scenario)
    const urlParams = new URLSearchParams(window.location.search)
    const fromUrl = urlParams.get('from')
    if (fromUrl) {
      router.push(decodeURIComponent(fromUrl))
      return
    }
    // Fallback to sessionStorage
    const backUrl = sessionStorage.getItem('playerStatsBackUrl')
    if (backUrl) {
      sessionStorage.removeItem('playerStatsBackUrl')
      router.push(backUrl)
    } else {
      router.back()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-6 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            onClick={handleBack}
            variant="outline"
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Player Stats</h1>
          <p className="text-gray-400">Real-time statistics from Cricbuzz</p>
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

                  {player.stats.fifties !== undefined && (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.7 }}
                      className="bg-gradient-to-br from-cyan-600/20 to-cyan-800/20 border border-cyan-500/30 rounded-lg p-4 text-center"
                    >
                      <Award className="w-5 h-5 text-cyan-400 mx-auto mb-2" />
                      <p className="text-gray-400 text-xs mb-1">50s</p>
                      <p className="text-white text-2xl font-black">{player.stats.fifties}</p>
                    </motion.div>
                  )}

                  {player.stats.hundreds !== undefined && player.stats.hundreds > 0 && (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.8 }}
                      className="bg-gradient-to-br from-pink-600/20 to-pink-800/20 border border-pink-500/30 rounded-lg p-4 text-center"
                    >
                      <Star className="w-5 h-5 text-pink-400 mx-auto mb-2" />
                      <p className="text-gray-400 text-xs mb-1">100s</p>
                      <p className="text-white text-2xl font-black">{player.stats.hundreds}</p>
                    </motion.div>
                  )}

                  {player.stats.highestScore && (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.9 }}
                      className="bg-gradient-to-br from-emerald-600/20 to-emerald-800/20 border border-emerald-500/30 rounded-lg p-4 text-center"
                    >
                      <TrendingUp className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
                      <p className="text-gray-400 text-xs mb-1">Highest</p>
                      <p className="text-white text-2xl font-black">{player.stats.highestScore}</p>
                    </motion.div>
                  )}

                  {player.stats.bestBowling && (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 1.0 }}
                      className="bg-gradient-to-br from-rose-600/20 to-rose-800/20 border border-rose-500/30 rounded-lg p-4 text-center"
                    >
                      <Zap className="w-5 h-5 text-rose-400 mx-auto mb-2" />
                      <p className="text-gray-400 text-xs mb-1">Best Bowling</p>
                      <p className="text-white text-2xl font-black">{player.stats.bestBowling}</p>
                    </motion.div>
                  )}
                </div>
              </div>
            )}

            {/* No Stats Message */}
            {!player.stats && (
              <div className="bg-slate-900/50 rounded-lg p-6 text-center">
                <Activity className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No detailed statistics available for this player.</p>
                <p className="text-gray-500 text-sm mt-1">Stats will be shown when available from API.</p>
              </div>
            )}

            {/* Team Info */}
            {player.team && (
              <div className="mt-4 bg-slate-900/50 rounded-lg p-4">
                <p className="text-gray-400 text-sm">IPL 2025 Team</p>
                <p className="text-xl font-bold text-orange-400">{player.team}</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
