/**
 * Shepherd Engine - Insight Reasoner
 * 
 * Takes raw ideas and transforms them into clarity.
 * Powers the Compass tool.
 * 
 * Customer Transformation: "I don't know where to start" → "I have clarity"
 */

import { jsonCompletion, completionWithFallback, type ChatMessage } from './groq-client'
import type { ClarityInput, ClarityOutput } from './types'

const CLARITY_SYSTEM_PROMPT = `You are the ShepLight Clarity Engine — a UX-research-powered AI that transforms messy ideas into crystal-clear product direction.

## Your Philosophy (Golden Sheep AI + Steve Jobs)
"Start with the customer experience. Work backwards to technology."

Before analyzing ANY idea, you think:
- Who is the HUMAN we're serving?
- What TRANSFORMATION do they need?
- What does the ideal experience FEEL like?

## Your Approach
You analyze ideas like a senior UX researcher who has:
- Conducted 500+ user interviews
- Built personas for startups and Fortune 500s
- Never shipped a feature without user validation

## Your Rules (Zero-Placeholder Policy)
1. NO generic insights ("Users want it to be easier")
2. NO vague personas ("Tech-savvy millennials")
3. NO assumed behaviors — only synthesize what the input supports
4. EVERY output must be specific enough to act on TODAY

## Your Output Standards
- Problem statements must be ONE sentence, crystal clear
- Target users must be SPECIFIC humans, not demographics
- Jobs-to-be-done must be ACTIONS, not features
- Next steps must be EXECUTABLE within 48 hours

Always respond in valid JSON format matching the requested schema.`

const CLARITY_USER_PROMPT = (input: ClarityInput) => `
Analyze this idea and provide clarity:

## The Idea
${input.idea}

${input.targetUser ? `## Target User (provided by founder)\n${input.targetUser}` : ''}

${input.additionalContext ? `## Additional Context\n${input.additionalContext}` : ''}

---

Provide your analysis in this exact JSON structure:
{
  "problemStatement": "A clear, one-sentence problem statement that captures the core issue this idea solves",
  "targetUser": "A specific description of who experiences this problem most acutely (be specific, not generic)",
  "jobsToBeDone": [
    "What the user is trying to accomplish (job 1)",
    "What the user is trying to accomplish (job 2)",
    "What the user is trying to accomplish (job 3)"
  ],
  "opportunityGap": "What's missing in the current market that creates an opportunity for this idea",
  "valueHypotheses": [
    "If we build X, users will get Y benefit",
    "If we build X, users will get Y benefit",
    "If we build X, users will get Y benefit"
  ],
  "nextSteps": [
    "Immediate action the founder should take",
    "Second action to validate the idea",
    "Third action to move forward"
  ]
}

Be specific, actionable, and insightful. Avoid generic platitudes. The founder should walk away feeling like they finally understand their own idea.
`

/**
 * Generate clarity from a raw idea
 * This is the core function that powers Shepherd Compass
 */
export async function generateClarity(input: ClarityInput): Promise<ClarityOutput> {
  const messages: ChatMessage[] = [
    { role: 'system', content: CLARITY_SYSTEM_PROMPT },
    { role: 'user', content: CLARITY_USER_PROMPT(input) },
  ]

  try {
    // Use the primary model with JSON mode
    const result = await jsonCompletion<ClarityOutput>(messages, {
      model: 'llama-3.3-70b-versatile',
      temperature: 0.4, // Slightly creative but mostly consistent
      maxTokens: 2048,
    })

    // Validate the response structure
    validateClarityOutput(result)
    
    return result
  } catch (error) {
    // If primary fails, try with fallback models
    console.warn('Primary model failed, attempting fallback:', error)
    
    const result = await completionWithFallback<ClarityOutput>(
      messages,
      { temperature: 0.4, maxTokens: 2048 },
      true // parseAsJson
    )

    if (typeof result === 'string') {
      throw new Error('Fallback returned string instead of JSON')
    }

    validateClarityOutput(result)
    return result
  }
}

/**
 * Validate clarity output structure
 * Ensures we have real data, not placeholders
 */
function validateClarityOutput(output: ClarityOutput): void {
  if (!output.problemStatement || output.problemStatement.length < 20) {
    throw new Error('Invalid problemStatement: must be a meaningful statement')
  }
  if (!output.targetUser || output.targetUser.length < 10) {
    throw new Error('Invalid targetUser: must be specific')
  }
  if (!Array.isArray(output.jobsToBeDone) || output.jobsToBeDone.length < 1) {
    throw new Error('Invalid jobsToBeDone: must have at least 1 job')
  }
  if (!output.opportunityGap || output.opportunityGap.length < 20) {
    throw new Error('Invalid opportunityGap: must explain the market gap')
  }
  if (!Array.isArray(output.valueHypotheses) || output.valueHypotheses.length < 1) {
    throw new Error('Invalid valueHypotheses: must have at least 1 hypothesis')
  }
  if (!Array.isArray(output.nextSteps) || output.nextSteps.length < 1) {
    throw new Error('Invalid nextSteps: must have at least 1 next step')
  }
}

/**
 * Refine clarity based on founder feedback
 * Used when founder provides additional context after initial clarity
 */
export async function refineClarity(
  previousOutput: ClarityOutput,
  feedback: string
): Promise<ClarityOutput> {
  const messages: ChatMessage[] = [
    { role: 'system', content: CLARITY_SYSTEM_PROMPT },
    { 
      role: 'user', 
      content: `
Previous clarity analysis:
${JSON.stringify(previousOutput, null, 2)}

Founder feedback:
${feedback}

Please refine the clarity analysis based on this feedback. Maintain the same JSON structure but update the insights to better reflect the founder's vision.
`
    },
  ]

  const result = await jsonCompletion<ClarityOutput>(messages, {
    model: 'llama-3.3-70b-versatile',
    temperature: 0.3,
    maxTokens: 2048,
  })

  validateClarityOutput(result)
  return result
}
