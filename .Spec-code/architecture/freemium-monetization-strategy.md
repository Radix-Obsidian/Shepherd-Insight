# Shepherd Insight: Freemium Monetization Strategy
**"Give away value. Charge for velocity."** — Customer-Backwards Pricing

---

## 🎯 Customer Transformation

**From (Free User):** "I can validate my idea and build clarity"  
**To (Pro User):** "I can build 10 products in the time it used to take me to research one"

---

## 💰 Pricing Philosophy

### Steve Jobs Principle
> "Some people say, 'Give the customers what they want.' But that's not my approach. Our job is to figure out what they're going to want before they do."

**Applied to Shepherd:**
- **Free Tier:** Give them the transformation (1 complete journey)
- **Pro Tier:** Give them velocity (unlimited journeys + premium features)
- **Pricing:** Transparent, fair, covers costs + sustains growth

---

## 📊 Tier Structure

### Free Tier: "Validate Your Idea"
**Goal:** Let users experience the full transformation once

**Limits:**
- ✅ **3 Compass sessions** (clarity generation)
- ✅ **2 Muse sessions** (research with Perplexity)
- ✅ **1 Blueprint** (MVP roadmap)
- ✅ **1 Mind Map** generation
- ✅ **1 Complete export** (Markdown/PDF)
- ❌ No Decision Vault refinement (lock only)
- ❌ No AI Dev Prompt generation

**Why These Limits:**
```
3 Compass = Try different ideas, iterate
2 Muse = Compare 2 approaches
1 Blueprint = See the full value
1 Export = Take action

Cost per free user: ~$1.50-2.00
Value delivered: Validated idea + clarity = Priceless
```

**When They Hit Limit:**
```
"You've validated your idea! 🎉

You've used Shepherd to:
✓ Find clarity on your problem
✓ Understand your users deeply
✓ Generate your MVP blueprint

Ready to build MORE products faster?

Upgrade to Pro and unlock:
• Unlimited AI-powered journeys
• Decision Vault refinement (Refine/Replace/Discard)
• AI Dev Prompt (copy → paste → build with Claude/Cursor)
• Priority support

Pro: $29/month → Ship 10x faster"
```

---

### Pro Tier: "Ship Everything"
**Price:** $29/month

**Includes:**
- ✅ **Unlimited Compass sessions**
- ✅ **Unlimited Muse research** (Perplexity + Claude)
- ✅ **Unlimited Blueprints**
- ✅ **Unlimited Mind Maps**
- ✅ **Unlimited Exports**
- ✅ **Decision Vault refinement** (Refine/Replace/Discard)
- ✅ **AI Dev Prompt generation** (killer feature)
- ✅ **Priority email support**
- ✅ **Early access to new features**

**Why $29/month:**

| Usage Level | AI Cost | Revenue | Margin |
|-------------|---------|---------|--------|
| **Light user** (3 journeys/mo) | $2.70 | $29 | 91% |
| **Active user** (10 journeys/mo) | $9.00 | $29 | 69% |
| **Power user** (30 journeys/mo) | $27.00 | $29 | 7% |

**At 100 Pro users:**
- Avg 10 journeys/mo → $900 AI cost
- Revenue: $2,900/mo
- **Margin: 69% ($2,000 profit)**
- Covers free tier + sustains growth ✅

**At 1000 Pro users:**
- Avg 10 journeys/mo → $9,000 AI cost
- Revenue: $29,000/mo
- **Margin: 69% ($20,000 profit)**
- Solo founder sustainable ✅

---

### Optional: Lifetime Deal (Launch Special)
**Price:** $249 one-time

**Goal:** Get early cash flow + evangelists

**Limits:**
- Cap at 100 lifetime deals
- All Pro features forever
- Lifetime updates
- VIP community access

**Revenue:**
- 100 × $249 = **$24,900 upfront**
- Covers 12+ months of runway
- Creates passionate advocates

**When to Run:**
- Week 1 of alpha launch
- 72-hour timer
- "First 100 founders only"

---

## 🏗️ Technical Architecture

### 1. Usage Tracking System

