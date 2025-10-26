# Copy-Paste Commands for Deployment

Run these commands in order to get Shepherd Insight fully deployed.

---

## 1. Generate INTERNAL_API_KEY

```bash
openssl rand -hex 32
```

**Save this output!** You'll need it for `.env.local`, Vercel, and Supabase.

---

## 2. Create `.env.local`

Create this file in your project root:

```bash
cat > .env.local << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=https://jiecqmnygnqrfntqoqsg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY_HERE
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY_HERE
GROQ_API_KEY=YOUR_GROQ_KEY_HERE
FIRECRAWL_API_KEY=YOUR_FIRECRAWL_KEY_HERE
FIRECRAWL_WEBHOOK_SECRET=YOUR_WEBHOOK_SECRET_HERE
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
INTERNAL_API_KEY=YOUR_GENERATED_KEY_FROM_STEP_1
NODE_ENV=development
EOF
```

**Then edit it with your actual values:**

```bash
code .env.local
# or: vim .env.local
# or: nano .env.local
```

---

## 3. Start Local Dev Server

```bash
npm install
npm run dev
```

Visit: http://localhost:3000

**Leave this running in a separate terminal!**

---

## 4. Supabase Setup (New Terminal)

### 4a. Get Supabase Access Token

1. Go to: https://supabase.com/dashboard/account/tokens
2. Click "Generate new token"
3. Copy the token

### 4b. Set Token and Login

```bash
export SUPABASE_ACCESS_TOKEN=YOUR_TOKEN_HERE

supabase login --token "$SUPABASE_ACCESS_TOKEN"
```

### 4c. Link Project

```bash
supabase link --project-ref jiecqmnygnqrfntqoqsg
```

### 4d. Set Edge Function Secrets

**Replace the placeholder values with your actual keys:**

```bash
supabase secrets set \
  SUPABASE_URL=https://jiecqmnygnqrfntqoqsg.supabase.co \
  SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY_HERE \
  GROQ_API_KEY=YOUR_GROQ_KEY_HERE \
  FIRECRAWL_API_KEY=YOUR_FIRECRAWL_KEY_HERE \
  FIRECRAWL_WEBHOOK_SECRET=YOUR_WEBHOOK_SECRET_HERE \
  INTERNAL_API_KEY=YOUR_GENERATED_KEY_FROM_STEP_1
```

**Or use the automated script:**

```bash
# Make sure .env.local is populated first!
npm run setup:supabase
```

### 4e. Deploy Edge Function

```bash
npm run deploy:functions
```

Expected output: `✅ Deployed env-config`

### 4f. Push Database Schema

```bash
npm run deploy:db
```

Expected output: `✅ Migrations applied`

---

## 5. Verify Setup

### 5a. Check Supabase Dashboard

1. Go to: https://supabase.com/dashboard/project/jiecqmnygnqrfntqoqsg
2. Navigate to **Edge Functions**
3. Confirm `env-config` shows as "Active"
4. Check **Logs** to ensure no errors

### 5b. Check Database

1. In Supabase Dashboard, go to **Database → Tables**
2. Verify these tables exist:
   - `projects`
   - `versions`
   - `insights`
   - `insight_jobs`

---

## 6. Run E2E Tests

### 6a. Install Playwright (First Time Only)

```bash
npx playwright install
```

### 6b. Run Demo Flow Test

```bash
npm run test:e2e:demo
```

This will:
- ✅ Create a test project
- ✅ Generate versions
- ✅ Test AI mind map
- ✅ Test exports
- ✅ Validate dashboard

**Screenshots and artifacts saved to:** `playwright-report/`

### 6c. View HTML Report

```bash
npm run test:e2e:report
```

Your browser will open with the full test report.

---

## 7. Deploy to Vercel

### 7a. Create Vercel Project

```bash
# Option 1: Use Vercel CLI
npm install -g vercel
vercel

# Option 2: Use Web UI
# Go to: https://vercel.com/new
# Click "Import Project"
# Select your Git repository
```

### 7b. Set Environment Variables in Vercel

**Via CLI:**

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# Enter: https://jiecqmnygnqrfntqoqsg.supabase.co

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# Enter: YOUR_ANON_KEY

