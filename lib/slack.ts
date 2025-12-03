// Slack integration for internal team notifications

interface SlackMessage {
  text: string
  blocks?: any[]
  channel?: string
}

export async function sendSlackNotification(message: SlackMessage): Promise<boolean> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL
  
  if (!webhookUrl) {
    console.warn('SLACK_WEBHOOK_URL not configured. Notification not sent.')
    return false
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    })

    return response.ok
  } catch (error) {
    console.error('Failed to send Slack notification:', error)
    return false
  }
}

export function formatMeetingSummarySlackMessage(meeting: {
  id: string
  companyName: string
  summary: string
  keyTakeaways: string[]
  appUrl: string
}): SlackMessage {
  return {
    text: `New meeting summary: ${meeting.companyName}`,
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `📊 ${meeting.companyName} - Meeting Complete`,
          emoji: true,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: meeting.summary.substring(0, 300) + '...',
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*Key Takeaways:*\n' + meeting.keyTakeaways.slice(0, 3).map(t => `• ${t}`).join('\n'),
        },
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'View Full Summary',
              emoji: true,
            },
            url: `${meeting.appUrl}/meeting/${meeting.id}`,
            style: 'primary',
          },
        ],
      },
    ],
  }
}

export async function notifyTeamOfNewMeeting(meeting: {
  id: string
  companyName: string
  summary: string
  keyTakeaways: string[]
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  
  const message = formatMeetingSummarySlackMessage({
    ...meeting,
    appUrl,
  })

  return sendSlackNotification(message)
}

