// Test backup Cricket API
const BACKUP_API_KEY = '3a9d8ee5-d5fc-49a6-820e-f1b2422952a3'
const BACKUP_API_URL = 'https://api.cricapi.com/v1'

async function testBackupAPI() {
  console.log('🔍 Testing Backup Cricket API...\n')
  
  const playerName = 'Virat Kohli'
  const url = `${BACKUP_API_URL}/players?apikey=${BACKUP_API_KEY}&search=${encodeURIComponent(playerName)}`
  
  console.log(`📡 URL: ${url}`)
  
  try {
    const response = await fetch(url)
    console.log(`Status: ${response.status} ${response.statusText}`)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Backup API is working!')
      console.log(JSON.stringify(data, null, 2))
    } else {
      const error = await response.text()
      console.log('❌ Backup API failed:', error)
    }
  } catch (error) {
    console.log('❌ Error:', error.message)
  }
}

testBackupAPI()
