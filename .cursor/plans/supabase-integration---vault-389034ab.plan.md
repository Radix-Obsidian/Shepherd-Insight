<!-- 389034ab-76b7-4b9a-84b2-e26120cf15b8 297f9eb4-7b99-4ed5-bea1-bb9cfa6ee27b -->
# Fix Authentication & Complete System Verification

## Issues Identified

1. **Session Persistence**: Page refresh forces re-login because session isn't persisted
2. **Post-Login Navigation**: After login, navigation gets stuck at account page
3. **Insight Generator Architecture**: Need to verify current implementation vs. desired Firesearch/Firecrawl/Groq flow
4. **Full System Testing**: Need comprehensive testing of all features

## Current Architecture Analysis

Based on code review:

**Current Research Pipeline**:

- Uses `FirecrawlClient` (direct SDK integration) for search/scrape/extract
- Uses `GroqClient` (LangChain integration) for AI synthesis
- Uses `ResearchWorkflow` class to orchestrate: Search → Scrape → Extract → Groq → Insights
- **NOT using Firesearch** - custom workflow implementation instead

**Desired Architecture**:

```
Real Web → Firecrawl Search/Extract → Firesearch (LangGraph) → Groq → Insight Brief → Vault → Mind Map
```

## Implementation Plan

### 1. Fix Session Persistence on Refresh

**Problem**: `checkSession` runs on every mount but doesn't persist session data

**Root Cause**: The session check happens in `RootLayoutClient.tsx` but the state isn't properly hydrated from localStorage or cookies

**Solution A - Add localStorage persistence**:

File: `src/lib/store.ts`

```typescript
// Add to store initialization
const storedAuth = typeof window !== 'undefined' 
  ? localStorage.getItem('auth_state')
  : null

const initialAuth = storedAuth 
  ? JSON.parse(storedAuth)
  : { user: null, session: null, authReady: false }

// In checkSession action, persist to localStorage
checkSession: async () => {
  try {
    const response = await fetch('/api/auth?action=session')
    if (!response.ok) throw new Error('Session check failed')
    const data = await response.json()
    
    if (data.session?.user) {
      const authState = {
        user: { id: data.session.user.id, email: data.session.user.email },
        session: data.session,
        authReady: true
      }
      set(authState)
      localStorage.setItem('auth_state', JSON.stringify(authState))
    } else {
      set({ user: null, session: null, authReady: true })
      localStorage.removeItem('auth_state')
    }
  } catch (error) {
    set({ user: null, session: null, authReady: true })
    localStorage.removeItem('auth_state')
  }
}
```

**Solution B - Fix auth redirect dependency**:

File: `src/app/dashboard/page.tsx`, `src/app/vault/page.tsx`, `src/app/intake/page.tsx`

Change the redirect logic to only run once:

```typescript
const hasRedirected = useRef(false)

useEffect(() => {
  if (authReady && !isAuthenticated && !hasRedirected.current) {
    hasRedirected.current = true
    router.push('/account')
  }
}, [authReady, isAuthenticated, router])
```

### 2. Integrate Firesearch Architecture

**Current**: Custom `ResearchWorkflow` → Direct Firecrawl + Groq

**Target**: Firesearch (LangGraph) → Firecrawl + Groq

**Steps**:

1. **Install Firesearch dependencies**:
```bash
npm install @langchain/langgraph firesearch
```

2. **Replace ResearchWorkflow with Firesearch**:

Create: `src/lib/research/firesearch-adapter.ts`

```typescript
import { FirecrawlClient } from './firecrawl-client'
import { GroqClient } from './groq-client'
// Import Firesearch LangGraph nodes

export class FiresearchAdapter {
  private firecrawl: FirecrawlClient
  private groq: GroqClient
  
  constructor() {
    this.firecrawl = new FirecrawlClient()
    this.groq = new GroqClient()
  }
  
  // Adapt Firesearch nodes to use Groq instead of default LLM
  // Use Firecrawl for data layer (search, extract)
  // Return InsightData matching our schema
}
```

3. **Update API route**:

File: `src/app/api/research/run/route.ts`

Replace `ResearchWorkflow` with `FiresearchAdapter`

### 3. Fix Post-Login Navigation

**Problem**: After successful login, user stays on account page

**Solution**:

File: `src/app/account/page.tsx`

After successful login, redirect to dashboard:

```typescript
const handleSignIn = async () => {
  // ... existing sign in logic ...
  if (success) {
    router.push('/dashboard')
  }
}
```

### 4. Comprehensive System Testing

Test the following flow:

1. **Landing Page** → Verify UI loads
2. **Sign Up** → Create new account
3. **Sign In** → Login with credentials
4. **Dashboard** → Verify redirect after login, projects load
5. **New Insight** → Fill intake form, create project
6. **Research Panel** → Run research with Firesearch+Firecrawl+Groq
7. **Insight Page** → View generated insights with citations
8. **Vault** → Lock decisions, verify persistence
9. **Mind Map** → Generate mind map from insights
10. **Export** → Export to MD/PDF
11. **Refresh Test** → Refresh each page, verify session persists
12. **Navigation Test** → Click all sidebar links, verify no stuck states

## Files to Modify

- `src/lib/store.ts` (add localStorage persistence)
- `src/app/dashboard/page.tsx` (fix redirect logic)
- `src/app/vault/page.tsx` (fix redirect logic)  
- `src/app/intake/page.tsx` (fix redirect logic)
- `src/app/account/page.tsx` (add post-login redirect)
- `src/lib/research/firesearch-adapter.ts` (NEW - Firesearch integration)
- `src/app/api/research/run/route.ts` (use Firesearch adapter)

## Questions for Clarification

1. **Firesearch Integration**: You must fully replace the current custom workflow with Firesearch!

2. **Session Storage**: Should we use localStorage (client-side) or cookies (server-side) for session persistence?

3. **Onboarding Flow**: You mentioned onboarding might be broken - do you have a specific onboarding flow (tutorial, walkthrough) that should trigger on first login?

### To-dos

- [ ] Wrap MindMapBuilder with ReactFlowProvider in mindmap page
- [ ] Remove/fix blocking auth redirects in dashboard, intake, vault, insight pages
- [ ] Delete .next directory and rebuild to fix webpack module error
- [ ] Fix import paths in test-apis.mjs to use correct relative paths
- [ ] Create .cursor/mcp.json with Firecrawl MCP server configuration
- [ ] Test complete navigation flow: login → dashboard → all tabs