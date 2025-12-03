import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateMeetingSummary, extractActionItems } from '@/lib/agents/summaryAgent'
import { notifyTeamOfNewMeeting } from '@/lib/slack'

export async function POST(request: NextRequest) {
  try {
    const { meetingId } = await request.json()

    if (!meetingId) {
      return NextResponse.json(
        { error: 'meetingId required' },
        { status: 400 }
      )
    }

    // Get meeting with all related data
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
      include: {
        deal: true,
        slides: {
          orderBy: { slideNumber: 'asc' },
          include: {
            claims: true,
          },
        },
        transcript: {
          orderBy: { timestamp: 'asc' },
        },
        questions: {
          orderBy: { priority: 'desc' },
        },
        claims: true,
      },
    })

    if (!meeting) {
      return NextResponse.json(
        { error: 'Meeting not found' },
        { status: 404 }
      )
    }

    // Build full transcript
    const fullTranscript = meeting.transcript.map(s => s.text).join('\n\n')

    // Prepare input for summary generation
    const summaryInput = {
      companyName: meeting.deal.companyName,
      transcript: fullTranscript,
      slides: meeting.slides.map(s => ({
        slideNumber: s.slideNumber,
        text: s.text || '',
        keyPoints: [], // Would extract from claims
      })),
      claims: meeting.claims.map(c => ({
        text: c.claimText,
        type: c.claimType,
      })),
      questions: meeting.questions.map(q => ({
        text: q.questionText,
        answer: q.answer || undefined,
      })),
    }

    // Generate summary
    const summary = await generateMeetingSummary(summaryInput)

    // Extract action items
    const actionItems = await extractActionItems(fullTranscript)

    // Update meeting with summary
    await prisma.meeting.update({
      where: { id: meetingId },
      data: {
        summary: summary.executiveSummary,
        keyTakeaways: summary.keyTakeaways,
        nextSteps: summary.nextSteps,
        status: 'completed',
      },
    })

    // Save follow-ups
    const followUpPromises = actionItems.map(item =>
      prisma.followUp.create({
        data: {
          meetingId,
          title: item,
          description: item,
        },
      })
    )
    await Promise.all(followUpPromises)

    // Save insights
    const insightPromises = [
      ...summary.opportunities.map((opp: string) =>
        prisma.insight.create({
          data: {
            dealId: meeting.dealId,
            insightType: 'opportunity',
            title: 'Opportunity',
            description: opp,
          },
        })
      ),
      ...summary.concerns.map((concern: string) =>
        prisma.insight.create({
          data: {
            dealId: meeting.dealId,
            insightType: 'risk',
            title: 'Risk/Concern',
            description: concern,
            severity: 'medium',
          },
        })
      ),
    ]
    await Promise.all(insightPromises)

    // Notify team via Slack
    await notifyTeamOfNewMeeting({
      id: meeting.id,
      companyName: meeting.deal.companyName,
      summary: summary.executiveSummary,
      keyTakeaways: summary.keyTakeaways,
    })

    return NextResponse.json({
      success: true,
      summary,
      actionItems,
    })
  } catch (error) {
    console.error('Summary generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    )
  }
}

