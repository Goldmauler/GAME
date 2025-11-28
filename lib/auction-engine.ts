// IPL Auction Engine - Core Logic with Official IPL Rules
import { prisma } from './prisma'

// IPL Auction Configuration
export const AUCTION_CONFIG = {
  TOTAL_BUDGET: 10000, // ₹100 crore in lakhs
  MIN_SQUAD_SIZE: 18,
  MAX_SQUAD_SIZE: 25,
  MIN_BATSMEN: 5,
  MIN_BOWLERS: 5,
  MIN_ALL_ROUNDERS: 2,
  MIN_WICKET_KEEPERS: 2,
  BID_INCREMENT: 10, // ₹10 lakhs
  BID_TIMER_SECONDS: 30,
  GOING_COUNT_MAX: 3, // "Going once, going twice, sold"
  RTM_CARDS_PER_TEAM: 2,
  MAX_OVERSEAS_PLAYERS: 8,
  MAX_OVERSEAS_IN_XI: 4,
}

export interface Team {
  id: string
  name: string
  userName: string
  userId: string
  budget: number
  players: TeamPlayer[]
  rtmCardsLeft: number
  isActive: boolean
}

export interface TeamPlayer {
  playerId: string
  playerName: string
  role: string
  price: number
  isOverseas: boolean
}

export interface AuctionState {
  roomCode: string
  status: 'lobby' | 'countdown' | 'active' | 'paused' | 'completed'
  teams: Team[]
  currentPlayerId: string | null
  currentBid: number | null
  currentBidderId: string | null
  bidCount: number
  playerQueue: string[] // Player IDs in auction order
  soldPlayers: string[]
  unsoldPlayers: string[]
  turnTimerStart: Date | null
  hostId: string
}

export interface BidResult {
  success: boolean
  message: string
  newBid?: number
  bidderId?: string
  bidderName?: string
}

export interface ValidationResult {
  valid: boolean
  reason?: string
}

/**
 * Validate if a team can place a bid
 */
export function validateBid(
  team: Team,
  currentBid: number,
  bidAmount: number,
  player: any
): ValidationResult {
  // Check if team is active
  if (!team.isActive) {
    return { valid: false, reason: 'Team is not active in auction' }
  }

  // Check bid increment
  if (bidAmount < currentBid + AUCTION_CONFIG.BID_INCREMENT) {
    return {
      valid: false,
      reason: `Minimum bid increment is ₹${AUCTION_CONFIG.BID_INCREMENT}L`
    }
  }

  // Check budget
  if (bidAmount > team.budget) {
    return {
      valid: false,
      reason: `Insufficient budget. You have ₹${team.budget}L remaining`
    }
  }

  // Check squad size
  if (team.players.length >= AUCTION_CONFIG.MAX_SQUAD_SIZE) {
    return {
      valid: false,
      reason: `Maximum squad size (${AUCTION_CONFIG.MAX_SQUAD_SIZE}) reached`
    }
  }

  // Check overseas player limit
  const overseasCount = team.players.filter(p => p.isOverseas).length
  if (player.country !== 'India' && overseasCount >= AUCTION_CONFIG.MAX_OVERSEAS_PLAYERS) {
    return {
      valid: false,
      reason: `Maximum overseas players (${AUCTION_CONFIG.MAX_OVERSEAS_PLAYERS}) reached`
    }
  }

  return { valid: true }
}

/**
 * Validate squad composition
 */
export function validateSquadComposition(team: Team): ValidationResult {
  const roleCounts = {
    BATSMAN: 0,
    BOWLER: 0,
    ALL_ROUNDER: 0,
    WICKET_KEEPER: 0,
  }

  team.players.forEach(player => {
    roleCounts[player.role as keyof typeof roleCounts]++
  })

  // Check minimum requirements
  if (roleCounts.BATSMAN < AUCTION_CONFIG.MIN_BATSMEN) {
    return {
      valid: false,
      reason: `Need at least ${AUCTION_CONFIG.MIN_BATSMEN} batsmen (have ${roleCounts.BATSMAN})`
    }
  }

  if (roleCounts.BOWLER < AUCTION_CONFIG.MIN_BOWLERS) {
    return {
      valid: false,
      reason: `Need at least ${AUCTION_CONFIG.MIN_BOWLERS} bowlers (have ${roleCounts.BOWLER})`
    }
  }

  if (roleCounts.ALL_ROUNDER < AUCTION_CONFIG.MIN_ALL_ROUNDERS) {
    return {
      valid: false,
      reason: `Need at least ${AUCTION_CONFIG.MIN_ALL_ROUNDERS} all-rounders (have ${roleCounts.ALL_ROUNDER})`
    }
  }

  if (roleCounts.WICKET_KEEPER < AUCTION_CONFIG.MIN_WICKET_KEEPERS) {
    return {
      valid: false,
      reason: `Need at least ${AUCTION_CONFIG.MIN_WICKET_KEEPERS} wicket-keepers (have ${roleCounts.WICKET_KEEPER})`
    }
  }

  // Check minimum squad size
  if (team.players.length < AUCTION_CONFIG.MIN_SQUAD_SIZE) {
    return {
      valid: false,
      reason: `Need at least ${AUCTION_CONFIG.MIN_SQUAD_SIZE} players (have ${team.players.length})`
    }
  }

  return { valid: true }
}

