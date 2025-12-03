'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { TrendingUp, Target, Globe, AlertCircle } from 'lucide-react'

interface MarketData {
  tam?: string
  sam?: string
  growthRate?: string
  keyPlayers?: string[]
  trends?: string[]
  sources?: string[]
}

interface Insight {
  id: string
  type: string
  title: string
  description: string
  severity?: string
}

interface MarketPanelProps {
  marketData?: MarketData
  insights: Insight[]
}

export function MarketPanel({ marketData, insights }: MarketPanelProps) {
  const opportunities = insights.filter(i => i.type === 'opportunity')
  const risks = insights.filter(i => i.type === 'risk')
  const moatInsights = insights.filter(i => i.type === 'moat')

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'high':
        return 'destructive'
      case 'medium':
        return 'secondary'
      case 'low':
        return 'outline'
      default:
        return 'outline'
    }
  }

  return (
    <div className="space-y-6">
      {/* Market Size */}
      {marketData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Market Intelligence
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* TAM/SAM/SOM */}
            <div className="grid grid-cols-3 gap-4">
              {marketData.tam && (
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-600 font-semibold mb-1">
                    TAM
                  </p>
                  <p className="text-2xl font-bold text-blue-900">
                    {marketData.tam}
                  </p>
                </div>
              )}
              {marketData.sam && (
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-xs text-purple-600 font-semibold mb-1">
                    SAM
                  </p>
                  <p className="text-2xl font-bold text-purple-900">
                    {marketData.sam}
                  </p>
                </div>
              )}
              {marketData.growthRate && (
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-xs text-green-600 font-semibold mb-1">
                    Growth Rate
                  </p>
                  <p className="text-2xl font-bold text-green-900">
                    {marketData.growthRate}
                  </p>
                </div>
              )}
            </div>

            {/* Key Players */}
            {marketData.keyPlayers && marketData.keyPlayers.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Key Market Players
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {marketData.keyPlayers.map((player, index) => (
                      <Badge key={index} variant="secondary">
                        {player}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Trends */}
            {marketData.trends && marketData.trends.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Market Trends
                  </h4>
                  <ul className="space-y-2">
                    {marketData.trends.map((trend, index) => (
                      <li
                        key={index}
                        className="text-sm flex items-start gap-2"
                      >
                        <span className="text-blue-600 mt-1">•</span>
                        <span className="text-gray-700">{trend}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Opportunities */}
      {opportunities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Opportunities
              <Badge variant="secondary" className="ml-auto">
                {opportunities.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {opportunities.map(insight => (
                <div
                  key={insight.id}
                  className="p-4 bg-green-50 border border-green-200 rounded-lg"
                >
                  <h4 className="font-semibold text-sm text-green-900 mb-1">
                    {insight.title}
                  </h4>
                  <p className="text-sm text-green-800">
                    {insight.description}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Risks & Concerns */}
      {risks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              Risks & Concerns
              <Badge variant="secondary" className="ml-auto">
                {risks.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {risks.map(insight => (
                <div
                  key={insight.id}
                  className="p-4 bg-red-50 border border-red-200 rounded-lg"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-sm text-red-900">
                      {insight.title}
                    </h4>
                    {insight.severity && (
                      <Badge
                        variant={getSeverityColor(insight.severity) as any}
                        className="text-xs capitalize"
                      >
                        {insight.severity}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-red-800">{insight.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Moat Analysis */}
      {moatInsights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-600" />
              Competitive Moat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {moatInsights.map(insight => (
                <div
                  key={insight.id}
                  className="p-4 bg-purple-50 border border-purple-200 rounded-lg"
                >
                  <h4 className="font-semibold text-sm text-purple-900 mb-1">
                    {insight.title}
                  </h4>
                  <p className="text-sm text-purple-800">
                    {insight.description}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

