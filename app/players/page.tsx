"use client"

export const dynamic = 'force-dynamic'

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Trophy, ArrowLeft, Search, Star, ChevronDown, ChevronUp, ExternalLink } from "lucide-react"
import Link from "next/link"

// IPL 2025 MEGA AUCTION - Base Prices (in Crores)
// Base prices are the starting bid amounts players enter auction with
const IPL_PLAYERS = [
  // MARQUEE SET (Base Price: ₹2 Cr)
  { name: "Rishabh Pant", role: "WK", price: 2, isMarquee: true },
  { name: "Shreyas Iyer", role: "BAT", price: 2, isMarquee: true },
  { name: "Arshdeep Singh", role: "BOWL", price: 2, isMarquee: true },
  { name: "Yuzvendra Chahal", role: "BOWL", price: 2, isMarquee: true },
  { name: "Jos Buttler", role: "WK", price: 2, isMarquee: true },
  { name: "Mohammed Shami", role: "BOWL", price: 2, isMarquee: true },
  { name: "KL Rahul", role: "WK", price: 2, isMarquee: true },
  { name: "Mitchell Starc", role: "BOWL", price: 2, isMarquee: true },
  { name: "Kagiso Rabada", role: "BOWL", price: 2, isMarquee: true },
  { name: "David Miller", role: "BAT", price: 2, isMarquee: true },
  { name: "Liam Livingstone", role: "AR", price: 2, isMarquee: true },
  { name: "Glenn Maxwell", role: "AR", price: 2, isMarquee: true },
  { name: "Ishan Kishan", role: "WK", price: 2, isMarquee: true },
  { name: "Mohammed Siraj", role: "BOWL", price: 2, isMarquee: true },

  // NOTE: Retained players are usually NOT in auction, but if listed here for reference, 
  // they should have valid dummy base prices or be marked clearly. 
  // User asked for "real auction" feel, so we list potential auction stars.

  // High Value Batters
  { name: "Venkatesh Iyer", role: "AR", price: 2 },
  { name: "David Warner", role: "BAT", price: 2 },
  { name: "Faf du Plessis", role: "BAT", price: 2 },
  { name: "Harry Brook", role: "BAT", price: 2 },
  { name: "Travis Head", role: "BAT", price: 2 },
  { name: "Devon Conway", role: "BAT", price: 2 },
  { name: "Aiden Markram", role: "BAT", price: 2 },

  // High Value Bowlers
  { name: "Trent Boult", role: "BOWL", price: 2 },
  { name: "Josh Hazlewood", role: "BOWL", price: 2 },
  { name: "Jofra Archer", role: "BOWL", price: 2 },
  { name: "Bhuvneshwar Kumar", role: "BOWL", price: 2 },
  { name: "Prasidh Krishna", role: "BOWL", price: 2 },
  { name: "Anrich Nortje", role: "BOWL", price: 2 },
  { name: "Lockie Ferguson", role: "BOWL", price: 2 },
  { name: "Harshal Patel", role: "BOWL", price: 2 },
  { name: "Rahul Chahar", role: "BOWL", price: 1.5 }, // Dropped slightly

  // High Value All-rounders
  { name: "Marcus Stoinis", role: "AR", price: 2 },
  { name: "Sam Curran", role: "AR", price: 2 },
  { name: "Wanindu Hasaranga", role: "AR", price: 2 },
  { name: "Marco Jansen", role: "AR", price: 2 },
  { name: "Washington Sundar", role: "AR", price: 1.5 },

  // Mid Range (1 Cr - 1.5 Cr)
  { name: "Quinton de Kock", role: "WK", price: 2 }, // Vet
  { name: "Rinku Singh", role: "BAT", price: 1.5 }, // Simulating if he was in auction
  { name: "Shivam Dube", role: "AR", price: 1.5 },
  { name: "Nitish Rana", role: "BAT", price: 1.5 },
  { name: "Rajat Patidar", role: "BAT", price: 1.5 },
  { name: "Jitesh Sharma", role: "WK", price: 1.5 },
  { name: "Ravi Bishnoi", role: "BOWL", price: 1.5 }, // Simulating
  { name: "T Natarajan", role: "BOWL", price: 1.5 },
  { name: "Will Jacks", role: "AR", price: 1.5 },
  { name: "Rachin Ravindra", role: "AR", price: 1.5 },

  // 1 Cr
  { name: "Tilak Varma", role: "BAT", price: 1.25 },
  { name: "Rahul Tewatia", role: "AR", price: 1 },
  { name: "Nehal Wadhera", role: "BAT", price: 1 },
  { name: "Tim David", role: "AR", price: 1.5 }, // High impact
  { name: "Abdul Samad", role: "BAT", price: 0.75 },

  // Budget / Uncapped Stars (0.3 - 0.75)
  { name: "Sameer Rizvi", role: "BAT", price: 0.4 },
  { name: "Shahrukh Khan", role: "BAT", price: 0.5 },
  { name: "Abishek Porel", role: "WK", price: 0.5 },
  { name: "Ramandeep Singh", role: "AR", price: 0.5 },
  { name: "Akash Madhwal", role: "BOWL", price: 0.4 },
  { name: "Yash Dayal", role: "BOWL", price: 0.75 },
  { name: "Mohit Sharma", role: "BOWL", price: 0.75 },
  { name: "Mayank Yadav", role: "BOWL", price: 1.5 }, // Special talent
]

