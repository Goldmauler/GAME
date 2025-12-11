"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  Trophy, 
  Medal, 
  Star, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Target, 
  Zap,
  ChevronDown,
  ChevronUp,
  Crown,
  Award,
  Shield,
  Flame
} from "lucide-react"
import { createLeaderboard, TeamScore } from "@/lib/team-scorer"
import confetti from 'canvas-confetti'

interface Team {
  id: string
  name: string
  budget: number
  players: {
    id: string
    name: string
    role: string
    basePrice: number
    soldPrice?: number
  }[]
  maxPlayers: number
}

interface AuctionLeaderboardProps {
  teams: Team[]
  onClose?: () => void
  showAnimation?: boolean
}

const rankColors = {
  1: "from-yellow-500 via-amber-400 to-yellow-600",
  2: "from-gray-300 via-slate-200 to-gray-400", 
  3: "from-amber-600 via-orange-500 to-amber-700",
  default: "from-slate-600 via-slate-500 to-slate-700"
}

const gradeColors: Record<string, string> = {
  'S+': 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50',
  'S': 'text-yellow-500 bg-yellow-500/15 border-yellow-500/40',
  'A+': 'text-green-400 bg-green-500/20 border-green-500/50',
  'A': 'text-green-500 bg-green-500/15 border-green-500/40',
  'B+': 'text-blue-400 bg-blue-500/20 border-blue-500/50',
  'B': 'text-blue-500 bg-blue-500/15 border-blue-500/40',
  'C+': 'text-orange-400 bg-orange-500/20 border-orange-500/50',
  'C': 'text-orange-500 bg-orange-500/15 border-orange-500/40',
  'D': 'text-red-400 bg-red-500/20 border-red-500/50',
  'F': 'text-red-600 bg-red-500/25 border-red-500/60'
}

const categoryIcons: Record<string, React.ReactNode> = {
  squadBalance: <Target className="w-4 h-4" />,
  starPower: <Star className="w-4 h-4" />,
  budgetEfficiency: <DollarSign className="w-4 h-4" />,
  squadDepth: <Users className="w-4 h-4" />,
  valueForMoney: <TrendingUp className="w-4 h-4" />
}

const categoryLabels: Record<string, string> = {
  squadBalance: "Squad Balance",
  starPower: "Star Power",
  budgetEfficiency: "Budget Efficiency",
  squadDepth: "Squad Depth",
  valueForMoney: "Value for Money"
}

const categoryMaxScores: Record<string, number> = {
  squadBalance: 25,
  starPower: 25,
  budgetEfficiency: 20,
  squadDepth: 15,
  valueForMoney: 15
}

