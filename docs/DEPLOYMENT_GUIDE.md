# Shepherd Insight - Deployment Guide

Complete guide for deploying Shepherd Insight to production with Vercel and Supabase.

## Prerequisites

- Node.js 18+ installed
- Supabase account with project created
- Vercel account
- API keys for:
  - Groq AI
  - Firecrawl

## Part 1: Local Development Setup

### 1.1 Clone and Install

```bash
git clone <your-repo>
cd Shepherd-Insight
npm install
```

### 1.2 Generate INTERNAL_API_KEY

```bash
# macOS/Linux
openssl rand -hex 32

# or Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Save this key - you'll need it for all environments.

### 1.3 Create .env.local

Create `.env.local` in the project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://jiecqmnygnqrfntqoqsg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>

# AI Services
GROQ_API_KEY=<your-groq-key>
FIRECRAWL_API_KEY=<your-firecrawl-key>
FIRECRAWL_WEBHOOK_SECRET=<your-webhook-secret>

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
INTERNAL_API_KEY=<your-generated-key>
NODE_ENV=development
```

### 1.4 Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to verify the app loads.

## Part 2: Supabase Setup

### 2.1 Install Supabase CLI

```bash
brew install supabase/tap/supabase
```

### 2.2 Get Supabase Access Token

1. Go to https://supabase.com/dashboard/account/tokens
2. Create a new access token
3. Save it securely

### 2.3 Login and Link Project

```bash
# Set token
export SUPABASE_ACCESS_TOKEN=<your-token>

# Login
supabase login --token "$SUPABASE_ACCESS_TOKEN"

# Link project
supabase link --project-ref jiecqmnygnqrfntqoqsg
```

### 2.4 Push Database Schema

```bash
supabase db push
```

This will apply all migrations in `supabase/migrations/`.

### 2.5 Set Edge Function Secrets

Set all required secrets for Edge Functions:

```bash
supabase secrets set \
  SUPABASE_URL=https://jiecqmnygnqrfntqoqsg.supabase.co \
  SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key> \
  GROQ_API_KEY=<your-groq-key> \
  FIRECRAWL_API_KEY=<your-firecrawl-key> \
  FIRECRAWL_WEBHOOK_SECRET=<your-webhook-secret> \
  INTERNAL_API_KEY=<your-generated-key>
```

**Or use the helper script:**

```bash
./scripts/setup-env.sh
```

### 2.6 Deploy Edge Function

```bash
supabase functions deploy env-config --project-ref jiecqmnygnqrfntqoqsg
```

### 2.7 Verify Edge Function

Check the Supabase Dashboard:
1. Go to Edge Functions
2. Find `env-config`
3. Check Logs to confirm it's running
4. Status should be "Active"

**Test invocation (optional):**

```bash
curl -X POST \
  'https://jiecqmnygnqrfntqoqsg.supabase.co/functions/v1/env-config' \
  -H 'Authorization: Bearer <user-access-token>' \
  -H 'Content-Type: application/json' \
  -d '{"name":"GROQ_API_KEY"}'
```

## Part 3: Vercel Deployment

### 3.1 Create Vercel Project

1. Go to https://vercel.com/new
2. Import your Git repository
3. Select the project

### 3.2 Configure Build Settings

- **Framework Preset:** Next.js
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`
- **Node Version:** 18.x or 20.x

### 3.3 Set Environment Variables

Go to **Settings → Environment Variables** and add:

```env
NEXT_PUBLIC_SUPABASE_URL=https://jiecqmnygnqrfntqoqsg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
GROQ_API_KEY=<your-groq-key>
FIRECRAWL_API_KEY=<your-firecrawl-key>
FIRECRAWL_WEBHOOK_SECRET=<your-webhook-secret>
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
INTERNAL_API_KEY=<your-generated-key>
NODE_ENV=production
```

**Important:** Set these for all environments:
- ✅ Production
- ✅ Preview
- ✅ Development

### 3.4 Deploy

Click **Deploy** and wait for the build to complete.

### 3.5 Update Supabase Auth Settings

After deployment:

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Set **Site URL:** `https://your-domain.vercel.app`
3. Add **Redirect URLs:**
   - `https://your-domain.vercel.app/**`
   - `https://your-domain.vercel.app/auth/callback`

## Part 4: E2E Testing & Validation

### 4.1 Install Playwright

```bash
npm install
npx playwright install
```

### 4.2 Run Full Test Suite

```bash
# Run all E2E tests with full tracing
npx playwright test --project=chromium --reporter=html

# Open HTML report
npx playwright show-report
```

### 4.3 Run Demo Flow Test

