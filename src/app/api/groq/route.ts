'use server'

import { logger } from '@/lib/logger'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { GroqClient } from '@/lib/research/groq-client'

// Lazy-initialized client to avoid build-time errors
let _groq: GroqClient | null = null

function getGroq(): GroqClient {
  if (!_groq) {
    _groq = new GroqClient({ temperature: 0.2 })
  }
  return _groq
}

const AnalysisSchema = z.object({
  summary: z.string(),
  marketInsights: z.array(z.string()).min(3),
  competitiveAnalysis: z.array(z.string()).min(3),
  recommendations: z.array(z.string()).min(3),
  riskAssessment: z.object({
    technical: z.string(),
    market: z.string(),
    operational: z.string(),
    competitive: z.string(),
  }),
})

const InsightSchema = z.object({
  keyInsights: z.array(z.string()).min(3),
  positioning: z.object({
    heroStatement: z.string(),
    differentiators: z.array(z.string()).min(2),
    targetPersona: z.string(),
  }),
  goToMarket: z.object({
    channels: z.array(z.string()).min(2),
    pricing: z.string(),
    acquisition: z.string(),
  }),
})

const EnhancedFeatureSchema = z.object({
  enhancedFeatures: z.array(
    z.object({
      original: z.string(),
      enhanced: z.string(),
      rationale: z.string(),
      priority: z.enum(['High', 'Medium', 'Low']),
    })
  ),
  enhancementStrategy: z.string(),
})

type NormalizedProject = ReturnType<typeof normalizeProjectData>
type GroqAction = 'analyze-project' | 'generate-insights' | 'enhance-features'

interface GroqRequestBody {
  action?: GroqAction
  projectData?: Record<string, unknown>
}

function normalizeList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(item => String(item).trim()).filter(Boolean)
  }
  if (typeof value === 'string') {
    return value
      .split('\n')
      .map(item => item.trim())
      .filter(Boolean)
  }
  return []
}

function toStringValue(value: unknown): string {
  return typeof value === 'string' ? value : value != null ? String(value) : ''
}

function normalizeProjectData(input: Record<string, unknown>) {
  return {
    name: toStringValue(input['name']),
    audience: toStringValue(input['audience']),
    problem: toStringValue(input['problem']),
    whyCurrentFails: toStringValue(
      input['whyCurrentFails'] ?? input['why_current_fails']
    ),
    promise: toStringValue(input['promise']),
    mustHaves: normalizeList(input['mustHaves'] ?? input['must_haves']),
    notNow: normalizeList(input['notNow'] ?? input['not_now']),
    constraints: toStringValue(input['constraints']),
    positioning: toStringValue(input['positioning']),
  }
}

function buildProjectContext(project: NormalizedProject) {
  return `
Project Name: ${project.name || 'Untitled'}
Audience: ${project.audience || 'Not provided'}
Problem: ${project.problem || 'Not provided'}
Why Current Solutions Fail: ${project.whyCurrentFails || 'Not provided'}
Core Promise: ${project.promise || 'Not provided'}
Must Have Features: ${project.mustHaves.length ? project.mustHaves.join('; ') : 'None provided'}
Out of Scope Features: ${project.notNow.length ? project.notNow.join('; ') : 'None provided'}
Constraints: ${project.constraints || 'Not provided'}
Positioning Statement: ${project.positioning || 'Not provided'}
`.trim()
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as GroqRequestBody
    const { action, projectData } = body

    if (!action) {
      return NextResponse.json({ error: 'action is required' }, { status: 400 })
    }

    if (!projectData || typeof projectData !== 'object') {
      return NextResponse.json({ error: 'projectData is required' }, { status: 400 })
    }

    const project = normalizeProjectData(projectData)

    const context = buildProjectContext(project)

    switch (action) {
      case 'analyze-project': {
        const prompt = `
You are a product strategist. Analyze the following project data and respond with a JSON object that matches the provided schema.

${context}

Focus on actionable insight for a founding team. Keep answers concise but specific.
`;
        const analysis = await getGroq().structuredOutputWithFallback(prompt, AnalysisSchema, {
          temperature: 0.25,
        })
        return NextResponse.json({
          analysis,
          timestamp: new Date().toISOString(),
        })
      }

      case 'generate-insights': {
        const prompt = `
You are an insight analyst. Using the project data below, produce positioning guidance and go-to-market recommendations.

${context}

Return JSON that follows the schema. Each list should contain specific, non-generic guidance.
`;
        const insights = await getGroq().structuredOutputWithFallback(prompt, InsightSchema, {
          temperature: 0.2,
        })
        return NextResponse.json({
          insights,
          generatedAt: new Date().toISOString(),
        })
      }

      case 'enhance-features': {
        if (!project.mustHaves.length) {
          return NextResponse.json(
            { error: 'Project must include at least one must-have feature.' },
            { status: 400 }
          )
        }

        const prompt = `
You are a product architect. For each must-have feature listed, suggest one enhancement that increases differentiation while staying aligned with constraints.

${context}

Return JSON adhering to the schema. For priority, assign "High" to core MVP differentiators, "Medium" to supportive elements, and "Low" only when an enhancement stretches beyond MVP scope.
`;
        const enhanced = await getGroq().structuredOutputWithFallback(prompt, EnhancedFeatureSchema, {
          temperature: 0.3,
        })
        return NextResponse.json({
          ...enhanced,
          timestamp: new Date().toISOString(),
        })
      }

      default:
        return NextResponse.json(
          { error: `Unsupported action "${action}"` },
          { status: 400 }
        )
    }
  } catch (error: unknown) {
    logger.error('Groq route error', error)
    const details = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      {
        error: 'Groq processing failed',
        details,
      },
      { status: 500 }
    )
  }
}
