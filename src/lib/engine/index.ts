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

// Groq Client (official SDK integration)
export {
  chatCompletion,
  jsonCompletion,
  completionWithFallback,
  healthCheck,
  listModels,
} from './groq-client'

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

// TODO: Opportunity Scorer - Slice 3
// export { scoreOpportunities } from './opportunity-score'

// TODO: Feature Mapper - Slice 3
// export { mapFeatures } from './feature-mapper'

// TODO: MVP Prioritizer (powers Blueprint) - Slice 3
// export { prioritizeMvp } from './mvp-prioritizer'

// TODO: Story Composer (powers Blueprint) - Slice 3
// export { composeNarrative } from './story-composer'
