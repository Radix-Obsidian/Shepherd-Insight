/**
 * Usage Guard System for ShepLight Freemium
 * 
 * This module provides client-side usage tracking and limit checking.
 * For MVP, we use Zustand to track usage locally.
 * Later, this integrates with Supabase for persistent tracking.
 */

import { 
  FeatureType, 
  SubscriptionTier, 
  FREE_LIMITS, 
  PRO_LIMITS,
  UsageStats,
  getFeatureDisplayName
} from '@/types/subscription'

export interface UsageCheckResult {
  allowed: boolean
  reason?: string
  usageInfo?: {
    used: number
    limit: number
    remaining: number
  }
}

/**
 * Check if user can use a feature based on their tier and current usage
 */
export function checkFeatureUsage(
  tier: SubscriptionTier,
  feature: FeatureType,
  usage: UsageStats
): UsageCheckResult {
  // Pro and Lifetime have unlimited access
  if (tier === 'pro' || tier === 'lifetime') {
    return { allowed: true }
  }

  // Free tier: check specific limits
  const limits = FREE_LIMITS

  // Features completely blocked for free tier
  if (feature === 'refine_decision') {
    return {
      allowed: false,
      reason: `Decision refinement is a Pro feature. Upgrade to unlock AI-powered decision refinement.`
    }
  }

  if (feature === 'ai_prompt') {
    return {
      allowed: false,
      reason: `AI Dev Prompt generation is a Pro feature. Upgrade to export prompts for Claude/Cursor.`
    }
  }

  // Count-based features
  const usageMap: Record<string, { used: number; limit: number }> = {
    clarity: {
      used: usage.claritySessionsUsed,
      limit: limits.claritySessionsPerMonth
    },
    research: {
      used: usage.researchSessionsUsed,
      limit: limits.researchSessionsPerMonth
    },
    blueprint: {
      used: usage.blueprintsUsed,
      limit: limits.blueprintsPerMonth
    },
    mindmap: {
      used: usage.mindMapsUsed,
      limit: limits.mindMapsPerMonth
    },
    export: {
      used: usage.exportsUsed,
      limit: limits.exportsPerMonth
    }
  }

  const featureUsage = usageMap[feature]
  if (!featureUsage) {
    return { allowed: true } // Unknown feature, allow by default
  }

  const remaining = featureUsage.limit - featureUsage.used

  if (remaining <= 0) {
    const featureName = getFeatureDisplayName(feature)
    return {
      allowed: false,
      reason: `You've used all ${featureUsage.limit} ${featureName}s this month. Upgrade to Pro for unlimited access.`,
      usageInfo: {
        used: featureUsage.used,
        limit: featureUsage.limit,
        remaining: 0
      }
    }
  }

  return {
    allowed: true,
    usageInfo: {
      used: featureUsage.used,
      limit: featureUsage.limit,
      remaining
    }
  }
}

/**
 * Check if user is approaching their limit (80%)
 */
export function isApproachingLimit(
  tier: SubscriptionTier,
  feature: FeatureType,
  usage: UsageStats
): { approaching: boolean; percentUsed: number } {
  if (tier === 'pro' || tier === 'lifetime') {
    return { approaching: false, percentUsed: 0 }
  }

  const limits = FREE_LIMITS
  const usageMap: Record<string, { used: number; limit: number }> = {
    clarity: { used: usage.claritySessionsUsed, limit: limits.claritySessionsPerMonth },
    research: { used: usage.researchSessionsUsed, limit: limits.researchSessionsPerMonth },
    blueprint: { used: usage.blueprintsUsed, limit: limits.blueprintsPerMonth },
    mindmap: { used: usage.mindMapsUsed, limit: limits.mindMapsPerMonth },
    export: { used: usage.exportsUsed, limit: limits.exportsPerMonth }
  }

  const featureUsage = usageMap[feature]
  if (!featureUsage || featureUsage.limit === 0) {
    return { approaching: false, percentUsed: 0 }
  }

  const percentUsed = (featureUsage.used / featureUsage.limit) * 100
  return {
    approaching: percentUsed >= 80,
    percentUsed
  }
}

/**
 * Get upgrade message for a blocked feature
 */
export function getUpgradeMessage(feature: FeatureType): string {
  const messages: Record<FeatureType, string> = {
    clarity: "Upgrade to Pro for unlimited Compass sessions and find clarity on all your ideas.",
    research: "Upgrade to Pro for unlimited Muse research with Perplexity + Claude.",
    blueprint: "Upgrade to Pro for unlimited Blueprint generations.",
    mindmap: "Upgrade to Pro for unlimited Mind Maps.",
    export: "Upgrade to Pro for unlimited exports.",
    refine_decision: "Upgrade to Pro to unlock Decision Vault refinement - refine, replace, and perfect every decision.",
    ai_prompt: "Upgrade to Pro to generate AI Dev Prompts - copy, paste into Claude/Cursor, and start building!"
  }
  return messages[feature]
}

/**
 * Get the column name in database for a feature
 */
export function getUsageColumn(feature: FeatureType): string | null {
  const columnMap: Record<FeatureType, string | null> = {
    clarity: 'clarity_sessions_used',
    research: 'research_sessions_used',
    blueprint: 'blueprints_used',
    mindmap: 'mindmaps_used',
    export: 'exports_used',
    refine_decision: null, // Not tracked by count
    ai_prompt: null // Not tracked by count
  }
  return columnMap[feature]
}
