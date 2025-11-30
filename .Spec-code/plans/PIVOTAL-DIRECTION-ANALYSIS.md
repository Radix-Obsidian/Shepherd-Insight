# Shepherd Insight — Pivotal Direction Analysis

## Executive Summary

This document analyzes the current codebase state and maps the path to the Steve Jobs-aligned pivot: **One Engine → Three Tools → One Founder Journey.**

**Customer Transformation:**
- **From:** "I don't know where to start. I'm overwhelmed. I'm not technical."
- **To:** "I know my user. I know my MVP. I can build this."

---

## 1. Current Codebase State

### What Exists and Works

| Component | Status | Notes |
|-----------|--------|-------|
| **Next.js 14 App Router** | ✅ Working | Solid foundation, App Router structure in place |
| **Supabase Integration** | ✅ Working | PostgreSQL + Auth + RLS configured |
| **Authentication** | ✅ Working | `/account` page with Supabase Auth |
| **Dashboard** | ✅ Working | `/dashboard` - lists projects from Supabase |
| **Intake Form** | ✅ Working | `/intake` - creates projects with version data |
| **Insight Page** | ✅ Working | `/insight` - displays project data |
| **Mind Map** | ✅ Working | `/mindmap` - visual mind mapping with ReactFlow |
| **Decision Vault** | ✅ Working | `/vault` - locked decisions display |
| **Exports** | ✅ Working | `/exports` - Markdown export functional |
| **Zustand Store** | ✅ Working | Local state with persistence |
| **Tailwind CSS** | ✅ Working | Styling infrastructure |

### What Exists but Needs Work

| Component | Status | Notes |
|-----------|--------|-------|
| **Groq Integration** | ⚠️ Partial | `groq-client.ts` exists but uses mock responses in places |
| **Firecrawl Integration** | ⚠️ Partial | `firecrawl-client.ts` + `firesearch-adapter.ts` exist, need real wiring |
| **Research Workflow** | ⚠️ Partial | `research-workflow.ts` has orchestration logic, needs testing |
| **AI Analyzer** | ⚠️ Partial | `ai-analyzer.ts` exists, needs production validation |
| **Competitor Analyzer** | ⚠️ Partial | `competitor-analyzer.ts` exists, needs real Firecrawl data |

### What Doesn't Exist Yet (Required for Pivot)

| Component | Required For | Priority |
|-----------|--------------|----------|
| **Shepherd Engine** | Unified AI core | 🔴 Critical |
| **Shepherd Compass** | `/compass` route - clarity tool | 🔴 Critical |
| **Shepherd Research Muse** | `/muse` route - research tool | 🔴 Critical |
| **Shepherd Blueprint** | `/blueprint` route - MVP plan tool | 🔴 Critical |
| **Engine API Endpoints** | `/api/engine/*` routes | 🔴 Critical |
| **Unified Journey Flow** | Compass → Muse → Blueprint navigation | 🟡 High |
| **Engine Caching** | `engine_cache` table in Supabase | 🟡 High |

---

## 2. The Pivotal Direction

### From Current Architecture

```
User → Intake → Insight → Mindmap → Vault → Export
              ↓
        (AI scattered across multiple files)
```

### To New Architecture

```
User → Compass → Muse → Blueprint → Export
              ↓
        [Shepherd Engine]
        ├── Insight Reasoner
        ├── Persona Synthesizer
        ├── Opportunity Scorer
        ├── Feature Mapper
        ├── MVP Prioritizer
        └── Story Composer
```

### The Shepherd Engine Modules

| Module | Purpose | Inputs | Outputs |
|--------|---------|--------|---------|
| **Insight Reasoner** | Clarify raw ideas | Idea text, target user | Problem statement, JTBD, opportunity gap |
| **Persona Synthesizer** | Generate user profiles | Interviews, notes, competitor data | Personas, emotional journey, pain map |
| **Opportunity Scorer** | Evaluate market gaps | Pain points, competitor analysis | Scored opportunities, unmet needs |
| **Feature Mapper** | Connect features to value | Features, pain points | Feature-value mapping, priority scores |
| **MVP Prioritizer** | Define scope | Feature map, constraints | MVP scope, phases, roadmap |
| **Story Composer** | Generate narratives | All above outputs | Pitch story, investor narrative, how-it-works |

---