```typescript
// src/types/subscription.ts

export type SubscriptionTier = 'free' | 'pro' | 'lifetime'

export interface UsageLimits {
  claritySessionsRemaining: number
  researchSessionsRemaining: number
  blueprintsRemaining: number
  mindMapsRemaining: number
  exportsRemaining: number
  canRefineDeci

sions: boolean
  canGenerateAIPrompt: boolean
}

export interface UserSubscription {
  userId: string
  tier: SubscriptionTier
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  currentPeriodStart: string
  currentPeriodEnd: string
  status: 'active' | 'canceled' | 'past_due' | 'trialing'
  usage: {
    claritySessionsUsed: number
    researchSessionsUsed: number
    blueprintsUsed: number
    mindMapsUsed: number
    exportsUsed: number
  }
}

// Free tier limits
export const FREE_LIMITS = {
  claritySessionsPerMonth: 3,
  researchSessionsPerMonth: 2,
  blueprintsPerMonth: 1,
  mindMapsPerMonth: 1,
  exportsPerMonth: 1,
  canRefineDeci

sions: false,
  canGenerateAIPrompt: false
}

// Pro tier limits (unlimited)
export const PRO_LIMITS = {
  claritySessionsPerMonth: Infinity,
  researchSessionsPerMonth: Infinity,
  blueprintsPerMonth: Infinity,
  mindMapsPerMonth: Infinity,
  exportsPerMonth: Infinity,
  canRefineDecisions: true,
  canGenerateAIPrompt: true
}
```

### 2. Database Schema (Supabase)

```sql
-- Migration: Add subscriptions table

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'pro', 'lifetime')),
  
  -- Stripe integration
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,
  
  -- Subscription period
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  current_period_end TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '1 month'),
  
  -- Status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
  
  -- Usage tracking (resets monthly)
  clarity_sessions_used INTEGER NOT NULL DEFAULT 0,
  research_sessions_used INTEGER NOT NULL DEFAULT 0,
  blueprints_used INTEGER NOT NULL DEFAULT 0,
  mindmaps_used INTEGER NOT NULL DEFAULT 0,
  exports_used INTEGER NOT NULL DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  canceled_at TIMESTAMPTZ,
  
  -- Constraints
  UNIQUE(user_id)
);

-- RLS policies
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage subscriptions"
  ON subscriptions FOR ALL
  USING (auth.role() = 'service_role');

-- Function to reset monthly usage
CREATE OR REPLACE FUNCTION reset_monthly_usage()
RETURNS void AS $$
BEGIN
  UPDATE subscriptions
  SET 
    clarity_sessions_used = 0,
    research_sessions_used = 0,
    blueprints_used = 0,
    mindmaps_used = 0,
    exports_used = 0,
    current_period_start = NOW(),
    current_period_end = NOW() + INTERVAL '1 month'
  WHERE current_period_end < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cron job to run daily (requires pg_cron extension)
-- SELECT cron.schedule('reset-usage', '0 0 * * *', 'SELECT reset_monthly_usage()');
```

### 3. Stripe Integration

```typescript
// src/lib/stripe.ts

import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia'
})

export const STRIPE_PRICES = {
  pro_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY!, // $29/mo
  lifetime: process.env.STRIPE_PRICE_LIFETIME!,       // $249 one-time
}

/**
 * Create checkout session for Pro subscription
 */
export async function createCheckoutSession(
  userId: string,
  userEmail: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string
) {
  const session = await stripe.checkout.sessions.create({
    customer_email: userEmail,
    client_reference_id: userId,
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: priceId === STRIPE_PRICES.lifetime ? 'payment' : 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId,
    },
  })

  return session
}

/**
 * Create customer portal session (manage subscription)
 */
export async function createPortalSession(
  stripeCustomerId: string,
  returnUrl: string
) {
  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: returnUrl,
  })

  return session
}
```

### 4. Usage Guard Middleware

```typescript
// src/lib/subscription/usage-guard.ts

import { createSupabaseServerClient } from '@/lib/supabase-server'
import { FREE_LIMITS } from '@/types/subscription'

export type FeatureType = 
  | 'clarity'
  | 'research'
  | 'blueprint'
  | 'mindmap'
  | 'export'
  | 'refine_decision'
  | 'ai_prompt'

/**
 * Check if user can use a feature
 */
export async function canUseFeature(
  userId: string,
  feature: FeatureType
): Promise<{ allowed: boolean; reason?: string }> {
  const supabase = createSupabaseServerClient()
  
  // Get user subscription
  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  if (error || !subscription) {
    return { allowed: false, reason: 'No subscription found' }
  }
  
  // Pro/Lifetime users have unlimited access
  if (subscription.tier === 'pro' || subscription.tier === 'lifetime') {
    return { allowed: true }
  }
  
  // Free tier: check limits
  const usageMap: Record<FeatureType, { used: number; limit: number }> = {
    clarity: {
      used: subscription.clarity_sessions_used,
      limit: FREE_LIMITS.claritySessionsPerMonth
    },
    research: {
      used: subscription.research_sessions_used,
      limit: FREE_LIMITS.researchSessionsPerMonth
    },
    blueprint: {
      used: subscription.blueprints_used,
      limit: FREE_LIMITS.blueprintsPerMonth
    },
    mindmap: {
      used: subscription.mindmaps_used,
      limit: FREE_LIMITS.mindMapsPerMonth
    },
    export: {
      used: subscription.exports_used,
      limit: FREE_LIMITS.exportsPerMonth
    },
    refine_decision: {
      used: 0,
      limit: 0 // Not allowed on free tier
    },
    ai_prompt: {
      used: 0,
      limit: 0 // Not allowed on free tier
    }
  }
  
  const usage = usageMap[feature]
  
  if (usage.used >= usage.limit) {
    return {
      allowed: false,
      reason: `You've reached your ${feature} limit (${usage.limit}/${usage.limit}). Upgrade to Pro for unlimited access.`
    }
  }
  
  return { allowed: true }
}

