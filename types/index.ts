// Shared TypeScript types

export interface User {
  id: string
  email: string
  name?: string
  role: 'analyst' | 'partner' | 'admin'
  createdAt: Date
}

export interface Deal {
  id: string
  companyName: string
  website?: string
  stage?: string
  sector?: string
  description?: string
  createdAt: Date
}

export interface Meeting {
  id: string
  dealId: string
  userId: string
  title: string
  date: Date
  duration?: number
  status: 'in_progress' | 'completed' | 'failed'
  transcriptUrl?: string
  audioUrl?: string
  summary?: string
  keyTakeaways: string[]
  nextSteps: string[]
  createdAt: Date
}

export interface Slide {
  id: string
  meetingId: string
  slideNumber: number
  imageUrl?: string
  text?: string
  timestamp?: Date
  createdAt: Date
}

export interface Claim {
  id: string
  meetingId: string
  slideId?: string
  segmentId?: string
  claimText: string
  claimType: 'metric' | 'market_size' | 'competitor' | 'traction' | 'financial'
  isVerified: boolean
  verifiedBy?: string
  confidence?: number
  notes?: string
  createdAt: Date
}

export interface Question {
  id: string
  meetingId: string
  slideId?: string
  questionText: string
  category: 'verification' | 'expansion' | 'risk' | 'opportunity'
  priority: number
  asked: boolean
  askedAt?: Date
  answer?: string
  createdAt: Date
}

export interface TranscriptSegment {
  id: string
  meetingId: string
  speaker: string
  text: string
  timestamp: number
  createdAt: Date
}

export interface Competitor {
  id: string
  dealId: string
  name: string
  website?: string
  fundingStage?: string
  totalFunding?: number
  niche?: string
  revenue?: number
  employees?: number
  description?: string
  moat?: string
  createdAt: Date
}

export interface Insight {
  id: string
  dealId: string
  slideId?: string
  insightType: 'market' | 'competitor' | 'risk' | 'opportunity' | 'moat'
  title: string
  description: string
  severity?: 'high' | 'medium' | 'low'
  data?: any
  createdAt: Date
}

export interface Email {
  id: string
  meetingId: string
  type: 'thank_you' | 'follow_up' | 'ic_summary'
  subject: string
  body: string
  to: string[]
  cc: string[]
  sent: boolean
  sentAt?: Date
  createdAt: Date
}

export interface FollowUp {
  id: string
  meetingId: string
  title: string
  description?: string
  dueDate?: Date
  completed: boolean
  completedAt?: Date
  createdAt: Date
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

// Agent Types
export interface SlideAnalysis {
  text: string
  description: string
  claims: Array<{
    text: string
    type: Claim['claimType']
    confidence: number
  }>
  keyPoints: string[]
}

export interface MeetingSummary {
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

export interface ResearchResult {
  source: string
  data: any
  summary: string
}

export interface MarketData {
  tam: string
  sam: string
  growthRate: string
  keyPlayers: string[]
  trends: string[]
  sources: string[]
}

