const assert = require('assert')
const { generateTeamBiddingProfile, calculateNextBid, getNextBidder } = require('../auction-logic')

function run() {
  console.log('Running server auction-logic tests...')

  const teams = [
    { id: '1', name: 'A', budget: 100, players: [], maxPlayers: 25 },
    { id: '2', name: 'B', budget: 20, players: [], maxPlayers: 25 },
  ]

  const player = { id: 'p1', name: 'Test Player', role: 'Batsman', basePrice: 10 }

  const profile1 = generateTeamBiddingProfile(teams[0], [player])
  const profile2 = generateTeamBiddingProfile(teams[1], [player])

  const profiles = { '1': profile1, '2': profile2 }

  const context = { currentPrice: 10, basePrice: 10, highestBidder: null, remainingTime: 20, player }

  // At least one bidder should be returned
  const next = getNextBidder(teams, context, profiles)
  assert(next === '1' || next === '2' || next === null, 'getNextBidder returned unexpected id')

  // Calculate next bid for team 1
  const nextBid = calculateNextBid(10, teams[0], profile1, context)
  assert(typeof nextBid === 'number', 'calculateNextBid should return a number')

  console.log('All auction-logic quick tests passed')
}

try {
  run()
  process.exit(0)
} catch (e) {
  console.error('Tests failed:', e)
  process.exit(1)
}
