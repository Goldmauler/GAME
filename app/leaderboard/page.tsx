'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, Medal, Award, TrendingUp, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'

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

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboard()
  }, [])

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
      <div className="container mx-auto p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading leaderboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <Trophy className="h-10 w-10 text-yellow-500" />
          Global Leaderboard
        </h1>
        <p className="text-muted-foreground">Top performers across all auctions</p>
      </div>

      {leaderboard.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Results Yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Complete an auction to appear on the leaderboard!
            </p>
            <Button onClick={() => window.location.href = '/'}>
              Start Auction
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {leaderboard.map((entry, index) => (
            <Card 
              key={entry.id} 
              className={`transition-all hover:shadow-lg ${
                entry.rank === 1 ? 'border-yellow-500 border-2' : 
                entry.rank === 2 ? 'border-gray-400 border-2' : 
                entry.rank === 3 ? 'border-amber-700 border-2' : ''
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12">
                      {getRankIcon(entry.rank)}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{entry.userName}</h3>
                      <p className="text-sm text-muted-foreground">{entry.teamName}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          Room: {entry.roomCode}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
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
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>Spent: ₹{entry.totalSpent}Cr</div>
                      <div>Remaining: ₹{entry.budgetLeft}Cr</div>
                    </div>
                    <div className="text-xs text-muted-foreground">
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
  )
}
