import { NextResponse } from 'next/server'

// Use hardcoded API key since it's safe on server-side
const API_KEY = '3a9d8ee5-d5fc-49a6-820e-f1b2422952a3'
const API_URL = 'https://api.cricapi.com/v1'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const playerName = searchParams.get('name')

  if (!playerName) {
    return NextResponse.json({ error: 'Player name is required' }, { status: 400 })
  }

  console.log(`🔍 Fetching player data for: ${playerName}`)

  try {
    const apiUrl = `${API_URL}/players?apikey=${API_KEY}&offset=0&search=${encodeURIComponent(playerName)}`
    console.log(`📡 API URL: ${apiUrl.replace(API_KEY, 'API_KEY_HIDDEN')}`)
    
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
      },
    })

    console.log(`📊 API Response Status: ${response.status}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ API Error: ${response.status} - ${errorText}`)
      throw new Error(`API responded with status: ${response.status}`)
    }

    const data = await response.json()
    console.log(`✅ API Success: Found ${data.data?.length || 0} players`)
    
    return NextResponse.json({
      success: true,
      data: data.data || [],
      info: data.info,
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

// Test endpoint to verify API key
export async function POST(request: Request) {
  console.log('🧪 Testing API key...')
  
  try {
    const apiUrl = `${API_URL}/players?apikey=${API_KEY}&offset=0`
    console.log(`📡 Test API URL: ${apiUrl.replace(API_KEY, 'API_KEY_HIDDEN')}`)
    
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
      },
    })

    const data = await response.json()
    console.log('📊 API Test Response:', data)
    
    return NextResponse.json({
      apiKeyValid: data.status === 'success',
      info: data.info,
      message: data.status === 'success' 
        ? `API is working! ${data.info?.hitsToday || 0}/${data.info?.hitsLimit || 0} hits used today`
        : 'API key may be invalid',
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
