const WebSocket = require('ws')
const assert = require('assert')

function runE2ETest() {
  console.log('Running end-to-end auction server test...')
  
  return new Promise((resolve, reject) => {
    let server
    let testPassed = false
    const timeout = setTimeout(() => {
      if (!testPassed) {
        reject(new Error('Test timeout - server did not respond in time'))
      }
    }, 5000)

    try {
      // Start server as child process
      const { spawn } = require('child_process')
      server = spawn('node', ['server/auction-server.js'], {
        env: { ...process.env, AUCTION_PORT: '8081' }
      })

      let serverReady = false
      
      server.stdout.on('data', (data) => {
        const output = data.toString()
        console.log('Server:', output.trim())
        if (output.includes('Auction server starting')) {
          serverReady = true
          // Give server a moment to fully bind
          setTimeout(() => testWebSocket(), 500)
        }
      })

      server.stderr.on('data', (data) => {
        console.error('Server error:', data.toString())
      })

      function testWebSocket() {
        console.log('Connecting WebSocket client...')
        const ws = new WebSocket('ws://localhost:8081')
        
        ws.on('open', () => {
          console.log('✓ WebSocket connected')
          ws.send(JSON.stringify({ type: 'join', teamId: '1' }))
        })

        ws.on('message', (data) => {
          try {
            const msg = JSON.parse(data.toString())
            console.log('Received message type:', msg.type)

            if (msg.type === 'welcome') {
              console.log('✓ Received welcome message')
              assert(msg.payload.teams, 'Welcome should include teams')
              assert(msg.payload.players, 'Welcome should include players')
              assert(msg.payload.auctionState, 'Welcome should include auctionState')
              console.log(`  Teams: ${msg.payload.teams.length}`)
              console.log(`  Players: ${msg.payload.players.length}`)
              console.log(`  Auction phase: ${msg.payload.auctionState.phase}`)
            }

            if (msg.type === 'state') {
              console.log('✓ Received state update')
              assert(msg.payload.teams, 'State should include teams')
              assert(msg.payload.auctionState, 'State should include auctionState')
            }

            if (msg.type === 'joined') {
              console.log('✓ Received joined confirmation')
            }

            // Try placing a bid only once after receiving welcome
            if (!testPassed && msg.type === 'welcome') {
              const auctionState = msg.payload.auctionState
              if (auctionState && auctionState.phase === 'active') {
                const bidAmount = auctionState.currentPrice + 1
                console.log(`Placing test bid: ${bidAmount}Cr`)
                ws.send(JSON.stringify({ 
                  type: 'bid', 
                  payload: { teamId: '1', amount: bidAmount } 
                }))
                
                // Wait for state confirmation then end test
                setTimeout(() => {
                  testPassed = true
                  ws.close()
                  cleanup()
                }, 1500)
              }
            }
          } catch (e) {
            console.error('Message parse error:', e)
          }
        })

        ws.on('error', (err) => {
          console.error('WebSocket error:', err.message)
          cleanup(err)
        })

        ws.on('close', () => {
          console.log('WebSocket closed')
        })
      }

      function cleanup(error) {
        clearTimeout(timeout)
        if (server) {
          server.kill()
        }
        if (error) {
          reject(error)
        } else if (testPassed) {
          resolve()
        }
      }

    } catch (e) {
      clearTimeout(timeout)
      if (server) server.kill()
      reject(e)
    }
  })
}

async function run() {
  try {
    await runE2ETest()
    console.log('\n✅ End-to-end auction server test passed!')
    process.exit(0)
  } catch (e) {
    console.error('\n❌ E2E test failed:', e.message)
    process.exit(1)
  }
}

run()
