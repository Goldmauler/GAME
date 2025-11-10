import { NextResponse } from 'next/server'

const API_KEY = '3a9d8ee5-d5fc-49a6-820e-f1b2422952a3'
const API_URL = 'https://api.cricapi.com/v1'

// Get player info with stats
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const playerId = searchParams.get('id')

  if (!playerId) {
    return NextResponse.json({ error: 'Player ID is required' }, { status: 400 })
  }

  console.log(`🔍 Fetching detailed info for player ID: ${playerId}`)

  try {
    const apiUrl = `${API_URL}/players_info?apikey=${API_KEY}&id=${playerId}`
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
    console.log(`✅ API Success: Player info retrieved`)
    console.log('📋 Full API Response:', JSON.stringify(data, null, 2))
    
    return NextResponse.json({
      success: true,
      data: data.data || null,
      info: data.info,
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('❌ Error fetching player info:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch player info' 
      },
      { status: 500 }
    )
  }
}
