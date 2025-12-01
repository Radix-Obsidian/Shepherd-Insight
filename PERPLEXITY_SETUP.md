# Perplexity AI Integration - Setup Guide

## 🚀 What's New: Premium Research Mode

Shepherd Insight now uses **Perplexity Sonar Deep Research** for the Muse tool, providing:

- ✅ Real-time web search with citations
- ✅ Market research with trusted sources
- ✅ Competitor analysis from live URLs
- ✅ AI synthesis powered by Claude Sonnet 4
- ✅ 10x better research quality than AI knowledge alone

---

## 📝 Setup Instructions

### 1. Get Your Perplexity API Key

1. Visit: https://www.perplexity.ai/settings/api
2. Sign up or log in
3. Generate an API key (starts with `pplx-`)
4. Copy the key

### 2. Add to Environment Variables

Open your `.env.local` file and add:

```bash
PERPLEXITY_API_KEY=pplx-your-api-key-here
```

Your complete `.env.local` should include:

```bash
# AI Providers
PERPLEXITY_API_KEY=pplx-xxxxx          # NEW!
ANTHROPIC_API_KEY=sk-ant-xxxxx          # Existing
GROQ_API_KEY=gsk_xxxxx                  # Existing

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# Optional
FIRECRAWL_API_KEY=fc-xxxxx              # Optional
```

### 3. Restart the Dev Server

```bash
npm run dev
```

---

## 🎯 How It Works

### Full Research Mode (Default)
When users click **"Discover My Users"** in Muse:

1. **Perplexity** searches the web for:
   - Market insights (last 30 days)
   - Competitor analysis (from provided URLs)
   - User pain points (from forums, Reddit, reviews)

2. **Claude Sonnet 4** synthesizes:
   - User personas
   - Pain point map
   - Emotional journey
   - Competitor gaps
   - Actionable insights

**Cost:** ~$0.50-0.70 per journey  
**Time:** 20-60 seconds  
**Quality:** 🔥🔥🔥🔥🔥 (Premium, cited research)

### Quick Mode (Toggle On)
When users enable "Quick Research Mode":

1. **Groq Llama 3.3** generates:
   - Personas from AI knowledge
   - Pain points from common patterns
   - Insights without web search

**Cost:** ~$0.05 per journey  
**Time:** 5-10 seconds  
**Quality:** ⚡⚡⚡ (Fast, good for iteration)

---

## 📊 Pricing

### Perplexity Sonar Deep Research
- **Input tokens:** $2/1M
- **Output tokens:** $8/1M
- **Typical journey:** 10K-15K tokens = ~$0.15
- **Search queries:** $5/1K = ~$0.03
- **Total per journey:** ~$0.50-0.70

### Claude Sonnet 4 (Synthesis)
- **Input tokens:** $3/1M
- **Output tokens:** $15/1M
- **Typical synthesis:** 5K-8K tokens = ~$0.10

### Groq (Quick Mode)
- **Input tokens:** $0.05/1M
- **Output tokens:** $0.08/1M
- **Total per journey:** ~$0.05

**Complete Journey Cost:**
- **Full Research:** ~$0.90
- **Quick Mode:** ~$0.20

**At 100 journeys/month:** ~$90 (full) or ~$20 (quick)

---

## 🎨 User Experience

### Premium Research UI
When running full research, users see:

```
┌──────────────────────────────────────────┐
│  🔮 Deep Research in Progress            │
│  Real-time web search with AI synthesis  │
├──────────────────────────────────────────┤
│  • Searching the web for market insights │
│  • Analyzing competitor landscapes       │
│  • Synthesizing user personas            │
├──────────────────────────────────────────┤
│  Powered by Perplexity Sonar + Claude    │
│  🎯 Premium Research Mode                │
└──────────────────────────────────────────┘
```

### Quick Mode UI
When running quick mode:

```
┌──────────────────────────────────────────┐
│  ⚡ Quick Synthesis in Progress          │
│  Creating personas from AI knowledge     │
│                                          │
│  Powered by Groq Llama 3.3               │
└──────────────────────────────────────────┘
```

---

## 🧪 Testing

### Test Full Research Mode

1. Navigate to `/compass`
2. Complete clarity session
3. Continue to `/muse`
4. Add competitor URLs (optional)
5. Keep "Quick Research Mode" **OFF**
6. Click "Discover My Users"
7. Watch premium research UI
8. See results with citations

### Test Quick Mode

1. Navigate to `/muse`
2. Toggle **ON** "Quick Research Mode"
3. Click "Discover My Users"
4. Should complete in <10 seconds

### Test Fallback

1. Set `PERPLEXITY_API_KEY=""` (invalid)
2. Run full research
3. Should fallback to Groq automatically
4. Check logs for `[Orchestrator] Fallback`

---

## 🐛 Troubleshooting

### "PERPLEXITY_API_KEY not found"
- Check `.env.local` exists and has the key
- Restart dev server: `npm run dev`
- Verify no typos in key name

### Research fails silently
- Check browser console for errors
- Check server logs for `[Orchestrator]` messages
- Verify API key is valid on Perplexity dashboard

### Build errors
- Run `npm run build` to check TypeScript errors
- Only warnings are acceptable (no errors)

---

## 📚 Architecture

### Files Changed

**New Files:**
- `src/lib/engine/perplexity-client.ts` - Perplexity API client
- `src/lib/engine/orchestrator.ts` - AI task routing layer

**Updated Files:**
- `src/lib/engine/persona-synth.ts` - Uses orchestrator
- `src/lib/engine/index.ts` - Exports new clients
- `src/app/api/engine/research/route.ts` - Tracks AI provider used
- `src/app/muse/page.tsx` - Premium research UI
- `.env.example` - Perplexity key template

### Orchestration Flow

```typescript
User clicks "Discover My Users"
         ↓
    quickMode?
    /        \
  No         Yes
  ↓           ↓
Perplexity  Groq
  ↓           ↓
Claude      Direct
  ↓           ↓
Result     Result
```

---

## ✅ Next Steps

1. ✅ **Phase 1 Complete:** Perplexity integration
2. ⏭️ **Phase 2:** Decision Vault refinement (Lock/Refine/Replace/Discard)
3. ⏭️ **Phase 3:** AI Dev Prompt export
4. ⏭️ **Phase 4:** Launch alpha to users

---

**Questions?** Check the architecture docs:
- `.Spec-code/architecture/ai-orchestration-strategy.md`
- `.Spec-code/architecture/decision-vault-refinement.md`
