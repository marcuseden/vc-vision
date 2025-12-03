'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { AlertCircle, CheckCircle, HelpCircle, Lightbulb } from 'lucide-react'

interface Claim {
  id: string
  text: string
  type: string
  isVerified: boolean
  confidence?: number
}

interface Question {
  id: string
  text: string
  category: string
  priority: number
  asked: boolean
}

interface SlideCardProps {
  slideNumber: number
  imageUrl?: string
  text?: string
  claims: Claim[]
  questions: Question[]
  onAnalyze?: () => void
  onAskQuestion?: (questionId: string) => void
}

export function SlideCard({
  slideNumber,
  imageUrl,
  text,
  claims,
  questions,
  onAnalyze,
  onAskQuestion,
}: SlideCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const topQuestions = questions
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 3)

  const unverifiedClaims = claims.filter(c => !c.isVerified)

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Slide {slideNumber}</CardTitle>
          <div className="flex gap-2">
            {unverifiedClaims.length > 0 && (
              <Badge variant="outline" className="text-orange-600">
                <AlertCircle className="h-3 w-3 mr-1" />
                {unverifiedClaims.length} Unverified
              </Badge>
            )}
            {questions.length > 0 && (
              <Badge variant="outline" className="text-blue-600">
                <HelpCircle className="h-3 w-3 mr-1" />
                {questions.length} Questions
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-6">
        {/* Slide Image */}
        {imageUrl && (
          <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={imageUrl}
              alt={`Slide ${slideNumber}`}
              className="w-full h-full object-contain"
            />
          </div>
        )}

        {/* Analyze Button */}
        {!text && onAnalyze && (
          <Button onClick={onAnalyze} className="w-full">
            <Lightbulb className="h-4 w-4 mr-2" />
            Analyze Slide
          </Button>
        )}

        {/* Extracted Text */}
        {text && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Extracted Content</h4>
            <p className="text-sm text-gray-700 leading-relaxed">{text}</p>
          </div>
        )}

        {/* Claims */}
        {claims.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              Key Claims
              <Badge variant="secondary">{claims.length}</Badge>
            </h4>
            <div className="space-y-2">
              {claims.map(claim => (
                <div
                  key={claim.id}
                  className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg"
                >
                  {claim.isVerified ? (
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1 space-y-1">
                    <p className="text-sm">{claim.text}</p>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs capitalize">
                        {claim.type}
                      </Badge>
                      {claim.confidence && (
                        <Badge variant="secondary" className="text-xs">
                          {Math.round(claim.confidence * 100)}% confident
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Questions */}
        {topQuestions.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Smart Questions</h4>
              <div className="space-y-2">
                {topQuestions.map(q => (
                  <div
                    key={q.id}
                    className="p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-2"
                  >
                    <p className="text-sm font-medium">{q.text}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-xs capitalize">
                          {q.category}
                        </Badge>
                        <Badge
                          variant={q.asked ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          Priority: {q.priority}
                        </Badge>
                      </div>
                      {!q.asked && onAskQuestion && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onAskQuestion(q.id)}
                        >
                          Ask
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

