const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  try {
    console.log('Checking database connection...')
    // Try to count rooms to see if connection works
    const count = await prisma.auctionRoom.count()
    console.log(`Found ${count} rooms.`)
    
    const playerCount = await prisma.player.count()
    console.log(`Found ${playerCount} players.`)
    
    // Try to create a dummy room to check schema
    console.log('Attempting to create a test room...')
    const room = await prisma.auctionRoom.create({
      data: {
        roomCode: 'TEST_' + Date.now(),
        hostName: 'Tester',
        hostId: 'test-id',
        status: 'lobby',
        teams: [],
        availablePlayers: [],
        soldPlayers: [],
        unsoldPlayers: [],
        minTeams: 2,
        maxTeams: 8 // This is the field that was missing
      }
    })
    console.log('Successfully created room:', room.roomCode)
    
    // Clean up
    await prisma.auctionRoom.delete({
      where: { id: room.id }
    })
    console.log('Cleaned up test room.')
    
  } catch (e) {
    console.error('Error:', e)
  } finally {
    await prisma.$disconnect()
  }
}

main()
