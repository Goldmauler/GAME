'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, Medal, Award, TrendingUp, Users, ArrowLeft, RefreshCw, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import AuctionLeaderboard from '@/components/auction-leaderboard'

interface LeaderboardEntry {
  id: string
  roomCode: string
  userName: string
  teamName: string
  finalRating: number
  totalSpent: number
  budgetLeft: number
  playersCount: number
  rank: number
  createdAt: string
}

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

export default function LeaderboardPage() {
  const router = useRouter()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [sessionTeams, setSessionTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'session' | 'global'>('session')

  useEffect(() => {
    fetchLeaderboard()
    loadSessionTeams()
  }, [])

  const loadSessionTeams = () => {
    // Try to get teams from sessionStorage
    const storedTeams = sessionStorage.getItem('auctionTeams')
    if (storedTeams) {
      try {
        const allTeams = JSON.parse(storedTeams)
        setSessionTeams(allTeams)
        return
      } catch (e) {
        console.error('Error parsing auctionTeams:', e)
      }
    }
    
    // Fallback: try to get from auctionState
    const storedState = sessionStorage.getItem('auctionState')
    if (storedState) {
      try {
        const state = JSON.parse(storedState)
        if (state.teams && Array.isArray(state.teams)) {
          setSessionTeams(state.teams)
        }
      } catch (e) {
        console.error('Error parsing auctionState:', e)
      }
    }
  }

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/leaderboard')
      const data = await response.json()
      setLeaderboard(data.leaderboard || [])
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />
      case 3:
        return <Award className="h-6 w-6 text-amber-700" />
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading leaderboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-sm border-b border-slate-800 py-4">
        <div className="max-w-[1600px] mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <Button
              onClick={() => router.push('/')}
              variant="outline"
              className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            <div className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-500" />
              <h1 className="text-2xl font-bold text-white">Leaderboard</h1>
            </div>
            <Button
              onClick={() => {
                fetchLeaderboard()
                loadSessionTeams()
              }}
              variant="ghost"
              className="text-slate-400 hover:text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-2 justify-center">
            <Button
              onClick={() => setActiveTab('session')}
              variant={activeTab === 'session' ? 'default' : 'outline'}
              className={activeTab === 'session' 
                ? 'bg-orange-500 hover:bg-orange-600' 
                : 'border-slate-600 text-slate-400 hover:bg-slate-800'
              }
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Current Session
            </Button>
            <Button
              onClick={() => setActiveTab('global')}
              variant={activeTab === 'global' ? 'default' : 'outline'}
              className={activeTab === 'global' 
                ? 'bg-orange-500 hover:bg-orange-600' 
                : 'border-slate-600 text-slate-400 hover:bg-slate-800'
              }
            >
              <Trophy className="w-4 h-4 mr-2" />
              Global Rankings
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'session' ? (
        sessionTeams.length > 0 ? (
          <AuctionLeaderboard teams={sessionTeams} showAnimation={false} />
        ) : (
          <div className="flex flex-col items-center justify-center py-24">
            <Trophy className="h-20 w-20 text-slate-700 mb-6" />
            <h3 className="text-2xl font-bold text-white mb-2">No Session Data</h3>
            <p className="text-slate-400 text-center mb-6 max-w-md">
              Complete an auction to see your team rankings here!
            </p>
            <Button 
              onClick={() => router.push('/')}
              className="bg-orange-500 hover:bg-orange-600"
            >
              Start an Auction
            </Button>
          </div>
        )
      ) : (
        <div className="max-w-[1200px] mx-auto px-4 py-8">
          <div className="mb-6 text-center">
            <h2 className="text-3xl font-bold text-white mb-2">Global Rankings</h2>
            <p className="text-slate-400">Top performers across all auctions</p>
          </div>

          {leaderboard.length === 0 ? (
            <Card className="bg-slate-900/50 border-slate-700">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-16 w-16 text-slate-600 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Results Yet</h3>
                <p className="text-slate-400 text-center mb-4">
                  Complete an auction to appear on the leaderboard!
                </p>
                <Button 
                  onClick={() => router.push('/')}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  Start Auction
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {leaderboard.map((entry) => (
                <Card 
                  key={entry.id} 
                  className={`bg-slate-900/50 border-slate-700 transition-all hover:shadow-lg ${
                    entry.rank === 1 ? 'border-yellow-500/50 border-2 shadow-yellow-500/10' : 
                    entry.rank === 2 ? 'border-slate-400/50 border-2' : 
                    entry.rank === 3 ? 'border-amber-600/50 border-2' : ''
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-12">
                          {getRankIcon(entry.rank)}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">{entry.userName}</h3>
                          <p className="text-sm text-slate-400">{entry.teamName}</p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
                              Room: {entry.roomCode}
                            </Badge>
                            <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
                              {entry.playersCount} players
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right space-y-2">
                        <div className="flex items-center gap-2 justify-end">
                          <TrendingUp className="h-5 w-5 text-green-500" />
                          <span className="text-2xl font-bold text-green-500">
                            {entry.finalRating.toFixed(1)}
                          </span>
                        </div>
                        <div className="text-sm text-slate-400 space-y-1">
                          <div>Spent: ₹{entry.totalSpent}Cr</div>
                          <div>Remaining: ₹{entry.budgetLeft}Cr</div>
                        </div>
                        <div className="text-xs text-slate-500">
                          {new Date(entry.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
