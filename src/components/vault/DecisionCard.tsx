'use client'

import { useState } from 'react'
import { Decision, DecisionType } from '@/types/project'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Lock, RefreshCw, Replace, Trash2, Sparkles, XCircle, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DecisionCardProps {
  decision: Decision
  onLock: () => void
  onRefine: () => void
  onReplace: () => void
  onDiscard: () => void
  onScopeOut: () => void
  onNotNow: () => void
}

const DECISION_TYPE_COLORS: Record<DecisionType, string> = {
  persona: 'bg-purple-100 text-purple-800 border-purple-200',
  feature: 'bg-blue-100 text-blue-800 border-blue-200',
  painPoint: 'bg-red-100 text-red-800 border-red-200',
  insight: 'bg-amber-100 text-amber-800 border-amber-200',
  competitorGap: 'bg-green-100 text-green-800 border-green-200',
  emotionalJourneyStage: 'bg-pink-100 text-pink-800 border-pink-200',
}

const DECISION_TYPE_LABELS: Record<DecisionType, string> = {
  persona: 'Persona',
  feature: 'Feature',
  painPoint: 'Pain Point',
  insight: 'Insight',
  competitorGap: 'Competitor Gap',
  emotionalJourneyStage: 'Journey Stage',
}

const STATE_BADGES: Record<Decision['state'], { label: string; className: string }> = {
  pending: { label: 'Pending Review', className: 'bg-slate-100 text-slate-700' },
  locked: { label: 'Locked', className: 'bg-green-100 text-green-700' },
  refined: { label: 'Refined', className: 'bg-blue-100 text-blue-700' },
  replaced: { label: 'Replaced', className: 'bg-purple-100 text-purple-700' },
  discarded: { label: 'Discarded', className: 'bg-red-100 text-red-700' },
  scopedOut: { label: 'Out of Scope', className: 'bg-gray-100 text-gray-700' },
  notNow: { label: 'Not Now', className: 'bg-orange-100 text-orange-700' },
}

function getDecisionPreview(decision: Decision): { title: string; description: string } {
  const { type, content } = decision

  switch (type) {
    case 'persona':
      return {
        title: content.name || 'Unnamed Persona',
        description: content.role || content.quote || '',
      }
    case 'feature':
      return {
        title: content.name || content.title || 'Unnamed Feature',
        description: content.description || content.userStory || '',
      }
    case 'painPoint':
      return {
        title: content.pain || content.description || 'Pain Point',
        description: content.context || content.impact || '',
      }
    case 'insight':
      return {
        title: content.insight || content.title || 'Insight',
        description: content.evidence || content.implication || '',
      }
    case 'competitorGap':
      return {
        title: content.competitor || 'Competitor Gap',
        description: content.weakness || content.opportunity || '',
      }
    case 'emotionalJourneyStage':
      return {
        title: content.stage || content.name || 'Journey Stage',
        description: content.emotion || content.description || '',
      }
    default:
      return { title: 'Decision', description: '' }
  }
}

export function DecisionCard({
  decision,
  onLock,
  onRefine,
  onReplace,
  onDiscard,
  onScopeOut,
  onNotNow,
}: DecisionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { title, description } = getDecisionPreview(decision)
  const stateBadge = STATE_BADGES[decision.state]
  const isActionable = decision.state === 'pending' || decision.state === 'refined'

  return (
    <Card 
      className={cn(
        "transition-all hover:shadow-md",
        decision.state === 'discarded' && "opacity-50",
        decision.locked && "border-green-300 bg-green-50/30"
      )}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={DECISION_TYPE_COLORS[decision.type]}>
                {DECISION_TYPE_LABELS[decision.type]}
              </Badge>
              <Badge variant="outline" className={stateBadge.className}>
                {stateBadge.label}
              </Badge>
              {decision.locked && (
                <Lock className="w-4 h-4 text-green-600" />
              )}
            </div>
            <CardTitle className="text-lg">{title}</CardTitle>
            {description && (
              <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                {description}
              </p>
            )}
          </div>
        </div>
      </CardHeader>

      {isActionable && (
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              onClick={onLock}
              disabled={decision.locked}
              className="gap-2"
            >
              <Lock className="w-4 h-4" />
              {decision.locked ? 'Locked' : 'Lock It'}
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={onRefine}
              className="gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Refine It
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={onReplace}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Replace It
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={onNotNow}
              className="gap-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
            >
              <Clock className="w-4 h-4" />
              Not Now
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={onScopeOut}
              className="gap-2 text-gray-600 hover:text-gray-700 hover:bg-gray-50"
            >
              <XCircle className="w-4 h-4" />
              Out of Scope
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={onDiscard}
              className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
              Discard It
            </Button>
          </div>

          {decision.refinementHistory && decision.refinementHistory.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
              >
                {isExpanded ? '▼' : '▶'} {decision.refinementHistory.length} refinement{decision.refinementHistory.length > 1 ? 's' : ''}
              </button>
              {isExpanded && (
                <div className="mt-2 space-y-2">
                  {decision.refinementHistory.map((entry, idx) => (
                    <div key={idx} className="text-xs p-2 bg-slate-50 rounded">
                      <div className="font-medium text-slate-700">{entry.userRequest}</div>
                      <div className="text-slate-500 mt-1">{new Date(entry.timestamp).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}
