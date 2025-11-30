/**
 * Shepherd Engine Types
 * 
 * Type definitions for the unified AI intelligence layer.
 * Following Golden Sheep Methodology: Real types, no placeholders.
 */

// ============================================================================
// Compass (Clarity) Types
// ============================================================================

export interface ClarityInput {
  idea: string
  targetUser?: string
  additionalContext?: string
}

export interface ClarityOutput {
  problemStatement: string
  targetUser: string
  jobsToBeDone: string[]
  opportunityGap: string
  valueHypotheses: string[]
  nextSteps: string[]
}

export interface ClaritySession {
  id: string
  userId: string
  input: ClarityInput
  output: ClarityOutput
  createdAt: string
  updatedAt: string
}

// ============================================================================
// Muse (Research) Types
// ============================================================================

export interface ResearchInput {
  claritySessionId: string
  interviews?: string[]
  notes?: string[]
  competitorUrls?: string[]
  surveyData?: string
}

export interface Persona {
  name: string
  role: string
  goals: string[]
  frustrations: string[]
  quote: string
}

export interface PainPoint {
  description: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'rarely'
  intensity: 'critical' | 'high' | 'medium' | 'low'
  currentSolution: string
}

export interface ResearchOutput {
  personas: Persona[]
  painMap: PainPoint[]
  emotionalJourney: {
    stage: string
    emotion: string
    thought: string
  }[]
  insights: string[]
  competitorGaps: {
    competitor: string
    weakness: string
    opportunity: string
  }[]
}

export interface ResearchSession {
  id: string
  userId: string
  claritySessionId: string
  input: ResearchInput
  output: ResearchOutput
  createdAt: string
  updatedAt: string
}

// ============================================================================
// Blueprint (MVP Plan) Types
// ============================================================================

export interface BlueprintInput {
  claritySessionId: string
  researchSessionId: string
  constraints?: string[]
  timeline?: string
}

export interface UserStory {
  asA: string
  iWant: string
  soThat: string
}

export interface MVPFeature {
  name: string
  description: string
  priority: 'must-have' | 'should-have' | 'nice-to-have'
  effort: 'small' | 'medium' | 'large'
  painPointsAddressed: string[]
  userStories: UserStory[]
}

export interface RoadmapWeek {
  week: number
  theme: string
  goals: string[]
  deliverables: string[]
}

export interface SuccessMetric {
  metric: string
  target: string
  why: string
}

export interface Risk {
  risk: string
  mitigation: string
}

export interface BlueprintOutput {
  productVision: string
  mvpScope: string
  coreValue: string
  features: MVPFeature[]
  roadmap: RoadmapWeek[]
  successMetrics: SuccessMetric[]
  risks: Risk[]
  launchChecklist: string[]
}

export interface BlueprintSession {
  id: string
  userId: string
  claritySessionId: string
  researchSessionId: string
  input: BlueprintInput
  output: BlueprintOutput
  createdAt: string
  updatedAt: string
}

// ============================================================================
// Engine Configuration
// ============================================================================

export interface EngineConfig {
  model: GroqModel
  temperature?: number
  maxTokens?: number
}

export type GroqModel = 
  | 'llama-3.3-70b-versatile'      // Production: Best for complex tasks
  | 'openai/gpt-oss-120b'          // Production: Flagship with reasoning
  | 'openai/gpt-oss-20b'           // Production: Fast for simpler tasks
  | 'llama-3.1-8b-instant'         // Production: Instant responses

export const DEFAULT_ENGINE_CONFIG: EngineConfig = {
  model: 'llama-3.3-70b-versatile',
  temperature: 0.3,
  maxTokens: 4096,
}

// ============================================================================
// API Response Types
// ============================================================================

export interface EngineResponse<T> {
  success: boolean
  data?: T
  error?: string
  processingTime?: number
}
