import { complete } from '../openai'

interface MeetingSummaryInput {
  companyName: string
  transcript: string
  slides: Array<{
    slideNumber: number
    text: string
    keyPoints: string[]
  }>
  claims: Array<{
    text: string
    type: string
  }>
  questions: Array<{
    text: string
    answer?: string
  }>
}

interface MeetingSummary {
  executiveSummary: string
  keyTakeaways: string[]
  strengths: string[]
  concerns: string[]
  opportunities: string[]
  nextSteps: string[]
  investmentThesis: string
  recommendedAction: 'pass' | 'further_diligence' | 'partner_meeting' | 'term_sheet'
  confidenceScore: number
}

export async function generateMeetingSummary(
  input: MeetingSummaryInput
): Promise<MeetingSummary> {
  const systemPrompt = `You are a venture capital partner writing an investment committee memo.

Create a comprehensive, IC-ready meeting summary that includes:
1. Executive summary (2-3 sentences)
2. Key takeaways (3-5 bullets)
3. Strengths (what's compelling)
4. Concerns (red flags, risks, unknowns)
5. Opportunities (if we invest, what could go really well)
6. Next steps (what we need to do)
7. Investment thesis (why this could be a great investment)
8. Recommended action and confidence

Be critical, analytical, and balanced. This is for internal decision-making.

Return JSON:
{
  "executiveSummary": "...",
  "keyTakeaways": ["...", "...", "..."],
  "strengths": ["...", "..."],
  "concerns": ["...", "..."],
  "opportunities": ["...", "..."],
  "nextSteps": ["...", "..."],
  "investmentThesis": "...",
  "recommendedAction": "pass|further_diligence|partner_meeting|term_sheet",
  "confidenceScore": 0-1
}`

  const userPrompt = `Company: ${input.companyName}

TRANSCRIPT HIGHLIGHTS:
${input.transcript.substring(0, 4000)}

SLIDE KEY POINTS:
${input.slides.map(s => `Slide ${s.slideNumber}: ${s.keyPoints.join(', ')}`).join('\n')}

KEY CLAIMS:
${input.claims.map(c => `- ${c.text} (${c.type})`).join('\n')}

QUESTIONS ASKED:
${input.questions.map(q => `Q: ${q.text}${q.answer ? `\nA: ${q.answer}` : ''}`).join('\n\n')}

Generate IC-ready meeting summary.`

  const response = await complete(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    {
      response_format: { type: 'json_object' },
      temperature: 0.6,
      max_tokens: 2000,
    }
  )

  return JSON.parse(response || '{}')
}

export async function generateExecutiveSummary(
  companyName: string,
  fullSummary: MeetingSummary
): Promise<string> {
  const systemPrompt = `You are a VC partner writing a crisp, compelling executive summary for the investment committee.

Write 3-4 sentences that capture:
1. What the company does
2. Why it matters
3. Key strengths
4. Main concern

Be direct and specific.`

  const response = await complete([
    { role: 'system', content: systemPrompt },
    {
      role: 'user',
      content: `Company: ${companyName}

Key Takeaways: ${fullSummary.keyTakeaways.join('; ')}
Top Strength: ${fullSummary.strengths[0]}
Top Concern: ${fullSummary.concerns[0]}

Write executive summary.`,
    },
  ])

  return response || ''
}

export async function extractActionItems(transcript: string): Promise<string[]> {
  const systemPrompt = `Extract action items and next steps from a meeting transcript.

Look for:
- Commitments made by either party
- Information to be shared
- Follow-up meetings
- Due diligence items
- Introductions to be made

Return JSON:
{
  "actionItems": ["action item 1", "action item 2", ...]
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

  const result = JSON.parse(response || '{}')
  return result.actionItems || []
}

