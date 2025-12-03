import { complete } from '../openai'

interface FollowUpItem {
  title: string
  description: string
  dueDate: Date | null
  priority: 'low' | 'medium' | 'high'
  assignee?: string
}

export async function extractFollowUps(
  transcript: string,
  summary: string
): Promise<FollowUpItem[]> {
  const systemPrompt = `Extract follow-up items from a VC pitch meeting.

Look for:
- Data requests (metrics, financials, customer references)
- Introductions to be made
- Documents to be shared
- Next meeting scheduling
- Due diligence items

For each item, determine:
- What needs to be done
- Priority level
- Suggested timeline

Return JSON:
{
  "followUps": [
    {
      "title": "brief title",
      "description": "what needs to happen",
      "priority": "low|medium|high",
      "suggestedDaysUntilDue": number or null
    }
  ]
}`

  const response = await complete(
    [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `TRANSCRIPT:\n${transcript.substring(0, 3000)}\n\nSUMMARY:\n${summary}`,
      },
    ],
    {
      response_format: { type: 'json_object' },
      temperature: 0.4,
    }
  )

  const result = JSON.parse(response || '{}')
  const followUps = result.followUps || []

  return followUps.map((item: any) => ({
    title: item.title,
    description: item.description,
    priority: item.priority || 'medium',
    dueDate: item.suggestedDaysUntilDue
      ? new Date(Date.now() + item.suggestedDaysUntilDue * 24 * 60 * 60 * 1000)
      : null,
  }))
}

export async function prioritizeFollowUps(
  followUps: FollowUpItem[],
  dealContext: string
): Promise<FollowUpItem[]> {
  const systemPrompt = `You are prioritizing follow-up items for a VC deal.

Consider:
- Deal timing and competitive dynamics
- Information criticality for investment decision
- Ease of completion
- Dependencies

Re-order and adjust priorities.

Return JSON:
{
  "prioritized": [
    {
      "title": "...",
      "description": "...",
      "priority": "low|medium|high",
      "reasoning": "why this priority"
    }
  ]
}`

  const response = await complete(
    [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `Deal Context: ${dealContext}

Follow-ups:
${followUps.map((f, i) => `${i + 1}. ${f.title} (${f.priority})`).join('\n')}

Prioritize these follow-ups.`,
      },
    ],
    {
      response_format: { type: 'json_object' },
    }
  )

  const result = JSON.parse(response || '{}')
  const prioritized = result.prioritized || []

  return prioritized.map((item: any) => {
    const original = followUps.find(f => f.title === item.title)
    return {
      ...original,
      ...item,
      dueDate: original?.dueDate || null,
    }
  })
}

export async function suggestMeetingAgenda(
  companyName: string,
  previousMeetingSummary: string,
  outstandingQuestions: string[]
): Promise<{
  agenda: string[]
  suggestedDuration: number
  suggestedAttendees: string[]
}> {
  const systemPrompt = `Create an agenda for a follow-up meeting with a startup.

The agenda should:
- Address outstanding questions
- Dive deeper on key topics
- Be efficient and focused
- Have clear outcomes

Return JSON:
{
  "agenda": ["agenda item 1", "agenda item 2", ...],
  "suggestedDuration": minutes,
  "suggestedAttendees": ["role or name", ...]
}`

  const response = await complete(
    [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `Company: ${companyName}

Previous Meeting Summary:
${previousMeetingSummary}

Outstanding Questions:
${outstandingQuestions.join('\n')}

Create follow-up meeting agenda.`,
      },
    ],
    {
      response_format: { type: 'json_object' },
    }
  )

  return JSON.parse(response || '{}')
}

