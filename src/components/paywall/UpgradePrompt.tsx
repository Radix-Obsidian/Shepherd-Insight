'use client'

import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FeatureType, getFeatureDisplayName } from '@/types/subscription'
import { getUpgradeMessage } from '@/lib/subscription/usage-guard'

interface UpgradePromptProps {
  feature: FeatureType
  used: number
  limit: number
  onUpgrade: () => void
  variant?: 'warning' | 'info'
}

/**
 * Soft limit warning (shown at 80% usage)
 * Non-blocking, just informative
 */
export function UpgradePrompt({ 
  feature, 
  used, 
  limit, 
  onUpgrade,
  variant = 'warning'
}: UpgradePromptProps) {
  const featureName = getFeatureDisplayName(feature)
  const remaining = limit - used
  
  const bgColor = variant === 'warning' 
    ? 'bg-yellow-50 border-yellow-200' 
    : 'bg-blue-50 border-blue-200'
  const textColor = variant === 'warning'
    ? 'text-yellow-900'
    : 'text-blue-900'
  const iconColor = variant === 'warning'
    ? 'text-yellow-600'
    : 'text-blue-600'
  const btnColor = variant === 'warning'
    ? 'bg-yellow-600 hover:bg-yellow-700'
    : 'bg-blue-600 hover:bg-blue-700'

  return (
    <div className={`mb-6 p-4 ${bgColor} border-2 rounded-xl`}>
      <div className="flex items-start gap-3">
        <AlertCircle className={`w-6 h-6 ${iconColor} flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          <h3 className={`font-bold ${textColor} mb-1`}>
            {remaining === 0 
              ? `You've used all your ${featureName}s`
              : `Running low on ${featureName}s`
            }
          </h3>
          <p className={`text-sm ${textColor.replace('900', '800')} mb-3`}>
            You&apos;ve used {used} of {limit} {featureName}s this month.
            {remaining > 0 && ` ${remaining} remaining.`}
          </p>
          <p className="text-sm text-slate-600 mb-3">
            {getUpgradeMessage(feature)}
          </p>
          <Button 
            onClick={onUpgrade}
            className={`${btnColor} text-white`}
          >
            See Pro Features →
          </Button>
        </div>
      </div>
    </div>
  )
}