type Category = 'all' | 'marquee' | 'bat' | 'bowl' | 'ar' | 'wk'

function PlayersListContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<Category>('all')
  const [showAll, setShowAll] = useState(false)

  // Get back URL from query params or default to /rooms
  const backUrl = searchParams.get('from') || '/rooms'

  // Navigate to player stats
  const viewPlayerStats = (player: typeof IPL_PLAYERS[0]) => {
    // Store player data in session storage for the stats page
    const playerData = {
      id: player.name.toLowerCase().replace(/\s+/g, '-'),
      name: player.name,
      role: player.role === 'BAT' ? 'Batsman' :
        player.role === 'BOWL' ? 'Bowler' :
          player.role === 'AR' ? 'All-rounder' : 'Wicket-keeper',
      basePrice: player.price,
      rating: player.isMarquee ? 90 : 75,
    }
    sessionStorage.setItem('currentPlayer', JSON.stringify(playerData))
    sessionStorage.setItem('playerStatsBackUrl', '/players?from=' + encodeURIComponent(backUrl))
    router.push(`/player/${playerData.id}`)
  }

  // Filter players
  const filteredPlayers = IPL_PLAYERS.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchQuery.toLowerCase())
    if (selectedCategory === 'all') return matchesSearch
    if (selectedCategory === 'marquee') return matchesSearch && player.isMarquee
    if (selectedCategory === 'bat') return matchesSearch && player.role === 'BAT'
    if (selectedCategory === 'bowl') return matchesSearch && player.role === 'BOWL'
    if (selectedCategory === 'ar') return matchesSearch && player.role === 'AR'
    if (selectedCategory === 'wk') return matchesSearch && player.role === 'WK'
    return matchesSearch
  })

  const displayPlayers = showAll ? filteredPlayers : filteredPlayers.slice(0, 50)

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      'BAT': 'bg-blue-500/30 text-blue-300',
      'BOWL': 'bg-red-500/30 text-red-300',
      'AR': 'bg-purple-500/30 text-purple-300',
      'WK': 'bg-green-500/30 text-green-300',
    }
    return colors[role] || 'bg-gray-500/30 text-gray-300'
  }

  const counts = {
    all: IPL_PLAYERS.length,
    marquee: IPL_PLAYERS.filter(p => p.isMarquee).length,
    bat: IPL_PLAYERS.filter(p => p.role === 'BAT').length,
    bowl: IPL_PLAYERS.filter(p => p.role === 'BOWL').length,
    ar: IPL_PLAYERS.filter(p => p.role === 'AR').length,
    wk: IPL_PLAYERS.filter(p => p.role === 'WK').length,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-2 sm:p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <Link href={backUrl}>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white px-2">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <Trophy className="w-5 h-5 text-orange-500" />
          <h1 className="text-lg font-bold text-white">IPL 2025 Players</h1>
          <Badge className="bg-orange-500/20 text-orange-400 text-xs ml-auto">
            {IPL_PLAYERS.length} players
          </Badge>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search player..."
            className="pl-8 h-9 bg-slate-800/50 border-slate-700 text-white text-sm"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex gap-1 mb-3 overflow-x-auto pb-1">
          {[
            { key: 'all', label: 'All' },
            { key: 'marquee', label: '⭐ Top' },
            { key: 'bat', label: '🏏 BAT' },
            { key: 'bowl', label: '🎯 BOWL' },
            { key: 'ar', label: '⚡ AR' },
            { key: 'wk', label: '🧤 WK' },
          ].map(({ key, label }) => (
            <Button
              key={key}
              onClick={() => setSelectedCategory(key as Category)}
              size="sm"
              variant={selectedCategory === key ? "default" : "outline"}
              className={`text-xs px-2 py-1 h-7 whitespace-nowrap ${selectedCategory === key
                ? 'bg-orange-500 text-white'
                : 'border-slate-600 text-gray-400'
                }`}
            >
              {label} ({counts[key as Category]})
            </Button>
          ))}
        </div>

        {/* Players Table */}
        <Card className="bg-slate-800/50 border-slate-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-900/50 border-b border-slate-700">
                <tr>
                  <th className="text-left text-gray-400 font-medium py-2 px-2">#</th>
                  <th className="text-left text-gray-400 font-medium py-2 px-2">Player</th>
                  <th className="text-center text-gray-400 font-medium py-2 px-2">Role</th>
                  <th className="text-right text-gray-400 font-medium py-2 px-2">Base Price</th>
                  <th className="text-center text-gray-400 font-medium py-2 px-2">Stats</th>
                </tr>
              </thead>
              <tbody>
                {displayPlayers.map((player, idx) => (
                  <tr
                    key={player.name}
                    className={`border-b border-slate-700/50 hover:bg-slate-700/30 cursor-pointer transition-colors ${player.isMarquee ? 'bg-orange-500/5' : ''}`}
                    onClick={() => viewPlayerStats(player)}
                  >
                    <td className="py-1.5 px-2 text-gray-500 text-xs">{idx + 1}</td>
                    <td className="py-1.5 px-2">
                      <div className="flex items-center gap-1">
                        {player.isMarquee && <Star className="w-3 h-3 text-yellow-400 flex-shrink-0" />}
                        <span className="text-white text-xs truncate max-w-[120px] sm:max-w-none">
                          {player.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-1.5 px-2 text-center">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${getRoleBadge(player.role)}`}>
                        {player.role}
                      </span>
                    </td>
                    <td className="py-1.5 px-2 text-right">
                      <span className={`font-semibold ${player.isMarquee ? 'text-orange-400' : 'text-green-400'}`}>
                        ₹{player.price}Cr
                      </span>
                    </td>
                    <td className="py-1.5 px-2 text-center">
                      <ExternalLink className="w-3 h-3 text-gray-400 mx-auto" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Show More Button */}
          {filteredPlayers.length > 50 && !showAll && (
            <button
              onClick={(e) => { e.stopPropagation(); setShowAll(true); }}
              className="w-full py-2 text-orange-400 text-sm font-medium hover:bg-slate-700/50 flex items-center justify-center gap-1"
            >
              <ChevronDown className="w-4 h-4" />
              Show {filteredPlayers.length - 50} more players
            </button>
          )}

          {showAll && filteredPlayers.length > 50 && (
            <button
              onClick={() => setShowAll(false)}
              className="w-full py-2 text-gray-400 text-sm font-medium hover:bg-slate-700/50 flex items-center justify-center gap-1"
            >
              <ChevronUp className="w-4 h-4" />
              Show less
            </button>
          )}
        </Card>

        {/* Footer */}
        <p className="text-center text-gray-500 text-xs mt-3">
          IPL 2025 Mega Auction Prices
        </p>
      </div>
    </div>
  )
}

export default function PlayersListPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center text-gray-400">Loading players...</div>}>
      <PlayersListContent />
    </Suspense>
  )
}
