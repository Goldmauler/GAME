// IPL Player Database Seed Script
// Run: node --loader ts-node/esm prisma/seed-players.ts

import { PrismaClient } from '@prisma/client'
import { fetchPlayerData } from '../lib/cricbuzz-api'

const prisma = new PrismaClient()

// IPL 2024 Top Players with base prices (in lakhs ₹)
const IPL_PLAYERS = [
  // Mumbai Indians
  { name: 'Rohit Sharma', role: 'BATSMAN', basePrice: 1500, country: 'India' },
  { name: 'Jasprit Bumrah', role: 'BOWLER', basePrice: 1200, country: 'India' },
  { name: 'Suryakumar Yadav', role: 'BATSMAN', basePrice: 800, country: 'India' },
  { name: 'Ishan Kishan', role: 'WICKET_KEEPER', basePrice: 1525, country: 'India' },
  { name: 'Hardik Pandya', role: 'ALL_ROUNDER', basePrice: 1500, country: 'India' },
  { name: 'Tim David', role: 'ALL_ROUNDER', basePrice: 800, country: 'Australia' },
  { name: 'Cameron Green', role: 'ALL_ROUNDER', basePrice: 1750, country: 'Australia' },
  
  // Chennai Super Kings
  { name: 'MS Dhoni', role: 'WICKET_KEEPER', basePrice: 1200, country: 'India' },
  { name: 'Ravindra Jadeja', role: 'ALL_ROUNDER', basePrice: 1600, country: 'India' },
  { name: 'Ruturaj Gaikwad', role: 'BATSMAN', basePrice: 900, country: 'India' },
  { name: 'Devon Conway', role: 'BATSMAN', basePrice: 100, country: 'New Zealand' },
  { name: 'Deepak Chahar', role: 'BOWLER', basePrice: 1400, country: 'India' },
  { name: 'Moeen Ali', role: 'ALL_ROUNDER', basePrice: 800, country: 'England' },
  { name: 'Tushar Deshpande', role: 'BOWLER', basePrice: 20, country: 'India' },
  
  // Royal Challengers Bangalore
  { name: 'Virat Kohli', role: 'BATSMAN', basePrice: 1500, country: 'India' },
  { name: 'Faf du Plessis', role: 'BATSMAN', basePrice: 700, country: 'South Africa' },
  { name: 'Glenn Maxwell', role: 'ALL_ROUNDER', basePrice: 1100, country: 'Australia' },
  { name: 'Mohammed Siraj', role: 'BOWLER', basePrice: 700, country: 'India' },
  { name: 'Dinesh Karthik', role: 'WICKET_KEEPER', basePrice: 550, country: 'India' },
  { name: 'Wanindu Hasaranga', role: 'BOWLER', basePrice: 1075, country: 'Sri Lanka' },
  
  // Kolkata Knight Riders
  { name: 'Shreyas Iyer', role: 'BATSMAN', basePrice: 1225, country: 'India' },
  { name: 'Andre Russell', role: 'ALL_ROUNDER', basePrice: 1200, country: 'West Indies' },
  { name: 'Sunil Narine', role: 'ALL_ROUNDER', basePrice: 600, country: 'West Indies' },
  { name: 'Rinku Singh', role: 'BATSMAN', basePrice: 55, country: 'India' },
  { name: 'Mitchell Starc', role: 'BOWLER', basePrice: 2475, country: 'Australia' },
  { name: 'Varun Chakaravarthy', role: 'BOWLER', basePrice: 800, country: 'India' },
  
  // Delhi Capitals
  { name: 'Rishabh Pant', role: 'WICKET_KEEPER', basePrice: 1600, country: 'India' },
  { name: 'David Warner', role: 'BATSMAN', basePrice: 625, country: 'Australia' },
  { name: 'Axar Patel', role: 'ALL_ROUNDER', basePrice: 900, country: 'India' },
  { name: 'Kuldeep Yadav', role: 'BOWLER', basePrice: 200, country: 'India' },
  { name: 'Mitchell Marsh', role: 'ALL_ROUNDER', basePrice: 650, country: 'Australia' },
  { name: 'Prithvi Shaw', role: 'BATSMAN', basePrice: 750, country: 'India' },
  
  // Rajasthan Royals
  { name: 'Sanju Samson', role: 'WICKET_KEEPER', basePrice: 1400, country: 'India' },
  { name: 'Jos Buttler', role: 'WICKET_KEEPER', basePrice: 1000, country: 'England' },
  { name: 'Yashasvi Jaiswal', role: 'BATSMAN', basePrice: 400, country: 'India' },
  { name: 'Yuzvendra Chahal', role: 'BOWLER', basePrice: 650, country: 'India' },
  { name: 'Trent Boult', role: 'BOWLER', basePrice: 800, country: 'New Zealand' },
  { name: 'Shimron Hetmyer', role: 'BATSMAN', basePrice: 850, country: 'West Indies' },
  
  // Punjab Kings
  { name: 'Shikhar Dhawan', role: 'BATSMAN', basePrice: 825, country: 'India' },
  { name: 'Liam Livingstone', role: 'ALL_ROUNDER', basePrice: 1150, country: 'England' },
  { name: 'Kagiso Rabada', role: 'BOWLER', basePrice: 925, country: 'South Africa' },
  { name: 'Sam Curran', role: 'ALL_ROUNDER', basePrice: 1850, country: 'England' },
  { name: 'Arshdeep Singh', role: 'BOWLER', basePrice: 400, country: 'India' },
  { name: 'Jonny Bairstow', role: 'WICKET_KEEPER', basePrice: 675, country: 'England' },
  
  // Sunrisers Hyderabad
  { name: 'Aiden Markram', role: 'BATSMAN', basePrice: 260, country: 'South Africa' },
  { name: 'Travis Head', role: 'BATSMAN', basePrice: 650, country: 'Australia' },
  { name: 'Heinrich Klaasen', role: 'WICKET_KEEPER', basePrice: 525, country: 'South Africa' },
  { name: 'Bhuvneshwar Kumar', role: 'BOWLER', basePrice: 425, country: 'India' },
  { name: 'Pat Cummins', role: 'BOWLER', basePrice: 2050, country: 'Australia' },
  { name: 'Abhishek Sharma', role: 'ALL_ROUNDER', basePrice: 65, country: 'India' },
  
  // Gujarat Titans
  { name: 'Shubman Gill', role: 'BATSMAN', basePrice: 800, country: 'India' },
  { name: 'Rashid Khan', role: 'BOWLER', basePrice: 1500, country: 'Afghanistan' },
  { name: 'Mohammed Shami', role: 'BOWLER', basePrice: 625, country: 'India' },
  { name: 'David Miller', role: 'BATSMAN', basePrice: 300, country: 'South Africa' },
  
  // Lucknow Super Giants
  { name: 'KL Rahul', role: 'WICKET_KEEPER', basePrice: 1700, country: 'India' },
  { name: 'Nicholas Pooran', role: 'WICKET_KEEPER', basePrice: 1600, country: 'West Indies' },
  { name: 'Quinton de Kock', role: 'WICKET_KEEPER', basePrice: 675, country: 'South Africa' },
  { name: 'Marcus Stoinis', role: 'ALL_ROUNDER', basePrice: 900, country: 'Australia' },
  { name: 'Krunal Pandya', role: 'ALL_ROUNDER', basePrice: 825, country: 'India' },
  { name: 'Ravi Bishnoi', role: 'BOWLER', basePrice: 400, country: 'India' },
  
  // Additional Top Players
  { name: 'Ben Stokes', role: 'ALL_ROUNDER', basePrice: 1625, country: 'England' },
  { name: 'Jofra Archer', role: 'BOWLER', basePrice: 800, country: 'England' },
  { name: 'Chris Gayle', role: 'BATSMAN', basePrice: 200, country: 'West Indies' },
  { name: 'AB de Villiers', role: 'BATSMAN', basePrice: 1100, country: 'South Africa' },
  { name: 'Steve Smith', role: 'BATSMAN', basePrice: 220, country: 'Australia' },
  { name: 'Kane Williamson', role: 'BATSMAN', basePrice: 200, country: 'New Zealand' },
  { name: 'Umran Malik', role: 'BOWLER', basePrice: 400, country: 'India' },
  { name: 'Washington Sundar', role: 'ALL_ROUNDER', basePrice: 875, country: 'India' },
  { name: 'Nitish Rana', role: 'BATSMAN', basePrice: 800, country: 'India' },
]

