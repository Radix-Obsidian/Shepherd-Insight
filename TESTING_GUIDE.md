# 🧪 Shepherd Insight: Testing Guide
**See Your Progress Visually!**

---

## 🚀 Dev Server Status

**Running on:** http://localhost:3002  
**Status:** ✅ READY TO TEST

---

## 📋 What We're Testing

### ✅ Phase 1: Perplexity Integration (FULLY BUILT)
- Premium research UI
- Real-time web search with Perplexity
- Claude synthesis
- Citations display

### ⚠️ Phase 2.1: Decision Vault Data Layer (BACKEND BUILT)
- Decisions auto-created from journey
- Stored in Zustand
- API routes functional
- **Debug panel shows data visually**

---

## 🎯 Testing Flow

### Step 1: Complete the Shepherd Journey

**Path:** Compass → Muse → Blueprint → Vault

#### 1A: Start at Compass
1. Open browser: http://localhost:3002/compass
2. Fill in the clarity form:
   - **Problem:** "Busy parents struggle to track their kids' activities and schedules"
   - **Target User:** "Working parents with 2+ kids"
   - **Why current solutions fail:** "Too complicated, require too much manual input"
   - Click **"Generate Clarity"**
3. **Wait** for Claude to generate clarity (~10-20 seconds)
4. **Expected:** See problem statement, value hypotheses, next steps
5. Click **"Continue to Muse"**

---

#### 1B: Muse (Research Phase)
1. You should land on: http://localhost:3002/muse?clarityId=xxx
2. **ADD PERPLEXITY API KEY FIRST** (if not done):
   - Go to: https://www.perplexity.ai/settings/api
   - Copy your API key
   - Add to `.env.local`: `PERPLEXITY_API_KEY=pplx-your-key`
   - Restart dev server: `npm run dev`

3. **Optional:** Add competitor URLs (one per line):
   ```
   https://www.cozi.com
   https://www.timelyapp.com
   ```

4. **Toggle OFF "Quick Research Mode"** (to see Perplexity in action)
5. Click **"Discover My Users"**

6. **🎉 WATCH THIS:**
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

7. **Wait** (~20-60 seconds for premium research)
8. **Expected:** See personas, pain points, insights with REAL web data
9. Click **"Continue to Blueprint"**

---

#### 1C: Blueprint (MVP Planning)
1. You should land on: http://localhost:3002/blueprint?clarityId=xxx&researchId=xxx
2. **Auto-generates** MVP blueprint with Claude
3. **Wait** (~15-30 seconds)
4. **Expected:** See:
   - Product vision
   - MVP features
   - 3-week roadmap
   - Success metrics
   - Launch checklist

5. **🎯 KEY MOMENT:** Decisions are being created in the background!
6. Scroll down, click **"View in Vault"** or **"Navigate to Vault"**

---

#### 1D: Vault (Decision Preview)
1. You should land on: http://localhost:3002/vault?projectId=xxx&versionId=xxx
2. **🚀 LOOK FOR THE BIG INDIGO PANEL:**

```
┌──────────────────────────────────────────────────────────┐
│  🚀 Phase 2 Preview: Decision Vault (Data Layer Complete!)│
├──────────────────────────────────────────────────────────┤
│  Stats:                                                  │
│  15 Total | 15 Pending | 0 Locked | 0 Refined           │
├──────────────────────────────────────────────────────────┤
│  Personas (3) [Click to expand]                          │
│  Features (5) [Click to expand]                          │
│  PainPoints (4) [Click to expand]                        │
│  Insights (3) [Click to expand]                          │
└──────────────────────────────────────────────────────────┘
```

3. **Click each section** to see the decisions created
4. **Each decision shows:**
   - Name/description
   - State badge (pending, locked, etc.)
   - Full JSON content

---

### Step 2: Inspect Zustand Store (Browser DevTools)

1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Type:
   ```javascript
   JSON.parse(localStorage.getItem('shepherd-insight-store'))
   ```
4. **Expand** → `state` → `projects` → `[0]` → `versions` → `[0]` → `data` → `decisions`
5. **You'll see:** Array of Decision objects with:
   - `id`
   - `type` (persona, feature, etc.)
   - `content` (the actual data)
   - `state` (pending)
   - `locked` (false)
   - `createdAt`

---

### Step 3: Test API Routes (Optional)

#### Test Refinement API

1. Open a new terminal
2. Create a test file: `test-refine.json`
   ```json
   {
     "decisionType": "persona",
     "originalContent": {
       "name": "Sarah",
       "role": "Busy Mom",
       "goals": ["Track kids activities", "Stay organized"],
       "frustrations": ["Too many apps", "Forget things"],
       "quote": "I need something simple"
     },
     "userRequest": "Make her more tech-savvy and professional"
   }
   ```

