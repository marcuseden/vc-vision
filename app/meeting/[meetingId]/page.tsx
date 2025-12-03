'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MeetingTimeline } from '@/components/MeetingTimeline'
import { SlideCard } from '@/components/SlideCard'
import { TranscriptViewer } from '@/components/TranscriptViewer'
import { QuestionsPanel } from '@/components/QuestionsPanel'
import { CompetitorList } from '@/components/CompetitorList'
import { MarketPanel } from '@/components/MarketPanel'
import { SummaryEditor } from '@/components/SummaryEditor'
import { formatDateTime } from '@/lib/utils'
import {
  ArrowLeft,
  FileText,
  Sparkles,
  Share2,
  Mail,
  RefreshCw,
} from 'lucide-react'

export default function MeetingDetailPage() {
  const params = useParams()
  const meetingId = params.meetingId as string

  const [meeting, setMeeting] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchMeeting()
  }, [meetingId])

  const fetchMeeting = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/meetings?id=${meetingId}`)
      const data = await response.json()
      setMeeting(data.meeting)
    } catch (error) {
      console.error('Failed to fetch meeting:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateSummary = async () => {
    setProcessing(true)
    try {
      const response = await fetch('/api/meetings/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meetingId }),
      })
      const data = await response.json()
      await fetchMeeting() // Refresh
    } catch (error) {
      console.error('Failed to generate summary:', error)
    } finally {
      setProcessing(false)
    }
  }

  const handleAnalyzeSlide = async (slideId: string) => {
    try {
      const response = await fetch('/api/slides/intel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slideId }),
      })
      const data = await response.json()
      await fetchMeeting() // Refresh
    } catch (error) {
      console.error('Failed to analyze slide:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 mx-auto mb-4 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading meeting...</p>
        </div>
      </div>
    )
  }

  if (!meeting) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Meeting not found</p>
          <Link href="/dashboard">
            <Button className="mt-4">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Build timeline events
  const timelineEvents = [
    ...meeting.slides.map((s: any) => ({
      type: 'slide' as const,
      timestamp: s.timestamp ? new Date(s.timestamp).getTime() / 1000 : 0,
      content: `Slide ${s.slideNumber}`,
      metadata: { slideId: s.id },
    })),
    ...meeting.transcript.map((t: any) => ({
      type: 'transcript' as const,
      timestamp: t.timestamp,
      content: t.text.substring(0, 100) + '...',
      metadata: { speaker: t.speaker },
    })),
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
          </div>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {meeting.deal.companyName}
              </h1>
              <p className="text-gray-600 mt-1">{meeting.title}</p>
              <div className="flex gap-2 mt-2">
                <Badge
                  className={
                    meeting.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800'
                  }
                >
                  {meeting.status}
                </Badge>
                <Badge variant="outline">{formatDateTime(meeting.date)}</Badge>
                {meeting.deal.sector && (
                  <Badge variant="outline">{meeting.deal.sector}</Badge>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              {meeting.status === 'completed' && meeting.summary && (
                <>
                  <Button variant="outline">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  <Button>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Email
                  </Button>
                </>
              )}
              {meeting.status === 'in_progress' && (
                <Button onClick={handleGenerateSummary} disabled={processing}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  {processing ? 'Generating...' : 'Generate Summary'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="slides">
              Slides ({meeting.slides.length})
            </TabsTrigger>
            <TabsTrigger value="transcript">Transcript</TabsTrigger>
            <TabsTrigger value="questions">
              Questions ({meeting.questions.length})
            </TabsTrigger>
            <TabsTrigger value="research">Research</TabsTrigger>
            {meeting.summary && <TabsTrigger value="summary">Summary</TabsTrigger>}
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <MeetingTimeline
                  events={timelineEvents}
                  duration={meeting.duration}
                />
              </div>
              <div className="space-y-6">
                <QuestionsPanel
                  questions={meeting.questions.slice(0, 5)}
                  onMarkAsked={async (qId) => {
                    // Mark question as asked
                    await fetchMeeting()
                  }}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="slides">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {meeting.slides.map((slide: any) => (
                <SlideCard
                  key={slide.id}
                  slideNumber={slide.slideNumber}
                  imageUrl={slide.imageUrl || undefined}
                  text={slide.text || undefined}
                  claims={slide.claims || []}
                  questions={slide.questions || []}
                  onAnalyze={() => handleAnalyzeSlide(slide.id)}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="transcript">
            <TranscriptViewer segments={meeting.transcript} />
          </TabsContent>

          <TabsContent value="questions">
            <QuestionsPanel
              questions={meeting.questions}
              onMarkAsked={async (qId) => {
                await fetchMeeting()
              }}
            />
          </TabsContent>

          <TabsContent value="research" className="space-y-6">
            <MarketPanel
              insights={[]}
              marketData={undefined}
            />
            <CompetitorList competitors={[]} />
          </TabsContent>

          {meeting.summary && (
            <TabsContent value="summary">
              <SummaryEditor
                summary={{
                  executiveSummary: meeting.summary,
                  keyTakeaways: meeting.keyTakeaways || [],
                  strengths: [],
                  concerns: [],
                  opportunities: [],
                  nextSteps: meeting.nextSteps || [],
                  investmentThesis: '',
                  recommendedAction: 'further_diligence',
                  confidenceScore: 0.75,
                }}
              />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  )
}

