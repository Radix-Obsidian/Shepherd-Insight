# Phase 2 Progress: Decision Vault Refinement
**Started:** Dec 1, 2025 at 1:23pm  
**Status:** Foundation Complete ✅ | UI Components Next ⏭️

---

## ✅ What's Built (Foundation Layer)

### 1. Data Model
**File:** `src/types/project.ts`

**New Types Added:**
```typescript
export type DecisionState = 'pending' | 'locked' | 'refined' | 'replaced' | 'discarded'
export type DecisionType = 'feature' | 'persona' | 'painPoint' | 'insight' | 'competitorGap'

export interface Decision {
  id: string
  type: DecisionType
  content: any
  state: DecisionState
  originalContent?: any
  refinementHistory?: RefinementHistoryEntry[]
  locked: boolean
  lockedAt?: string
  createdAt: string
  updatedAt: string
}
```

**Result:** ✅ Type-safe decision management

---

### 2. State Management (Zustand Store)
**File:** `src/lib/store.ts`

**New Methods Added:**
```typescript
// Create decisions from journey data
createDecisionsFromJourney(projectId, versionId, journeyData)

// Lock/unlock decisions
lockDecision(projectId, versionId, decisionId)
unlockDecision(projectId, versionId, decisionId)

// Refine decision with AI
refineDecision(projectId, versionId, decisionId, refinedContent, userRequest, aiProvider)

// Replace with alternative
replaceDecision(projectId, versionId, decisionId, newContent, aiProvider)

// Discard decision
discardDecision(projectId, versionId, decisionId)

// Query decisions
getDecisions(projectId, versionId, filters?)
getDecisionStats(projectId, versionId) // Returns counts by state
```

**Result:** ✅ Complete decision lifecycle management

---

### 3. Blueprint Integration
**File:** `src/app/blueprint/page.tsx`

**Changes:**
- Auto-creates decisions from journey data after blueprint completes
- Extracts personas, pain points, insights, features, competitor gaps
- Stores all as `Decision` objects with `pending` state

**Result:** ✅ Decisions auto-populate when journey completes

---

### 4. AI API Routes

#### Refinement API
**File:** `src/app/api/vault/refine/route.ts`

**Endpoint:** `POST /api/vault/refine`

**What it does:**
- Takes original decision + user feedback
- Uses Claude (via orchestrator) to refine
- Returns refined content matching original structure
- Supports: persona, feature, painPoint, insight, competitorGap

**Example Request:**
```json
{
  "decisionType": "persona",
  "originalContent": {
    "name": "Sarah",
    "role": "Busy Mom",
    "goals": ["..."],
    "frustrations": ["..."]
  },
  "userRequest": "Make her more focused on professional work, not just kids"
}
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "refinedContent": {
      "name": "Sarah",
      "role": "Working Mom in Tech",
      "goals": ["Advance career while managing family", "..."],
      "frustrations": ["Hard to focus during meetings with kids", "..."]
    },
    "aiProvider": "claude"
  }
}
```

**Result:** ✅ AI-powered decision refinement

---

#### Alternatives API
**File:** `src/app/api/vault/alternatives/route.ts`

**Endpoint:** `POST /api/vault/alternatives`

**What it does:**
- Takes current decision
- Generates 3 distinct alternatives
- Uses Claude with higher temperature (0.9) for creativity
- Returns array of alternatives matching original structure

**Example Request:**
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

**Example Response:**
```json
{
  "success": true,
  "data": {
    "alternatives": [
      {
        "name": "Marcus",
        "role": "Single Dad",
        "goals": ["..."],
        "frustrations": ["..."]
      },
      {
        "name": "Jenny",
        "role": "Foster Parent",
        "goals": ["..."],
        "frustrations": ["..."]
      },
      {
        "name": "Tom",
        "role": "Grandparent Caregiver",
        "goals": ["..."],
        "frustrations": ["..."]
      }
    ],
    "aiProvider": "claude"
  }
}
```

**Result:** ✅ AI-generated alternatives for every decision type

---

## ⏭️ What's Next (UI Components)

### Week 1: Decision Card Component
**Estimated Time:** 2-3 days

**Create:** `src/components/vault/DecisionCard.tsx`

**Features:**
- Display decision based on type (persona, feature, etc.)
- 4 action buttons: Lock, Refine, Replace, Discard
- State badges (pending, locked, refined, replaced)
- Comparison view (show original vs refined)

**Example UI:**
```tsx
<DecisionCard decision={decision}>
  <PersonaView persona={decision.content} />
  
  <ActionButtons>
    <button onClick={handleLock}>
      <Lock /> Lock It
    </button>
    <button onClick={handleRefine}>
      <RefreshCw /> Refine It
    </button>
    <button onClick={handleReplace}>
      <Shuffle /> Get Alternatives
    </button>
    <button onClick={handleDiscard}>
      <Trash2 /> Discard
    </button>
  </ActionButtons>
</DecisionCard>
```

---

### Week 2: Refinement Modal
**Estimated Time:** 2 days

**Create:** `src/components/vault/RefinementModal.tsx`

**Features:**
- Show original decision
- Text area for user feedback
- Call `/api/vault/refine`
- Side-by-side comparison
- Lock refined version button

**User Flow:**
1. User clicks "Refine It" on persona
2. Modal opens with original persona
3. User types: "Make her more tech-focused"
4. AI generates refined version
5. Side-by-side comparison shown
6. User clicks "Lock Refined Version"

---

### Week 3: Alternatives Modal
**Estimated Time:** 2 days

