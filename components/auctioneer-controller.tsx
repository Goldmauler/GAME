"use client"

import { useEffect, useState } from "react"
import {
  type BiddingStrategy,
  calculateNextBid,
  generateTeamBiddingProfile,
  getNextBidder,
  type TeamBiddingProfile,
} from "@/lib/auctioneer-logic"

interface AuctioneerProps {
  teams: any[]
  currentPlayer: any
  currentPrice: number
  highestBidder: string
  timeLeft: number
  onBidPlaced: (teamId: string, amount: number) => void
}

/**
 * AuctioneerController - Manages AI bidding decisions and team strategies
 * This component sits alongside the auction arena and provides intelligent bidding
 */
export default function AuctioneerController({
  teams,
  currentPlayer,
  currentPrice,
  highestBidder,
  timeLeft,
  onBidPlaced,
}: AuctioneerProps) {
  const [teamProfiles, setTeamProfiles] = useState<Map<string, TeamBiddingProfile>>(new Map())
  const [nextBidderSuggestion, setNextBidderSuggestion] = useState<string | null>(null)

  // Initialize bidding profiles for all teams
  useEffect(() => {
    const profiles = new Map<string, TeamBiddingProfile>()
    teams.forEach((team) => {
      const profile = generateTeamBiddingProfile(team, [currentPlayer])
      profiles.set(team.id, profile)
    })
    setTeamProfiles(profiles)
  }, [teams, currentPlayer])

  // Suggest next bidder based on strategy
  useEffect(() => {
    if (!currentPlayer || teamProfiles.size === 0) return

    const context = {
      currentPrice,
      basePrice: currentPlayer.basePrice,
      highestBidder,
      remainingTime: timeLeft,
      player: currentPlayer,
    }

    const nextBidder = getNextBidder(teams, context, teamProfiles)
    setNextBidderSuggestion(nextBidder)

    // Auto-execute bid if auctioneer logic determines a team should bid
    if (nextBidder && timeLeft > 3 && Math.random() > 0.6) {
      const bidderTeam = teams.find((t) => t.id === nextBidder)
      const profile = teamProfiles.get(nextBidder)

      if (bidderTeam && profile) {
        const nextBidAmount = calculateNextBid(currentPrice, bidderTeam, profile, context)
        if (nextBidAmount > currentPrice) {
          onBidPlaced(nextBidder, nextBidAmount)
        }
      }
    }
  }, [currentPrice, currentPlayer, timeLeft, teams, teamProfiles, highestBidder])

  // Get active strategies
  const activeStrategies = Array.from(teamProfiles.values()).reduce(
    (acc, profile) => {
      acc[profile.strategy] = (acc[profile.strategy] || 0) + 1
      return acc
    },
    {} as Record<BiddingStrategy, number>,
  )

  return (
    <div className="hidden">
      {/* This component operates silently in the background */}
      {/* Data can be exposed for debugging or analytics */}
    </div>
  )
}
