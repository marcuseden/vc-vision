// Database seeding script for development/testing

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create users
  const analyst = await prisma.user.upsert({
    where: { email: 'analyst@vcfund.com' },
    update: {},
    create: {
      email: 'analyst@vcfund.com',
      name: 'Alex Analyst',
      role: 'analyst',
    },
  })

  const partner = await prisma.user.upsert({
    where: { email: 'partner@vcfund.com' },
    update: {},
    create: {
      email: 'partner@vcfund.com',
      name: 'Patricia Partner',
      role: 'partner',
    },
  })

  console.log('✅ Created users')

  // Create deals
  const deal1 = await prisma.deal.create({
    data: {
      companyName: 'TechFlow AI',
      website: 'https://techflow-ai.com',
      stage: 'seed',
      sector: 'AI/ML',
      description: 'AI-powered workflow automation for enterprise teams',
    },
  })

  const deal2 = await prisma.deal.create({
    data: {
      companyName: 'HealthTrack',
      website: 'https://healthtrack.io',
      stage: 'series-a',
      sector: 'HealthTech',
      description: 'Remote patient monitoring and predictive health analytics',
    },
  })

  console.log('✅ Created deals')

  // Create meetings
  const meeting1 = await prisma.meeting.create({
    data: {
      dealId: deal1.id,
      userId: analyst.id,
      title: 'Initial Pitch Meeting',
      date: new Date(),
      status: 'completed',
      summary: 'TechFlow AI is building an innovative AI-powered workflow automation platform targeting enterprise teams. Founded by ex-Google engineers, the team has strong technical expertise and early traction with 15 pilot customers.',
      keyTakeaways: [
        'Strong founding team with relevant experience at Google and Microsoft',
        '$50K MRR after 6 months, 3x growth month-over-month',
        'Large TAM ($50B+ workflow automation market)',
        'Unique AI approach using proprietary training data',
      ],
      nextSteps: [
        'Schedule product demo with CTO',
        'Request detailed financial projections',
        'Connect with 3 reference customers',
        'Review competitive landscape in detail',
      ],
      duration: 3600, // 1 hour
    },
  })

  const meeting2 = await prisma.meeting.create({
    data: {
      dealId: deal2.id,
      userId: partner.id,
      title: 'Series A Discussion',
      date: new Date(Date.now() - 86400000), // Yesterday
      status: 'in_progress',
      duration: 2700, // 45 minutes
    },
  })

  console.log('✅ Created meetings')

  // Create slides for meeting 1
  const slide1 = await prisma.slide.create({
    data: {
      meetingId: meeting1.id,
      slideNumber: 1,
      text: 'TechFlow AI - Revolutionizing Enterprise Workflows',
      timestamp: new Date(meeting1.date.getTime() + 60000),
    },
  })

  const slide2 = await prisma.slide.create({
    data: {
      meetingId: meeting1.id,
      slideNumber: 2,
      text: 'Problem: Teams waste 40% of time on repetitive tasks\nMarket Size: $50B TAM, $12B SAM\nGrowth Rate: 25% CAGR',
      timestamp: new Date(meeting1.date.getTime() + 300000),
    },
  })

  console.log('✅ Created slides')

  // Create claims
  await prisma.claim.createMany({
    data: [
      {
        meetingId: meeting1.id,
        slideId: slide2.id,
        claimText: 'Market size is $50B TAM and $12B SAM',
        claimType: 'market_size',
        isVerified: true,
        confidence: 0.85,
        verifiedBy: 'Industry reports',
      },
      {
        meetingId: meeting1.id,
        slideId: slide2.id,
        claimText: 'Market growing at 25% CAGR',
        claimType: 'market_size',
        isVerified: true,
        confidence: 0.9,
        verifiedBy: 'Gartner research',
      },
      {
        meetingId: meeting1.id,
        claimText: '$50K MRR with 3x month-over-month growth',
        claimType: 'traction',
        isVerified: false,
        confidence: 0.7,
      },
    ],
  })

  console.log('✅ Created claims')

  // Create questions
  await prisma.question.createMany({
    data: [
      {
        meetingId: meeting1.id,
        slideId: slide2.id,
        questionText: 'How did you calculate the $12B SAM? What assumptions went into this?',
        category: 'verification',
        priority: 9,
        asked: true,
        answer: 'We looked at mid-market and enterprise companies with 100+ employees in North America and Europe, estimating average contract value of $50K annually.',
      },
      {
        meetingId: meeting1.id,
        slideId: slide2.id,
        questionText: "What's your customer acquisition cost and how does it compare to lifetime value?",
        category: 'expansion',
        priority: 8,
        asked: false,
      },
      {
        meetingId: meeting1.id,
        questionText: 'What happens if OpenAI or Microsoft builds this capability into their core products?',
        category: 'risk',
        priority: 10,
        asked: false,
      },
    ],
  })

  console.log('✅ Created questions')

  // Create competitors
  await prisma.competitor.createMany({
    data: [
      {
        dealId: deal1.id,
        name: 'Zapier',
        website: 'https://zapier.com',
        fundingStage: 'Series B',
        totalFunding: 140000000,
        niche: 'No-code workflow automation',
        revenue: 100000000,
        employees: 500,
        description: 'Established player with 5M+ users, but primarily focused on no-code integrations. Less sophisticated AI capabilities.',
      },
      {
        dealId: deal1.id,
        name: 'Automation Anywhere',
        website: 'https://automationanywhere.com',
        fundingStage: 'Series F',
        totalFunding: 840000000,
        niche: 'RPA for enterprise',
        revenue: 250000000,
        employees: 2500,
        description: 'Enterprise RPA leader but complex implementation. TechFlow AI has simpler setup and better AI-native approach.',
      },
    ],
  })

  console.log('✅ Created competitors')

  // Create insights
  await prisma.insight.createMany({
    data: [
      {
        dealId: deal1.id,
        insightType: 'opportunity',
        title: 'Strong Product-Market Fit Signals',
        description: '15 pilot customers with 80% expressing intent to convert to paid plans. High engagement metrics and low churn.',
      },
      {
        dealId: deal1.id,
        insightType: 'risk',
        title: 'Competitive Intensity',
        description: 'Large incumbents (Microsoft, Google) could bundle similar capabilities. Moat depends on proprietary data and enterprise relationships.',
        severity: 'high',
      },
      {
        dealId: deal1.id,
        insightType: 'moat',
        title: 'Data Network Effects',
        description: 'Platform improves with usage as it learns company-specific workflows. Creates switching costs and defensibility.',
        severity: 'low',
      },
    ],
  })

  console.log('✅ Created insights')

  // Create follow-ups
  await prisma.followUp.createMany({
    data: [
      {
        meetingId: meeting1.id,
        title: 'Schedule product demo',
        description: 'Set up technical deep dive with CTO to understand architecture and AI approach',
        dueDate: new Date(Date.now() + 3 * 86400000), // 3 days from now
      },
      {
        meetingId: meeting1.id,
        title: 'Reference check',
        description: 'Speak with 3 pilot customers to validate product value and satisfaction',
        dueDate: new Date(Date.now() + 5 * 86400000),
      },
    ],
  })

  console.log('✅ Created follow-ups')

  console.log('🎉 Seeding complete!')
  console.log('\nCreated:')
  console.log(`- 2 users`)
  console.log(`- 2 deals`)
  console.log(`- 2 meetings`)
  console.log(`- 2 slides`)
  console.log(`- 3 claims`)
  console.log(`- 3 questions`)
  console.log(`- 2 competitors`)
  console.log(`- 3 insights`)
  console.log(`- 2 follow-ups`)
  console.log('\n✨ Your database is ready for testing!')
  console.log('Visit http://localhost:3000/dashboard to see your meetings.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('Error seeding database:', e)
    await prisma.$disconnect()
    process.exit(1)
  })

