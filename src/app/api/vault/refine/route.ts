/**
 * API Route: /api/vault/refine
 * 
 * Refines a decision using AI based on user feedback
 */

import { NextRequest, NextResponse } from 'next/server'
import { orchestrate } from '@/lib/engine'

/**
 * Strip markdown code blocks from AI response
 */
function stripMarkdownCodeBlocks(content: string): string {
  let cleaned = content.trim()
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7)
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3)
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3)
  }
  return cleaned.trim()
}

interface RefineRequest {
  decisionType: string
  originalContent: any
  userRequest: string
}

interface RefineResponse {
  success: boolean
  data?: {
    refinedContent: any
    aiProvider: string
  }
  error?: string
}

const REFINEMENT_PROMPTS = {
  persona: (original: any, request: string) => `
You are refining a user persona based on feedback.

Original Persona:
- Name: ${original.name}
- Role: ${original.role}
- Goals: ${original.goals?.join(', ')}
- Frustrations: ${original.frustrations?.join(', ')}
- Quote: "${original.quote}"

User Feedback: "${request}"

Refine this persona to address the feedback while keeping it specific, realistic, and actionable.

Return ONLY valid JSON with this exact structure:
{
  "name": "refined name",
  "role": "refined role description",
  "goals": ["goal 1", "goal 2", "goal 3"],
  "frustrations": ["frustration 1", "frustration 2", "frustration 3"],
  "quote": "A realistic quote this persona would say"
}`,

  feature: (original: any, request: string) => `
You are refining an MVP feature based on feedback.

Original Feature:
- Name: ${original.name}
- Description: ${original.description}
- Priority: ${original.priority}

User Feedback: "${request}"

Refine this feature to address the feedback while keeping it focused, valuable, and realistic for an MVP.

Return ONLY valid JSON with this exact structure:
{
  "name": "refined feature name",
  "description": "refined feature description",
  "priority": "must-have|should-have|nice-to-have",
  "effort": "small|medium|large",
  "painPointsAddressed": ["pain point 1", "pain point 2"],
  "userStories": [
    {
      "asA": "user type",
      "iWant": "what they want",
      "soThat": "the benefit"
    }
  ]
}`,

  painPoint: (original: any, request: string) => `
You are refining a user pain point based on feedback.

Original Pain Point:
- Description: ${original.description}
- Frequency: ${original.frequency}
- Intensity: ${original.intensity}
- Current Solution: ${original.currentSolution}

User Feedback: "${request}"

Refine this pain point to address the feedback while keeping it specific, felt, and actionable.

Return ONLY valid JSON with this exact structure:
{
  "description": "specific pain point description",
  "frequency": "daily|weekly|monthly|rarely",
  "intensity": "critical|high|medium|low",
  "currentSolution": "what they currently do to address this"
}`,

  insight: (original: any, request: string) => `
You are refining a product insight based on feedback.

Original Insight: "${original.text}"

User Feedback: "${request}"

Refine this insight to address the feedback while keeping it actionable and product-focused.

Return ONLY valid JSON with this exact structure:
{
  "text": "refined actionable insight"
}`,

  competitorGap: (original: any, request: string) => `
You are refining a competitor gap analysis based on feedback.

Original Gap:
- Competitor: ${original.competitor}
- Weakness: ${original.weakness}
- Opportunity: ${original.opportunity}

User Feedback: "${request}"

Refine this gap analysis to address the feedback while keeping it specific and actionable.

Return ONLY valid JSON with this exact structure:
{
  "competitor": "competitor name or category",
  "weakness": "where they fail the user",
  "opportunity": "how you can do better"
}`
}

export async function POST(request: NextRequest): Promise<NextResponse<RefineResponse>> {
  try {
    const body: RefineRequest = await request.json()
    
    if (!body.decisionType || !body.originalContent || !body.userRequest) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get the appropriate prompt for this decision type
    const promptGenerator = REFINEMENT_PROMPTS[body.decisionType as keyof typeof REFINEMENT_PROMPTS]
    
    if (!promptGenerator) {
      return NextResponse.json(
        { success: false, error: `Unknown decision type: ${body.decisionType}` },
        { status: 400 }
      )
    }

    const prompt = promptGenerator(body.originalContent, body.userRequest)

    // Use orchestrator to refine with Claude (best for synthesis)
    const result = await orchestrate('synthesis', prompt, {
      systemPrompt: 'You are a product strategy expert helping founders refine their decisions. Always return valid JSON matching the requested structure.',
      temperature: 0.7,
      maxTokens: 2048
    })

    // Parse the JSON response (strip markdown code blocks if present)
    const cleanedContent = stripMarkdownCodeBlocks(result.content)
    const refinedContent = JSON.parse(cleanedContent)

    return NextResponse.json({
      success: true,
      data: {
        refinedContent,
        aiProvider: result.provider
      }
    })

  } catch (error) {
    console.error('Decision refinement error:', error)
    
    const message = error instanceof Error ? error.message : 'Unknown error'
    
    return NextResponse.json(
      { success: false, error: `Refinement failed: ${message}` },
      { status: 500 }
    )
  }
}
