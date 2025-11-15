// Cricket API Service for player images and stats

export interface PlayerStats {
  playerId: string
  name: string
  image?: string
  country: string
  role: string
  battingStyle?: string
  bowlingStyle?: string
  stats: {
    matches: number
    innings: number
    runs: number
    wickets: number
    average: number
    strikeRate: number
    economy?: number
    bestScore?: string
    bestBowling?: string
  }
  recentForm?: Array<{
    match: string
    score?: string
    wickets?: string
    date: string
  }>
}

// CricAPI.com - Free Cricket API
const CRICAPI_KEY = process.env.NEXT_PUBLIC_CRICAPI_KEY || 'demo-key'
const CRICAPI_BASE = 'https://api.cricapi.com/v1'

// ESPN Cricinfo - Alternative
const ESPN_BASE = 'https://www.espncricinfo.com'

// Player name to ESPN Cricinfo ID mapping (commonly used players)
const PLAYER_ID_MAP: { [key: string]: string } = {
  // Mumbai Indians
  "Rohit Sharma": "34102",
  "Jasprit Bumrah": "625383",
  "Suryakumar Yadav": "446507",
  "Ishan Kishan": "720637",
  "Hardik Pandya": "625371",
  "Tim David": "326632",
  "Cameron Green": "767889",
  
  // Chennai Super Kings
  "MS Dhoni": "28081",
  "Ravindra Jadeja": "234675",
  "Ruturaj Gaikwad": "1070420",
  "Devon Conway": "533747",
  "Deepak Chahar": "554691",
  
  // Royal Challengers Bangalore
  "Virat Kohli": "253802",
  "Faf du Plessis": "44828",
  "Glenn Maxwell": "325026",
  "Mohammed Siraj": "537119",
  "Dinesh Karthik": "30045",
  
  // Kolkata Knight Riders
  "Shreyas Iyer": "554691",
  "Andre Russell": "230559",
  "Sunil Narine": "230559",
  "Rinku Singh": "1099743",
  "Mitchell Starc": "311592",
  
  // Delhi Capitals
  "Rishabh Pant": "931581",
  "David Warner": "219889",
  "Axar Patel": "554691",
  "Kuldeep Yadav": "587821",
  "Mitchell Marsh": "272450",
  
  // Rajasthan Royals
  "Sanju Samson": "421143",
  "Jos Buttler": "308967",
  "Yashasvi Jaiswal": "1099743",
  "Yuzvendra Chahal": "430246",
  "Trent Boult": "277906",
  
  // Punjab Kings
  "Shikhar Dhawan": "28235",
  "Liam Livingstone": "589034",
  "Kagiso Rabada": "556935",
  "Sam Curran": "728729",
  "Arshdeep Singh": "1099743",
  
  // Sunrisers Hyderabad
  "Aiden Markram": "514806",
  "Travis Head": "272297",
  "Heinrich Klaasen": "481979",
  "Bhuvneshwar Kumar": "326016",
  
  // Gujarat Titans
  "Shubman Gill": "1098824",
  "Rashid Khan": "793463",
  "Mohammed Shami": "481896",
  
  // Lucknow Super Giants
  "KL Rahul": "422108",
  "Nicholas Pooran": "489226",
  "Quinton de Kock": "379143",
  "Marcus Stoinis": "311592",
}

