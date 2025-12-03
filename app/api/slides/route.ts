import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { uploadFile, getPublicUrl } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const slideImage = formData.get('image') as File
    const meetingId = formData.get('meetingId') as string
    const slideNumber = parseInt(formData.get('slideNumber') as string)
    const timestamp = formData.get('timestamp') as string

    if (!slideImage || !meetingId || isNaN(slideNumber)) {
      return NextResponse.json(
        { error: 'Image, meetingId, and slideNumber required' },
        { status: 400 }
      )
    }

    // Upload slide image to storage
    const imageBuffer = Buffer.from(await slideImage.arrayBuffer())
    const imagePath = `meetings/${meetingId}/slides/slide-${slideNumber}.jpg`
    
    await uploadFile('slides', imagePath, imageBuffer)
    const imageUrl = getPublicUrl('slides', imagePath)

    // Create or update slide record
    const slide = await prisma.slide.upsert({
      where: {
        meetingId_slideNumber: {
          meetingId,
          slideNumber,
        },
      },
      create: {
        meetingId,
        slideNumber,
        imageUrl,
        timestamp: timestamp ? new Date(parseFloat(timestamp) * 1000) : null,
      },
      update: {
        imageUrl,
        timestamp: timestamp ? new Date(parseFloat(timestamp) * 1000) : null,
      },
    })

    return NextResponse.json({
      success: true,
      slide,
    })
  } catch (error) {
    console.error('Slide upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload slide' },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve all slides for a meeting
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

    const slides = await prisma.slide.findMany({
      where: { meetingId },
      orderBy: { slideNumber: 'asc' },
      include: {
        claims: true,
        questions: true,
        insights: true,
      },
    })

    return NextResponse.json({ slides })
  } catch (error) {
    console.error('Get slides error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve slides' },
      { status: 500 }
    )
  }
}

