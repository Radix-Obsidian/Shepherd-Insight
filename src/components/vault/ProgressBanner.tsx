'use client'

import Link from 'next/link'
import { CheckCircle2, Circle, Sparkles, ArrowRight } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface DecisionStats {
  total: number
  pending: number
  locked: number
  refined: number
  replaced: number
  discarded: number
}

interface ProgressBannerProps {
  stats: DecisionStats
  exportUrl?: string // URL to exports page with project/version params
}

export function ProgressBanner({ stats, exportUrl }: ProgressBannerProps) {
  const { total, pending, locked, refined, replaced, discarded } = stats
  const reviewedCount = locked + refined + replaced + discarded
  const lockedCount = locked + refined + replaced // Decisions ready for export (not discarded)
  const progress = total > 0 ? (reviewedCount / total) * 100 : 0
  const isComplete = reviewedCount === total && total > 0

  return (
    <div className={cn(
      "rounded-lg border p-6 mb-6 transition-all",
      isComplete 
        ? "bg-green-50 border-green-200" 
        : "bg-indigo-50 border-indigo-200"
    )}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className={cn(
            "text-lg font-semibold mb-1",
            isComplete ? "text-green-900" : "text-indigo-900"
          )}>
            {isComplete ? (
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                Vault Complete!
              </span>
            ) : (
              `Review Progress`
            )}
          </h3>
          <p className={cn(
            "text-sm",
            isComplete ? "text-green-700" : "text-indigo-700"
          )}>
            {isComplete 
              ? `All decisions reviewed. ${lockedCount} decision${lockedCount !== 1 ? 's' : ''} ready to export!`
              : `${reviewedCount} of ${total} decisions reviewed`
            }
          </p>
        </div>

        <div className="text-right">
          <div className={cn(
            "text-3xl font-bold",
            isComplete ? "text-green-600" : "text-indigo-600"
          )}>
            {Math.round(progress)}%
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {pending} pending
          </div>
        </div>
      </div>

      <Progress value={progress} className="h-2 mb-4" />

      {/* Export CTA when vault is complete */}
      {isComplete && exportUrl && (
        <div className="mb-4 p-4 bg-white rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <div>
                <p className="font-medium text-slate-900">Generate AI Dev Prompt</p>
                <p className="text-xs text-slate-500">Export your locked decisions as a ready-to-use prompt for Claude or Cursor</p>
              </div>
            </div>
            <Link href={exportUrl}>
              <Button className="gap-2 bg-purple-600 hover:bg-purple-700">
                Export Now
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Circle className="w-3 h-3 text-green-600 fill-green-600" />
          <span className="text-slate-600">Locked: <strong>{locked}</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <Circle className="w-3 h-3 text-blue-600 fill-blue-600" />
          <span className="text-slate-600">Refined: <strong>{refined}</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <Circle className="w-3 h-3 text-purple-600 fill-purple-600" />
          <span className="text-slate-600">Replaced: <strong>{replaced}</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <Circle className="w-3 h-3 text-red-600 fill-red-600" />
          <span className="text-slate-600">Discarded: <strong>{discarded}</strong></span>
        </div>
      </div>
    </div>
  )
}
