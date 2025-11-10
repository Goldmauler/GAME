import { NextResponse } from 'next/server'

// RapidAPI Cricbuzz - 500 requests/day FREE
const RAPIDAPI_KEY = 'f0484cffebmsh693ec841c20d016p16267bjsn43c1536f5c6a'
const RAPIDAPI_HOST = 'cricbuzz-cricket.p.rapidapi.com'
const CRICBUZZ_API = `https://${RAPIDAPI_HOST}`

// Backup API
const BACKUP_API_KEY = '3a9d8ee5-d5fc-49a6-820e-f1b2422952a3'
const BACKUP_API_URL = 'https://api.cricapi.com/v1'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const playerName = searchParams.get('name')

  if (!playerName) {
    return NextResponse.json({ error: 'Player name is required' }, { status: 400 })
  }

  console.log(`🔍 Fetching player data for: ${playerName}`)

  try {
    // Try RapidAPI Cricbuzz first (Best stats!)
    const cricbuzzUrl = `${CRICBUZZ_API}/stats/v1/player/search?plrN=${encodeURIComponent(playerName)}`
    console.log(`📡 Cricbuzz API URL: ${cricbuzzUrl}`)
    
    const cricbuzzResponse = await fetch(cricbuzzUrl, {
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': RAPIDAPI_HOST,
        'Accept': 'application/json',
      },
    }).catch(err => {
      console.warn('Cricbuzz API failed:', err)
      return null
    })

    if (cricbuzzResponse && cricbuzzResponse.ok) {
      const cricbuzzData = await cricbuzzResponse.json()
      console.log(`📊 Cricbuzz Response:`, cricbuzzData)
      
      if (cricbuzzData.player && cricbuzzData.player.length > 0) {
        console.log(`✅ Cricbuzz Success: Found ${cricbuzzData.player.length} players`)
        
        // Transform Cricbuzz data to our format
        const players = cricbuzzData.player.map((p: any) => ({
          id: p.id,
          name: p.name,
          country: p.teamName || 'Unknown',
          playerRole: p.role || 'Player',
          battingStyle: p.bat || 'Unknown',
          bowlingStyle: p.bowl || 'Unknown',
          imageUrl: p.imageId ? `https://img1.cricbuzz.com/img/${p.imageId}` : null,
          cricbuzzId: p.id,
        }))
        
        return NextResponse.json({
          success: true,
          data: players,
          source: 'Cricbuzz (RapidAPI)',
          info: {
            provider: 'Cricbuzz via RapidAPI',
            freeLimit: '500 requests/day'
          },
          timestamp: new Date().toISOString()
        })
      }
    }

    // Fallback to backup API
    console.log('⚠️ Cricbuzz failed, trying backup API...')
    const backupUrl = `${BACKUP_API_URL}/players?apikey=${BACKUP_API_KEY}&offset=0&search=${encodeURIComponent(playerName)}`
    console.log(`📡 Backup API URL: ${backupUrl.replace(BACKUP_API_KEY, 'API_KEY_HIDDEN')}`)
    
    const backupResponse = await fetch(backupUrl, {
      headers: {
        'Accept': 'application/json',
      },
    })

    console.log(`📊 Backup API Response Status: ${backupResponse.status}`)

    if (!backupResponse.ok) {
      const errorText = await backupResponse.text()
      console.error(`❌ Backup API Error: ${backupResponse.status} - ${errorText}`)
      throw new Error(`Both APIs failed`)
    }

    const backupData = await backupResponse.json()
    console.log(`✅ Backup API Success: Found ${backupData.data?.length || 0} players`)
    
    return NextResponse.json({
      success: true,
      data: backupData.data || [],
      source: 'CricAPI (Backup)',
      info: backupData.info,
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('❌ Error fetching player data:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch player data' 
      },
      { status: 500 }
    )
  }
}

// Test endpoint to verify RapidAPI
export async function POST(request: Request) {
  console.log('🧪 Testing Cricbuzz RapidAPI...')
  
  try {
    // Test with a known player
    const testUrl = `${CRICBUZZ_API}/stats/v1/player/search?plrN=Virat`
    console.log(`📡 Test URL: ${testUrl}`)
    
    const response = await fetch(testUrl, {
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': RAPIDAPI_HOST,
        'Accept': 'application/json',
      },
    })

    const data = await response.json()
    console.log('📊 Cricbuzz Test Response:', data)
    
    return NextResponse.json({
      apiKeyValid: response.ok,
      info: {
        provider: 'Cricbuzz via RapidAPI',
        freeLimit: '500 requests/day',
        status: response.ok ? 'Working' : 'Failed'
      },
      message: response.ok 
        ? `Cricbuzz RapidAPI is working! 500 free requests/day available.`
        : 'RapidAPI connection failed',
      sampleData: data,
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    return NextResponse.json(
      { 
        apiKeyValid: false,
        error: error.message 
      },
      { status: 500 }
    )
  }
}
