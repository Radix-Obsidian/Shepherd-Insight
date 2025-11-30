/**
 * Shepherd Engine - Blueprint Composer
 * 
 * Takes clarity + research and generates actionable MVP blueprint.
 * Powers the Blueprint tool.
 * 
 * Customer Transformation: "I understand my users" → "I know exactly what to build first"
 */

import { jsonCompletion, completionWithFallback, type ChatMessage } from './groq-client'
import type { ClarityOutput, ResearchOutput, BlueprintOutput } from './types'

const BLUEPRINT_SYSTEM_PROMPT = `You are the Shepherd Insight Blueprint Composer, an expert product strategist who transforms user understanding into actionable build plans.

Your role is to take clarity about an idea and deep user research, then generate a focused MVP blueprint that a solo founder can actually build.

You think like a seasoned product manager who has shipped dozens of successful MVPs. You know that less is more, and you ruthlessly prioritize.

Key principles:
1. MVP means MINIMUM - only features that prove the core value hypothesis
2. Prioritize by impact on pain points, not by what's cool or easy
3. User stories must be specific and testable
4. Roadmap must be realistic for a solo founder (2-4 weeks to MVP)

Always respond in valid JSON format matching the requested schema.`

const BLUEPRINT_USER_PROMPT = (clarity: ClarityOutput, research: ResearchOutput) => `
Based on this clarity and user research, create an actionable MVP blueprint:

## Clarity (from Compass)
- Problem: ${clarity.problemStatement}
- Target User: ${clarity.targetUser}
- Jobs to Be Done: ${clarity.jobsToBeDone.join(', ')}
- Opportunity: ${clarity.opportunityGap}
- Value Hypotheses: ${clarity.valueHypotheses.join('; ')}

## User Research (from Muse)
### Personas
${research.personas.map(p => `- ${p.name} (${p.role}): Goals: ${p.goals.join(', ')}. Frustrations: ${p.frustrations.join(', ')}`).join('\n')}

### Pain Points (by intensity)
${research.painMap.map(p => `- [${p.intensity}] ${p.description} (Currently: ${p.currentSolution})`).join('\n')}

### Key Insights
${research.insights.map(i => `- ${i}`).join('\n')}

### Competitor Gaps
${research.competitorGaps?.map(g => `- ${g.competitor}: ${g.weakness} → Opportunity: ${g.opportunity}`).join('\n') || 'None identified'}

---

Create an MVP blueprint with this exact JSON structure:
{
  "productVision": "One sentence that captures what this product will become",
  "mvpScope": "Clear description of what the MVP will and won't do (2-3 sentences)",
  "coreValue": "The ONE thing users must experience to validate the idea",
  
  "features": [
    {
      "name": "Feature name",
      "description": "What it does",
      "priority": "must-have|should-have|nice-to-have",
      "effort": "small|medium|large",
      "painPointsAddressed": ["Pain point 1", "Pain point 2"],
      "userStories": [
        {
          "asA": "User type",
          "iWant": "What they want to do",
          "soThat": "The benefit they get"
        }
      ]
    }
  ],
  
  "roadmap": [
    {
      "week": 1,
      "theme": "Theme for this week",
      "goals": ["Goal 1", "Goal 2"],
      "deliverables": ["What will be done"]
    }
  ],
  
  "successMetrics": [
    {
      "metric": "What to measure",
      "target": "Target value",
      "why": "Why this matters"
    }
  ],
  
  "risks": [
    {
      "risk": "What could go wrong",
      "mitigation": "How to address it"
    }
  ],
  
  "launchChecklist": [
    "Action item 1",
    "Action item 2",
    "Action item 3"
  ]
}

Requirements:
- 3-5 features max for MVP (be ruthless!)
- 2-4 week roadmap (realistic for solo founder)
- 2-3 must-have features, rest are should-have or nice-to-have
- User stories must be specific and testable
- Success metrics must be measurable

The founder should walk away knowing EXACTLY what to build and in what order.
`

export interface BlueprintInput {
  claritySessionId: string
  researchSessionId: string
  clarity: ClarityOutput
  research: ResearchOutput
}

/**
 * Generate MVP blueprint from clarity and research
 * This is the core function that powers Shepherd Blueprint
 */
export async function generateBlueprint(input: BlueprintInput): Promise<BlueprintOutput> {
  const messages: ChatMessage[] = [
    { role: 'system', content: BLUEPRINT_SYSTEM_PROMPT },
    { role: 'user', content: BLUEPRINT_USER_PROMPT(input.clarity, input.research) },
  ]

  try {
    const result = await jsonCompletion<BlueprintOutput>(messages, {
      model: 'llama-3.3-70b-versatile',
      temperature: 0.4, // Slightly lower for more focused output
      maxTokens: 4096,
    })

    // Validate the response structure
    validateBlueprintOutput(result)
    
    return result
  } catch (error) {
    console.warn('Primary model failed, attempting fallback:', error)
    
    const result = await completionWithFallback<BlueprintOutput>(
      messages,
      { temperature: 0.4, maxTokens: 4096 },
      true
    )

    if (typeof result === 'string') {
      throw new Error('Fallback returned string instead of JSON')
    }

    validateBlueprintOutput(result)
    return result
  }
}

/**
 * Validate blueprint output structure
 */
function validateBlueprintOutput(output: BlueprintOutput): void {
  if (!output.productVision || typeof output.productVision !== 'string') {
    throw new Error('Invalid productVision: must be a non-empty string')
  }
  if (!output.mvpScope || typeof output.mvpScope !== 'string') {
    throw new Error('Invalid mvpScope: must be a non-empty string')
  }
  if (!output.coreValue || typeof output.coreValue !== 'string') {
    throw new Error('Invalid coreValue: must be a non-empty string')
  }
  if (!Array.isArray(output.features) || output.features.length < 1) {
    throw new Error('Invalid features: must have at least 1 feature')
  }
  if (!Array.isArray(output.roadmap) || output.roadmap.length < 1) {
    throw new Error('Invalid roadmap: must have at least 1 week')
  }
  
  // Validate feature structure
  output.features.forEach((feature, i) => {
    if (!feature.name || !feature.description || !feature.priority) {
      throw new Error(`Invalid feature ${i}: missing required fields`)
    }
    if (!['must-have', 'should-have', 'nice-to-have'].includes(feature.priority)) {
      throw new Error(`Invalid feature ${i}: priority must be must-have, should-have, or nice-to-have`)
    }
  })

  // Validate roadmap structure
  output.roadmap.forEach((week, i) => {
    if (typeof week.week !== 'number' || !week.theme || !Array.isArray(week.goals)) {
      throw new Error(`Invalid roadmap week ${i}: missing required fields`)
    }
  })
}

/**
 * Quick blueprint without full validation (for iteration)
 */
export async function generateQuickBlueprint(
  clarity: ClarityOutput, 
  research: ResearchOutput
): Promise<BlueprintOutput> {
  return generateBlueprint({
    claritySessionId: '',
    researchSessionId: '',
    clarity,
    research,
  })
}
