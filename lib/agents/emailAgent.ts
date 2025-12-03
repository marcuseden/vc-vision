import { complete } from '../openai'

interface EmailDraft {
  subject: string
  body: string
  suggestedTiming: string
}

export async function generateThankYouEmail(
  companyName: string,
  founderName: string,
  meetingHighlights: string[],
  followUpQuestions: string[]
): Promise<EmailDraft> {
  const systemPrompt = `You are writing a professional, warm thank-you email after a VC pitch meeting.

The email should:
- Thank them for their time
- Show genuine interest and thoughtfulness
- Include 2-3 specific follow-up questions
- Suggest next steps if appropriate
- Be concise (under 200 words)

Tone: Professional but warm, interested but not over-eager.

Return JSON:
{
  "subject": "...",
  "body": "...",
  "suggestedTiming": "send immediately|send tomorrow|send in 2 days"
}`

  const userPrompt = `Company: ${companyName}
Founder: ${founderName}

Meeting Highlights:
${meetingHighlights.join('\n')}

Follow-up Questions:
${followUpQuestions.slice(0, 3).join('\n')}

Draft thank-you email.`

  const response = await complete(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    {
      response_format: { type: 'json_object' },
      temperature: 0.7,
    }
  )

  return JSON.parse(response || '{}')
}

export async function generateFollowUpEmail(
  companyName: string,
  founderName: string,
  previousDiscussion: string,
  newQuestions: string[],
  suggestMeeting: boolean
): Promise<EmailDraft> {
  const systemPrompt = `You are writing a follow-up email to a founder after initial due diligence.

The email should:
- Reference previous conversation
- Show continued interest
- Ask pointed, specific questions
- ${suggestMeeting ? 'Suggest a follow-up meeting with specific time options' : 'Request written responses'}
- Be professional and direct

Return JSON:
{
  "subject": "...",
  "body": "...",
  "suggestedTiming": "send immediately|send tomorrow|send next week"
}`

  const userPrompt = `Company: ${companyName}
Founder: ${founderName}
Suggest Meeting: ${suggestMeeting}

Previous Discussion:
${previousDiscussion}

New Questions:
${newQuestions.join('\n')}

Draft follow-up email.`

  const response = await complete(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    {
      response_format: { type: 'json_object' },
      temperature: 0.7,
    }
  )

  return JSON.parse(response || '{}')
}

export async function detectFollowUpIntent(transcript: string): Promise<{
  shouldFollowUp: boolean
  urgency: 'low' | 'medium' | 'high'
  suggestedAction: string
  reasoning: string
}> {
  const systemPrompt = `Analyze a meeting transcript to determine if and how to follow up.

Consider:
- Level of mutual interest
- Outstanding questions or concerns
- Commitments made
- Timeline mentioned
- Competitive dynamics

Return JSON:
{
  "shouldFollowUp": boolean,
  "urgency": "low|medium|high",
  "suggestedAction": "pass|send_email|schedule_meeting|introduce_partner|start_diligence",
  "reasoning": "brief explanation"
}`

  const response = await complete(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: transcript.substring(0, 4000) },
    ],
    {
      response_format: { type: 'json_object' },
    }
  )

  return JSON.parse(response || '{}')
}

export async function generateICEmail(
  companyName: string,
  summary: string,
  keyTakeaways: string[],
  strengths: string[],
  concerns: string[],
  recommendedAction: string
): Promise<EmailDraft> {
  const systemPrompt = `You are writing an investment committee summary email.

The email should:
- Lead with the recommendation
- Provide key context
- Highlight strengths and concerns
- Be data-driven and analytical
- Be concise but complete

This is for internal distribution to partners.

Return JSON:
{
  "subject": "...",
  "body": "..."
}`

  const userPrompt = `Company: ${companyName}
Recommendation: ${recommendedAction}

Executive Summary:
${summary}

Key Takeaways:
${keyTakeaways.join('\n')}

Strengths:
${strengths.join('\n')}

Concerns:
${concerns.join('\n')}

Draft IC summary email.`

  const response = await complete(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    {
      response_format: { type: 'json_object' },
      temperature: 0.5,
    }
  )

  const result = JSON.parse(response || '{}')
  return {
    ...result,
    suggestedTiming: 'send immediately',
  }
}