/**
 * Process a bid
 */
export async function processBid(
  roomCode: string,
  teamId: string,
  bidAmount: number,
  state: AuctionState
): Promise<BidResult> {
  const team = state.teams.find(t => t.id === teamId)
  if (!team) {
    return { success: false, message: 'Team not found' }
  }

  // Get current player
  const player = await prisma.player.findUnique({
    where: { id: state.currentPlayerId! }
  })

  if (!player) {
    return { success: false, message: 'Player not found' }
  }

  // Validate bid
  const validation = validateBid(
    team,
    state.currentBid || player.basePrice,
    bidAmount,
    player
  )

  if (!validation.valid) {
    return { success: false, message: validation.reason! }
  }

  // Record bid in history
  await prisma.bidHistory.create({
    data: {
      roomCode,
      playerId: player.id,
      teamId: team.id,
      teamName: team.name,
      userName: team.userName,
      bidAmount,
      bidType: 'normal',
    }
  })

  // Update auction state
  state.currentBid = bidAmount
  state.currentBidderId = teamId
  state.bidCount = 0 // Reset going count
  state.turnTimerStart = new Date()

  return {
    success: true,
    message: `${team.name} bid ₹${bidAmount}L`,
    newBid: bidAmount,
    bidderId: teamId,
    bidderName: team.name,
  }
}

/**
 * Process RTM (Right to Match) card
 */
export async function processRTM(
  roomCode: string,
  teamId: string,
  state: AuctionState
): Promise<BidResult> {
  const team = state.teams.find(t => t.id === teamId)
  if (!team) {
    return { success: false, message: 'Team not found' }
  }

  // Check RTM cards remaining
  if (team.rtmCardsLeft <= 0) {
    return { success: false, message: 'No RTM cards remaining' }
  }

  // Get current player
  const player = await prisma.player.findUnique({
    where: { id: state.currentPlayerId! }
  })

  if (!player) {
    return { success: false, message: 'Player not found' }
  }

  const matchAmount = state.currentBid!

  // Validate budget
  if (matchAmount > team.budget) {
    return {
      success: false,
      message: `Insufficient budget. Need ₹${matchAmount}L, have ₹${team.budget}L`
    }
  }

  // Use RTM card
  team.rtmCardsLeft--

  // Record RTM in history
  await prisma.bidHistory.create({
    data: {
      roomCode,
      playerId: player.id,
      teamId: team.id,
      teamName: team.name,
      userName: team.userName,
      bidAmount: matchAmount,
      bidType: 'rtm',
    }
  })

  // Automatically assign player to RTM team
  await assignPlayerToTeam(team, player, matchAmount, state)

  return {
    success: true,
    message: `${team.name} used RTM card for ₹${matchAmount}L`,
    newBid: matchAmount,
    bidderId: teamId,
    bidderName: team.name,
  }
}

/**
 * Assign player to winning team
 */
export async function assignPlayerToTeam(
  team: Team,
  player: any,
  price: number,
  state: AuctionState
): Promise<void> {
  // Add player to team
  team.players.push({
    playerId: player.id,
    playerName: player.name,
    role: player.role,
    price,
    isOverseas: player.country !== 'India',
  })

  // Deduct from budget
  team.budget -= price

  // Update player status
  await prisma.player.update({
    where: { id: player.id },
    data: {
      isSold: true,
      currentPrice: price,
      teamName: team.name,
    }
  })

  // Record purchase
  await prisma.playerPurchase.create({
    data: {
      roomCode: state.roomCode,
      playerId: player.id,
      playerName: player.name,
      playerRole: player.role,
      basePrice: player.basePrice,
      soldPrice: price,
      teamId: team.id,
      teamName: team.name,
      userName: team.userName,
    }
  })

  // Mark as sold
  state.soldPlayers.push(player.id)
}

