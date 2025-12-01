# Decision Vault Refinement Strategy
**"From locked decisions to a battle-tested blueprint"**

---

## 🎯 Customer Transformation

**From:** "I have some locked decisions and a bunch of stuff I'm not sure about"  
**To:** "I have a complete, refined vault of validated decisions ready to hand to Claude and build my app"

---

## 💡 The Problem with "Just Locking"

Current flow:
1. User goes through Compass → Muse → Blueprint
2. They see decisions (features, personas, etc.)
3. They can "lock" what they like
4. **But what about the rest?**

**User questions we don't answer:**
- "This feature is close but not quite right. Can I refine it?"
- "I don't want this persona. Can I get alternatives?"
- "This pain point doesn't resonate. What else did you find?"
- "Can I replace this with something more specific to my market?"

**The gap:** We give users a static list. They need a **refinement workshop**.

---

## 🏗️ Decision Vault 2.0: The Refinement Workshop

### New User Flow

```
┌─────────────────────────────────────────────────────────────┐
│  COMPASS → MUSE → BLUEPRINT                                 │
│  (Journey complete, data saved)                             │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│  VAULT: Initial State                                       │
│  • All decisions from journey loaded                        │
│  • Nothing locked yet                                       │
│  • "Refine Your Blueprint" banner shown                     │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│  User Actions (per decision):                               │
│  1. ✅ Lock it (keep as-is)                                 │
│  2. 🔄 Refine it (AI helps iterate)                         │
│  3. 🔀 Replace it (get alternatives)                        │
│  4. ❌ Discard it (remove from vault)                       │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│  VAULT: Finalized State                                     │
│  • Only locked/refined decisions remain                     │
│  • Ready for export                                         │
│  • Ready to hand to AI for development                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎨 UI Design: Decision Card Actions

### Every Decision Card Gets 4 Actions

```tsx
<DecisionCard>
  <DecisionContent>
    {/* Feature, Persona, Pain Point, etc. */}
  </DecisionContent>
  
  <DecisionActions>
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
  </DecisionActions>
</DecisionCard>
```

---

## 🤖 AI-Powered Refinement Flows

### 1. **Refine It** → Iterative Improvement

**Trigger:** User clicks "Refine It" on a feature

**UI Flow:**
```tsx
<RefinementModal>
  <OriginalDecision>
    Feature: "User profile with bio and photo"
  </OriginalDecision>
  
  <RefinementPrompt>
    <label>What would you like to change?</label>
    <textarea
      placeholder="e.g., 'Make it more focused on professional networking' or 'Add skill endorsements'"
    />
  </RefinementPrompt>
  
  <button onClick={handleRefine}>
    Generate Refined Version
  </button>
</RefinementModal>
```

**AI Call (Claude):**
```typescript
const refinedFeature = await orchestrate('synthesis', `
  Original Feature:
  ${originalFeature}
  
  User wants to change:
  "${userRefinementRequest}"
  
  Context from their journey:
  - Problem: ${clarity.problemStatement}
  - Target User: ${clarity.targetUser}
  - Pain Points: ${research.painMap.map(p => p.description).join(', ')}
  
  Refine this feature to match the user's request while staying true to their validated problem/user.
  
  Return JSON:
  {
    "name": "refined feature name",
    "description": "refined description",
    "rationale": "why this refinement solves their feedback",
    "userStory": "As a [user], I want [refined feature] so that [benefit]"
  }
`)
```

**Result:** User sees refined version side-by-side with original, can lock refined version

---

### 2. **Replace It** → Get Alternatives

**Trigger:** User clicks "Get Alternatives" on a persona

**UI Flow:**
```tsx
<AlternativesModal>
  <OriginalDecision>
    Persona: "Busy Parent Sarah"
    Role: Working mom, 2 kids
    Goal: Track kids' activities
  </OriginalDecision>
  
  <AlternativesPrompt>
    <label>What kind of alternative do you want?</label>
    <select>
      <option>Different demographic</option>
      <option>Different use case</option>
      <option>More niche/specific</option>
      <option>Broader audience</option>
    </select>
  </AlternativesPrompt>
  
  <button onClick={handleGetAlternatives}>
    Generate 3 Alternatives
  </button>
