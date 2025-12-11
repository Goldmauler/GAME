// Quick test script to verify Cricbuzz API
const RAPIDAPI_KEY = 'f0484cffebmsh693ec841c20d016p16267bjsn43c1536f5c6a'
const RAPIDAPI_HOST = 'cricbuzz-cricket.p.rapidapi.com'
const CRICBUZZ_BASE = 'https://cricbuzz-cricket.p.rapidapi.com'

async function testCricbuzzAPI() {
  console.log('🔍 Testing Cricbuzz API Connection...\n')
  
  const testPlayers = ['Virat Kohli', 'Rohit Sharma', 'MS Dhoni']
  
  for (const playerName of testPlayers) {
    console.log(`\n📡 Fetching: ${playerName}`)
    console.log(`URL: ${CRICBUZZ_BASE}/stats/v1/player/search?plrN=${encodeURIComponent(playerName)}`)
    
    try {
      const response = await fetch(
        `${CRICBUZZ_BASE}/stats/v1/player/search?plrN=${encodeURIComponent(playerName)}`,
        {
          method: 'GET',
          headers: {
            'X-RapidAPI-Key': RAPIDAPI_KEY,
            'X-RapidAPI-Host': RAPIDAPI_HOST,
          }
        }
      )
      
      console.log(`Status: ${response.status} ${response.statusText}`)
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ SUCCESS! Response:')
        console.log(JSON.stringify(data, null, 2))
        
        if (data.player && data.player.length > 0) {
          const player = data.player[0]
          console.log(`\n📊 Player Details:`)
          console.log(`   Name: ${player.name}`)
          console.log(`   ID: ${player.id}`)
          console.log(`   Role: ${player.role}`)
          console.log(`   Country: ${player.intlTeam || player.country || 'Unknown'}`)
          if (player.faceImageId) {
            console.log(`   Image: https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/${player.faceImageId}.png`)
          }
        }
      } else {
        const errorText = await response.text()
        console.log('❌ FAILED! Error:')
        console.log(errorText)
        
        if (response.status === 429) {
          console.log('\n⚠️  Rate limit exceeded! (500 requests/day limit reached)')
        } else if (response.status === 403) {
          console.log('\n⚠️  API Key issue - check if key is valid')
        } else if (response.status === 401) {
          console.log('\n⚠️  Unauthorized - API key may be invalid')
        }
      }
    } catch (error) {
      console.log('❌ REQUEST FAILED:', error.message)
    }
    
    // Wait 2 seconds between requests
    await new Promise(resolve => setTimeout(resolve, 2000))
  }
  
  console.log('\n\n✅ Test completed!')
}

// Run the test
testCricbuzzAPI().catch(console.error)
