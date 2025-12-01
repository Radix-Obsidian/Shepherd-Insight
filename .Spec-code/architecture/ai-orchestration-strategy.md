# AI Orchestration Strategy: Multi-Model Intelligence
**"The right AI for the right job"**

---

## 🎯 Customer Transformation

**From:** "I get generic AI responses that miss details or make mistakes"  
**To:** "I get the most accurate research AND the best strategic planning, automatically"

---

## 🧠 The Three-AI Architecture

### **Perplexity Sonar Deep Research** → Research & Discovery
**Strengths:**
- Real-time web search with citations
- Built-in tools: `web_search`, `fetch_url_content`, `execute_python`
- Academic research capabilities (`search_academic: true`)
- Domain filtering for trusted sources
- Time-based filters for recent data
- Exhaustive multi-step research
- Structured outputs

**Use Cases in Shepherd:**
- **Muse (Research Phase):**
  - Competitor analysis with live web data
  - Market research with citations
  - User persona synthesis from recent trends
  - Pain point validation from forums/Reddit/reviews
  - Industry analysis with time filters

- **Compass (Validation):**
  - Problem space research
  - Existing solution analysis
  - Market gap identification

**Perplexity Models:**
```typescript
// Best for Shepherd's research needs
sonar-deep-research   // Exhaustive research, detailed reports
sonar-pro             // Complex queries, competitive analysis
sonar-reasoning-pro   // Multi-step reasoning with search
```

---

### **Claude (Sonnet 4)** → Strategic Planning & Synthesis
**Strengths:**
- Long context window (200K tokens)
- Superior reasoning and planning
- Excellent structured output
- Strong at synthesis and storytelling
- Best for opinionated guidance
- Extended thinking mode

**Use Cases in Shepherd:**
- **Compass (Clarity Generation):**
  - Synthesize problem statements
  - Generate value hypotheses
  - Strategic questioning

- **Blueprint (Roadmap Creation):**
  - MVP feature prioritization
  - User story generation
  - Technical architecture planning
  - Risk assessment
  - Launch checklist creation

- **Synthesis Tasks:**
  - Combining Perplexity research → actionable blueprint
  - Decision vault recommendations
  - Export document generation

**Claude Models:**
```typescript
claude-sonnet-4-20250514  // Primary planning engine
```

---

### **Groq** → Speed Layer & Fallback
**Strengths:**
- Fastest inference speed (tokens/sec)
- Multiple model options
- Cost-effective
- Reliable fallback

**Use Cases in Shepherd:**
- **Quick Mode Research** (Muse page when user enables)
- **Fallback** when Claude or Perplexity fail
- **Suggestion Generation** (Compass idea starters)
- **Real-time streaming** responses

**Groq Models:**
```typescript
llama-3.3-70b-versatile  // Best balance
llama-4-90b-instruct     // Highest capability
```

---

## 🏗️ Implementation Architecture

### Phase 1: Create Orchestration Layer

```typescript
// src/lib/engine/orchestrator.ts

export type AITask = 
  | 'research'           // → Perplexity
  | 'planning'           // → Claude
  | 'synthesis'          // → Claude
  | 'quick-research'     // → Groq
  | 'validation'         // → Perplexity
  | 'fallback'           // → Groq

export interface OrchestrationConfig {
  task: AITask
  primary: 'perplexity' | 'claude' | 'groq'
  fallback: 'perplexity' | 'claude' | 'groq'
  timeout: number
  retries: number
}

const TASK_ROUTING: Record<AITask, OrchestrationConfig> = {
  'research': {
    task: 'research',
    primary: 'perplexity',
    fallback: 'groq',
    timeout: 60000,  // 60s for deep research
    retries: 2
  },
  'planning': {
    task: 'planning',
    primary: 'claude',
    fallback: 'groq',
    timeout: 30000,
    retries: 2
  },
  'quick-research': {
    task: 'quick-research',
    primary: 'groq',
    fallback: 'claude',
    timeout: 15000,
    retries: 1
  },
  // ... more routing configs
}

export async function orchestrate(
  task: AITask,
  prompt: string,
  options?: Partial<OrchestrationConfig>
) {
  const config = { ...TASK_ROUTING[task], ...options }
  
  try {
    return await callPrimary(config.primary, prompt, config.timeout)
  } catch (primaryError) {
    console.warn(`Primary AI (${config.primary}) failed for ${task}:`, primaryError)
    return await callFallback(config.fallback, prompt, config.timeout)
  }
}
```

