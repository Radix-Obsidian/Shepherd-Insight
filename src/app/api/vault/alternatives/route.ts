/**
 * API Route: /api/vault/alternatives
 * 
 * Generates alternative decisions using AI
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

interface AlternativesRequest {
  decisionType: string
  currentContent: any
  alternativeType?: 'different_demographic' | 'different_use_case' | 'more_specific' | 'broader'
  context?: {
    problemStatement?: string
    targetUser?: string
  }
}

interface AlternativesResponse {
  success: boolean
  data?: {
    alternatives: any[]
    aiProvider: string
  }
  error?: string
}

const ALTERNATIVES_PROMPTS = {
  persona: (current: any, altType: string, context: any) => `
You are generating alternative user personas for a product.

Current Persona:
- Name: ${current.name}
- Role: ${current.role}
- Goals: ${current.goals?.join(', ')}
- Frustrations: ${current.frustrations?.join(', ')}

Problem Space: ${context.problemStatement || 'Not specified'}
Target User: ${context.targetUser || 'Not specified'}

Alternative Type: ${altType}

Generate 3 alternative personas that:
- Are distinct from the current one
- Face similar problems but from different angles
- Would benefit from the same solution
- Represent real, specific people (not stereotypes)

Return ONLY valid JSON array with this exact structure:
[
  {
    "name": "First name only",
    "role": "Their role/life situation",
    "goals": ["goal 1", "goal 2", "goal 3"],
    "frustrations": ["frustration 1", "frustration 2", "frustration 3"],
    "quote": "A realistic quote"
  },
  {
    "name": "First name only",
    "role": "Their role/life situation",
    "goals": ["goal 1", "goal 2", "goal 3"],
    "frustrations": ["frustration 1", "frustration 2", "frustration 3"],
    "quote": "A realistic quote"
  },
  {
    "name": "First name only",
    "role": "Their role/life situation",
    "goals": ["goal 1", "goal 2", "goal 3"],
    "frustrations": ["frustration 1", "frustration 2", "frustration 3"],
    "quote": "A realistic quote"
  }
]`,

  feature: (current: any, altType: string, context: any) => `
You are generating alternative MVP features for a product.

Current Feature:
- Name: ${current.name}
- Description: ${current.description}
- Priority: ${current.priority}

Problem Space: ${context.problemStatement || 'Not specified'}

Alternative Type: ${altType}

Generate 3 alternative features that:
- Solve similar user problems
- Are realistic for an MVP
- Offer different approaches or angles
- Stay focused and achievable

Return ONLY valid JSON array with this exact structure:
[
  {
    "name": "Feature name",
    "description": "Clear feature description",
    "priority": "must-have|should-have|nice-to-have",
    "effort": "small|medium|large",
    "painPointsAddressed": ["pain 1", "pain 2"],
    "userStories": [
      {
        "asA": "user type",
        "iWant": "what they want",
        "soThat": "the benefit"
      }
    ]
  },
  {
    "name": "Feature name",
    "description": "Clear feature description",
    "priority": "must-have|should-have|nice-to-have",
    "effort": "small|medium|large",
    "painPointsAddressed": ["pain 1", "pain 2"],
    "userStories": [
      {
        "asA": "user type",
        "iWant": "what they want",
        "soThat": "the benefit"
      }
    ]
  },
  {
    "name": "Feature name",
    "description": "Clear feature description",
    "priority": "must-have|should-have|nice-to-have",
    "effort": "small|medium|large",
    "painPointsAddressed": ["pain 1", "pain 2"],
    "userStories": [
      {
        "asA": "user type",
        "iWant": "what they want",
        "soThat": "the benefit"
      }
    ]
  }
]`,

  painPoint: (current: any, altType: string, context: any) => `
You are generating alternative pain points for a product.

Current Pain Point:
- Description: ${current.description}
- Frequency: ${current.frequency}
- Intensity: ${current.intensity}

Problem Space: ${context.problemStatement || 'Not specified'}
Target User: ${context.targetUser || 'Not specified'}

Alternative Type: ${altType}

Generate 3 alternative pain points that:
- Affect the same target user
- Are related to the problem space
- Offer different angles or aspects
- Are specific and felt (not generic)

Return ONLY valid JSON array with this exact structure:
[
  {
    "description": "Specific pain point",
    "frequency": "daily|weekly|monthly|rarely",
    "intensity": "critical|high|medium|low",
    "currentSolution": "What they currently do"
  },
  {
    "description": "Specific pain point",
    "frequency": "daily|weekly|monthly|rarely",
    "intensity": "critical|high|medium|low",
    "currentSolution": "What they currently do"
  },
  {
    "description": "Specific pain point",
    "frequency": "daily|weekly|monthly|rarely",
    "intensity": "critical|high|medium|low",
    "currentSolution": "What they currently do"
  }
]`,

  insight: (current: any, altType: string, context: any) => `
You are generating alternative product insights.

Current Insight: "${current.text}"

Problem Space: ${context.problemStatement || 'Not specified'}

Alternative Type: ${altType}

Generate 3 alternative insights that:
- Are actionable for product decisions
- Offer different perspectives
- Are specific and valuable
- Guide MVP development

Return ONLY valid JSON array with this exact structure:
[
  { "text": "Actionable insight 1" },
  { "text": "Actionable insight 2" },
  { "text": "Actionable insight 3" }
]`
}

export async function POST(request: NextRequest): Promise<NextResponse<AlternativesResponse>> {
  try {
    const body: AlternativesRequest = await request.json()
    
    if (!body.decisionType || !body.currentContent) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get the appropriate prompt for this decision type
    const promptGenerator = ALTERNATIVES_PROMPTS[body.decisionType as keyof typeof ALTERNATIVES_PROMPTS]
    
    if (!promptGenerator) {
      return NextResponse.json(
        { success: false, error: `Unknown decision type: ${body.decisionType}` },
        { status: 400 }
      )
    }

    const altType = body.alternativeType || 'different_use_case'
    const prompt = promptGenerator(body.currentContent, altType, body.context || {})

    // Use orchestrator to generate alternatives with Claude
    const result = await orchestrate('synthesis', prompt, {
      systemPrompt: 'You are a product strategy expert generating diverse alternatives to help founders explore options. Always return valid JSON arrays.',
      temperature: 0.9,  // Higher temperature for more creative alternatives
      maxTokens: 3072
    })

    // Parse the JSON response (strip markdown code blocks if present)
    const cleanedContent = stripMarkdownCodeBlocks(result.content)
    const alternatives = JSON.parse(cleanedContent)

    if (!Array.isArray(alternatives) || alternatives.length !== 3) {
      throw new Error('Invalid alternatives format')
    }

    return NextResponse.json({
      success: true,
      data: {
        alternatives,
        aiProvider: result.provider
      }
    })

  } catch (error) {
    console.error('Alternatives generation error:', error)
    
    const message = error instanceof Error ? error.message : 'Unknown error'
    
    return NextResponse.json(
      { success: false, error: `Alternatives generation failed: ${message}` },
      { status: 500 }
    )
  }
}