## 3. What Stays vs What Changes

### KEEP (Don't Touch)

- **`src/lib/supabase*.ts`** — Supabase client configuration is solid
- **`src/lib/store.ts`** — Zustand store structure, but will extend for new tools
- **`src/middleware.ts`** — Auth middleware
- **`src/components/ui/*`** — UI primitives (button, card, input, etc.)
- **`src/components/sidebar.tsx`** — Will update navigation items only
- **`src/app/account/*`** — Authentication flow
- **`src/app/dashboard/*`** — Project listing (update to show new journey)
- **`supabase/migrations/*`** — Existing schema, add new tables
- **Tailwind config** — Styling infrastructure
- **Next.js config** — Build configuration

### REFACTOR (Adapt for New Direction)

| Current | Becomes | Action |
|---------|---------|--------|
| `/intake` | Entry point for Compass | Simplify or merge into Compass |
| `/insight` | Deprecated or redirect | Replace with Compass output |
| `/mindmap` | Optional visualization | Keep as enhancement, not core journey |
| `/vault` | Part of Blueprint | Locked decisions move to Blueprint output |
| `/exports` | Blueprint export | Export from Blueprint page |

### CREATE (New Components)

| Component | Path | Description |
|-----------|------|-------------|
| Shepherd Engine | `src/lib/engine/` | Core AI orchestration layer |
| Insight Reasoner | `src/lib/engine/insight-reasoner.ts` | Clarity logic |
| Persona Synthesizer | `src/lib/engine/persona-synth.ts` | Persona generation |
| Opportunity Scorer | `src/lib/engine/opportunity-score.ts` | Pain scoring |
| Feature Mapper | `src/lib/engine/feature-mapper.ts` | Feature-value mapping |
| MVP Prioritizer | `src/lib/engine/mvp-prioritizer.ts` | Scope calculation |
| Story Composer | `src/lib/engine/story-composer.ts` | Narrative generation |
| Engine Orchestrator | `src/lib/engine/index.ts` | Central coordination |
| Compass UI | `src/app/compass/page.tsx` | Clarity tool interface |
| Muse UI | `src/app/muse/page.tsx` | Research tool interface |
| Blueprint UI | `src/app/blueprint/page.tsx` | MVP plan interface |
| Clarity API | `src/app/api/engine/clarity/route.ts` | Clarity endpoint |
| Persona API | `src/app/api/engine/persona/route.ts` | Persona endpoint |
| MVP API | `src/app/api/engine/mvp/route.ts` | MVP scope endpoint |
| Narrative API | `src/app/api/engine/narrative/route.ts` | Story endpoint |

### EXTEND (Add to Existing)

| Component | Extension |
|-----------|-----------|
| Supabase Schema | Add `clarity_sessions`, `research_insights`, `blueprints`, `engine_cache` tables |
| Zustand Store | Add Compass/Muse/Blueprint state management |
| Sidebar Navigation | Update to Compass → Muse → Blueprint journey |

---

## 4. Integration Requirements (Official Docs Only)

### Groq Integration

**Official Documentation:** https://console.groq.com/docs

**Required:**
- Use `groq-sdk` npm package
- Multi-model support: Llama 4, Llama 3.3
- Streaming for long responses
- Error handling for rate limits

**Current State:** `src/lib/research/groq-client.ts` exists, needs validation against official docs.

### Firecrawl Integration

**Official Documentation:** https://docs.firecrawl.dev/

**Required:**
- Use official Firecrawl client
- Webhook handling for async scraping
- Fire search for competitor research
- Content extraction and parsing

**Current State:** `src/lib/research/firecrawl-client.ts` + `firesearch-adapter.ts` exist, need validation.

### Supabase Integration

**Official Documentation:** https://supabase.com/docs

**Current State:** ✅ Properly integrated using official patterns.

**Extensions Needed:**
- New tables for Compass/Muse/Blueprint data
- RLS policies for new tables
- Edge Functions for secure API key management (if needed)

---

## 5. Migration Strategy

### Phase 1: Engine Foundation (Days 1-2)

1. Create `src/lib/engine/` directory structure
2. Implement `insight-reasoner.ts` using real Groq calls (official docs)
3. Create `/api/engine/clarity` endpoint
4. Add `clarity_sessions` table to Supabase
5. Verify with real AI responses