vercel env add SUPABASE_SERVICE_ROLE_KEY production
# Enter: YOUR_SERVICE_ROLE_KEY

vercel env add GROQ_API_KEY production
# Enter: YOUR_GROQ_KEY

vercel env add FIRECRAWL_API_KEY production
# Enter: YOUR_FIRECRAWL_KEY

vercel env add FIRECRAWL_WEBHOOK_SECRET production
# Enter: YOUR_WEBHOOK_SECRET

vercel env add NEXT_PUBLIC_APP_URL production
# Enter: https://your-domain.vercel.app

vercel env add NEXT_PUBLIC_SITE_URL production
# Enter: https://your-domain.vercel.app

vercel env add INTERNAL_API_KEY production
# Enter: YOUR_GENERATED_KEY

vercel env add NODE_ENV production
# Enter: production
```

**Or via Web UI:**

1. Go to your project in Vercel
2. Click **Settings → Environment Variables**
3. Add each variable for: **Production**, **Preview**, **Development**

### 7c. Deploy

```bash
vercel --prod
```

---

## 8. Update Supabase Auth URLs

### After Vercel deployment completes:

1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/jiecqmnygnqrfntqoqsg
2. Navigate to **Authentication → URL Configuration**
3. Set:
   - **Site URL:** `https://your-domain.vercel.app`
   - **Redirect URLs:** Add `https://your-domain.vercel.app/**`

---

## 9. Test Production Deployment

### 9a. Manual Smoke Test

1. Visit your Vercel URL: `https://your-domain.vercel.app`
2. Sign up / Sign in
3. Create a project via Intake
4. Navigate through Insight → Vault → Mind Map → Exports
5. Test exports (Markdown, PDF)

### 9b. Run E2E Against Production (Optional)

```bash
PLAYWRIGHT_BASE_URL=https://your-domain.vercel.app npm run test:e2e:demo
```

---

## 10. Generate Marketing Report

```bash
# Open the template
open docs/reports/e2e-marketing-report.md

# Or with your editor
code docs/reports/e2e-marketing-report.md
```

Fill in:
- ✅ Start/End timestamps
- ✅ Pass/Fail status
- ✅ Attach screenshots from `playwright-report/`
- ✅ Attach exported Markdown brief

---

## Quick Troubleshooting

### "supabase command not found"

```bash
brew install supabase/tap/supabase
```

### "Unauthorized" from Edge Function

Check that `INTERNAL_API_KEY` matches in:
- `.env.local`
- Supabase secrets: `supabase secrets list`
- Vercel environment variables

### "Module not found" errors

```bash
rm -rf node_modules package-lock.json
npm install
```

### Playwright tests fail

```bash
# Ensure dev server is running
npm run dev

# Re-run auth setup
npx playwright test auth.setup

# Run tests
npm run test:e2e:demo
```

### Build fails

```bash
# Check TypeScript errors
npm run type-check

# Check linting
npm run lint

# Try clean build
rm -rf .next
npm run build
```

---

## Summary of Commands (In Order)

```bash
# 1. Generate key
openssl rand -hex 32

# 2. Create and edit .env.local
# (manual step)

# 3. Start dev server
npm install && npm run dev

# 4. Supabase setup (new terminal)
export SUPABASE_ACCESS_TOKEN=YOUR_TOKEN
supabase login --token "$SUPABASE_ACCESS_TOKEN"
supabase link --project-ref jiecqmnygnqrfntqoqsg
npm run setup:supabase  # or set secrets manually
npm run deploy:functions
npm run deploy:db

# 5. Run tests
npx playwright install
npm run test:e2e:demo
npm run test:e2e:report

# 6. Deploy to Vercel
vercel
# Set environment variables in Vercel dashboard
vercel --prod

# 7. Update Supabase Auth URLs
# (manual step in Supabase dashboard)

# 8. Test production
# Visit your Vercel URL and test manually

# 9. Generate marketing report
open docs/reports/e2e-marketing-report.md
```

---

## Support

- **Full Guide:** `docs/DEPLOYMENT_GUIDE.md`
- **Quick Start:** `QUICK_START.md`
- **Architecture:** `README-ARCH.md`
- **Supabase:** `SUPABASE_SETUP.md`

---

**You're all set! 🚀**

