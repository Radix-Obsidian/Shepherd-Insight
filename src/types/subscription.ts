/**
 * Subscription Types for ShepLight Freemium Model
 * 
 * Philosophy: "Give away value. Charge for velocity."
 * - Free tier: Experience the full transformation once
 * - Pro tier: Unlimited velocity for serious builders
 */

export type SubscriptionTier = 'free' | 'pro' | 'lifetime'
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing'

export type FeatureType = 
  | 'clarity'        // Compass sessions
  | 'research'       // Muse sessions (Perplexity)
  | 'blueprint'      // Blueprint generations
  | 'mindmap'        // Mind map generations
  | 'export'         // PDF/MD exports
  | 'refine_decision'// Decision Vault refinement (Pro only)
  | 'ai_prompt'      // AI Dev Prompt generation (Pro only)

// Free tier limits (experience the transformation once)
export const FREE_LIMITS = {
  claritySessionsPerMonth: 3,
  researchSessionsPerMonth: 2,
  blueprintsPerMonth: 1,
  mindMapsPerMonth: 1,
  exportsPerMonth: 1,
  canRefineDecisions: false,
  canGenerateAIPrompt: false,
} as const

// Pro tier limits (unlimited velocity)
export const PRO_LIMITS = {
  claritySessionsPerMonth: Infinity,
  researchSessionsPerMonth: Infinity,
  blueprintsPerMonth: Infinity,
  mindMapsPerMonth: Infinity,
  exportsPerMonth: Infinity,
  canRefineDecisions: true,
  canGenerateAIPrompt: true,
} as const

export interface UsageLimits {
  claritySessionsRemaining: number
  researchSessionsRemaining: number
  blueprintsRemaining: number
  mindMapsRemaining: number
  exportsRemaining: number
  canRefineDecisions: boolean
  canGenerateAIPrompt: boolean
}

export interface UsageStats {
  claritySessionsUsed: number
  researchSessionsUsed: number
  blueprintsUsed: number
  mindMapsUsed: number
  exportsUsed: number
}

export interface UserSubscription {
  id: string
  userId: string
  tier: SubscriptionTier
  status: SubscriptionStatus
  
  // Stripe integration
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  stripePriceId?: string
  
  // Period tracking
  currentPeriodStart: string
  currentPeriodEnd: string
  
  // Usage tracking (resets monthly)
  usage: UsageStats
  
  // Timestamps
  createdAt: string
  updatedAt: string
  canceledAt?: string
}

/**
 * Get limits for a given tier
 */
export function getLimitsForTier(tier: SubscriptionTier): typeof FREE_LIMITS | typeof PRO_LIMITS {
  switch (tier) {
    case 'free':
      return FREE_LIMITS
    case 'pro':
    case 'lifetime':
      return PRO_LIMITS
  }
}

/**
 * Check if a feature is available for a tier
 */
export function isFeatureAvailable(tier: SubscriptionTier, feature: FeatureType): boolean {
  const limits = getLimitsForTier(tier)
  
  switch (feature) {
    case 'refine_decision':
      return limits.canRefineDecisions
    case 'ai_prompt':
      return limits.canGenerateAIPrompt
    default:
      return true // Count-based features are available, just limited
  }
}

/**
 * Get friendly name for a feature (for UI messages)
 */
export function getFeatureDisplayName(feature: FeatureType): string {
  const names: Record<FeatureType, string> = {
    clarity: 'Compass session',
    research: 'Muse research session',
    blueprint: 'Blueprint generation',
    mindmap: 'Mind Map',
    export: 'export',
    refine_decision: 'Decision refinement',
    ai_prompt: 'AI Dev Prompt',
  }
  return names[feature]
}
