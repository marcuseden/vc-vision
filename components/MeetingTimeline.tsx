'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { formatDateTime, formatDuration } from '@/lib/utils'
import { Calendar, Clock, MessageSquare, Image } from 'lucide-react'

interface TimelineEvent {
  type: 'slide' | 'transcript' | 'question' | 'claim'
  timestamp: number
  content: string
  metadata?: any
}

interface MeetingTimelineProps {
  events: TimelineEvent[]
  duration?: number
  onEventClick?: (event: TimelineEvent) => void
}

export function MeetingTimeline({
  events,
  duration,
  onEventClick,
}: MeetingTimelineProps) {
  const sortedEvents = [...events].sort((a, b) => a.timestamp - b.timestamp)

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'slide':
        return <Image className="h-4 w-4" />
      case 'transcript':
        return <MessageSquare className="h-4 w-4" />
      case 'question':
        return <MessageSquare className="h-4 w-4 text-blue-500" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getEventColor = (type: string) => {
    switch (type) {
      case 'slide':
        return 'border-purple-500'
      case 'transcript':
        return 'border-gray-300'
      case 'question':
        return 'border-blue-500'
      case 'claim':
        return 'border-orange-500'
      default:
        return 'border-gray-300'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Meeting Timeline
          {duration && (
            <Badge variant="secondary" className="ml-auto">
              {formatDuration(duration)}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          <div className="relative space-y-4">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

            {sortedEvents.map((event, index) => (
              <div
                key={index}
                className="relative pl-12 cursor-pointer hover:bg-gray-50 rounded-lg p-2 -ml-2 transition-colors"
                onClick={() => onEventClick?.(event)}
              >
                {/* Timeline dot */}
                <div
                  className={`absolute left-2.5 top-4 h-4 w-4 rounded-full border-2 bg-white ${getEventColor(
                    event.type
                  )}`}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    {getEventIcon(event.type)}
                  </div>
                </div>

                {/* Event content */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {formatDuration(event.timestamp)}
                    </Badge>
                    <Badge variant="secondary" className="text-xs capitalize">
                      {event.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-700">{event.content}</p>
                  {event.metadata && (
                    <p className="text-xs text-gray-500">
                      {JSON.stringify(event.metadata)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

