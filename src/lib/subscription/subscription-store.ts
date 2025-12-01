/**
 * Subscription Store for ShepLight Freemium
 * 
 * Client-side state management for subscription status and usage tracking.
 * Uses Zustand with localStorage persistence for MVP.
 * 
 * In production, this syncs with Supabase for server-side verification.
 * 
 * IMPORTANT: Uses skipHydration to prevent React hydration mismatch errors.
 * Components must check hasHydrated before rendering subscription-dependent UI.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useEffect, useState } from 'react'
import { 
  SubscriptionTier, 
  UsageStats, 
  FeatureType,
  FREE_LIMITS
} from '@/types/subscription'
import { checkFeatureUsage, isApproachingLimit, UsageCheckResult } from './usage-guard'

interface SubscriptionState {
  // Hydration tracking to prevent SSR mismatch
  _hasHydrated: boolean
  setHasHydrated: (state: boolean) => void
  
  // Subscription info
  tier: SubscriptionTier
  status: 'active' | 'canceled' | 'past_due' | 'trialing'
  currentPeriodEnd: string | null
  
  // Usage tracking
  usage: UsageStats
  
  // Actions
  setTier: (tier: SubscriptionTier) => void
  incrementUsage: (feature: FeatureType) => void
  resetUsage: () => void
  canUseFeature: (feature: FeatureType) => UsageCheckResult
  isApproachingLimit: (feature: FeatureType) => { approaching: boolean; percentUsed: number }
  
  // For syncing with server
  syncFromServer: (data: {
    tier: SubscriptionTier
    status: 'active' | 'canceled' | 'past_due' | 'trialing'
    usage: UsageStats
    currentPeriodEnd: string
  }) => void
}

const initialUsage: UsageStats = {
  claritySessionsUsed: 0,
  researchSessionsUsed: 0,
  blueprintsUsed: 0,
  mindMapsUsed: 0,
  exportsUsed: 0,
}

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      // Hydration tracking
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      
      // Initial state - default to free tier
      tier: 'free',
      status: 'active',
      currentPeriodEnd: null,
      usage: initialUsage,

      // Set tier (after successful payment)
      setTier: (tier) => set({ tier }),

      // Increment usage for a feature
      incrementUsage: (feature) => {
        const { tier } = get()
        
        // Pro/Lifetime don't track usage
        if (tier === 'pro' || tier === 'lifetime') return

        set((state) => {
          const newUsage = { ...state.usage }
          
          switch (feature) {
            case 'clarity':
              newUsage.claritySessionsUsed += 1
              break
            case 'research':
              newUsage.researchSessionsUsed += 1
              break
            case 'blueprint':
              newUsage.blueprintsUsed += 1
              break
            case 'mindmap':
              newUsage.mindMapsUsed += 1
              break
            case 'export':
              newUsage.exportsUsed += 1
              break
            // refine_decision and ai_prompt don't have counts
          }
          
          return { usage: newUsage }
        })
      },

      // Reset usage (monthly reset or manual)
      resetUsage: () => set({ usage: initialUsage }),

      // Check if user can use a feature
      canUseFeature: (feature) => {
        const { tier, usage } = get()
        return checkFeatureUsage(tier, feature, usage)
      },

      // Check if approaching limit
      isApproachingLimit: (feature) => {
        const { tier, usage } = get()
        return isApproachingLimit(tier, feature, usage)
      },

      // Sync state from server (after auth or page load)
      syncFromServer: (data) => {
        set({
          tier: data.tier,
          status: data.status,
          usage: data.usage,
          currentPeriodEnd: data.currentPeriodEnd,
        })
      },
    }),
    {
      name: 'sheplight-subscription',
      // Only persist essential data (not hydration state)
      partialize: (state) => ({
        tier: state.tier,
        status: state.status,
        usage: state.usage,
        currentPeriodEnd: state.currentPeriodEnd,
      }),
      // Set hydrated to true after rehydration completes
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)

/**
 * Hook to check and track feature usage
 * Returns: { allowed, reason, used, limit, remaining }
 */
export function useFeatureGate(feature: FeatureType) {
  const { canUseFeature, incrementUsage, isApproachingLimit, tier } = useSubscriptionStore()
  
  const check = canUseFeature(feature)
  const limitWarning = isApproachingLimit(feature)
  
  return {
    ...check,
    ...limitWarning,
    tier,
    trackUsage: () => incrementUsage(feature),
  }
}

/**
 * Hook to wait for store hydration before rendering
 * Prevents hydration mismatch errors from localStorage state
 */
export function useHasHydrated() {
  const [hasHydrated, setHasHydrated] = useState(false)
  
  useEffect(() => {
    // Check if store has rehydrated from localStorage
    const unsubscribe = useSubscriptionStore.persist.onFinishHydration(() => {
      setHasHydrated(true)
    })
    
    // If already hydrated (e.g., fast refresh), set immediately
    if (useSubscriptionStore.persist.hasHydrated()) {
      setHasHydrated(true)
    }
    
    return unsubscribe
  }, [])
  
  return hasHydrated
}

/**
 * Get remaining usage for display
 */
export function useRemainingUsage() {
  const { tier, usage } = useSubscriptionStore()
  
  if (tier === 'pro' || tier === 'lifetime') {
    return {
      clarity: Infinity,
      research: Infinity,
      blueprint: Infinity,
      mindmap: Infinity,
      export: Infinity,
    }
  }

  return {
    clarity: FREE_LIMITS.claritySessionsPerMonth - usage.claritySessionsUsed,
    research: FREE_LIMITS.researchSessionsPerMonth - usage.researchSessionsUsed,
    blueprint: FREE_LIMITS.blueprintsPerMonth - usage.blueprintsUsed,
    mindmap: FREE_LIMITS.mindMapsPerMonth - usage.mindMapsUsed,
    export: FREE_LIMITS.exportsPerMonth - usage.exportsUsed,
  }
}