export default function AuctionLeaderboard({ teams, onClose, showAnimation = true }: AuctionLeaderboardProps) {
  const [revealedRanks, setRevealedRanks] = useState<number[]>([])
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  
  const leaderboard = useMemo(() => createLeaderboard(teams), [teams])
  
  // Dramatic reveal animation
  useEffect(() => {
    if (!showAnimation) {
      setRevealedRanks(leaderboard.map((_, i) => i))
      setShowDetails(true)
      return
    }
    
    // Reveal from last to first with delays
    const totalTeams = leaderboard.length
    leaderboard.forEach((_, index) => {
      const delay = (totalTeams - index) * 600 // Last place first
      setTimeout(() => {
        setRevealedRanks(prev => [...prev, totalTeams - 1 - index])
        
        // Confetti for winner reveal
        if (index === totalTeams - 1 && typeof window !== 'undefined') {
          setTimeout(() => {
            confetti({
              particleCount: 150,
              spread: 70,
              origin: { y: 0.3 }
            })
          }, 300)
        }
      }, delay + 500)
    })
    
    // Show details after all reveals
    setTimeout(() => {
      setShowDetails(true)
    }, (totalTeams + 1) * 600)
  }, [leaderboard, showAnimation])
  
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-8 h-8 text-yellow-400" />
      case 2: return <Medal className="w-7 h-7 text-gray-300" />
      case 3: return <Award className="w-7 h-7 text-amber-600" />
      default: return <Shield className="w-6 h-6 text-slate-400" />
    }
  }
  
  const getPositionLabel = (rank: number) => {
    if (rank === 1) return "CHAMPION"
    if (rank === 2) return "RUNNER-UP"
    if (rank === 3) return "THIRD PLACE"
    return `#${rank}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-8 px-4">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-12 h-12 text-yellow-500" />
            <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500">
              AUCTION LEADERBOARD
            </h1>
            <Trophy className="w-12 h-12 text-yellow-500" />
          </div>
          <p className="text-slate-400 text-lg">Team Rankings Based on Squad Evaluation</p>
        </motion.div>

        {/* Leaderboard */}
        <div className="space-y-4">
          <AnimatePresence>
            {leaderboard.map((teamScore, index) => {
              const isRevealed = revealedRanks.includes(index)
              const isExpanded = expandedTeam === teamScore.teamId
              const isWinner = teamScore.rank === 1
              
              return (
                <motion.div
                  key={teamScore.teamId}
                  initial={{ opacity: 0, scale: 0.8, y: 50 }}
                  animate={isRevealed ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.8, y: 50 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 200, 
                    damping: 20,
                    delay: isWinner ? 0.2 : 0 
                  }}
                >
                  <Card 
                    className={`
                      relative overflow-hidden border-2 transition-all duration-300
                      ${isWinner 
                        ? 'border-yellow-500/50 bg-gradient-to-r from-yellow-500/10 via-slate-900 to-yellow-500/10 shadow-2xl shadow-yellow-500/20' 
                        : teamScore.rank === 2 
                          ? 'border-slate-400/30 bg-slate-900/80'
                          : teamScore.rank === 3
                            ? 'border-amber-600/30 bg-slate-900/80'
                            : 'border-slate-700/50 bg-slate-900/60'
                      }
                      ${isExpanded ? 'ring-2 ring-orange-500/50' : ''}
                    `}
                  >
                    {/* Winner glow effect */}
                    {isWinner && (
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 via-orange-500/5 to-yellow-500/5 animate-pulse" />
                    )}
                    
                    {/* Main Row */}
                    <div 
                      className="relative p-6 cursor-pointer"
                      onClick={() => setExpandedTeam(isExpanded ? null : teamScore.teamId)}
                    >
                      <div className="flex items-center gap-6">
                        {/* Rank Badge */}
                        <div className={`
                          w-20 h-20 rounded-2xl flex flex-col items-center justify-center
                          bg-gradient-to-br ${rankColors[teamScore.rank as keyof typeof rankColors] || rankColors.default}
                          shadow-lg
                        `}>
                          {getRankIcon(teamScore.rank)}
                          <span className="text-xs font-bold text-slate-900 mt-1">
                            {getPositionLabel(teamScore.rank)}
                          </span>
                        </div>
                        
                        {/* Team Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h2 className={`text-2xl font-black ${isWinner ? 'text-yellow-400' : 'text-white'}`}>
                              {teamScore.teamName}
                            </h2>
                            <span className={`px-3 py-1 rounded-full text-sm font-bold border ${gradeColors[teamScore.grade] || gradeColors['C']}`}>
                              {teamScore.grade}
                            </span>
                            {isWinner && <Flame className="w-6 h-6 text-orange-500 animate-pulse" />}
                          </div>
                          
                          <div className="flex items-center gap-6 text-sm text-slate-400">
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {teamScore.details.squadSize} Players
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              ₹{teamScore.details.totalSpent.toFixed(1)}Cr Spent
                            </span>
                            <span className="flex items-center gap-1">
                              <TrendingUp className="w-4 h-4" />
                              Avg: ₹{teamScore.details.avgPlayerPrice.toFixed(1)}Cr
                            </span>
                          </div>
                        </div>
                        
                        {/* Score */}
                        <div className="text-right">
                          <div className={`text-4xl font-black ${isWinner ? 'text-yellow-400' : 'text-orange-500'}`}>
                            {teamScore.totalScore.toFixed(1)}
                          </div>
                          <div className="text-slate-500 text-sm">/ 100 points</div>
                        </div>
                        
                        {/* Expand Icon */}
                        <div className="ml-2">
                          {isExpanded ? (
                            <ChevronUp className="w-6 h-6 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-6 h-6 text-slate-400" />
                          )}
                        </div>
                      </div>
                      
                      {/* Quick Stats Bar */}
                      <div className="mt-4 grid grid-cols-5 gap-2">
                        {Object.entries(teamScore.breakdown).map(([key, value]) => (
                          <div key={key} className="bg-slate-800/50 rounded-lg p-2">
                            <div className="flex items-center gap-1 mb-1">
                              {categoryIcons[key]}
                              <span className="text-xs text-slate-400 truncate">{categoryLabels[key]}</span>
                            </div>
                            <Progress 
                              value={(value / categoryMaxScores[key]) * 100} 
                              className="h-2 bg-slate-700"
                            />
                            <div className="text-xs text-right mt-1 text-slate-300">
                              {value}/{categoryMaxScores[key]}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Expanded Details */}
                    <AnimatePresence>
                      {isExpanded && showDetails && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="border-t border-slate-700"
                        >
                          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Role Breakdown */}
                            <div className="bg-slate-800/30 rounded-xl p-4">
                              <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                <Users className="w-5 h-5 text-blue-400" />
                                Squad Composition
                              </h3>
                              <div className="space-y-2">
                                {Object.entries(teamScore.details.roleBreakdown).map(([role, count]) => (
                                  <div key={role} className="flex items-center justify-between">
                                    <span className="text-slate-300">{role}</span>
                                    <span className={`font-bold ${count >= 4 ? 'text-green-400' : count >= 2 ? 'text-yellow-400' : 'text-red-400'}`}>
                                      {count}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            {/* Top Players */}
                            <div className="bg-slate-800/30 rounded-xl p-4">
                              <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                <Star className="w-5 h-5 text-yellow-400" />
                                Star Players
                              </h3>
                              <div className="space-y-2">
                                {teamScore.details.topPlayers.length > 0 ? (
                                  teamScore.details.topPlayers.map((player, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                      <span className="text-yellow-500">★</span>
                                      <span className="text-slate-300">{player}</span>
                                    </div>
                                  ))
                                ) : (
                                  <p className="text-slate-500 italic">No marquee signings</p>
                                )}
                              </div>
                            </div>
                            
                            {/* Strengths & Weaknesses */}
                            <div className="bg-slate-800/30 rounded-xl p-4">
                              <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                <Zap className="w-5 h-5 text-orange-400" />
                                Analysis
                              </h3>
                              <div className="space-y-3">
                                <div>
                                  <p className="text-green-400 text-sm font-semibold mb-1">Strengths:</p>
                                  <ul className="text-sm text-slate-300 space-y-1">
                                    {teamScore.details.strengths.length > 0 ? (
                                      teamScore.details.strengths.map((s, i) => (
                                        <li key={i} className="flex items-center gap-1">
                                          <span className="text-green-500">+</span> {s}
                                        </li>
                                      ))
                                    ) : (
                                      <li className="text-slate-500 italic">None identified</li>
                                    )}
                                  </ul>
                                </div>
                                <div>
                                  <p className="text-red-400 text-sm font-semibold mb-1">Weaknesses:</p>
                                  <ul className="text-sm text-slate-300 space-y-1">
                                    {teamScore.details.weaknesses.length > 0 ? (
                                      teamScore.details.weaknesses.map((w, i) => (
                                        <li key={i} className="flex items-center gap-1">
                                          <span className="text-red-500">−</span> {w}
                                        </li>
                                      ))
                                    ) : (
                                      <li className="text-slate-500 italic">None identified</li>
                                    )}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
        
        {/* Winner Celebration */}
        {showDetails && leaderboard.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-10 text-center"
          >
            <Card className="inline-block bg-gradient-to-r from-yellow-500/20 via-orange-500/20 to-red-500/20 border-yellow-500/50 p-8">
              <Crown className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
              <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-2">
                AUCTION CHAMPION
              </h2>
              <p className="text-4xl font-black text-white mb-2">{leaderboard[0]?.teamName}</p>
              <p className="text-xl text-yellow-400">
                Score: {leaderboard[0]?.totalScore.toFixed(1)}/100 • Grade: {leaderboard[0]?.grade}
              </p>
            </Card>
          </motion.div>
        )}
        
        {/* Close Button */}
        {onClose && showDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-8 text-center"
          >
            <Button
              onClick={onClose}
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 text-lg font-bold"
            >
              Close Leaderboard
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
