/**
 * Shepherd Engine - Persona Synthesizer
 * 
 * Takes clarity output + research data and synthesizes deep user understanding.
 * Powers the Muse tool.
 * 
 * Customer Transformation: "I have clarity" → "I understand my users deeply"
 */

import { jsonCompletion, completionWithFallback, type ChatMessage } from './groq-client'
import type { ClarityOutput, ResearchOutput } from './types'
import { FirecrawlClient } from '@/lib/research/firecrawl-client'

const PERSONA_SYSTEM_PROMPT = `You are the ShepLight Empathy Engine — a UX-research AI that synthesizes raw data into deep human understanding.

## Your Philosophy (Golden Sheep AI + Steve Jobs)
"You've got to start with the customer experience and work backwards."

You don't create demographics. You create HUMANS.
You don't list features. You uncover FRUSTRATIONS.
You don't assume. You SYNTHESIZE from evidence.

## Your Expertise
You think like a senior UX researcher who has:
- Conducted 500+ user interviews across industries
- Built personas that product teams actually use
- Mapped emotional journeys that reveal real opportunities
- Identified pain points competitors miss

## Your Rules (Zero-Placeholder Policy)
1. Personas are SPECIFIC people, not stereotypes
   - ❌ "Tech-savvy millennial who values convenience"
   - ✅ "Marcus, a 28-year-old freelance designer juggling 4 clients with no invoicing system"

2. Pain points are FELT, not theoretical
   - ❌ "Users find it difficult to manage tasks"
   - ✅ "Every Monday morning, they panic realizing they forgot a client deadline over the weekend"

3. Insights are ACTIONABLE, not obvious
   - ❌ "Users want a simple solution"
   - ✅ "Users abandon tools after 3 days if they require manual data entry"

4. Quotes sound REAL, not corporate
   - ❌ "I need a comprehensive solution for my workflow"
   - ✅ "I literally have 47 browser tabs open and I still can't find that client's email"

## Your Output Standards
Every persona must feel like someone you could call on the phone.
Every pain point must make the founder say "I've felt that too."
Every insight must suggest a clear product decision.

Always respond in valid JSON format matching the requested schema.`

const PERSONA_USER_PROMPT = (clarity: ClarityOutput, research: string) => `
Based on this clarity and research, synthesize deep user understanding:

## Clarity (from Compass)
- Problem: ${clarity.problemStatement}
- Target User: ${clarity.targetUser}
- Jobs to Be Done: ${clarity.jobsToBeDone.join(', ')}
- Opportunity: ${clarity.opportunityGap}

## Research Data
${research}

---

Synthesize this into user understanding with this exact JSON structure:
{
  "personas": [
    {
      "name": "A realistic first name that represents this persona type",
      "role": "Their role or life situation (e.g., 'Busy Single Mom', 'First-time Founder')",
      "goals": ["What they're trying to achieve (goal 1)", "Goal 2", "Goal 3"],
      "frustrations": ["What blocks them (frustration 1)", "Frustration 2", "Frustration 3"],
      "quote": "A realistic quote this persona might say about their situation"
    }
  ],
  "painMap": [
    {
      "description": "Specific pain point they experience",
      "frequency": "daily|weekly|monthly|rarely",
      "intensity": "critical|high|medium|low",
      "currentSolution": "What they currently do to address this (even if inadequate)"
    }
  ],
  "emotionalJourney": [
    {
      "stage": "Stage name (e.g., 'Awareness', 'Consideration', 'Decision')",
      "emotion": "Primary emotion at this stage",
      "thought": "What they're thinking at this stage"
    }
  ],
  "insights": [
    "Key insight about the users that should inform product decisions",
    "Another key insight",
    "Third key insight"
  ],
  "competitorGaps": [
    {
      "competitor": "Name of existing solution or workaround",
      "weakness": "Where it fails the user",
      "opportunity": "How you can do better"
    }
  ]
}

Create 2-3 distinct personas, 4-6 pain points, 3-5 emotional journey stages, 3-5 insights, and 2-4 competitor gaps.
Be specific, empathetic, and actionable. The founder should walk away feeling like they truly know their users.
`

export interface ResearchInput {
  claritySessionId: string
  clarity: ClarityOutput
  competitorUrls?: string[]
  additionalContext?: string
}

/**
 * Research and synthesize user understanding
 * This is the core function that powers Shepherd Muse
 */