</AlternativesModal>
```

**AI Call (Perplexity + Claude):**
```typescript
// Step 1: Perplexity researches alternatives
const alternativeResearch = await researchWithPerplexity({
  query: `
    Research alternative user personas for: ${clarity.problemStatement}
    
    Current persona: ${currentPersona}
    
    Find 3 different personas who:
    - Face similar pain points
    - Would benefit from this solution
    - Represent ${alternativeType}
    
    Include demographics, goals, frustrations, and usage patterns.
  `,
  model: 'sonar-pro',
  searchRecency: 'month'
})

// Step 2: Claude synthesizes into structured personas
const alternatives = await orchestrate('synthesis', `
  Based on this research: ${alternativeResearch}
  
  Create 3 alternative personas in the same format as:
  ${currentPersona}
  
  Make them distinct but equally valid for the problem space.
`)
```

**Result:** User sees 3 alternatives, can lock one or request more

---

### 3. **Discard It** → Remove from Vault

**Trigger:** User clicks "Discard"

**Simple Flow:**
```typescript
const handleDiscard = (decisionId: string) => {
  if (confirm('Remove this from your vault? You can always regenerate alternatives later.')) {
    removeDecisionFromVault(projectId, versionId, decisionId)
  }
}
```

**Result:** Decision removed. If user later wants it back, they can use "Get Alternatives" to regenerate.

---

## 📦 Data Model Updates

### Add Decision States

```typescript
// src/types/project.ts

export type DecisionState = 
  | 'pending'      // From journey, not reviewed yet
  | 'locked'       // User approved, keep as-is
  | 'refined'      // User refined it
  | 'replaced'     // User replaced with alternative
  | 'discarded'    // User removed it

export interface Decision {
  id: string
  type: 'feature' | 'persona' | 'painPoint' | 'insight' | 'risk'
  content: any  // The actual decision data
  state: DecisionState
  originalContent?: any  // If refined/replaced, keep original
  refinementHistory?: {
    timestamp: string
    userRequest: string
    result: any
  }[]
  locked: boolean
  lockedAt?: string
}

export interface VersionData {
  // ... existing fields
  decisions?: Decision[]  // NEW: All decisions with states
}
```

---

## 🎯 Vault Page UX

### Banner: Progress Tracker

```tsx
<VaultBanner>
  <VaultProgress>
    <div>
      <span className="text-3xl font-bold">{lockedCount}</span>
      <span className="text-slate-600">/ {totalCount} locked</span>
    </div>
    
    {lockedCount === totalCount ? (
      <Alert variant="success">
        ✅ Your vault is complete! Ready to export and build.
      </Alert>
    ) : (
      <Alert variant="info">
        🎯 Review {totalCount - lockedCount} more decisions to complete your vault
      </Alert>
    )}
  </VaultProgress>
  
  <VaultActions>
    <button onClick={handleExportBlueprint}>
      Export Blueprint
    </button>
    <button onClick={handleGenerateAIPrompt}>
      Generate AI Dev Prompt
    </button>
  </VaultActions>
</VaultBanner>
```

### Decision Sections with Filters

```tsx
<VaultSections>
  <SectionHeader>
    <h2>Features ({featureCount})</h2>
    <FilterButtons>
      <button active={filter === 'all'}>All</button>
      <button active={filter === 'pending'}>Needs Review</button>
      <button active={filter === 'locked'}>Locked</button>
    </FilterButtons>
  </SectionHeader>
  
  <DecisionCards>
    {filteredFeatures.map(feature => (
      <FeatureCard
        feature={feature}
        onLock={handleLock}
        onRefine={handleRefine}
        onReplace={handleReplace}
        onDiscard={handleDiscard}
      />
    ))}
  </DecisionCards>
