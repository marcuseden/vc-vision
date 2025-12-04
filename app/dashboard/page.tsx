'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatDateTime, formatDuration } from '@/lib/utils'
import {
  Calendar,
  Plus,
  TrendingUp,
  Users,
  FileText,
  Clock,
} from 'lucide-react'

interface Meeting {
  id: string
  title: string
  date: string
  status: string
  deal: {
    companyName: string
    sector?: string
  }
  _count?: {
    slides: number
    questions: number
    claims: number
  }
}

export default function DashboardPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'in_progress' | 'completed'>('all')

  useEffect(() => {
    fetchMeetings()
  }, [filter])

  const fetchMeetings = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter !== 'all') params.set('status', filter)

      const response = await fetch(`/api/meetings?${params}`)
      const data = await response.json()
      setMeetings(data.meetings || [])
    } catch (error) {
      console.error('Failed to fetch meetings:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredMeetings = meetings.filter(m => 
    filter === 'all' ? true : m.status === filter
  )

  const stats = {
    total: meetings.length,
    inProgress: meetings.filter(m => m.status === 'in_progress').length,
    completed: meetings.filter(m => m.status === 'completed').length,
    thisWeek: meetings.filter(
      m => new Date(m.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                VC Magic 🪄
              </h1>
              <p className="text-gray-600 mt-1">
                AI-Powered Deal Intelligence • Ray-Ban Meta Gen 2
              </p>
            </div>
            <Button size="lg">
              <Plus className="h-5 w-5 mr-2" />
              New Meeting
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Meetings
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                In Progress
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inProgress}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completed}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.thisWeek}</div>
            </CardContent>
          </Card>
        </div>

        {/* Meetings List */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <Tabs value={filter} onValueChange={(v: any) => setFilter(v)}>
                <TabsList>
                  <TabsTrigger value="all">All Meetings</TabsTrigger>
                  <TabsTrigger value="in_progress">In Progress</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-12 text-gray-500">
                    Loading meetings...
                  </div>
                ) : filteredMeetings.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>No meetings found.</p>
                    <p className="text-sm mt-1">
                      Create your first meeting to get started.
                    </p>
                  </div>
                ) : (
                  filteredMeetings.map(meeting => (
                    <Link
                      key={meeting.id}
                      href={`/meeting/${meeting.id}`}
                      className="block"
                    >
                      <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-lg">
                                {meeting.deal.companyName}
                              </h3>
                              <Badge
                                className={`${getStatusColor(
                                  meeting.status
                                )} capitalize`}
                              >
                                {meeting.status.replace('_', ' ')}
                              </Badge>
                              {meeting.deal.sector && (
                                <Badge variant="outline">
                                  {meeting.deal.sector}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">
                              {meeting.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatDateTime(meeting.date)}
                            </p>
                          </div>
                          
                          {meeting._count && (
                            <div className="flex gap-4 text-sm text-gray-600">
                              <div className="text-center">
                                <div className="font-semibold">
                                  {meeting._count.slides}
                                </div>
                                <div className="text-xs">Slides</div>
                              </div>
                              <div className="text-center">
                                <div className="font-semibold">
                                  {meeting._count.questions}
                                </div>
                                <div className="text-xs">Questions</div>
                              </div>
                              <div className="text-center">
                                <div className="font-semibold">
                                  {meeting._count.claims}
                                </div>
                                <div className="text-xs">Claims</div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

