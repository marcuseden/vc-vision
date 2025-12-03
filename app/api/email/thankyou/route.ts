import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateThankYouEmail } from '@/lib/agents/emailAgent'

export async function POST(request: NextRequest) {
  try {
    const { meetingId, founderName, founderEmail } = await request.json()

    if (!meetingId || !founderName || !founderEmail) {
      return NextResponse.json(
        { error: 'meetingId, founderName, and founderEmail required' },
        { status: 400 }
      )
    }

    // Get meeting data
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
      include: {
        deal: true,
        questions: {
          where: { asked: false },
          orderBy: { priority: 'desc' },
          take: 5,
        },
      },
    })

    if (!meeting) {
      return NextResponse.json(
        { error: 'Meeting not found' },
        { status: 404 }
      )
    }

    // Generate email
    const emailDraft = await generateThankYouEmail(
      meeting.deal.companyName,
      founderName,
      meeting.keyTakeaways || [],
      meeting.questions.map(q => q.questionText)
    )

    // Save email draft
    const email = await prisma.email.create({
      data: {
        meetingId,
        type: 'thank_you',
        subject: emailDraft.subject,
        body: emailDraft.body,
        to: [founderEmail],
        cc: [],
      },
    })

    return NextResponse.json({
      success: true,
      email,
      emailDraft,
    })
  } catch (error) {
    console.error('Thank you email generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate email' },
      { status: 500 }
    )
  }
}

