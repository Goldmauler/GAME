const assert = require('assert')
const { calculateTeamRating } = require('../team-rating')

function run() {
  console.log('Running team-rating tests...')

  // Test 1: Empty team
  const emptyTeam = { id: '1', name: 'Empty', budget: 100, players: [] }
  const emptyRating = calculateTeamRating(emptyTeam)
  assert(emptyRating.overallScore >= 0, 'Empty team should have non-negative score')
  assert(Array.isArray(emptyRating.strengths), 'Strengths should be an array')
  assert(Array.isArray(emptyRating.weaknesses), 'Weaknesses should be an array')
  console.log('✓ Empty team test passed')

  // Test 2: Balanced team
  const balancedTeam = {
    id: '2',
    name: 'Balanced',
    budget: 50,
    players: [
      { id: 'p1', name: 'Batsman1', role: 'Batsman', basePrice: 50 },
      { id: 'p2', name: 'Batsman2', role: 'Batsman', basePrice: 40 },
      { id: 'p3', name: 'Batsman3', role: 'Batsman', basePrice: 30 },
      { id: 'p4', name: 'Batsman4', role: 'Batsman', basePrice: 30 },
      { id: 'p5', name: 'Batsman5', role: 'Batsman', basePrice: 20 },
      { id: 'p6', name: 'Batsman6', role: 'Batsman', basePrice: 20 },
      { id: 'p7', name: 'Bowler1', role: 'Bowler', basePrice: 40 },
      { id: 'p8', name: 'Bowler2', role: 'Bowler', basePrice: 35 },
      { id: 'p9', name: 'Bowler3', role: 'Bowler', basePrice: 30 },
      { id: 'p10', name: 'Bowler4', role: 'Bowler', basePrice: 25 },
      { id: 'p11', name: 'Bowler5', role: 'Bowler', basePrice: 20 },
      { id: 'p12', name: 'AR1', role: 'All-rounder', basePrice: 45 },
      { id: 'p13', name: 'AR2', role: 'All-rounder', basePrice: 35 },
      { id: 'p14', name: 'AR3', role: 'All-rounder', basePrice: 25 },
      { id: 'p15', name: 'WK1', role: 'Wicket-keeper', basePrice: 30 },
    ]
  }
  const balancedRating = calculateTeamRating(balancedTeam)
  assert(balancedRating.overallScore > 0, 'Balanced team should have positive score')
  assert(balancedRating.battingScore > 0, 'Should have batting score')
  assert(balancedRating.bowlingScore > 0, 'Should have bowling score')
  assert(balancedRating.balanceScore > 0, 'Should have balance score')
  console.log(`✓ Balanced team test passed (Overall: ${balancedRating.overallScore})`)

  // Test 3: Batting-heavy team
  const battingTeam = {
    id: '3',
    name: 'Batting Heavy',
    budget: 20,
    players: [
      ...Array.from({ length: 15 }, (_, i) => ({
        id: `bat${i}`,
        name: `Batsman${i}`,
        role: 'Batsman',
        basePrice: 50 + i
      }))
    ]
  }
  const battingRating = calculateTeamRating(battingTeam)
  assert(battingRating.battingScore >= battingRating.bowlingScore, 'Batting-heavy team should have higher batting score')
  console.log(`✓ Batting-heavy team test passed (Batting: ${battingRating.battingScore}, Bowling: ${battingRating.bowlingScore})`)

  // Test 4: Premium players team
  const premiumTeam = {
    id: '4',
    name: 'Premium',
    budget: 10,
    players: [
      { id: 'p1', name: 'Star1', role: 'Batsman', basePrice: 80 },
      { id: 'p2', name: 'Star2', role: 'Batsman', basePrice: 75 },
      { id: 'p3', name: 'Star3', role: 'Bowler', basePrice: 70 },
      { id: 'p4', name: 'Star4', role: 'All-rounder', basePrice: 65 },
    ]
  }
  const premiumRating = calculateTeamRating(premiumTeam)
  assert(premiumRating.strengths.some(s => s.includes('premium')), 'Premium team should be recognized')
  console.log(`✓ Premium team test passed (Strengths: ${premiumRating.strengths.join(', ')})`)

  // Test 5: Weaknesses detection
  const weakTeam = {
    id: '5',
    name: 'Weak',
    budget: 90,
    players: [
      { id: 'p1', name: 'Cheap1', role: 'Batsman', basePrice: 5 },
      { id: 'p2', name: 'Cheap2', role: 'Batsman', basePrice: 5 },
    ]
  }
  const weakRating = calculateTeamRating(weakTeam)
  assert(weakRating.weaknesses.length > 0, 'Weak team should have weaknesses identified')
  console.log(`✓ Weak team test passed (Weaknesses: ${weakRating.weaknesses.join(', ')})`)

  // Test 6: Recommendations
  const incompleteTeam = {
    id: '6',
    name: 'Incomplete',
    budget: 60,
    players: [
      { id: 'p1', name: 'B1', role: 'Batsman', basePrice: 20 },
      { id: 'p2', name: 'B2', role: 'Batsman', basePrice: 20 },
    ]
  }
  const incompleteRating = calculateTeamRating(incompleteTeam)
  assert(incompleteRating.recommendations.length > 0, 'Incomplete team should have recommendations')
  console.log(`✓ Incomplete team test passed (Recommendations: ${incompleteRating.recommendations.length} items)`)

  // Test 7: Full squad
  const fullTeam = {
    id: '7',
    name: 'Full',
    budget: 5,
    players: Array.from({ length: 25 }, (_, i) => ({
      id: `p${i}`,
      name: `Player${i}`,
      role: ['Batsman', 'Bowler', 'All-rounder', 'Wicket-keeper'][i % 4],
      basePrice: 30 + (i % 10)
    }))
  }
  const fullRating = calculateTeamRating(fullTeam)
  assert(fullRating.insights.some(ins => ins.includes('Full squad')), 'Full squad should be recognized')
  console.log(`✓ Full squad test passed`)

  console.log('\n✅ All team-rating tests passed!')
}

try {
  run()
  process.exit(0)
} catch (e) {
  console.error('❌ Tests failed:', e.message)
  console.error(e.stack)
  process.exit(1)
}
