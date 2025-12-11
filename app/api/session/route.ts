// API Route: Session Management and Reconnection
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'

// Create or validate session
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, sessionToken, roomCode, userId, userName, teamId } = body
    
    if (action === 'create') {
      // Create new session
      const newSessionToken = randomBytes(32).toString('hex')
      
      const session = await prisma.userSession.create({
        data: {
          roomCode,
          userId,
          userName,
          teamId,
          sessionToken: newSessionToken,
          isActive: true,
        }
      })
      
      return NextResponse.json({
        success: true,
        sessionToken: newSessionToken,
        session
      })
    }
    
    if (action === 'validate') {
      // Validate existing session
      const session = await prisma.userSession.findUnique({
        where: { sessionToken }
      })
      
      if (!session || !session.isActive) {
        return NextResponse.json(
          { success: false, error: 'Invalid or expired session' },
          { status: 401 }
        )
      }
      
      // Update heartbeat
      await prisma.userSession.update({
        where: { sessionToken },
        data: { lastHeartbeat: new Date() }
      })
      
      return NextResponse.json({
        success: true,
        session
      })
    }
    
    if (action === 'reconnect') {
      // Reconnect to session
      const session = await prisma.userSession.findUnique({
        where: { sessionToken },
        include: {
          room: true
        }
      })
      
      if (!session) {
        return NextResponse.json(
          { success: false, error: 'Session not found' },
          { status: 404 }
        )
      }
      
      // Reactivate session
      await prisma.userSession.update({
        where: { sessionToken },
        data: { 
          isActive: true,
          lastHeartbeat: new Date()
        }
      })
      
      return NextResponse.json({
        success: true,
        session,
        roomState: session.room
      })
    }
    
    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error: any) {
    console.error('Session API error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// Get session info
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionToken = searchParams.get('token')
    const roomCode = searchParams.get('roomCode')
    
    if (sessionToken) {
      const session = await prisma.userSession.findUnique({
        where: { sessionToken },
        include: {
          room: true
        }
      })
      
      if (!session) {
        return NextResponse.json(
          { success: false, error: 'Session not found' },
          { status: 404 }
        )
      }
      
      return NextResponse.json({
        success: true,
        session
      })
    }
    
    if (roomCode) {
      const sessions = await prisma.userSession.findMany({
        where: { 
          roomCode,
          isActive: true
        }
      })
      
      return NextResponse.json({
        success: true,
        sessions,
        count: sessions.length
      })
    }
    
    return NextResponse.json(
      { success: false, error: 'Missing parameters' },
      { status: 400 }
    )
  } catch (error: any) {
    console.error('Session GET error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// Deactivate session (logout)
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionToken = searchParams.get('token')
    
    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: 'Session token required' },
        { status: 400 }
      )
    }
    
    await prisma.userSession.update({
      where: { sessionToken },
      data: { isActive: false }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Session deactivated'
    })
  } catch (error: any) {
    console.error('Session DELETE error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