/**
 * Mark player as unsold
 */
export async function markPlayerUnsold(
  playerId: string,
  state: AuctionState
): Promise<void> {
  state.unsoldPlayers.push(playerId)
  
  await prisma.player.update({
    where: { id: playerId },
    data: { isSold: false }
  })
}

/**
 * Move to next player in auction
 */
export function moveToNextPlayer(state: AuctionState): void {
  if (state.playerQueue.length === 0) {
    // Auction complete
    state.status = 'completed'
    state.currentPlayerId = null
    state.currentBid = null
    state.currentBidderId = null
    return
  }

  // Get next player
  const nextPlayerId = state.playerQueue.shift()!
  state.currentPlayerId = nextPlayerId
  state.currentBid = null
  state.currentBidderId = null
  state.bidCount = 0
  state.turnTimerStart = new Date()
}

/**
 * Check if auction should end
 */
export function shouldEndAuction(state: AuctionState): boolean {
  // All players sold or unsold
  if (state.playerQueue.length === 0 && !state.currentPlayerId) {
    return true
  }

  // All teams have full squads
  const allTeamsFull = state.teams.every(
    team => team.players.length >= AUCTION_CONFIG.MIN_SQUAD_SIZE
  )

  // All teams out of budget
  const allTeamsOutOfBudget = state.teams.every(
    team => team.budget < AUCTION_CONFIG.BID_INCREMENT
  )

  return allTeamsFull || allTeamsOutOfBudget
}

/**
 * Calculate team rating
 */
export function calculateTeamRating(team: Team): number {
  if (team.players.length === 0) return 0

  // Simple rating: total spent + bonus for balanced squad
  const totalSpent = team.players.reduce((sum, p) => sum + p.price, 0)
  
  const roleCounts = {
    BATSMAN: 0,
    BOWLER: 0,
    ALL_ROUNDER: 0,
    WICKET_KEEPER: 0,
  }

  team.players.forEach(player => {
    roleCounts[player.role as keyof typeof roleCounts]++
  })

  // Bonus for balanced squad (each role has at least minimum)
  let balanceBonus = 0
  if (roleCounts.BATSMAN >= AUCTION_CONFIG.MIN_BATSMEN) balanceBonus += 500
  if (roleCounts.BOWLER >= AUCTION_CONFIG.MIN_BOWLERS) balanceBonus += 500
  if (roleCounts.ALL_ROUNDER >= AUCTION_CONFIG.MIN_ALL_ROUNDERS) balanceBonus += 300
  if (roleCounts.WICKET_KEEPER >= AUCTION_CONFIG.MIN_WICKET_KEEPERS) balanceBonus += 200

  return totalSpent + balanceBonus
}

/**
 * Get auction leaderboard
 */
export function getLeaderboard(teams: Team[]): Array<Team & { rating: number; rank: number }> {
  const teamsWithRating = teams.map(team => ({
    ...team,
    rating: calculateTeamRating(team),
  }))

  // Sort by rating descending
  teamsWithRating.sort((a, b) => b.rating - a.rating)

  // Add rank
  return teamsWithRating.map((team, index) => ({
    ...team,
    rank: index + 1,
  }))
}

/**
 * Pause auction
 */
export function pauseAuction(state: AuctionState): void {
  state.status = 'paused'
  state.turnTimerStart = null
}

/**
 * Resume auction
 */
export function resumeAuction(state: AuctionState): void {
  state.status = 'active'
  state.turnTimerStart = new Date()
}

/**
 * Skip current player (admin only)
 */
export async function skipPlayer(state: AuctionState): Promise<void> {
  if (state.currentPlayerId) {
    await markPlayerUnsold(state.currentPlayerId, state)
  }
  moveToNextPlayer(state)
}

/**
 * Reset auction (admin only)
 */
export async function resetAuction(roomCode: string): Promise<void> {
  // Reset all players
  await prisma.player.updateMany({
    where: {
      purchases: {
        some: { roomCode }
      }
    },
    data: {
      isSold: false,
      currentPrice: null,
      teamName: null,
    }
  })

  // Delete bid history
  await prisma.bidHistory.deleteMany({
    where: { roomCode }
  })

  // Delete purchases
  await prisma.playerPurchase.deleteMany({
    where: { roomCode }
  })
}
