import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { emailId } = await request.json()

    if (!emailId) {
      return NextResponse.json(
        { error: 'emailId required' },
        { status: 400 }
      )
    }

    // Get email
    const email = await prisma.email.findUnique({
      where: { id: emailId },
    })

    if (!email) {
      return NextResponse.json(
        { error: 'Email not found' },
        { status: 404 }
      )
    }

    if (email.sent) {
      return NextResponse.json(
        { error: 'Email already sent' },
        { status: 400 }
      )
    }

    // Send email
    const success = await sendEmail({
      to: email.to,
      cc: email.cc,
      subject: email.subject,
      body: email.body,
    })

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      )
    }

    // Update email status
    await prisma.email.update({
      where: { id: emailId },
      data: {
        sent: true,
        sentAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error('Send email error:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}

