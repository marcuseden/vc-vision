// Email integration (SendGrid example)
// Replace with your preferred email provider

interface EmailOptions {
  to: string[]
  cc?: string[]
  subject: string
  body: string
  from?: string
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const apiKey = process.env.SENDGRID_API_KEY
  
  if (!apiKey) {
    console.warn('SENDGRID_API_KEY not configured. Email not sent.')
    return false
  }

  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: options.to.map(email => ({ email })),
            cc: options.cc?.map(email => ({ email })),
            subject: options.subject,
          },
        ],
        from: {
          email: options.from || process.env.EMAIL_FROM || 'noreply@yourfund.com',
        },
        content: [
          {
            type: 'text/html',
            value: options.body,
          },
        ],
      }),
    })

    return response.ok
  } catch (error) {
    console.error('Failed to send email:', error)
    return false
  }
}

export function formatThankYouEmail(meeting: {
  companyName: string
  founderName?: string
  questions: string[]
  summary: string
}): string {
  const greeting = meeting.founderName 
    ? `Hi ${meeting.founderName},` 
    : `Hi,`

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
      <p>${greeting}</p>
      
      <p>Thank you for taking the time to meet with us today. It was great learning more about ${meeting.companyName}.</p>
      
      <p>Based on our conversation, we have a few follow-up questions:</p>
      
      <ul>
        ${meeting.questions.map(q => `<li>${q}</li>`).join('\n')}
      </ul>
      
      <p>Looking forward to continuing our conversation.</p>
      
      <p>Best regards,<br>
      The Team</p>
    </div>
  `
}

export function formatICEmail(meeting: {
  companyName: string
  summary: string
  keyTakeaways: string[]
  nextSteps: string[]
  risks: string[]
  opportunities: string[]
}): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto;">
      <h1 style="color: #1a1a1a; border-bottom: 2px solid #e5e5e5; padding-bottom: 10px;">
        ${meeting.companyName} - Meeting Summary
      </h1>
      
      <h2 style="color: #2563eb; margin-top: 30px;">Summary</h2>
      <p style="line-height: 1.6;">${meeting.summary}</p>
      
      <h2 style="color: #2563eb; margin-top: 30px;">Key Takeaways</h2>
      <ul style="line-height: 1.8;">
        ${meeting.keyTakeaways.map(t => `<li>${t}</li>`).join('\n')}
      </ul>
      
      <h2 style="color: #2563eb; margin-top: 30px;">Opportunities</h2>
      <ul style="line-height: 1.8;">
        ${meeting.opportunities.map(o => `<li>${o}</li>`).join('\n')}
      </ul>
      
      <h2 style="color: #dc2626; margin-top: 30px;">Risks & Concerns</h2>
      <ul style="line-height: 1.8;">
        ${meeting.risks.map(r => `<li>${r}</li>`).join('\n')}
      </ul>
      
      <h2 style="color: #2563eb; margin-top: 30px;">Next Steps</h2>
      <ul style="line-height: 1.8;">
        ${meeting.nextSteps.map(s => `<li>${s}</li>`).join('\n')}
      </ul>
    </div>
  `
}

