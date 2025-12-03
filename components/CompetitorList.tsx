'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { formatCurrency, formatCompactNumber } from '@/lib/utils'
import { Building2, TrendingUp, Users, DollarSign } from 'lucide-react'

interface Competitor {
  id: string
  name: string
  website?: string
  fundingStage?: string
  totalFunding?: number
  niche?: string
  revenue?: number
  employees?: number
  description?: string
}

interface CompetitorListProps {
  competitors: Competitor[]
}

export function CompetitorList({ competitors }: CompetitorListProps) {
  const getStageColor = (stage?: string) => {
    const s = stage?.toLowerCase() || ''
    if (s.includes('series c') || s.includes('series d')) return 'bg-purple-100 text-purple-800'
    if (s.includes('series b')) return 'bg-blue-100 text-blue-800'
    if (s.includes('series a')) return 'bg-green-100 text-green-800'
    if (s.includes('seed')) return 'bg-yellow-100 text-yellow-800'
    if (s.includes('pre-seed')) return 'bg-orange-100 text-orange-800'
    return 'bg-gray-100 text-gray-800'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Competitive Landscape
          <Badge variant="secondary" className="ml-auto">
            {competitors.length} competitors
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {competitors.map((competitor, index) => (
            <div key={competitor.id}>
              {index > 0 && <Separator className="my-6" />}
              
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{competitor.name}</h3>
                    {competitor.website && (
                      <a
                        href={competitor.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {competitor.website}
                      </a>
                    )}
                  </div>
                  {competitor.fundingStage && (
                    <Badge
                      className={`${getStageColor(
                        competitor.fundingStage
                      )} capitalize`}
                    >
                      {competitor.fundingStage}
                    </Badge>
                  )}
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-3 gap-4">
                  {competitor.totalFunding && (
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">Funding</p>
                        <p className="font-semibold">
                          {formatCurrency(competitor.totalFunding)}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {competitor.revenue && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">Est. Revenue</p>
                        <p className="font-semibold">
                          {formatCompactNumber(competitor.revenue)}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {competitor.employees && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">Employees</p>
                        <p className="font-semibold">{competitor.employees}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Niche */}
                {competitor.niche && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs font-semibold text-blue-900 mb-1">
                      Focus Area
                    </p>
                    <p className="text-sm text-blue-800">{competitor.niche}</p>
                  </div>
                )}

                {/* Description/Differentiation */}
                {competitor.description && (
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {competitor.description}
                  </p>
                )}
              </div>
            </div>
          ))}

          {competitors.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Building2 className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No competitive analysis available yet.</p>
              <p className="text-sm mt-1">
                Competitors will be identified during the research phase.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

