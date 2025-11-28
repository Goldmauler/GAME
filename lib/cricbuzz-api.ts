// Cricbuzz API Integration Service with Caching and Fallback
import { prisma } from './prisma'

// Environment variables from .env
const RAPIDAPI_KEY = process.env.NEXT_PUBLIC_RAPIDAPI_KEY || ''
const RAPIDAPI_HOST = process.env.NEXT_PUBLIC_API_HOST || 'cricbuzz-cricket.p.rapidapi.com'
const CRICBUZZ_BASE = process.env.NEXT_PUBLIC_CRICKET_API_URL || 'https://cricbuzz-cricket.p.rapidapi.com'
const BACKUP_API_KEY = process.env.NEXT_PUBLIC_BACKUP_API_KEY || ''
const BACKUP_API_URL = process.env.NEXT_PUBLIC_BACKUP_API_URL || 'https://api.cricapi.com/v1'

// Cache duration: 24 hours
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000

export interface CricbuzzPlayer {
  id: string
  name: string
  role: 'BATSMAN' | 'BOWLER' | 'ALL_ROUNDER' | 'WICKET_KEEPER'
  country: string
  imageUrl?: string
  stats?: {
    batting?: {
      matches: number
      innings: number
      runs: number
      average: number
      strikeRate: number
      centuries: number
      fifties: number
      highestScore: string
    }
    bowling?: {
      matches: number
      innings: number
      wickets: number
      average: number
      economy: number
      strikeRate: number
      bestFigures: string
    }
  }
}

/**
 * Fetch player data from cache or API
 */
export async function fetchPlayerData(playerName: string): Promise<CricbuzzPlayer | null> {
  // Try cache first
  const cached = await getCachedData(`player:${playerName}`)
  if (cached) {
    return cached as CricbuzzPlayer
  }

  // Try Cricbuzz API
  try {
    const player = await fetchFromCricbuzz(playerName)
    if (player) {
      await cacheData(`player:${playerName}`, player)
      return player
    }
  } catch (error) {
    console.error('Cricbuzz API error:', error)
  }

  // Try backup API
  try {
    const player = await fetchFromBackupAPI(playerName)
    if (player) {
      await cacheData(`player:${playerName}`, player)
      return player
    }
  } catch (error) {
    console.error('Backup API error:', error)
  }

  return null
}

/**
 * Fetch from Cricbuzz RapidAPI
 */
async function fetchFromCricbuzz(playerName: string): Promise<CricbuzzPlayer | null> {
  if (!RAPIDAPI_KEY) {
    throw new Error('RapidAPI key not configured')
  }

  const response = await fetch(`${CRICBUZZ_BASE}/stats/v1/player/search?plrN=${encodeURIComponent(playerName)}`, {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': RAPIDAPI_KEY,
      'X-RapidAPI-Host': RAPIDAPI_HOST,
    },
    next: { revalidate: 86400 } // Cache for 24 hours
  })

  if (!response.ok) {
    throw new Error(`Cricbuzz API error: ${response.status}`)
  }

  const data = await response.json()
  
  if (data.player && data.player.length > 0) {
    const player = data.player[0]
    return transformCricbuzzPlayer(player)
  }

  return null
}

/**
 * Fetch from backup Cricket API
 */
async function fetchFromBackupAPI(playerName: string): Promise<CricbuzzPlayer | null> {
  if (!BACKUP_API_KEY) {
    throw new Error('Backup API key not configured')
  }

  const response = await fetch(`${BACKUP_API_URL}/players?apikey=${BACKUP_API_KEY}&search=${encodeURIComponent(playerName)}`, {
    next: { revalidate: 86400 }
  })

  if (!response.ok) {
    throw new Error(`Backup API error: ${response.status}`)
  }

  const data = await response.json()
  
  if (data.data && data.data.length > 0) {
    const player = data.data[0]
    return transformBackupAPIPlayer(player)
  }

  return null
}

