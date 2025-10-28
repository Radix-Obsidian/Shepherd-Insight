# Vercel Deployment Checklist - Get to 5 Users ASAP

**Status:** ✅ Build passing with no errors/warnings  
**Goal:** Deploy to Vercel and get in 5 people's hands within a week

## ✅ Pre-Deployment (COMPLETED)

- [x] Build passes locally (`npm run build`)
- [x] No TypeScript errors
- [x] No ESLint warnings (except one necessary Firecrawl SDK cast)
- [x] All API routes in `src/app/api/` folder
- [x] `vercel.json` created

## 🚀 Vercel Deployment Steps (Do Now)

### 1. Connect to Vercel (5 minutes)

```bash
# If you don't have Vercel CLI installed:
npm i -g vercel

# Then login
vercel login
```

### 2. Deploy to Vercel (10 minutes)

```bash
# Deploy to production
vercel --prod
```

Or use the dashboard:
1. Go to https://vercel.com/new
2. Import your GitHub repo
3. Click "Deploy"

### 3. Set Environment Variables (Critical!)

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

Add these **EXACTLY** (use your actual values):

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://jiecqmnygnqrfntqoqsg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>

# AI Services (Required)
GROQ_API_KEY=<your-groq-key>
FIRECRAWL_API_KEY=<your-firecrawl-key>
FIRECRAWL_WEBHOOK_SECRET=<your-webhook-secret>

# URLs (Update with your Vercel domain after first deploy)
NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
NEXT_PUBLIC_SITE_URL=https://your-app-name.vercel.app

# Auth (Optional - for testing)
NEXT_PUBLIC_DISABLE_AUTH=false
NODE_ENV=production
```

**CRITICAL:** Set these for all environments:
- ✅ Production
- ✅ Preview  
- ✅ Development

### 4. Redeploy After Setting Env Vars

```bash
vercel --prod
```

Or trigger a redeploy from the Vercel dashboard.

## 🔗 Update Supabase Redirect URLs

After getting your Vercel URL (e.g., `https://shepherd-insight.vercel.app`):

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Set **Site URL:** `https://your-app.vercel.app`
3. Add **Redirect URLs:**
   ```
   https://your-app.vercel.app/**
   https://your-app.vercel.app/auth/callback
   ```

## 🧪 Test Deployment (5 minutes)

Open your Vercel URL and test:
- [ ] Home page loads
- [ ] Can sign up/login
- [ ] Intake form works
- [ ] Can create a project
- [ ] AI analysis works
- [ ] Mind map generates

## 👥 Share with 5 Users (Now!)

Send them:
1. **URL:** `https://your-app.vercel.app`
2. **Signup link:** `https://your-app.vercel.app` (they'll see the signup modal)
3. **Temporary passwords** (or let them create accounts)

**Quick test accounts:**
```
Email: test1@example.com
Password: (set in Supabase)

Email: test2@example.com
Password: (set in Supabase)
```

## 🐛 Common Issues & Fixes

### Issue: "Environment variable not found"
**Fix:** Make sure you set env vars in Vercel dashboard, then redeploy

### Issue: "Unauthorized" errors
**Fix:** Check that `SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are set

### Issue: API routes returning 500 errors
**Fix:** Check Vercel Function logs (Dashboard → Your Deploy → Functions)

### Issue: Auth not working
**Fix:** Update Supabase redirect URLs to match your Vercel domain

### Issue: Build fails
**Fix:** Check build logs in Vercel dashboard for the exact error

## 📊 Monitor After Deployment

### Vercel Dashboard
- Check deployment status
- Monitor function logs
- Watch for errors

### Supabase Dashboard
- Monitor database queries
- Check Edge Function logs
- Review auth activity

## 🎯 Success Criteria

- [ ] Vercel deployment live
- [ ] Environment variables set
- [ ] Supabase redirect URLs updated
- [ ] Can sign up/login
- [ ] Intake form works
- [ ] AI analysis completes
- [ ] 5 users can access the app
- [ ] No runtime errors in production

## 🔄 Quick Deploy Commands

```bash
# Deploy to production
vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs your-app-name.vercel.app

# Open live deployment
vercel open
```

## 📝 Environment Variables Reference

Find your keys in:
- **Supabase:** Dashboard → Settings → API
- **Groq:** https://console.groq.com/keys
- **Firecrawl:** https://firecrawl.dev/dashboard

## ⚡ One-Line Deploy

If you've already connected to Vercel:

```bash
# Deploy everything
vercel --prod && vercel domains && echo "✅ Deployed! Visit: https://your-app.vercel.app"
```

## 📞 Next Steps After Deployment

1. Share the URL with 5 test users
2. Collect feedback
3. Monitor Vercel logs for errors
4. Iterate based on feedback
5. Prepare for Phase 2 features

---

**Timeline:** 
- Deployment: ~20 minutes
- Testing: ~10 minutes  
- Sharing: ~5 minutes
- **Total: ~35 minutes to get live!**