async function seedPlayers() {
  console.log('🏏 Starting IPL Player Database Seeding...\n')
  
  let successCount = 0
  let failCount = 0
  
  for (const playerData of IPL_PLAYERS) {
    try {
      console.log(`Fetching data for ${playerData.name}...`)
      
      // Try to fetch from API
      const apiData = await fetchPlayerData(playerData.name)
      
      // Create or update player in database
      const player = await prisma.player.upsert({
        where: { name: playerData.name },
        update: {
          role: apiData?.role || playerData.role,
          country: apiData?.country || playerData.country,
          basePrice: playerData.basePrice,
          imageUrl: apiData?.imageUrl || getPlaceholderImage(playerData.name),
          stats: apiData?.stats || undefined,
          cricbuzzId: apiData?.id || null,
        },
        create: {
          name: playerData.name,
          role: apiData?.role || playerData.role,
          country: apiData?.country || playerData.country,
          basePrice: playerData.basePrice,
          imageUrl: apiData?.imageUrl || getPlaceholderImage(playerData.name),
          stats: apiData?.stats || undefined,
          cricbuzzId: apiData?.id || null,
        }
      })
      
      console.log(`✅ Added: ${player.name} (${player.role}) - ₹${player.basePrice}L`)
      successCount++
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500))
      
    } catch (error) {
      console.error(`❌ Failed to add ${playerData.name}:`, error)
      failCount++
    }
  }
  
  console.log(`\n📊 Seeding Summary:`)
  console.log(`✅ Success: ${successCount} players`)
  console.log(`❌ Failed: ${failCount} players`)
  console.log(`📦 Total: ${IPL_PLAYERS.length} players`)
}

function getPlaceholderImage(playerName: string): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(playerName)}&size=320&background=1e293b&color=f97316&bold=true`
}

// Run the seed
seedPlayers()
  .then(() => {
    console.log('\n✅ Player seeding completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Seeding failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
