'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { HelpCircle, Volume2, Check } from 'lucide-react'

interface Question {
  id: string
  text: string
  category: string
  priority: number
  asked: boolean
  answer?: string
  slideNumber?: number
}

interface QuestionsPanelProps {
  questions: Question[]
  onMarkAsked?: (questionId: string) => void
  onPlayAudio?: (questionId: string) => void
}

export function QuestionsPanel({
  questions,
  onMarkAsked,
  onPlayAudio,
}: QuestionsPanelProps) {
  const sortedQuestions = [...questions].sort((a, b) => {
    // Unasked first, then by priority
    if (a.asked !== b.asked) return a.asked ? 1 : -1
    return b.priority - a.priority
  })

  const unaskedCount = questions.filter(q => !q.asked).length

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'verification':
        return 'bg-orange-100 text-orange-800'
      case 'expansion':
        return 'bg-blue-100 text-blue-800'
      case 'risk':
        return 'bg-red-100 text-red-800'
      case 'opportunity':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityLabel = (priority: number) => {
    if (priority >= 8) return { label: 'High', color: 'destructive' }
    if (priority >= 5) return { label: 'Medium', color: 'secondary' }
    return { label: 'Low', color: 'outline' }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Smart Questions
          </CardTitle>
          {unaskedCount > 0 && (
            <Badge variant="default">{unaskedCount} pending</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-4">
            {sortedQuestions.map((question) => {
              const priorityInfo = getPriorityLabel(question.priority)

              return (
                <div
                  key={question.id}
                  className={`p-4 rounded-lg border ${
                    question.asked
                      ? 'bg-gray-50 border-gray-200 opacity-75'
                      : 'bg-white border-gray-300 shadow-sm'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Question Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 space-y-2">
                        <p className="text-sm font-medium leading-relaxed">
                          {question.text}
                        </p>
                        
                        {/* Badges */}
                        <div className="flex flex-wrap gap-2">
                          <Badge
                            variant="secondary"
                            className={`text-xs capitalize ${getCategoryColor(
                              question.category
                            )}`}
                          >
                            {question.category}
                          </Badge>
                          <Badge
                            variant={priorityInfo.color as any}
                            className="text-xs"
                          >
                            {priorityInfo.label} Priority
                          </Badge>
                          {question.slideNumber && (
                            <Badge variant="outline" className="text-xs">
                              Slide {question.slideNumber}
                            </Badge>
                          )}
                          {question.asked && (
                            <Badge variant="default" className="text-xs">
                              <Check className="h-3 w-3 mr-1" />
                              Asked
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Status Icon */}
                      {question.asked ? (
                        <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                      ) : (
                        <HelpCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                      )}
                    </div>

                    {/* Answer if available */}
                    {question.answer && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-xs font-semibold text-green-900 mb-1">
                          Answer:
                        </p>
                        <p className="text-sm text-green-800">
                          {question.answer}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    {!question.asked && (
                      <div className="flex gap-2">
                        {onPlayAudio && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onPlayAudio(question.id)}
                          >
                            <Volume2 className="h-4 w-4 mr-2" />
                            Play
                          </Button>
                        )}
                        {onMarkAsked && (
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => onMarkAsked(question.id)}
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Mark as Asked
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}

            {questions.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <HelpCircle className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>No questions generated yet.</p>
                <p className="text-sm mt-1">
                  Questions will appear as slides are analyzed.
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