/**
 * Increment usage for a feature
 */
export async function incrementUsage(
  userId: string,
  feature: FeatureType
): Promise<void> {
  const supabase = createSupabaseServerClient()
  
  const columnMap: Record<FeatureType, string> = {
    clarity: 'clarity_sessions_used',
    research: 'research_sessions_used',
    blueprint: 'blueprints_used',
    mindmap: 'mindmaps_used',
    export: 'exports_used',
    refine_decision: '', // Not tracked
    ai_prompt: '' // Not tracked
  }
  
  const column = columnMap[feature]
  if (!column) return
  
  await supabase.rpc('increment_usage', {
    p_user_id: userId,
    p_column: column
  })
}
```

---

## 🎨 Paywall UI/UX

### 1. Soft Limit Warning (80% usage)

```tsx
// When user hits 80% of any limit
<div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
  <div className="flex items-start gap-3">
    <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
    <div>
      <h3 className="font-bold text-yellow-900 mb-1">
        You're running low on research sessions
      </h3>
      <p className="text-sm text-yellow-800 mb-3">
        You've used 2 of 2 Muse sessions this month. 
        Upgrade to Pro for unlimited research with Perplexity + Claude.
      </p>
      <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
        See Pro Features →
      </button>
    </div>
  </div>
</div>
```

### 2. Hard Limit Paywall (100% usage)

```tsx
// Full-page overlay when limit hit
<div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
  <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
    
    {/* Header */}
    <div className="p-8 bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
      <Sparkles className="w-12 h-12 mb-4" />
      <h2 className="text-3xl font-bold mb-2">
        You've Completed Your Free Journey! 🎉
      </h2>
      <p className="text-indigo-100 text-lg">
        You've validated your idea using Shepherd. Ready to build more?
      </p>
    </div>
    
    {/* What you accomplished */}
    <div className="p-8 bg-green-50 border-b-2 border-green-200">
      <h3 className="font-bold text-green-900 mb-4">What You've Accomplished:</h3>
      <div className="grid gap-3">
        <div className="flex items-center gap-3 text-green-800">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span>Found clarity on your problem space</span>
        </div>
        <div className="flex items-center gap-3 text-green-800">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span>Researched your users with real-time web data</span>
        </div>
        <div className="flex items-center gap-3 text-green-800">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span>Generated your MVP blueprint</span>
        </div>
      </div>
    </div>
    
    {/* Why we charge */}
    <div className="p-8 border-b-2 border-slate-200">
      <h3 className="font-bold text-slate-900 mb-3">Why Pro?</h3>
      <p className="text-slate-700 mb-4">
        Shepherd uses premium AI (Perplexity Sonar Deep Research + Claude Sonnet 4) 
        to give you real-time, cited research. Each journey costs us ~$0.90 in AI fees.
      </p>
      <p className="text-slate-700">
        Pro lets us keep building amazing features while giving you unlimited 
        research power. You ship faster. We stay sustainable. Win-win.
      </p>
    </div>
    
    {/* Pro features */}
    <div className="p-8">
      <h3 className="font-bold text-slate-900 mb-4">Upgrade to Pro: $29/month</h3>
      <div className="grid gap-3 mb-6">
        <div className="flex items-start gap-3">
          <Infinity className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-slate-900">Unlimited AI Journeys</p>
            <p className="text-sm text-slate-600">Build 10 products in the time it used to take for 1</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <RefreshCw className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-slate-900">Decision Vault Refinement</p>
            <p className="text-sm text-slate-600">Refine, replace, and perfect every decision</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Code className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-slate-900">AI Dev Prompt Generator</p>
            <p className="text-sm text-slate-600">Copy → Paste into Claude/Cursor → Build your app</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Zap className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-slate-900">Priority Support</p>
            <p className="text-sm text-slate-600">Get help when you need it</p>
          </div>
        </div>
      </div>
      
      <div className="flex gap-4">
        <button 
          onClick={handleUpgrade}
          className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
        >
          Upgrade to Pro → $29/mo
        </button>
        <button 
          onClick={handleClose}
          className="px-6 py-3 text-slate-600 hover:text-slate-900 transition-colors"
        >
          Maybe Later
        </button>
      </div>
    </div>
    
  </div>
