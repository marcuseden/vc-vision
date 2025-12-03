'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { FileText, Share2, Mail, CheckCircle } from 'lucide-react'

interface MeetingSummary {
  executiveSummary: string
  keyTakeaways: string[]
  strengths: string[]
  concerns: string[]
  opportunities: string[]
  nextSteps: string[]
  investmentThesis: string
  recommendedAction: string
  confidenceScore: number
}

interface SummaryEditorProps {
  summary: MeetingSummary
  onSave?: (summary: MeetingSummary) => void
  onShare?: () => void
  onSendEmail?: () => void
}

export function SummaryEditor({
  summary,
  onSave,
  onShare,
  onSendEmail,
}: SummaryEditorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedSummary, setEditedSummary] = useState(summary)

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'term_sheet':
        return 'bg-green-100 text-green-800'
      case 'partner_meeting':
        return 'bg-blue-100 text-blue-800'
      case 'further_diligence':
        return 'bg-yellow-100 text-yellow-800'
      case 'pass':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleSave = () => {
    onSave?.(editedSummary)
    setIsEditing(false)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            IC Meeting Summary
          </CardTitle>
          <div className="flex gap-2">
            <Badge
              className={`${getActionColor(
                summary.recommendedAction
              )} capitalize`}
            >
              {summary.recommendedAction.replace('_', ' ')}
            </Badge>
            <Badge variant="secondary">
              {Math.round(summary.confidenceScore * 100)}% Confidence
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Actions */}
        <div className="flex gap-2">
          {!isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                Edit Summary
              </Button>
              {onShare && (
                <Button variant="outline" onClick={onShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share with Team
                </Button>
              )}
              {onSendEmail && (
                <Button onClick={onSendEmail}>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
              )}
            </>
          ) : (
            <>
              <Button onClick={handleSave}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setEditedSummary(summary)
                  setIsEditing(false)
                }}
              >
                Cancel
              </Button>
            </>
          )}
        </div>

        <Separator />

        {/* Executive Summary */}
        <div>
          <h3 className="font-semibold mb-2">Executive Summary</h3>
          {isEditing ? (
            <textarea
              className="w-full p-3 border rounded-lg text-sm resize-none"
              rows={4}
              value={editedSummary.executiveSummary}
              onChange={e =>
                setEditedSummary({
                  ...editedSummary,
                  executiveSummary: e.target.value,
                })
              }
            />
          ) : (
            <p className="text-sm text-gray-700 leading-relaxed">
              {summary.executiveSummary}
            </p>
          )}
        </div>

        <Separator />

        {/* Key Takeaways */}
        <div>
          <h3 className="font-semibold mb-3">Key Takeaways</h3>
          <ul className="space-y-2">
            {summary.keyTakeaways.map((takeaway, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <span className="text-blue-600 mt-1">•</span>
                <span className="text-gray-700">{takeaway}</span>
              </li>
            ))}
          </ul>
        </div>

        <Separator />

        {/* Strengths */}
        <div>
          <h3 className="font-semibold mb-3 text-green-700">Strengths</h3>
          <div className="space-y-2">
            {summary.strengths.map((strength, index) => (
              <div
                key={index}
                className="p-3 bg-green-50 border border-green-200 rounded-lg"
              >
                <p className="text-sm text-green-800">{strength}</p>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Concerns */}
        <div>
          <h3 className="font-semibold mb-3 text-red-700">Concerns</h3>
          <div className="space-y-2">
            {summary.concerns.map((concern, index) => (
              <div
                key={index}
                className="p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <p className="text-sm text-red-800">{concern}</p>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Opportunities */}
        <div>
          <h3 className="font-semibold mb-3 text-blue-700">Opportunities</h3>
          <div className="space-y-2">
            {summary.opportunities.map((opportunity, index) => (
              <div
                key={index}
                className="p-3 bg-blue-50 border border-blue-200 rounded-lg"
              >
                <p className="text-sm text-blue-800">{opportunity}</p>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Investment Thesis */}
        <div>
          <h3 className="font-semibold mb-2">Investment Thesis</h3>
          <p className="text-sm text-gray-700 leading-relaxed p-4 bg-purple-50 border border-purple-200 rounded-lg">
            {summary.investmentThesis}
          </p>
        </div>

        <Separator />

        {/* Next Steps */}
        <div>
          <h3 className="font-semibold mb-3">Next Steps</h3>
          <ul className="space-y-2">
            {summary.nextSteps.map((step, index) => (
              <li key={index} className="flex items-start gap-3 text-sm">
                <CheckCircle className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{step}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

