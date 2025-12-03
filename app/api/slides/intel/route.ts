import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { analyzeSlide, generateQuestionsForSlide } from '@/lib/agents/slideIntelAgent'
import { generateSpeech } from '@/lib/openai'
import { uploadFile, getPublicUrl } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { slideId } = await request.json()

    if (!slideId) {
      return NextResponse.json(
        { error: 'slideId required' },
        { status: 400 }
      )
    }

    // Get slide with meeting context
    const slide = await prisma.slide.findUnique({
      where: { id: slideId },
      include: {
        meeting: {
          include: {
            deal: true,
          },
        },
      },
    })

    if (!slide || !slide.imageUrl) {
      return NextResponse.json(
        { error: 'Slide not found or missing image' },
        { status: 404 }
      )
    }

    // Analyze slide
    const analysis = await analyzeSlide(
      slide.imageUrl,
      slide.slideNumber,
      slide.meeting.deal.description || undefined
    )

    // Update slide with extracted text
    await prisma.slide.update({
      where: { id: slideId },
      data: {
        text: analysis.text,
      },
    })

    // Save claims
    const claimPromises = analysis.claims.map(claim =>
      prisma.claim.create({
        data: {
          meetingId: slide.meetingId,
          slideId: slide.id,
          claimText: claim.text,
          claimType: claim.type,
          confidence: claim.confidence,
        },
      })
    )
    await Promise.all(claimPromises)

    // Generate and save questions
    const questions = await generateQuestionsForSlide(analysis, slide.slideNumber)
    
    const questionPromises = questions.map(q =>
      prisma.question.create({
        data: {
          meetingId: slide.meetingId,
          slideId: slide.id,
          questionText: q.text,
          category: q.category,
          priority: q.priority,
        },
      })
    )
    const savedQuestions = await Promise.all(questionPromises)

    // Generate TTS for top 2 questions
    const topQuestions = savedQuestions
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 2)

    const ttsPromises = topQuestions.map(async (q) => {
      const audioBuffer = await generateSpeech(q.questionText)
      const audioPath = `meetings/${slide.meetingId}/questions/q-${q.id}.mp3`
      await uploadFile('audio', audioPath, audioBuffer)
      return {
        questionId: q.id,
        audioUrl: getPublicUrl('audio', audioPath),
      }
    })
    const questionAudio = await Promise.all(ttsPromises)

    return NextResponse.json({
      success: true,
      analysis: {
        text: analysis.text,
        description: analysis.description,
        keyPoints: analysis.keyPoints,
      },
      claims: analysis.claims,
      questions: savedQuestions,
      questionAudio,
    })
  } catch (error) {
    console.error('Slide intelligence error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze slide' },
      { status: 500 }
    )
  }
}