</div>
```

---

## 📅 Implementation Roadmap

### Phase 1: Perplexity Integration ✅ DONE
- ✅ Orchestrator layer
- ✅ Premium research UI
- ✅ Cost tracking

### Phase 2: Decision Vault Refinement ⏭️ NEXT
- ⏭️ Refine/Replace/Discard
- ⏭️ AI-powered refinement
- ⏭️ Progress tracking

### Phase 3: AI Dev Prompt Export ⏭️ THEN
- ⏭️ Generate prompt from vault
- ⏭️ One-click copy for Claude/Cursor
- ⏭️ Markdown formatting

### Phase 4: Manual Testing & Polish 🧪
- 🧪 Test complete journey end-to-end
- 🧪 Fix any critical bugs
- 🧪 Verify AI quality
- 🧪 Optimize performance

### Phase 5: Freemium & Payments 💰 FINAL
**Week 1: Database + Tracking**
- [ ] Add `subscriptions` table migration
- [ ] Implement usage tracking
- [ ] Add `canUseFeature` guards
- [ ] Test usage limits

**Week 2: Stripe Integration**
- [ ] Set up Stripe account
- [ ] Create Pro + Lifetime products
- [ ] Implement checkout flow
- [ ] Add webhook handlers
- [ ] Test payment flow

**Week 3: Paywall UI**
- [ ] Soft limit warnings (80%)
- [ ] Hard limit overlay (100%)
- [ ] Upgrade CTA throughout app
- [ ] Billing management page
- [ ] Test user experience

**Week 4: Launch Prep**
- [ ] Lifetime deal landing page
- [ ] Email sequences (welcome, upgrade, billing)
- [ ] Analytics tracking (Plausible/Posthog)
- [ ] Legal (Terms, Privacy, Refund policy)
- [ ] Final testing

---

## 🚀 Launch Strategy

### Day 1: Lifetime Deal (72 hours)
- Tweet: "First 100 founders: $249 lifetime access"
- ProductHunt launch
- Indie Hackers post
- Reddit (r/SideProject, r/SaaS)

**Goal:** 50-100 lifetime sales = $12,450-24,900 upfront

### Week 2-4: Convert Free → Pro
- Email drip campaign
- In-app upgrade prompts
- Case studies from beta users
- Feature announcements

**Goal:** 10-20% conversion rate

### Month 2: Optimize
- A/B test pricing
- Improve conversion funnels
- Add testimonials
- Refine feature set

---

## ✅ Success Metrics

**Month 1:**
- 500 free users
- 50 lifetime deals ($12,450)
- 10 Pro monthly ($290/mo)
- **Total:** $12,740

**Month 3:**
- 2000 free users
- 100 lifetime deals ($24,900 total)
- 100 Pro monthly ($2,900/mo)
- **MRR:** $2,900
- **AI cost:** ~$1,000/mo
- **Margin:** 66%

**Month 6:**
- 5000 free users
- 100 lifetime deals (capped)
- 300 Pro monthly ($8,700/mo)
- **MRR:** $8,700
- **AI cost:** ~$3,000/mo
- **Margin:** 66%
- **Solo founder sustainable** ✅

---

## 🎯 Why This Works

1. **Free tier delivers value** (1 complete journey)
2. **Pro unlocks velocity** (unlimited + premium features)
3. **Pricing covers costs** (69% margin at scale)
4. **Transparent, not greedy** (educate why we charge)
5. **Lifetime deal gets cash flow** (runway + evangelists)
6. **Scalable** (Stripe handles billing)
7. **No viral debt risk** (limits prevent bankruptcy)

---

**Next Steps:**
1. ✅ Complete Phases 1-3 (current work)
2. 🧪 Manual test everything
3. 💰 Implement Phase 5 (Freemium)
4. 🚀 Launch with confidence

**You won't wake up with a negative balance. You'll wake up profitable.** 🐑
