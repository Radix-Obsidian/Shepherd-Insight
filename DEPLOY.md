# Shepherd Insight - Production Deployment Guide

Complete guide for deploying Shepherd Insight to production on Vercel with Supabase.

## Prerequisites

- Node.js 18+ installed locally
- Supabase account with project created
- Vercel account
- API keys for:
  - Groq AI
  - Firecrawl
- Git repository (GitHub recommended for Vercel integration)

## Part 1: Environment Variables Setup

### 1.1 Generate INTERNAL_API_KEY

```bash
openssl rand -hex 32
```

**Critical:** Generate this key ONCE and use the **SAME value** for:
- Local development (`.env.local`)
- Vercel production environment variables
- Supabase Edge Function secrets

This ensures internal API calls between services use the same authentication key.

**Expected format:** 64-character hexadecimal string (e.g., `a1b2c3d4...`)

**Save this output securely!** Never commit it to git.

**Security Notes:**
- **If INTERNAL_API_KEY is ever exposed or compromised, rotate it immediately** by generating a new key and updating all three locations
- Internal API calls use `Authorization: Bearer <INTERNAL_API_KEY>` header for server-to-server authentication
- This key enables access to research API endpoints without requiring user authentication
- Rate limiting is enforced on webhook endpoints to prevent abuse

### 1.2 Set Environment Variables in Vercel

1. Go to your Vercel project settings
2. Navigate to **Settings → Environment Variables**
3. Add the following variables:

```env
# Supabase (Public - Safe for client)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Supabase (Private - Server-only)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI Services (Private - Server-only)
GROQ_API_KEY=your-groq-api-key
FIRECRAWL_API_KEY=your-firecrawl-api-key
FIRECRAWL_WEBHOOK_SECRET=your-firecrawl-webhook-secret

# Internal API Key (Private - Server-only)
INTERNAL_API_KEY=your-generated-key-from-step-1.1

# App Configuration (Public)
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app

# Environment
NODE_ENV=production
```

**Important:**
- Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser
- All other variables are server-only secrets
- **INTERNAL_API_KEY must be identical** across local dev, Vercel, and Supabase Edge Functions
- Set these for **Production**, **Preview**, and **Development** environments as needed

## Part 2: Supabase Setup

### 2.1 Install Supabase CLI

```bash
# macOS
brew install supabase/tap/supabase

# Or via npm
npm install -g supabase
```

### 2.2 Login to Supabase

1. Go to https://supabase.com/dashboard/account/tokens
2. Generate a new access token
3. Login:

```bash
export SUPABASE_ACCESS_TOKEN=your-token-here
supabase login --token "$SUPABASE_ACCESS_TOKEN"
```

### 2.3 Link Your Project

```bash
supabase link --project-ref your-project-id
```

### 2.4 Push Database Schema

```bash
supabase db push
```

This applies all migrations from `supabase/migrations/` to your production database.

### 2.5 Set Edge Function Secrets

Set secrets for your Supabase Edge Functions:

```bash
supabase secrets set \
  SUPABASE_URL=https://your-project-id.supabase.co \
  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key \
  GROQ_API_KEY=your-groq-api-key \
  FIRECRAWL_API_KEY=your-firecrawl-api-key \
  FIRECRAWL_WEBHOOK_SECRET=your-firecrawl-webhook-secret \
  INTERNAL_API_KEY=your-generated-key-from-step-1.1
```

### 2.6 Deploy Edge Functions

```bash
# Deploy the env-config function
supabase functions deploy env-config --project-ref your-project-id
```

## Part 3: Vercel Deployment

### 3.1 Connect Repository

1. Go to https://vercel.com/new
2. Import your Git repository
3. Vercel will auto-detect Next.js

### 3.2 Configure Build Settings

- **Framework Preset:** Next.js
- **Build Command:** `npm run build` (default)
- **Output Directory:** `.next` (default)
- **Install Command:** `npm install` (default)

### 3.3 Deploy

Click **Deploy**. Vercel will:
1. Install dependencies
2. Build the application
3. Deploy to production

After deployment, your app will be available at `https://your-app.vercel.app`

## Part 4: Verify Deployment

### 4.1 Health Check

Visit: `https://your-app.vercel.app/api/health`

You should see:
```json
{
  "ok": true,
  "timestamp": "2024-...",
  "database": "connected"
}
```

### 4.2 Test Authentication

1. Visit your deployed app
2. Navigate to `/account`
3. Sign up with a test account
4. Verify you can create and view projects

### 4.3 Test Intake Flow

1. Sign in to your deployed app
2. Navigate to `/intake`
3. Fill out the form with a test product idea
4. Submit and verify redirect to `/insight?projectId=...`
5. Verify insight data loads correctly

## Part 5: First-Time User Flow

The onboarding flow is now automated:

1. **New user signs in** → Redirected to `/dashboard` or `/intake`
2. **User visits `/intake`** → Sees simplified form: "What are you trying to build, and who is it for?"
3. **User submits** → Creates project in Supabase, triggers insight generation
4. **Automatic redirect** → User is redirected to `/insight?projectId=...&versionId=...`
5. **Insight loads** → Shows problem framing, persona, features, competitor analysis (if available)

**Key Points:**
- `/intake` is the canonical starting point for new users
- Insight generation happens automatically (async)
- Users see their insight brief immediately after project creation
- Advanced fields are optional and collapsible

## Part 6: Troubleshooting

### Build Fails

- Check environment variables are set correctly in Vercel
- Verify all required env vars are present (check `.env.example`)
- Check build logs in Vercel dashboard

### Database Connection Issues

- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct
- Check Supabase project is active
- Verify RLS policies are configured correctly

### Edge Functions Not Working

- Verify secrets are set: `supabase secrets list`
- Check function logs: `supabase functions logs env-config`
- Ensure CORS headers are configured (already done in code)

### Authentication Issues

- Verify Supabase Auth is enabled in Supabase dashboard
- Check redirect URLs are configured in Supabase Auth settings
- Ensure `NEXT_PUBLIC_SUPABASE_URL` is set correctly

## Part 7: Monitoring

### Health Check Endpoint

Monitor deployment health:
- `GET /api/health` - Returns app status and database connection

### Vercel Analytics

- Enable Vercel Analytics in project settings
- Monitor function execution times
- Check error rates

### Supabase Dashboard

- Monitor database performance
- Check Edge Function logs
- Review authentication metrics

## Part 8: Paywall (Future)

**Note:** Stripe paywall implementation was skipped for now. To add later:

1. Set up Stripe account
2. Add `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID_MONTHLY`, `STRIPE_WEBHOOK_SECRET` to Vercel env vars
3. Create `/api/billing/*` routes
4. Gate `/exports` route behind `is_pro` check

## Summary

After completing these steps, you should have:

✅ Production app deployed on Vercel  
✅ Supabase database with all migrations applied  
✅ Edge Functions deployed and configured  
✅ Environment variables properly secured  
✅ Automated onboarding flow working  
✅ Health check endpoint available  

Your app is now ready for paid pilots with real users!

