import { complete } from '../openai'

interface ResearchResult {
  source: string
  data: any
  summary: string
}

export async function researchClaim(
  claimText: string,
  claimType: string,
  companyName: string
): Promise<ResearchResult> {
  // In a production system, this would:
  // 1. Search web for verification sources
  // 2. Query financial databases (Pitchbook, Crunchbase)
  // 3. Check market research reports
  // 4. Cross-reference with internal knowledge base
  
  // For now, we'll use GPT-4 to generate research insights
  const systemPrompt = `You are a venture capital research analyst. 
Given a claim from a pitch deck, provide critical analysis and context.

Consider:
- Is the claim verifiable?
- What are comparable benchmarks?
- What are red flags or concerns?
- What additional data would be valuable?

Return JSON:
{
  "verifiable": boolean,
  "confidence": 0-1,
  "benchmarks": ["comparable data points"],
  "concerns": ["potential issues"],
  "recommendations": ["what to verify or ask about"],
  "sources": ["suggested sources to check"]
}`

  const userPrompt = `Company: ${companyName}
Claim Type: ${claimType}
Claim: "${claimText}"

Analyze this claim and provide research insights.`

  const response = await complete(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    {
      response_format: { type: 'json_object' },
      temperature: 0.4,
    }
  )

  const data = JSON.parse(response || '{}')

  return {
    source: 'AI Analysis',
    data,
    summary: generateResearchSummary(data),
  }
}

export async function researchMarket(
  sector: string,
  targetMarket: string
): Promise<{
  tam: string
  sam: string
  growthRate: string
  keyPlayers: string[]
  trends: string[]
  sources: string[]
}> {
  const systemPrompt = `You are a market research analyst. Provide market intelligence for a given sector and target market.

Return JSON with:
{
  "tam": "Total Addressable Market estimate",
  "sam": "Serviceable Addressable Market estimate",
  "growthRate": "Market growth rate",
  "keyPlayers": ["major competitors/players"],
  "trends": ["key market trends"],
  "sources": ["where to verify this data"]
}`

  const response = await complete(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Sector: ${sector}\nTarget Market: ${targetMarket}` },
    ],
    {
      response_format: { type: 'json_object' },
      temperature: 0.3,
    }
  )

  return JSON.parse(response || '{}')
}

export async function researchCompetitors(
  companyName: string,
  sector: string,
  description: string
): Promise<Array<{
  name: string
  fundingStage: string
  totalFunding: string
  niche: string
  estimatedRevenue: string
  differentiation: string
}>> {
  const systemPrompt = `You are a competitive intelligence analyst. 
Identify and analyze competitors in the same space.

Return JSON:
{
  "competitors": [
    {
      "name": "Company Name",
      "fundingStage": "Seed/Series A/B/C/etc",
      "totalFunding": "Amount raised",
      "niche": "Their specific focus",
      "estimatedRevenue": "Revenue estimate",
      "differentiation": "How they differ from the target company"
    }
  ]
}`

  const response = await complete(
    [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `Company: ${companyName}\nSector: ${sector}\nDescription: ${description}\n\nIdentify key competitors.`,
      },
    ],
    {
      response_format: { type: 'json_object' },
      temperature: 0.4,
    }
  )

  const result = JSON.parse(response || '{}')
  return result.competitors || []
}

export async function analyzeMoat(
  companyName: string,
  description: string,
  technology: string,
  traction: string
): Promise<{
  moatStrength: 'weak' | 'moderate' | 'strong'
  moatTypes: string[]
  vulnerabilities: string[]
  recommendations: string[]
}> {
  const systemPrompt = `You are a venture capital analyst evaluating competitive moats.

Assess the defensibility of the business across:
- Technology/IP moat
- Network effects
- Data moat
- Brand/community
- Regulatory barriers
- Switching costs
- Economies of scale

Return JSON:
{
  "moatStrength": "weak|moderate|strong",
  "moatTypes": ["types of moat present"],
  "vulnerabilities": ["weaknesses in defensibility"],
  "recommendations": ["how to strengthen moat"]
}`

  const response = await complete(
    [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `Company: ${companyName}
Description: ${description}
Technology: ${technology}
Traction: ${traction}

Analyze the competitive moat.`,
      },
    ],
    {
      response_format: { type: 'json_object' },
      temperature: 0.5,
    }
  )

  return JSON.parse(response || '{}')
}

function generateResearchSummary(data: any): string {
  const parts: string[] = []

  if (data.verifiable !== undefined) {
    parts.push(`Verifiable: ${data.verifiable ? 'Yes' : 'No'}`)
  }

  if (data.confidence) {
    parts.push(`Confidence: ${Math.round(data.confidence * 100)}%`)
  }

  if (data.concerns && data.concerns.length > 0) {
    parts.push(`Concerns: ${data.concerns.join('; ')}`)
  }

  if (data.recommendations && data.recommendations.length > 0) {
    parts.push(`Recommendations: ${data.recommendations.join('; ')}`)
  }

  return parts.join(' | ')
}