```bash
# Run the comprehensive demo flow
npx playwright test full-demo-flow --project=chromium
```

This test validates:
- ✅ Authentication
- ✅ Project creation from Intake
- ✅ Multi-version support
- ✅ AI Mind Map generation
- ✅ Export functionality
- ✅ Dashboard navigation

### 4.4 Marketing Report

After tests complete:

1. Screenshots saved to: `playwright-report/`
2. Exported files saved to: `playwright-report/`
3. HTML report: `playwright-report/index.html`

Update the marketing report template:
```bash
open docs/reports/e2e-marketing-report.md
```

## Part 5: Production Checklist

### 5.1 Security

- [ ] All API keys stored in environment variables (not in code)
- [ ] `INTERNAL_API_KEY` is random and secure (32+ bytes)
- [ ] Supabase RLS policies enabled on all tables
- [ ] Edge Function `env-config` requires authentication
- [ ] CORS configured correctly for production domain

### 5.2 Configuration

- [ ] `NEXT_PUBLIC_SITE_URL` matches production domain
- [ ] Supabase Auth redirect URLs include production domain
- [ ] Firecrawl webhook URL points to production
- [ ] All environment variables set in Vercel
- [ ] All secrets set in Supabase Edge Functions

### 5.3 Database

- [ ] All migrations applied (`supabase db push`)
- [ ] Backup strategy in place
- [ ] Connection pooling configured (if needed)

### 5.4 Performance

- [ ] Next.js static generation enabled where possible
- [ ] Images optimized
- [ ] API routes implement rate limiting (future)
- [ ] React Strict Mode enabled (`reactStrictMode: true`)

### 5.5 Monitoring

- [ ] Vercel Analytics enabled (optional)
- [ ] Supabase logs monitored
- [ ] Error tracking configured (Sentry, optional)

### 5.6 Testing

- [ ] All Playwright tests pass
- [ ] Unit tests pass (`npm run test`)
- [ ] Manual smoke test on production

## Part 6: Troubleshooting

### Issue: "Unauthorized" from Edge Function

**Solution:** Ensure you're passing a valid Supabase user token or `INTERNAL_API_KEY`:

```bash
# For user auth
Authorization: Bearer <user-jwt>

# For server-to-server
Authorization: Bearer <INTERNAL_API_KEY>
```

### Issue: "Environment variable not found"

**Solution:** Verify secrets are set:

```bash
supabase secrets list
```

### Issue: Build fails on Vercel

**Solution:** 
1. Check build logs in Vercel dashboard
2. Verify all environment variables are set
3. Try building locally: `npm run build`

### Issue: Playwright tests fail

**Solution:**
1. Ensure dev server is running: `npm run dev`
2. Check if auth setup exists: `tests/e2e/.auth/user.json`
3. Run auth setup: `npx playwright test auth.setup`

### Issue: Database connection errors

**Solution:**
1. Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
2. Check Supabase project status in dashboard
3. Ensure migrations are applied: `supabase db push`

## Part 7: Maintenance

### Updating Environment Variables

**Locally:**
```bash
# Edit .env.local
vim .env.local
```

**Vercel:**
1. Settings → Environment Variables
2. Edit or add variables
3. Redeploy: `vercel --prod`

**Supabase:**
```bash
supabase secrets set KEY=value
supabase functions deploy env-config
```

### Deploying Updates

```bash
# Push to Git (triggers Vercel deploy)
git add .
git commit -m "Update feature"
git push origin main

# Or manual Vercel deploy
vercel --prod
```

### Database Migrations

```bash
# Create new migration
supabase migration new add_new_table

# Edit migration file
vim supabase/migrations/<timestamp>_add_new_table.sql

# Apply locally
supabase db push

# Will auto-apply on Supabase when deployed
```

## Support

For issues or questions:
- Check Supabase Dashboard logs
- Check Vercel deployment logs
- Review Playwright test reports
- Consult `README-ARCH.md` for architecture details

## Quick Reference

**Essential Commands:**

```bash
# Local dev
npm run dev

# Build
npm run build

# Test
npm test                                    # Unit tests
npx playwright test                         # E2E tests
npx playwright show-report                  # View report

# Supabase
supabase login --token "$SUPABASE_ACCESS_TOKEN"
supabase link --project-ref jiecqmnygnqrfntqoqsg
supabase db push
supabase secrets set KEY=value
supabase functions deploy env-config

# Vercel
vercel                                      # Deploy preview
vercel --prod                               # Deploy production
```

---

**Deployment Status:**
- Last Updated: 2025-01-26
- Version: 1.0.0
- MVP Status: Phase 1-7 Complete

