import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Create a new meeting
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { dealId, userId, title, date } = body

    if (!dealId || !userId || !title) {
      return NextResponse.json(
        { error: 'dealId, userId, and title required' },
        { status: 400 }
      )
    }

    const meeting = await prisma.meeting.create({
      data: {
        dealId,
        userId,
        title,
        date: date ? new Date(date) : new Date(),
        status: 'in_progress',
      },
      include: {
        deal: true,
        user: true,
      },
    })

    return NextResponse.json({
      success: true,
      meeting,
    })
  } catch (error) {
    console.error('Create meeting error:', error)
    return NextResponse.json(
      { error: 'Failed to create meeting' },
      { status: 500 }
    )
  }
}

// Get meetings (with filters)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dealId = searchParams.get('dealId')
    const userId = searchParams.get('userId')
    const status = searchParams.get('status')
    const meetingId = searchParams.get('id')

    // Get single meeting
    if (meetingId) {
      const meeting = await prisma.meeting.findUnique({
        where: { id: meetingId },
        include: {
          deal: true,
          user: true,
          slides: {
            orderBy: { slideNumber: 'asc' },
            include: {
              claims: true,
              questions: true,
            },
          },
          transcript: {
            orderBy: { timestamp: 'asc' },
          },
          questions: {
            orderBy: { priority: 'desc' },
          },
          claims: true,
          followUps: {
            orderBy: { dueDate: 'asc' },
          },
          emails: {
            orderBy: { createdAt: 'desc' },
          },
          comments: {
            include: {
              user: true,
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      })

      if (!meeting) {
        return NextResponse.json(
          { error: 'Meeting not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({ meeting })
    }

    // Get multiple meetings with filters
    const where: any = {}
    if (dealId) where.dealId = dealId
    if (userId) where.userId = userId
    if (status) where.status = status

    const meetings = await prisma.meeting.findMany({
      where,
      include: {
        deal: true,
        user: true,
        _count: {
          select: {
            slides: true,
            questions: true,
            claims: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    })

    return NextResponse.json({ meetings })
  } catch (error) {
    console.error('Get meetings error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve meetings' },
      { status: 500 }
    )
  }
}

// Update meeting
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { meetingId, ...updates } = body

    if (!meetingId) {
      return NextResponse.json(
        { error: 'meetingId required' },
        { status: 400 }
      )
    }

    const meeting = await prisma.meeting.update({
      where: { id: meetingId },
      data: updates,
    })

    return NextResponse.json({
      success: true,
      meeting,
    })
  } catch (error) {
    console.error('Update meeting error:', error)
    return NextResponse.json(
      { error: 'Failed to update meeting' },
      { status: 500 }
    )
  }
}