---

### Phase 2: Perplexity Integration

```typescript
// src/lib/engine/perplexity-client.ts

interface PerplexityResearchOptions {
  query: string
  model?: 'sonar-deep-research' | 'sonar-pro' | 'sonar-reasoning-pro'
  searchDomainFilter?: string[]  // Trusted sources
  searchRecency?: 'month' | 'week' | 'day'
  searchAcademic?: boolean
  reasoningEffort?: 'low' | 'medium' | 'high'
}

export async function researchWithPerplexity(
  options: PerplexityResearchOptions
) {
  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: options.model || 'sonar-deep-research',
      messages: [
        {
          role: 'system',
          content: 'You are a research assistant for Shepherd Insight. Provide detailed, cited research.'
        },
        {
          role: 'user',
          content: options.query
        }
      ],
      search_domain_filter: options.searchDomainFilter,
      search_recency_filter: options.searchRecency,
      search_academic: options.searchAcademic,
      reasoning_effort: options.reasoningEffort || 'medium',
      return_citations: true,
      stream: true,  // For real-time updates
    }),
  })

  // Stream reasoning steps to user
  return parsePerplexityStream(response)
}

// Example: Competitor Research
export async function researchCompetitors(urls: string[]) {
  return await researchWithPerplexity({
    query: `Analyze these competitors: ${urls.join(', ')}
    
    For each:
    1. Core value proposition
    2. Target audience
    3. Key features
    4. Pricing model
    5. Weaknesses/gaps
    
    Then synthesize competitive gaps and opportunities.`,
    model: 'sonar-pro',
    searchDomainFilter: urls,
    reasoningEffort: 'high'
  })
}
```

---

### Phase 3: Update Muse Research Flow

```typescript
// src/app/api/engine/research/route.ts

export async function POST(request: Request) {
  const { claritySessionId, competitorUrls, quickMode } = await request.json()
  
  // Load clarity data
  const clarity = await getClaritySession(claritySessionId)
  
  // DECISION POINT: Route to appropriate AI
  if (quickMode) {
    // Quick mode = Groq (fast, AI knowledge only)
    return await orchestrate('quick-research', buildResearchPrompt(clarity), {
      timeout: 15000
    })
  } else {
    // Full research = Perplexity (deep web research)
    const perplexityResults = await researchWithPerplexity({
      query: buildResearchPrompt(clarity),
      model: 'sonar-deep-research',
      searchDomainFilter: competitorUrls.length > 0 ? competitorUrls : undefined,
      searchRecency: 'month',
      reasoningEffort: 'high'
    })
    
    // Claude synthesizes Perplexity results into personas
    return await orchestrate('synthesis', buildPersonaSynthesisPrompt(perplexityResults))
  }
}
```

---

### Phase 4: Update Blueprint with Claude-First

