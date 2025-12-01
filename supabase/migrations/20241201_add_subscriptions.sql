-- ============================================================================
-- ShepLight Freemium: Subscriptions Table
-- ============================================================================
-- This migration adds subscription tracking for the freemium model.
-- Philosophy: "Give away value. Charge for velocity."

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
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
  
  -- Ensure one subscription per user
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own subscription
CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own subscription (on signup)
CREATE POLICY "Users can insert own subscription"
  ON subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Service role can manage all subscriptions (for webhooks)
CREATE POLICY "Service role can manage subscriptions"
  ON subscriptions FOR ALL
  USING (auth.role() = 'service_role');

-- Create index for faster lookups
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);

-- Function to increment usage for a specific column
CREATE OR REPLACE FUNCTION increment_usage(
  p_user_id UUID,
  p_column TEXT
)
RETURNS void AS $$
BEGIN
  EXECUTE format(
    'UPDATE subscriptions SET %I = %I + 1, updated_at = NOW() WHERE user_id = $1',
    p_column, p_column
  ) USING p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reset monthly usage (call via cron or manually)
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
    current_period_end = NOW() + INTERVAL '1 month',
    updated_at = NOW()
  WHERE current_period_end < NOW()
    AND tier = 'free'; -- Only reset free tier; Pro is unlimited
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create default subscription on user signup
-- This can be called from a trigger or application code
CREATE OR REPLACE FUNCTION create_default_subscription(p_user_id UUID)
RETURNS UUID AS $$
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO subscriptions (user_id, tier, status)
  VALUES (p_user_id, 'free', 'active')
  ON CONFLICT (user_id) DO NOTHING
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- Usage: After running this migration, users will get a free subscription
-- created when they sign up. The application checks limits before each
-- feature usage and increments counters after successful operations.
-- ============================================================================