// Get player image from ESPN Cricinfo
export function getPlayerImage(playerName: string): string {
  const playerId = PLAYER_ID_MAP[playerName]
  
  if (playerId) {
    // ESPN Cricinfo player image
    return `https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/319900/319946.png`
  }
  
  // Fallback to placeholder with initials
  const initials = playerName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
  
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(playerName)}&size=200&background=1e293b&color=f97316&bold=true`
}

// Generate mock stats based on player role and base price
export function generatePlayerStats(playerName: string, role: string, basePrice: number): PlayerStats {
  const playerId = PLAYER_ID_MAP[playerName] || Math.random().toString(36).substr(2, 9)
  
  // Stats are influenced by base price (higher price = better stats)
  const quality = basePrice / 15 // Normalize to 0-1 range
  
  const battingStats = {
    matches: Math.floor(50 + Math.random() * 150),
    innings: Math.floor(45 + Math.random() * 140),
    runs: Math.floor(1000 + quality * 4000 + Math.random() * 2000),
    average: parseFloat((25 + quality * 30 + Math.random() * 15).toFixed(2)),
    strikeRate: parseFloat((120 + quality * 40 + Math.random() * 30).toFixed(2)),
    bestScore: `${Math.floor(50 + quality * 75)}*`,
  }
  
  const bowlingStats = {
    matches: Math.floor(50 + Math.random() * 150),
    innings: Math.floor(45 + Math.random() * 140),
    wickets: Math.floor(20 + quality * 150 + Math.random() * 80),
    average: parseFloat((35 - quality * 15 + Math.random() * 10).toFixed(2)),
    economy: parseFloat((9 - quality * 2 + Math.random() * 2).toFixed(2)),
    bestBowling: `${Math.floor(3 + quality * 3)}/${Math.floor(15 + Math.random() * 25)}`,
  }
  
  const allRounderStats = {
    ...battingStats,
    wickets: Math.floor(30 + quality * 80 + Math.random() * 50),
    economy: parseFloat((9 - quality * 2 + Math.random() * 2).toFixed(2)),
    bestBowling: `${Math.floor(2 + quality * 2)}/${Math.floor(20 + Math.random() * 20)}`,
  }
  
  let stats
  if (role === "Batsman" || role === "Wicket-keeper") {
    stats = {
      matches: battingStats.matches,
      innings: battingStats.innings,
      runs: battingStats.runs,
      wickets: 0,
      average: battingStats.average,
      strikeRate: battingStats.strikeRate,
      bestScore: battingStats.bestScore,
    }
  } else if (role === "Bowler") {
    stats = {
      matches: bowlingStats.matches,
      innings: bowlingStats.innings,
      runs: 0,
      wickets: bowlingStats.wickets,
      average: bowlingStats.average,
      strikeRate: 0,
      economy: bowlingStats.economy,
      bestBowling: bowlingStats.bestBowling,
    }
  } else {
    // All-rounder
    stats = {
      matches: allRounderStats.matches,
      innings: allRounderStats.innings,
      runs: allRounderStats.runs,
      wickets: allRounderStats.wickets,
      average: allRounderStats.average,
      strikeRate: allRounderStats.strikeRate,
      economy: allRounderStats.economy,
      bestScore: allRounderStats.bestScore,
      bestBowling: allRounderStats.bestBowling,
    }
  }
  
  // Determine country based on name patterns
  const country = getPlayerCountry(playerName)
  
  // Generate recent form (last 5 matches)
  const recentForm = Array.from({ length: 5 }, (_, i) => ({
    match: `Match ${i + 1}`,
    score: role !== "Bowler" ? `${Math.floor(20 + Math.random() * 80)}${Math.random() > 0.7 ? '*' : ''}` : undefined,
    wickets: role !== "Batsman" && role !== "Wicket-keeper" ? `${Math.floor(Math.random() * 4)}/${Math.floor(20 + Math.random() * 30)}` : undefined,
    date: new Date(Date.now() - (i + 1) * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  }))
  
  return {
    playerId,
    name: playerName,
    image: getPlayerImage(playerName),
    country,
    role,
    battingStyle: getBattingStyle(playerName),
    bowlingStyle: getBowlingStyle(playerName, role),
    stats,
    recentForm,
  }
}

function getPlayerCountry(playerName: string): string {
  // Indian players - common Indian names
  const indianPlayers = [
    "Rohit", "Virat", "Jasprit", "Suryakumar", "Ishan", "Hardik", "Ravindra", 
    "Ruturaj", "Shivam", "Deepak", "MS Dhoni", "Kuldeep", "Axar", "Rishabh",
    "Shreyas", "Rinku", "Nitish", "Yuzvendra", "Shikhar", "Arshdeep", "Bhuvneshwar",
    "Umran", "Shubman", "Mohammed", "Prithvi", "Yashasvi", "Sanju", "Rahul"
  ]
  
  if (indianPlayers.some(indian => playerName.includes(indian))) {
    return "India"
  }
  
  // Australian players
  if (["Warner", "Maxwell", "Starc", "Cummins", "Smith", "Wade", "Green", "Head", "Stoinis"].some(aus => playerName.includes(aus))) {
    return "Australia"
  }
  
  // South African players
  if (["Rabada", "de Kock", "Markram", "Klaasen", "Nortje", "Coetzee", "Stubbs"].some(sa => playerName.includes(sa))) {
    return "South Africa"
  }
  
  // English players
  if (["Buttler", "Stokes", "Curran", "Livingstone", "Moeen", "Bairstow", "Salt"].some(eng => playerName.includes(eng))) {
    return "England"
  }
  
  // West Indian players
  if (["Russell", "Narine", "Hetmyer", "Pooran", "Holder", "Shepherd"].some(wi => playerName.includes(wi))) {
    return "West Indies"
  }
  
  // New Zealand players
  if (["Boult", "Conway", "Mitchell", "Chapman", "Southee"].some(nz => playerName.includes(nz))) {
    return "New Zealand"
  }
  
  // Sri Lankan players
  if (["Theekshana", "Pathirana", "Hasaranga", "Fernando"].some(sl => playerName.includes(sl))) {
    return "Sri Lanka"
  }
  
  // Afghanistan players
  if (["Rashid", "Nabi", "Mujeeb", "Farooqi", "Gurbaz"].some(afg => playerName.includes(afg))) {
    return "Afghanistan"
  }
  
  return "International"
}

function getBattingStyle(playerName: string): string {
  const leftHanders = ["Dhawan", "Pant", "Ishan", "Jadeja", "Gurbaz", "Warner", "Starc", "Boult"]
  
  if (leftHanders.some(lh => playerName.includes(lh))) {
    return "Left-hand bat"
  }
  
  return "Right-hand bat"
}

function getBowlingStyle(playerName: string, role: string): string | undefined {
  if (role === "Batsman" || role === "Wicket-keeper") {
    return undefined
  }
  
  const spinners = ["Chahal", "Kuldeep", "Ashwin", "Narine", "Rashid", "Hasaranga", "Jadeja", "Axar", "Theekshana", "Varun"]
  const leftArmPace = ["Starc", "Boult", "Arshdeep", "Natarajan"]
  
  if (spinners.some(spinner => playerName.includes(spinner))) {
    if (["Jadeja", "Axar", "Narine"].some(la => playerName.includes(la))) {
      return "Left-arm orthodox"
    }
    return "Right-arm leg spin"
  }
  
  if (leftArmPace.some(lap => playerName.includes(lap))) {
    return "Left-arm fast"
  }
  
  return "Right-arm fast medium"
}

// Fetch player stats from API (with fallback to mock data)
export async function fetchPlayerStats(playerName: string, role: string, basePrice: number): Promise<PlayerStats> {
  try {
    // Try to fetch from CricAPI (if you have API key)
    const response = await fetch(`${CRICAPI_BASE}/players?apikey=${CRICAPI_KEY}&search=${encodeURIComponent(playerName)}`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    })
    
    if (response.ok) {
      const data = await response.json()
      if (data.data && data.data.length > 0) {
        const playerData = data.data[0]
        // Transform API data to our format
        return {
          playerId: playerData.id,
          name: playerData.name,
          image: getPlayerImage(playerName),
          country: playerData.country || getPlayerCountry(playerName),
          role: playerData.role || role,
          battingStyle: getBattingStyle(playerName),
          bowlingStyle: getBowlingStyle(playerName, role),
          stats: {
            matches: 0,
            innings: 0,
            runs: 0,
            wickets: 0,
            average: 0,
            strikeRate: 0,
          },
          recentForm: [],
        }
      }
    }
  } catch (error) {
    console.log('API fetch failed, using mock data:', error)
  }
  
  // Fallback to generated stats
  return generatePlayerStats(playerName, role, basePrice)
}

// Get player's flag emoji
export function getCountryFlag(country: string): string {
  const flags: { [key: string]: string } = {
    "India": "🇮🇳",
    "Australia": "🇦🇺",
    "England": "🏴󐁧󐁢󐁥󐁮󐁧󐁿",
    "South Africa": "🇿🇦",
    "West Indies": "🏴󐁿",
    "New Zealand": "🇳🇿",
    "Pakistan": "🇵🇰",
    "Sri Lanka": "🇱🇰",
    "Bangladesh": "🇧🇩",
    "Afghanistan": "🇦🇫",
    "Ireland": "🇮🇪",
    "Zimbabwe": "🇿🇼",
  }
  
  return flags[country] || "🌍"
}
