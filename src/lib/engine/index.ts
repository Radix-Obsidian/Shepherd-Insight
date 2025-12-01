/**
 * Shepherd Engine
 * 
 * The unified AI intelligence layer that powers all Shepherd Insight tools.
 * 
 * Architecture:
 * - Compass → Insight Reasoner (clarity from ideas)
 * - Muse → Persona Synthesizer (understanding from research)
 * - Blueprint → MVP Prioritizer + Story Composer (action plan)
 * 
 * Customer Transformation:
 * "I don't know where to start" → "I know my user. I know my MVP. I can build this."
 */

// Types
export * from './types'

// AI Orchestration Layer
export {
  orchestrate,
  healthCheckAll,
  estimateCost,
  type AITask,
  type AIProvider,
  type OrchestrationConfig,
} from './orchestrator'

// Groq Client (official SDK integration)
export {
  chatCompletion,
  jsonCompletion,
  completionWithFallback,
  healthCheck,
  listModels,
} from './groq-client'

// Perplexity Client (real-time web research)
export {
  researchWithPerplexity,
  researchCompetitors,
  researchMarket,
  researchProblemValidation,
  healthCheckPerplexity,
  type PerplexityResearchOptions,
} from './perplexity-client'

// Insight Reasoner (powers Compass)
export {
  generateClarity,
  refineClarity,
} from './insight-reasoner'

// Persona Synthesizer (powers Muse)
export {
  synthesizeResearch,
  synthesizeQuickResearch,
} from './persona-synth'

// Blueprint Composer (powers Blueprint)
export {
  generateBlueprint,
  generateQuickBlueprint,
} from './blueprint-composer'

// TODO: Story Composer (powers Blueprint) - Slice 3
// export { composeNarrative } from './story-composer'
