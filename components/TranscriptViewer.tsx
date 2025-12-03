'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { formatDuration } from '@/lib/utils'
import { MessageSquare, User } from 'lucide-react'

interface TranscriptSegment {
  id: string
  speaker: string
  text: string
  timestamp: number
}

interface TranscriptViewerProps {
  segments: TranscriptSegment[]
  currentTime?: number
  onSegmentClick?: (segment: TranscriptSegment) => void
}

export function TranscriptViewer({
  segments,
  currentTime,
  onSegmentClick,
}: TranscriptViewerProps) {
  const getSpeakerColor = (speaker: string) => {
    switch (speaker.toLowerCase()) {
      case 'founder':
        return 'bg-blue-100 text-blue-800'
      case 'vc':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getSpeakerIcon = (speaker: string) => {
    return <User className="h-3 w-3" />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Transcript
          <Badge variant="secondary" className="ml-auto">
            {segments.length} segments
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-4">
            {segments.map((segment) => {
              const isActive =
                currentTime !== undefined &&
                Math.abs(segment.timestamp - currentTime) < 5

              return (
                <div
                  key={segment.id}
                  className={`p-4 rounded-lg border transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-50 border-blue-300 shadow-sm'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => onSegmentClick?.(segment)}
                >
                  <div className="flex items-start gap-3">
                    {/* Speaker Badge */}
                    <Badge
                      variant="secondary"
                      className={`${getSpeakerColor(
                        segment.speaker
                      )} flex items-center gap-1 capitalize`}
                    >
                      {getSpeakerIcon(segment.speaker)}
                      {segment.speaker}
                    </Badge>

                    {/* Timestamp */}
                    <Badge variant="outline" className="text-xs">
                      {formatDuration(segment.timestamp)}
                    </Badge>
                  </div>

                  {/* Text */}
                  <p className="mt-2 text-sm leading-relaxed text-gray-700">
                    {segment.text}
                  </p>
                </div>
              )
            })}

            {segments.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>No transcript available yet.</p>
                <p className="text-sm mt-1">
                  Audio will be transcribed in real-time during the meeting.
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

