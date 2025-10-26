# Shepherd Insight - Quick Start

Get Shepherd Insight running locally and deployed in production.

## 🚀 Local Setup (5 minutes)

### 1. Generate API Keys

```bash
# Generate INTERNAL_API_KEY
openssl rand -hex 32
```

### 2. Create `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=https://jiecqmnygnqrfntqoqsg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
GROQ_API_KEY=<your-groq-key>
FIRECRAWL_API_KEY=<your-firecrawl-key>
FIRECRAWL_WEBHOOK_SECRET=<your-webhook-secret>
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
INTERNAL_API_KEY=<generated-above>
NODE_ENV=development
```

### 3. Install and Run

```bash
npm install
npm run dev
```

Visit: http://localhost:3000

---

## 🔧 Supabase Setup (10 minutes)

### 1. Get Access Token

1. Go to: https://supabase.com/dashboard/account/tokens
2. Create new token
3. Copy it

### 2. Run Setup Script

```bash
export SUPABASE_ACCESS_TOKEN=<your-token>
./scripts/setup-env.sh
```

This will:
- ✅ Login to Supabase CLI
- ✅ Link your project
- ✅ Set all Edge Function secrets

### 3. Deploy Edge Function

```bash
supabase functions deploy env-config --project-ref jiecqmnygnqrfntqoqsg
```

### 4. Push Database Schema

```bash
supabase db push
```

---

## ✅ Verify Setup

### Run E2E Tests

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run full test suite
npx playwright test --project=chromium --reporter=html

# View report
npx playwright show-report
```

### Run Demo Flow

```bash
npx playwright test full-demo-flow --project=chromium
```

This validates:
- User authentication
- Project creation
- Versioning
- AI mind map generation
- Export functionality

---

## 🌐 Deploy to Production

### 1. Vercel Setup

1. Go to: https://vercel.com/new
2. Import your Git repo
3. Configure:
   - Framework: **Next.js**
   - Build Command: `npm run build`
   - Output Directory: `.next`

### 2. Set Environment Variables in Vercel

Copy all variables from `.env.local` to Vercel:

**Settings → Environment Variables**

Set for: **Production**, **Preview**, **Development**

**Important:** Update these values:
```env
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
NODE_ENV=production
```

### 3. Deploy

Click **Deploy** in Vercel.

### 4. Update Supabase Auth URLs

In Supabase Dashboard:

**Authentication → URL Configuration**

- Site URL: `https://your-domain.vercel.app`
- Redirect URLs: `https://your-domain.vercel.app/**`

---

## 📊 Generate Marketing Report

After running tests:

```bash
# Tests create screenshots and artifacts in:
playwright-report/

# Update the marketing report:
open docs/reports/e2e-marketing-report.md
```

Include:
- Screenshots from `playwright-report/`
- Exported Markdown brief
- Test results summary

---

## 🐛 Troubleshooting

### "Environment variable not found"

```bash
# Check Supabase secrets
supabase secrets list

# Re-set if needed
supabase secrets set GROQ_API_KEY=<your-key>
```

### "Unauthorized" from Edge Function

Ensure you're authenticated:
- Local: User session via Supabase Auth
- Server: Use `INTERNAL_API_KEY` in Authorization header

### Build fails

```bash
# Test build locally
npm run build

# Check TypeScript errors
npm run type-check
```

### Tests fail

```bash
# Ensure server is running
npm run dev

# Run auth setup
npx playwright test auth.setup

# Check for linting errors
npm run lint
```

---

## 📚 Full Documentation

- **Deployment Guide:** `docs/DEPLOYMENT_GUIDE.md`
- **Architecture:** `README-ARCH.md`
- **Supabase Setup:** `SUPABASE_SETUP.md`

---

## 🎯 Next Steps

1. ✅ Complete local setup
2. ✅ Run E2E tests
3. ✅ Deploy to Vercel
4. ✅ Generate marketing report
5. ✅ Share with stakeholders

**Support:** Check the full deployment guide for detailed troubleshooting.

