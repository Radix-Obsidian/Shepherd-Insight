'use client'

import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSubscriptionStore, useRemainingUsage, useHasHydrated } from '@/lib/subscription'
import { FREE_LIMITS } from '@/types/subscription'

/**
 * Banner showing current usage and upgrade CTA
 * Displayed on dashboard and feature pages for free users
 */
export function UpgradeBanner() {
  const hasHydrated = useHasHydrated()
  const { tier } = useSubscriptionStore()
  const remaining = useRemainingUsage()

  // Wait for hydration to prevent SSR mismatch
  if (!hasHydrated) {
    return null
  }

  // Don't show for Pro/Lifetime users
  if (tier === 'pro' || tier === 'lifetime') {
    return null
  }

  // Calculate which feature is most depleted
  const usageItems = [
    { name: 'Compass', remaining: remaining.clarity, total: FREE_LIMITS.claritySessionsPerMonth },
    { name: 'Muse', remaining: remaining.research, total: FREE_LIMITS.researchSessionsPerMonth },
    { name: 'Blueprint', remaining: remaining.blueprint, total: FREE_LIMITS.blueprintsPerMonth },
  ]

  const mostDepleted = usageItems.reduce((min, item) => 
    (item.remaining / item.total) < (min.remaining / min.total) ? item : min
  )

  const allUsed = usageItems.every(item => item.remaining <= 0)

  if (allUsed) {
    return (
      <div className="mb-6 p-6 bg-primary text-primary-foreground rounded-2xl shadow-md">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-white/20 rounded-full mt-1">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-lg">Ready to make this your go-to decision studio?</p>
              <p className="text-primary-foreground/90 mt-1">
                You’ve seen what one journey can do. Upgrade to unlock more projects and richer exports.
              </p>
            </div>
          </div>
          <Link href="/account?tab=billing">
            <Button variant="secondary" className="whitespace-nowrap font-semibold shadow-sm">
              View plans
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-6 p-4 bg-card border border-border/50 rounded-2xl shadow-sm">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Free tier usage:</span>
          <div className="flex items-center gap-3">
            <span>
              <span className="font-semibold text-primary">{remaining.clarity}</span>/{FREE_LIMITS.claritySessionsPerMonth} Compass
            </span>
            <span className="text-border">•</span>
            <span>
              <span className="font-semibold text-primary">{remaining.research}</span>/{FREE_LIMITS.researchSessionsPerMonth} Muse
            </span>
            <span className="text-border">•</span>
            <span>
              <span className="font-semibold text-primary">{remaining.blueprint}</span>/{FREE_LIMITS.blueprintsPerMonth} Blueprint
            </span>
          </div>
        </div>
        <Link href="/account?tab=billing" className="text-sm text-primary hover:text-primary/80 font-semibold flex items-center gap-1 transition-colors">
          Upgrade <span aria-hidden="true">→</span>
        </Link>
      </div>
    </div>
  )
}