**Create:** `src/components/vault/AlternativesModal.tsx`

**Features:**
- Show current decision
- Dropdown for alternative type
- Call `/api/vault/alternatives`
- Display 3 alternatives
- Select one to replace
- "Get More" button for additional alternatives

**User Flow:**
1. User clicks "Get Alternatives" on feature
2. Modal opens with current feature
3. User selects "Different approach"
4. AI generates 3 alternatives
5. User picks alternative #2
6. Replaces original, marks as "replaced"

---

### Week 4: Vault Page Enhancement
**Estimated Time:** 2-3 days

**Update:** `src/app/vault/page.tsx`

**Features:**
- Progress banner (X/12 locked)
- Filter by decision type
- Filter by state (pending, locked, etc.)
- Sort by type, date, state
- "Lock All Pending" bulk action
- "Export Locked Only" button

**Progress Banner:**
```tsx
<VaultProgress>
  <div>
    <span className="text-3xl font-bold">{lockedCount}</span>
    <span className="text-slate-600">/ {totalCount} locked</span>
  </div>
  
  {lockedCount === totalCount ? (
    <Alert variant="success">
      ✅ Your vault is complete! Ready to export.
    </Alert>
  ) : (
    <Alert variant="info">
      🎯 Review {totalCount - lockedCount} more decisions
    </Alert>
  )}
</VaultProgress>
```

---

## 📊 Decision Flow Diagram

```
Journey Complete (Blueprint page)
         ↓
Auto-create decisions (all pending)
         ↓
User opens Vault page
         ↓
    ┌────────────────────┐
    │  Decision Card     │
    ├────────────────────┤
    │  [Persona/Feature] │
    │                    │
    │  4 Actions:        │
    │  ✅ Lock It        │ → state = 'locked'
    │  🔄 Refine It      │ → Modal → AI → state = 'refined'
    │  🔀 Replace It     │ → Modal → AI → state = 'replaced'
    │  ❌ Discard It     │ → state = 'discarded'
    └────────────────────┘
         ↓
Progress tracker updates
         ↓
When all locked/refined/replaced
         ↓
Export unlocked (Phase 3)
```

---

## 🧪 Testing Checklist

### Data Layer (Complete ✅)
- [x] Types compile without errors
- [x] Store methods added
- [x] Blueprint creates decisions
- [x] API routes respond correctly

### UI Layer (Next ⏭️)
- [ ] DecisionCard renders all types
- [ ] Lock button works
- [ ] Refinement modal opens
- [ ] API call succeeds
- [ ] Refined content displays
- [ ] Alternatives modal opens
- [ ] 3 alternatives generated
- [ ] Replace works
- [ ] Discard works
- [ ] Progress tracker updates
- [ ] Filter/sort works

### Integration (Final 🧪)
- [ ] Complete journey → decisions created
- [ ] Refine persona → stores history
- [ ] Replace feature → keeps original
- [ ] Discard insight → hides from vault
- [ ] Lock all → ready for export
- [ ] Navigate to vault after blueprint

---

## 📁 Files Created/Modified

**Created:**
- ✅ `src/app/api/vault/refine/route.ts` (177 lines)
- ✅ `src/app/api/vault/alternatives/route.ts` (236 lines)
- ✅ `PHASE2_PROGRESS.md` (this file)

**Modified:**
- ✅ `src/types/project.ts` (added Decision types)
- ✅ `src/lib/store.ts` (added 8 decision methods)
- ✅ `src/app/blueprint/page.tsx` (auto-create decisions)

**Next to Create:**
- ⏭️ `src/components/vault/DecisionCard.tsx`
- ⏭️ `src/components/vault/RefinementModal.tsx`
- ⏭️ `src/components/vault/AlternativesModal.tsx`
- ⏭️ `src/components/vault/ProgressBanner.tsx`
- ⏭️ Update `src/app/vault/page.tsx`

---

## 🎯 Success Metrics

**Foundation (Current):**
- ✅ Build successful
- ✅ 0 TypeScript errors
- ✅ API routes functional
- ✅ Store methods tested (manual)

**UI Components (Next Week):**
- [ ] All decision types render correctly
- [ ] Refinement success rate > 95%
- [ ] Alternatives quality rated 4/5+
- [ ] User can complete vault in < 10 min

**Integration (Final):**
- [ ] Complete journey → vault populated
- [ ] User refines 3+ decisions
- [ ] User replaces 1+ decision
- [ ] User discards 1+ decision
- [ ] All pending → locked/refined
- [ ] Export shows only locked decisions

---

## ⏱️ Timeline

**Week 1 (Dec 2-8):**
- Build DecisionCard component
- Wire up Lock/Discard actions
- Test with real journey data

**Week 2 (Dec 9-15):**
- Build RefinementModal
- Build AlternativesModal
- Test AI generation quality

**Week 3 (Dec 16-22):**
- Update Vault page
- Add progress tracking
- Add filters/sorting
- Polish UX

**Week 4 (Dec 23-29):**
- End-to-end testing
- Bug fixes
- Phase 3 prep (AI Dev Prompt)

---

## 🐑 Following GSAIM

✅ **Customer-Backwards:** Started with "What transformation?" (static list → refined vault)  
✅ **Vertical Slice:** Built complete data layer before touching UI  
✅ **Integration-First:** AI APIs tested before UI components  
✅ **Type Safety:** All TypeScript, no runtime errors  
✅ **One Slice at a Time:** Foundation done, UI next  

---

**Next Command:** Build DecisionCard component when ready!
