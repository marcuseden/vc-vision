import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { extractFollowUps, suggestMeetingAgenda } from '@/lib/agents/followupAgent'
import { detectFollowUpIntent } from '@/lib/agents/emailAgent'
import { suggestFollowUpTimes, formatTimeOptions } from '@/lib/calendar'

export async function POST(request: NextRequest) {
  try {
    const { meetingId, action } = await request.json()

    if (!meetingId) {
      return NextResponse.json(
        { error: 'meetingId required' },
        { status: 400 }
      )
    }

    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
      include: {
        deal: true,
        transcript: {
          orderBy: { timestamp: 'asc' },
        },
        questions: {
          where: { asked: false },
        },
      },
    })

    if (!meeting) {
      return NextResponse.json(
        { error: 'Meeting not found' },
        { status: 404 }
      )
    }

    const fullTranscript = meeting.transcript.map(s => s.text).join('\n\n')

    if (action === 'extract') {
      // Extract follow-up items from meeting
      const followUps = await extractFollowUps(
        fullTranscript,
        meeting.summary || ''
      )

      // Save follow-ups
      const savedFollowUps = await Promise.all(
        followUps.map(item =>
          prisma.followUp.create({
            data: {
              meetingId,
              title: item.title,
              description: item.description,
              dueDate: item.dueDate,
            },
          })
        )
      )

      return NextResponse.json({
        success: true,
        followUps: savedFollowUps,
      })
    } else if (action === 'detect_intent') {
      // Detect if follow-up meeting is needed
      const intent = await detectFollowUpIntent(fullTranscript)

      return NextResponse.json({
        success: true,
        intent,
      })
    } else if (action === 'suggest_meeting') {
      // Suggest follow-up meeting agenda and times
      const outstandingQuestions = meeting.questions.map(q => q.questionText)

      const agenda = await suggestMeetingAgenda(
        meeting.deal.companyName,
        meeting.summary || '',
        outstandingQuestions
      )

      const timeOptions = await suggestFollowUpTimes(
        agenda.suggestedDuration || 30
      )

      return NextResponse.json({
        success: true,
        agenda,
        timeOptions: formatTimeOptions(timeOptions),
        rawTimes: timeOptions,
      })
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Follow-up error:', error)
    return NextResponse.json(
      { error: 'Failed to process follow-up' },
      { status: 500 }
    )
  }
}

// Update follow-up status
export async function PATCH(request: NextRequest) {
  try {
    const { followUpId, completed } = await request.json()

    if (!followUpId) {
      return NextResponse.json(
        { error: 'followUpId required' },
        { status: 400 }
      )
    }

    const followUp = await prisma.followUp.update({
      where: { id: followUpId },
      data: {
        completed: completed ?? true,
        completedAt: completed ? new Date() : null,
      },
    })

    return NextResponse.json({
      success: true,
      followUp,
    })
  } catch (error) {
    console.error('Update follow-up error:', error)
    return NextResponse.json(
      { error: 'Failed to update follow-up' },
      { status: 500 }
    )
  }
}

