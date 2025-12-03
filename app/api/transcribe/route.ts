import { NextRequest, NextResponse } from 'next/server'
import { transcribeAudio } from '@/lib/openai'
import { prisma } from '@/lib/db'
import { uploadFile, getPublicUrl } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File
    const meetingId = formData.get('meetingId') as string
    const timestamp = formData.get('timestamp') as string

    if (!audioFile || !meetingId) {
      return NextResponse.json(
        { error: 'Audio file and meetingId required' },
        { status: 400 }
      )
    }

    // Upload audio to storage
    const audioBuffer = Buffer.from(await audioFile.arrayBuffer())
    const audioPath = `meetings/${meetingId}/audio-${Date.now()}.m4a`
    
    await uploadFile('audio', audioPath, audioBuffer)
    const audioUrl = getPublicUrl('audio', audioPath)

    // Transcribe audio
    const transcriptText = await transcribeAudio(audioBuffer)

    // Save transcript segment
    const segment = await prisma.transcriptSegment.create({
      data: {
        meetingId,
        text: transcriptText,
        timestamp: parseFloat(timestamp) || 0,
        speaker: 'founder', // Default, can be enhanced with speaker detection
      },
    })

    // Update meeting with audio URL if not set
    await prisma.meeting.update({
      where: { id: meetingId },
      data: {
        audioUrl: audioUrl,
      },
    })

    return NextResponse.json({
      success: true,
      segment,
      transcriptText,
    })
  } catch (error) {
    console.error('Transcription error:', error)
    return NextResponse.json(
      { error: 'Failed to transcribe audio' },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve full transcript for a meeting
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const meetingId = searchParams.get('meetingId')

    if (!meetingId) {
      return NextResponse.json(
        { error: 'meetingId required' },
        { status: 400 }
      )
    }

    const segments = await prisma.transcriptSegment.findMany({
      where: { meetingId },
      orderBy: { timestamp: 'asc' },
    })

    const fullTranscript = segments.map(s => s.text).join('\n\n')

    return NextResponse.json({
      segments,
      fullTranscript,
    })
  } catch (error) {
    console.error('Get transcript error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve transcript' },
      { status: 500 }
    )
  }
}

