#!/bin/bash
set -e

echo "🔧 Shepherd Insight - Environment Setup Helper"
echo "=============================================="
echo ""

# Check if required commands exist
command -v supabase >/dev/null 2>&1 || { echo "❌ supabase CLI not installed. Install with: brew install supabase/tap/supabase"; exit 1; }
command -v openssl >/dev/null 2>&1 || { echo "❌ openssl not found"; exit 1; }

# Step 1: Generate INTERNAL_API_KEY if not exists
if [ -z "$INTERNAL_API_KEY" ]; then
  echo "📝 Generating INTERNAL_API_KEY..."
  INTERNAL_API_KEY=$(openssl rand -hex 32)
  echo "Generated: $INTERNAL_API_KEY"
  echo ""
  echo "⚠️  Save this key to your .env.local file:"
  echo "INTERNAL_API_KEY=$INTERNAL_API_KEY"
  echo ""
fi

# Step 2: Check for Supabase access token
if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
  echo "❌ SUPABASE_ACCESS_TOKEN not set"
  echo "Create one at: https://supabase.com/dashboard/account/tokens"
  echo "Then run: export SUPABASE_ACCESS_TOKEN=YOUR_TOKEN"
  exit 1
fi

# Step 3: Login to Supabase
echo "🔐 Logging in to Supabase CLI..."
supabase login --token "$SUPABASE_ACCESS_TOKEN"

# Step 4: Link project
echo "🔗 Linking to Supabase project..."
supabase link --project-ref jiecqmnygnqrfntqoqsg

# Step 5: Set secrets
echo "🔒 Setting Supabase Edge Function secrets..."
echo "   (You'll need to provide the actual values)"
echo ""

# Check if .env.local exists
if [ -f ".env.local" ]; then
  echo "✅ Found .env.local, loading values..."
  source .env.local
else
  echo "⚠️  No .env.local found. You'll need to provide values manually."
fi

# Set secrets (skip if empty)
[ -n "$SUPABASE_URL" ] && supabase secrets set SUPABASE_URL="$SUPABASE_URL" || echo "⚠️  SUPABASE_URL not set"
[ -n "$SUPABASE_SERVICE_ROLE_KEY" ] && supabase secrets set SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_ROLE_KEY" || echo "⚠️  SUPABASE_SERVICE_ROLE_KEY not set"
[ -n "$GROQ_API_KEY" ] && supabase secrets set GROQ_API_KEY="$GROQ_API_KEY" || echo "⚠️  GROQ_API_KEY not set"
[ -n "$FIRECRAWL_API_KEY" ] && supabase secrets set FIRECRAWL_API_KEY="$FIRECRAWL_API_KEY" || echo "⚠️  FIRECRAWL_API_KEY not set"
[ -n "$FIRECRAWL_WEBHOOK_SECRET" ] && supabase secrets set FIRECRAWL_WEBHOOK_SECRET="$FIRECRAWL_WEBHOOK_SECRET" || echo "⚠️  FIRECRAWL_WEBHOOK_SECRET not set"
[ -n "$INTERNAL_API_KEY" ] && supabase secrets set INTERNAL_API_KEY="$INTERNAL_API_KEY" || echo "⚠️  INTERNAL_API_KEY not set"

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Deploy Edge Function: supabase functions deploy env-config --project-ref jiecqmnygnqrfntqoqsg"
echo "2. Run Playwright tests: npx playwright test --project=chromium --reporter=html"
echo "3. View report: npx playwright show-report"