3. Test with curl:
   ```bash
   curl -X POST http://localhost:3002/api/vault/refine \
     -H "Content-Type: application/json" \
     -d @test-refine.json
   ```

4. **Expected Response:**
   ```json
   {
     "success": true,
     "data": {
       "refinedContent": {
         "name": "Sarah",
         "role": "Tech-Savvy Working Mom",
         "goals": ["..."],
         "frustrations": ["..."],
         "quote": "..."
       },
       "aiProvider": "claude"
     }
   }
   ```

---

#### Test Alternatives API

1. Create test file: `test-alternatives.json`
   ```json
   {
     "decisionType": "persona",
     "currentContent": {
       "name": "Sarah",
       "role": "Busy Mom"
     },
     "alternativeType": "different_demographic",
     "context": {
       "problemStatement": "Parents struggle to track kids' activities",
       "targetUser": "Busy parents"
     }
   }
   ```

2. Test with curl:
   ```bash
   curl -X POST http://localhost:3002/api/vault/alternatives \
     -H "Content-Type: application/json" \
     -d @test-alternatives.json
   ```

3. **Expected Response:**
   ```json
   {
     "success": true,
     "data": {
       "alternatives": [
         { "name": "Marcus", "role": "Single Dad", "..." },
         { "name": "Jenny", "role": "Foster Parent", "..." },
         { "name": "Tom", "role": "Grandparent Caregiver", "..." }
       ],
       "aiProvider": "claude"
     }
   }
   ```

---

## ✅ What You Should See

### Premium Perplexity Research (Phase 1)
- ✅ Purple gradient research UI
- ✅ Animated progress indicators
- ✅ "Powered by Perplexity Sonar" badge
- ✅ Real-time web-researched personas
- ✅ Citations (if Perplexity returns them)

### Decision Vault Data (Phase 2.1)
- ✅ Big indigo debug panel in Vault page
- ✅ Stats showing decision counts
- ✅ Expandable sections by type
- ✅ Each decision shows state and content
- ✅ JSON data visible in localStorage

### What's NOT Built Yet (Phase 2.2)
- ❌ Lock/Unlock buttons
- ❌ Refine modal UI
- ❌ Alternatives modal UI
- ❌ Progress tracker
- ❌ Filters/sorting

**BUT** the data is there! The backend works!

---

## 🐛 Troubleshooting

### Perplexity Research Fails
**Symptom:** Error during Muse research  
**Fix:**
1. Check `.env.local` has `PERPLEXITY_API_KEY=pplx-...`
2. Restart dev server: `npm run dev`
3. Try Quick Mode toggle ON (uses Groq fallback)

### No Decisions in Vault
**Symptom:** Debug panel doesn't appear  
**Fix:**
1. Make sure you completed full journey (Compass → Muse → Blueprint)
2. Check browser console for errors
3. Check localStorage:
   ```javascript
   const store = JSON.parse(localStorage.getItem('shepherd-insight-store'));
   console.log(store.state.projects[0].versions[0].data.decisions);
   ```

### Build Errors
**Symptom:** TypeScript errors  
**Fix:**
1. Run `npm run build` to see errors
2. All current warnings are non-critical
3. Zero errors = good to go

---

## 📊 Success Checklist

### Phase 1 Testing
- [ ] Compass generates clarity
- [ ] Muse shows premium research UI
- [ ] Perplexity research completes
- [ ] Personas have realistic data
- [ ] Blueprint generates successfully

### Phase 2.1 Testing
- [ ] Decisions auto-created after Blueprint
- [ ] Debug panel appears in Vault
- [ ] Stats show correct counts
- [ ] Can expand each decision type
- [ ] Can see full JSON content
- [ ] API routes return correct JSON

---

## 🎯 Next Steps After Testing

1. **Take screenshots** of:
   - Premium research UI in Muse
   - Debug panel in Vault showing decisions

2. **Verify** all decisions are created:
   - 2-3 Personas
   - 5-8 Features
   - 4-6 Pain Points
   - 3-5 Insights
   - 0-4 Competitor Gaps

3. **Test API routes** manually to confirm they work

4. **Ready to build UI?** Let me know and we'll create:
   - DecisionCard component
   - RefinementModal
   - AlternativesModal
   - Progress tracker

---

## 🎉 What This Proves

**Backend Complete:**
- ✅ Data model designed
- ✅ Store methods working
- ✅ API routes functional
- ✅ Journey integration complete
- ✅ Perplexity research premium

**Frontend Next:**
- ⏭️ Decision cards
- ⏭️ AI refinement UI
- ⏭️ Alternatives UI
- ⏭️ Progress tracking

**You're seeing the foundation in action!** 🚀

---

**Happy Testing!** 🐑