</VaultSections>
```

---

## 🚀 New Export: AI Dev Prompt

**The killer feature:** Generate a prompt ready for Claude/Cursor/Windsurf

```typescript
export async function generateAIDevPrompt(projectId: string, versionId: string) {
  const vault = getVaultData(projectId, versionId)
  const lockedDecisions = vault.decisions.filter(d => d.locked)
  
  return `
# ${vault.projectName} - Development Blueprint

## Overview
${vault.clarity.problemStatement}

Target User: ${vault.clarity.targetUser}

## User Personas
${lockedDecisions
  .filter(d => d.type === 'persona')
  .map(p => formatPersona(p.content))
  .join('\n\n')}

## Core Features (MVP)
${lockedDecisions
  .filter(d => d.type === 'feature')
  .map(f => formatFeature(f.content))
  .join('\n\n')}

## User Pain Points to Solve
${lockedDecisions
  .filter(d => d.type === 'painPoint')
  .map(p => `- ${p.content.description} (${p.content.intensity})`)
  .join('\n')}

## Technical Architecture
${vault.blueprint.technicalArchitecture}

## Success Metrics
${vault.blueprint.successMetrics.map(m => `- ${m.metric}: ${m.target}`).join('\n')}

## Development Instructions
You are an expert software engineer. Build this application following:
1. Modern best practices (TypeScript, React, TailwindCSS)
2. The user personas and pain points above
3. The MVP features prioritized above
4. Clean, production-ready code

Start by setting up the project structure, then implement features one at a time.
`
}
```

**User clicks "Copy AI Dev Prompt"** → Opens Cursor/Windsurf → Pastes → AI builds their app!

---

## 🎬 Complete User Journey with Refinement

```
Day 1: Discovery
├─ Compass: Find clarity (5 min)
├─ Muse: Research users (10 min)
└─ Blueprint: Generate MVP plan (5 min)

Day 2: Refinement
├─ Open Vault
├─ Review 12 features → Lock 8, Refine 3, Discard 1
├─ Review 3 personas → Lock 2, Get alternatives for 1
├─ Review 8 pain points → Lock all
└─ Vault complete! 100% locked

Day 3: Build
├─ Export Blueprint as Markdown
├─ Generate AI Dev Prompt
├─ Open Cursor/Claude
├─ Paste prompt
└─ AI builds app based on refined, validated decisions
```

---

## 📊 Implementation Phases

### Phase 1: Data Model (Week 1)
- ✅ Add `Decision` interface
- ✅ Add `decisions` array to `VersionData`
- ✅ Update `createProjectFromJourney` to create decisions

### Phase 2: Vault Actions (Week 2)
- ⏭️ Add Lock/Refine/Replace/Discard UI
- ⏭️ Wire up state changes
- ⏭️ Add progress tracking

### Phase 3: AI Refinement (Week 3)
- ⏭️ Implement "Refine It" modal + AI call
- ⏭️ Implement "Get Alternatives" modal + AI call
- ⏭️ Add refinement history tracking

### Phase 4: Export Enhancement (Week 4)
- ⏭️ Generate AI Dev Prompt
- ⏭️ Add "Copy for Claude" button
- ⏭️ Add "Copy for Cursor" button
- ⏭️ Test end-to-end with real AI coding assistant

---

## ✅ Success Metrics

1. **Vault Completion Rate**: % of users who lock all decisions
2. **Refinement Usage**: % of users who refine at least 1 decision
3. **Alternative Requests**: Avg # of alternative requests per journey
4. **AI Dev Prompt Copies**: % of users who copy the prompt
5. **Build Success**: User reports of "I built my app with this"

---

## 🎯 The Endgame

**Shepherd Insight becomes the bridge:**

```
User's Idea
     ↓
Shepherd Journey (Compass → Muse → Blueprint)
     ↓
Decision Vault (Refine → Lock → Validate)
     ↓
AI Dev Prompt (One-click copy)
     ↓
Claude/Cursor/Windsurf
     ↓
Production App
```

**Customer Transformation (Complete):**
"I have an idea" → "I have a working app"

**Time:** 3 days (vs. 3 months of planning)

---

**Next Steps:** Ready to build Decision Vault 2.0?