/**
 * Transform Cricbuzz API response to our format
 */
function transformCricbuzzPlayer(apiPlayer: any): CricbuzzPlayer {
  return {
    id: apiPlayer.id || apiPlayer.playerId,
    name: apiPlayer.name || apiPlayer.fullName,
    role: normalizeRole(apiPlayer.role || apiPlayer.playingRole),
    country: apiPlayer.country || apiPlayer.intlTeam || 'Unknown',
    imageUrl: apiPlayer.imageUrl || apiPlayer.faceImageId 
      ? `https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/${apiPlayer.faceImageId}.png`
      : undefined,
    stats: apiPlayer.stats ? {
      batting: apiPlayer.stats.batting,
      bowling: apiPlayer.stats.bowling,
    } : undefined
  }
}

/**
 * Transform Backup API response to our format
 */
function transformBackupAPIPlayer(apiPlayer: any): CricbuzzPlayer {
  return {
    id: apiPlayer.id,
    name: apiPlayer.name,
    role: normalizeRole(apiPlayer.playerRole),
    country: apiPlayer.country || 'Unknown',
    imageUrl: apiPlayer.playerImg,
  }
}

/**
 * Normalize role to our enum values
 */
function normalizeRole(role: string): 'BATSMAN' | 'BOWLER' | 'ALL_ROUNDER' | 'WICKET_KEEPER' {
  const normalized = role?.toUpperCase() || ''
  
  if (normalized.includes('BAT')) return 'BATSMAN'
  if (normalized.includes('BOWL')) return 'BOWLER'
  if (normalized.includes('ALL') || normalized.includes('ROUNDER')) return 'ALL_ROUNDER'
  if (normalized.includes('KEEPER') || normalized.includes('WK')) return 'WICKET_KEEPER'
  
  return 'BATSMAN' // Default
}

/**
 * Get cached data from database
 */
async function getCachedData(key: string): Promise<any | null> {
  try {
    const cache = await prisma.playerCache.findUnique({
      where: { cacheKey: key }
    })

    if (!cache) return null

    // Check if cache is expired
    if (new Date() > cache.expiresAt) {
      await prisma.playerCache.delete({ where: { cacheKey: key } })
      return null
    }

    return cache.data
  } catch (error) {
    console.error('Cache read error:', error)
    return null
  }
}

/**
 * Cache data in database
 */
async function cacheData(key: string, data: any): Promise<void> {
  try {
    await prisma.playerCache.upsert({
      where: { cacheKey: key },
      update: {
        data: data,
        expiresAt: new Date(Date.now() + CACHE_DURATION_MS),
      },
      create: {
        cacheKey: key,
        data: data,
        expiresAt: new Date(Date.now() + CACHE_DURATION_MS),
      }
    })
  } catch (error) {
    console.error('Cache write error:', error)
  }
}

/**
 * Fetch multiple players in batch (for seeding)
 */
export async function fetchPlayersInBatch(playerNames: string[]): Promise<CricbuzzPlayer[]> {
  const players: CricbuzzPlayer[] = []
  
  // Process in chunks to avoid rate limiting
  const chunkSize = 5
  for (let i = 0; i < playerNames.length; i += chunkSize) {
    const chunk = playerNames.slice(i, i + chunkSize)
    
    const results = await Promise.allSettled(
      chunk.map(name => fetchPlayerData(name))
    )
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        players.push(result.value)
      } else {
        console.warn(`Failed to fetch player: ${chunk[index]}`)
      }
    })
    
    // Wait 2 seconds between chunks to avoid rate limiting
    if (i + chunkSize < playerNames.length) {
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }
  
  return players
}

/**
 * Clear expired cache entries
 */
export async function clearExpiredCache(): Promise<number> {
  try {
    const result = await prisma.playerCache.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    })
    return result.count
  } catch (error) {
    console.error('Cache cleanup error:', error)
    return 0
  }
}
