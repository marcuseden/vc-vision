import { complete } from '../openai'
import { analyzeSlideImage } from '../openai'

interface SlideAnalysis {
  text: string
  description: string
  claims: Array<{
    text: string
    type: 'metric' | 'market_size' | 'competitor' | 'traction' | 'financial'
    confidence: number
  }>
  keyPoints: string[]
}

export async function analyzeSlide(
  slideImageUrl: string,
  slideNumber: number,
  context?: string
): Promise<SlideAnalysis> {
  // Step 1: Extract text and visual description from slide
  const imageAnalysis = await analyzeSlideImage(slideImageUrl)

  // Step 2: Use GPT-4 to extract structured information
  const systemPrompt = `You are a venture capital analyst reviewing a pitch deck slide. 
Extract key claims, metrics, and assertions from the slide content.

Focus on:
- Market size claims (TAM/SAM/SOM)
- Financial metrics and projections
- Traction metrics (users, revenue, growth rates)
- Competitive positioning claims
- Product/technology claims

Return a JSON object with:
{
  "claims": [{ "text": "claim text", "type": "metric|market_size|competitor|traction|financial", "confidence": 0-1 }],
  "keyPoints": ["key point 1", "key point 2", ...]
}`

  const userPrompt = `Slide #${slideNumber}

Text content:
${imageAnalysis.text}

Visual description:
${imageAnalysis.description}

${context ? `Additional context: ${context}` : ''}

Analyze this slide and extract claims and key points.`

  const response = await complete(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    {
      response_format: { type: 'json_object' },
      temperature: 0.3,
    }
  )

  const analysis = JSON.parse(response || '{}')

  return {
    text: imageAnalysis.text,
    description: imageAnalysis.description,
    claims: analysis.claims || [],
    keyPoints: analysis.keyPoints || [],
  }
}

export async function generateQuestionsForSlide(
  slideAnalysis: SlideAnalysis,
  slideNumber: number
): Promise<Array<{
  text: string
  category: 'verification' | 'expansion' | 'risk' | 'opportunity'
  priority: number
}>> {
  const systemPrompt = `You are a sharp venture capital partner preparing smart questions for a pitch meeting.

Generate 2-3 insightful questions that:
1. Verify bold claims or metrics
2. Explore risks and edge cases
3. Understand competitive moats
4. Uncover hidden opportunities

Questions should be:
- Specific and actionable
- Not easily deflected
- Demonstrate deep industry knowledge

Return JSON:
{
  "questions": [
    {
      "text": "question text",
      "category": "verification|expansion|risk|opportunity",
      "priority": 1-10 (higher = more important)
    }
  ]
}`

  const userPrompt = `Slide #${slideNumber}

Key claims:
${slideAnalysis.claims.map((c, i) => `${i + 1}. ${c.text} (${c.type})`).join('\n')}

Key points:
${slideAnalysis.keyPoints.join('\n')}

Generate smart questions for this slide.`

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

  const result = JSON.parse(response || '{}')
  return result.questions || []
}