export async function synthesizeResearch(input: ResearchInput): Promise<ResearchOutput> {
  // Step 1: Gather research data using Firecrawl
  const researchData = await gatherResearch(input)
  
  // Step 2: Synthesize into personas and insights using Groq
  const messages: ChatMessage[] = [
    { role: 'system', content: PERSONA_SYSTEM_PROMPT },
    { role: 'user', content: PERSONA_USER_PROMPT(input.clarity, researchData) },
  ]

  try {
    const result = await jsonCompletion<ResearchOutput>(messages, {
      model: 'llama-3.3-70b-versatile',
      temperature: 0.5, // More creative for persona generation
      maxTokens: 4096,
    })

    // Validate the response structure
    validateResearchOutput(result)
    
    return result
  } catch (error) {
    console.warn('Primary model failed, attempting fallback:', error)
    
    const result = await completionWithFallback<ResearchOutput>(
      messages,
      { temperature: 0.5, maxTokens: 4096 },
      true
    )

    if (typeof result === 'string') {
      throw new Error('Fallback returned string instead of JSON')
    }

    validateResearchOutput(result)
    return result
  }
}

/**
 * Gather research data from web sources
 */
async function gatherResearch(input: ResearchInput): Promise<string> {
  const firecrawl = new FirecrawlClient()
  const researchParts: string[] = []

  try {
    // Search for information about the target user
    const userSearchQuery = `${input.clarity.targetUser} pain points frustrations needs`
    const userSearch = await firecrawl.search(userSearchQuery, { limit: 3 })
    
    if (userSearch.data && userSearch.data.length > 0) {
      researchParts.push('## User Research')
      userSearch.data.forEach((item, i) => {
        researchParts.push(`${i + 1}. ${item.title || ''}: ${item.description || item.snippet || ''}`)
      })
    }
  } catch (error) {
    console.warn('User search failed:', error)
    researchParts.push('## User Research\nNo external user research available.')
  }

  try {
    // Search for competitors and existing solutions
    const competitorQuery = `${input.clarity.problemStatement} solutions apps tools`
    const competitorSearch = await firecrawl.search(competitorQuery, { limit: 3 })
    
    if (competitorSearch.data && competitorSearch.data.length > 0) {
      researchParts.push('\n## Competitor Research')
      competitorSearch.data.forEach((item, i) => {
        researchParts.push(`${i + 1}. ${item.title || ''}: ${item.description || item.snippet || ''}`)
      })
    }
  } catch (error) {
    console.warn('Competitor search failed:', error)
    researchParts.push('\n## Competitor Research\nNo external competitor research available.')
  }

  // Scrape provided competitor URLs if any
  if (input.competitorUrls && input.competitorUrls.length > 0) {
    researchParts.push('\n## Direct Competitor Analysis')
    
    for (const url of input.competitorUrls.slice(0, 3)) { // Limit to 3 URLs
      try {
        const scrapeResult = await firecrawl.scrapeUrl(url, { formats: ['markdown'], onlyMainContent: true })
        if (scrapeResult.data?.markdown) {
          // Take first 1000 chars to avoid token overload
          const content = scrapeResult.data.markdown.slice(0, 1000)
          researchParts.push(`\n### ${url}\n${content}...`)
        }
      } catch (error) {
        console.warn(`Failed to scrape ${url}:`, error)
      }
    }
  }

  // Add any additional context
  if (input.additionalContext) {
    researchParts.push(`\n## Additional Context\n${input.additionalContext}`)
  }

  // If no research was gathered, provide a fallback
  if (researchParts.length === 0) {
    return 'No external research available. Synthesize personas based on the clarity output alone, using your knowledge of similar markets and user types.'
  }

  return researchParts.join('\n')
}

/**
 * Validate research output structure
 */
function validateResearchOutput(output: ResearchOutput): void {
  if (!Array.isArray(output.personas) || output.personas.length < 1) {
    throw new Error('Invalid personas: must have at least 1 persona')
  }
  if (!Array.isArray(output.painMap) || output.painMap.length < 1) {
    throw new Error('Invalid painMap: must have at least 1 pain point')
  }
  if (!Array.isArray(output.emotionalJourney) || output.emotionalJourney.length < 1) {
    throw new Error('Invalid emotionalJourney: must have at least 1 stage')
  }
  if (!Array.isArray(output.insights) || output.insights.length < 1) {
    throw new Error('Invalid insights: must have at least 1 insight')
  }
  
  // Validate persona structure
  output.personas.forEach((persona, i) => {
    if (!persona.name || !persona.role || !persona.quote) {
      throw new Error(`Invalid persona ${i}: missing required fields`)
    }
  })
}

/**
 * Quick research without Firecrawl (uses AI knowledge only)
 * Useful for fast iteration or when research credits are limited
 */
export async function synthesizeQuickResearch(clarity: ClarityOutput): Promise<ResearchOutput> {
  const messages: ChatMessage[] = [
    { role: 'system', content: PERSONA_SYSTEM_PROMPT },
    { 
      role: 'user', 
      content: PERSONA_USER_PROMPT(
        clarity, 
        'No external research available. Use your knowledge of similar markets, user types, and common patterns to synthesize realistic personas and insights.'
      ) 
    },
  ]

  const result = await jsonCompletion<ResearchOutput>(messages, {
    model: 'llama-3.3-70b-versatile',
    temperature: 0.5,
    maxTokens: 4096,
  })

  validateResearchOutput(result)
  return result
}