### Phase 2: Compass UI (Day 3)

1. Create `/compass` route
2. Simple, Steve Jobs-style interface (big input, clear output)
3. Connect to `/api/engine/clarity`
4. Store sessions in Supabase
5. Add "Continue to Muse" flow

### Phase 3: Persona Synthesizer + Muse (Days 4-5)

1. Implement `persona-synth.ts` with Firecrawl + Groq
2. Create `/api/engine/persona` endpoint
3. Add `research_insights` table
4. Create `/muse` route with upload/input interface
5. Display personas, pain map, insights

### Phase 4: Blueprint Tools (Days 6-7)

1. Implement remaining engine modules:
   - `opportunity-score.ts`
   - `feature-mapper.ts`
   - `mvp-prioritizer.ts`
   - `story-composer.ts`
2. Create `/api/engine/mvp` + `/api/engine/narrative` endpoints
3. Add `blueprints` table
4. Create `/blueprint` route with full output display

### Phase 5: Journey Integration (Day 8)

1. Update sidebar navigation: Compass → Muse → Blueprint
2. Create unified navigation flow
3. Pass data between tools via URL params or Zustand
4. Update dashboard to show journey status

### Phase 6: Polish + Deploy (Days 9-10)

1. Add loading states (Apple-like smoothness)
2. Add rate limiting
3. Add caching (`engine_cache`)
4. Full E2E testing
5. Deploy to Vercel

---

## 6. Critical Path Dependencies

```
Groq Client (validated) 
    ↓
Insight Reasoner 
    ↓
/api/engine/clarity 
    ↓
Compass UI ────────→ [Can ship Day 3]
    ↓
Firecrawl Client (validated)
    ↓
Persona Synthesizer
    ↓
/api/engine/persona
    ↓
Muse UI ───────────→ [Can ship Day 5]
    ↓
Feature Mapper + MVP Prioritizer + Story Composer
    ↓
/api/engine/mvp + /api/engine/narrative
    ↓
Blueprint UI ──────→ [Can ship Day 7]
    ↓
Journey Integration
    ↓
Production Deploy ─→ [Ship Day 10]
```

---

## 7. Risk Mitigation

### Risk: AI Integration Fails

**Mitigation:** Validate Groq and Firecrawl integrations against official docs BEFORE building UI. If issues, check GitHub issues and Stack Overflow for battle-tested solutions.

### Risk: Data Migration Breaks Existing Projects

**Mitigation:** Keep existing tables, add new tables for Compass/Muse/Blueprint. Old projects remain accessible.

### Risk: Scope Creep

**Mitigation:** Strict vertical slice discipline. Each tool is a separate slice. Ship Compass before touching Muse.

### Risk: UI Complexity

**Mitigation:** Steve Jobs principle — "What can we remove?" Keep UI minimal. Big input, clear output, obvious next step.

---

## 8. Success Criteria

### Compass Shipped (Day 3)

- [ ] User enters raw idea
- [ ] AI returns clear problem + JTBD + opportunity gap
- [ ] Data saved to Supabase
- [ ] "Continue to Muse" button works

### Muse Shipped (Day 5)

- [ ] User uploads interviews/notes/competitor URLs
- [ ] AI returns personas + pain map + insights
- [ ] Firecrawl successfully scrapes competitor data
- [ ] Data saved to Supabase
- [ ] "Continue to Blueprint" button works

### Blueprint Shipped (Day 7)

- [ ] MVP scope generated from Compass + Muse data
- [ ] Feature list with priority scores
- [ ] Phased roadmap
- [ ] Investor-ready narrative
- [ ] Export to PDF/Markdown

### Full Journey Shipped (Day 10)

- [ ] Compass → Muse → Blueprint flow works end-to-end
- [ ] All data persisted in Supabase
- [ ] Deployed to Vercel
- [ ] One real user can complete the journey

---

## 9. The Non-Negotiables

1. **Customer transformation defined first** — Every feature serves "confusion → clarity → action"
2. **Official documentation only** — Groq, Firecrawl, Supabase integrations use official docs
3. **Real AI responses** — No mocks in production slices
4. **Vertical slices** — Ship Compass before Muse before Blueprint
5. **Daily deployability** — Each slice works in production

---

*This analysis was created following the Golden Sheep AI Methodology™ — Customer-Backwards Development.*