```typescript
// src/app/api/engine/blueprint/route.ts

export async function POST(request: Request) {
  const { claritySessionId, researchSessionId } = await request.json()
  
  // Load journey data
  const clarity = await getClaritySession(claritySessionId)
  const research = await getResearchSession(researchSessionId)
  
  // Claude is PERFECT for blueprint planning
  const blueprint = await orchestrate('planning', `
    Based on this validated research:
    
    Problem: ${clarity.problemStatement}
    Target User: ${clarity.targetUser}
    
    User Personas:
    ${JSON.stringify(research.personas, null, 2)}
    
    Pain Map:
    ${JSON.stringify(research.painMap, null, 2)}
    
    Create an MVP Blueprint with:
    1. Prioritized features (use RICE scoring)
    2. User stories for each feature
    3. 3-sprint roadmap
    4. Technical architecture recommendations
    5. Success metrics
    6. Risk mitigation
    7. Launch checklist
    
    Be opinionated. This needs to be ready to hand to an AI coding assistant.
  `, {
    primary: 'claude',
    timeout: 45000
  })
  
  return blueprint
}
```

---

## 📊 Cost & Performance Comparison

| Task | AI | Latency | Cost/1K req | Best Use |
|------|----|---------|-----------| ---------|
| Deep Competitor Research | Perplexity Sonar Deep Research | 20-60s | $15-25 | High-value, cited research |
| Quick Persona Synthesis | Groq Llama 3.3 | 2-5s | $0.50 | Speed-critical, no web needed |
| Blueprint Planning | Claude Sonnet 4 | 10-30s | $3-8 | Strategic, long-form planning |
| Fallback | Groq | 2-5s | $0.50 | Any failure scenario |

**Estimated Cost per Complete Journey:**
- Compass (Clarity): Claude → ~$0.10
- Muse (Research): Perplexity Deep → ~$0.50  
- Blueprint: Claude → ~$0.30
- **Total: ~$0.90 per user journey** (vs. $0.20 with Groq-only)

**ROI:** 4x cost increase → 10x better research quality + citations + web-current data

---

## 🚀 Rollout Plan

### Week 1: Foundation
- ✅ Dev server running (DONE)
- ✅ All fixes deployed (DONE)
- ⏭️ Add Perplexity client
- ⏭️ Add orchestrator layer
- ⏭️ Update `.env.example` with PERPLEXITY_API_KEY

### Week 2: Muse Enhancement
- ⏭️ Wire Muse to Perplexity (full mode)
- ⏭️ Keep Groq for quick mode
- ⏭️ Add "Research powered by Perplexity" badge
- ⏭️ Show citations in UI

### Week 3: Blueprint Enhancement
- ⏭️ Ensure Claude handles all blueprint generation
- ⏭️ Add Groq fallback
- ⏭️ Test full journey end-to-end

### Week 4: Polish & Monitor
- ⏭️ Add cost tracking per journey
- ⏭️ Monitor fallback rates
- ⏭️ A/B test research quality

---

## 🎨 UX Enhancements

### Research Progress UI (Muse Page)

```tsx
{isResearching && !quickMode && (
  <div className="p-6 bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl">
    <div className="flex items-center gap-3 mb-4">
      <Sparkles className="w-6 h-6 text-purple-600 animate-pulse" />
      <h3 className="text-lg font-bold text-purple-900">
        Deep Research in Progress...
      </h3>
    </div>
    
    <div className="space-y-2 text-sm text-purple-700">
      {reasoningSteps.map((step, i) => (
        <div key={i} className="flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p>{step.thought}</p>
        </div>
      ))}
    </div>
    
    <p className="text-xs text-purple-600 mt-4">
      Powered by Perplexity Sonar • Real-time web research
    </p>
  </div>
)}
```

---

## 🔒 Environment Setup

```bash
# .env.local
PERPLEXITY_API_KEY=pplx-xxxxx
ANTHROPIC_API_KEY=sk-ant-xxxxx  # Already have
GROQ_API_KEY=gsk_xxxxx         # Already have
```

---

## ✅ Success Metrics

1. **Research Quality**: User retention after Muse → Blueprint
2. **Citation Trust**: Users clicking "View Sources"
3. **Fallback Rate**: < 5% of requests hit fallback
4. **Cost per Journey**: Target $1.00 or less
5. **Time to Complete Journey**: < 5 minutes

---

**Next Steps:** Ready to implement Perplexity integration?
