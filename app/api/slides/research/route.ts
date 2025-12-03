import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import {
  researchClaim,
  researchMarket,
  researchCompetitors,
  analyzeMoat,
} from '@/lib/agents/researchAgent'

export async function POST(request: NextRequest) {
  try {
    const { claimId, dealId, researchType } = await request.json()

    if (researchType === 'claim' && claimId) {
      return await researchClaimHandler(claimId)
    } else if (researchType === 'market' && dealId) {
      return await researchMarketHandler(dealId)
    } else if (researchType === 'competitors' && dealId) {
      return await researchCompetitorsHandler(dealId)
    } else if (researchType === 'moat' && dealId) {
      return await analyzeMoatHandler(dealId)
    } else {
      return NextResponse.json(
        { error: 'Invalid research type or missing parameters' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Research error:', error)
    return NextResponse.json(
      { error: 'Research failed' },
      { status: 500 }
    )
  }
}

async function researchClaimHandler(claimId: string) {
  const claim = await prisma.claim.findUnique({
    where: { id: claimId },
    include: {
      meeting: {
        include: {
          deal: true,
        },
      },
    },
  })

  if (!claim) {
    return NextResponse.json({ error: 'Claim not found' }, { status: 404 })
  }

  const research = await researchClaim(
    claim.claimText,
    claim.claimType,
    claim.meeting.deal.companyName
  )

  // Save research result
  await prisma.researchResult.create({
    data: {
      claimId: claim.id,
      source: research.source,
      data: research.data,
      summary: research.summary,
    },
  })

  // Update claim with verification status
  await prisma.claim.update({
    where: { id: claimId },
    data: {
      isVerified: research.data.verifiable || false,
      confidence: research.data.confidence || null,
      verifiedBy: research.source,
    },
  })

  return NextResponse.json({
    success: true,
    research,
  })
}

async function researchMarketHandler(dealId: string) {
  const deal = await prisma.deal.findUnique({
    where: { id: dealId },
  })

  if (!deal) {
    return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
  }

  const marketData = await researchMarket(
    deal.sector || 'Technology',
    deal.description || ''
  )

  // Save as insights
  await prisma.insight.create({
    data: {
      dealId: deal.id,
      insightType: 'market',
      title: 'Market Analysis',
      description: `TAM: ${marketData.tam}, Growth Rate: ${marketData.growthRate}`,
      data: marketData,
    },
  })

  return NextResponse.json({
    success: true,
    marketData,
  })
}

async function researchCompetitorsHandler(dealId: string) {
  const deal = await prisma.deal.findUnique({
    where: { id: dealId },
  })

  if (!deal) {
    return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
  }

  const competitors = await researchCompetitors(
    deal.companyName,
    deal.sector || 'Technology',
    deal.description || ''
  )

  // Save competitors
  const competitorPromises = competitors.map(comp =>
    prisma.competitor.create({
      data: {
        dealId: deal.id,
        name: comp.name,
        fundingStage: comp.fundingStage,
        totalFunding: parseFloat(comp.totalFunding.replace(/[^0-9.]/g, '')) || null,
        niche: comp.niche,
        revenue: parseFloat(comp.estimatedRevenue.replace(/[^0-9.]/g, '')) || null,
        description: comp.differentiation,
      },
    })
  )
  const savedCompetitors = await Promise.all(competitorPromises)

  return NextResponse.json({
    success: true,
    competitors: savedCompetitors,
  })
}

async function analyzeMoatHandler(dealId: string) {
  const deal = await prisma.deal.findUnique({
    where: { id: dealId },
    include: {
      meetings: {
        orderBy: { date: 'desc' },
        take: 1,
      },
    },
  })

  if (!deal) {
    return NextResponse.json({ error: 'Deal not found' }, { status: 404 })
  }

  const moatAnalysis = await analyzeMoat(
    deal.companyName,
    deal.description || '',
    'Technology details from meeting', // Would extract from transcript
    'Traction details from meeting' // Would extract from transcript
  )

  // Save as insight
  await prisma.insight.create({
    data: {
      dealId: deal.id,
      insightType: 'moat',
      title: `Moat Analysis - ${moatAnalysis.moatStrength}`,
      description: moatAnalysis.moatTypes.join(', '),
      severity: moatAnalysis.moatStrength === 'weak' ? 'high' : 'low',
      data: moatAnalysis,
    },
  })

  return NextResponse.json({
    success: true,
    moatAnalysis,
  })
}

