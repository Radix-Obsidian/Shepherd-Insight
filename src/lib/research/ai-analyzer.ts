/**
 * Advanced Groq AI Features
 * Multi-model support, structured outputs, and validation
 */

import { GroqClient } from './groq-client'
import { z } from 'zod'
import { logger } from '@/lib/logger'

export interface ModelConfig {
  name: string
  maxTokens: number
  temperature: number
  description: string
  useCase: string[]
}

export const AVAILABLE_MODELS: Record<string, ModelConfig> = {
  'gpt-oss-120b': {
    name: 'openai/gpt-oss-120b',
    maxTokens: 8192,
    temperature: 0.1,
    description: 'GPT-OSS 120B - Best for complex reasoning and structured outputs',
    useCase: ['complex-analysis', 'structured-output', 'research', 'reasoning']
  },
  'llama-4-maverick': {
    name: 'meta-llama/llama-4-maverick-17b-128e',
    maxTokens: 8192,
    temperature: 0.1,
    description: 'Llama 4 Maverick 17B - State-of-the-art multimodal reasoning',
    useCase: ['multimodal-analysis', 'image-processing', 'coding', 'reasoning']
  },
  'llama-3.3-70b': {
    name: 'llama-3.3-70b-versatile',
    maxTokens: 8192,
    temperature: 0.1,
    description: 'Llama 3.3 70B - Versatile model for general tasks',
    useCase: ['chat', 'complex-analysis', 'general-tasks']
  },
  'gpt-oss-20b': {
    name: 'openai/gpt-oss-20b',
    maxTokens: 4096,
    temperature: 0.1,
    description: 'GPT-OSS 20B - Fast model for simpler tasks',
    useCase: ['quick-tasks', 'simple-analysis', 'chat']
  },
  'llama-4-scout': {
    name: 'meta-llama/llama-4-scout-17b-16e',
    maxTokens: 4096,
    temperature: 0.1,
    description: 'Llama 4 Scout 17B - Efficient multimodal model',
    useCase: ['multimodal-analysis', 'visual-comprehension', 'efficient-processing']
  },
  'llama-3.1-8b': {
    name: 'llama-3.1-8b-instant',
    maxTokens: 4096,
    temperature: 0.1,
    description: 'Llama 3.1 8B - Instant responses for basic tasks',
    useCase: ['instant-responses', 'basic-tasks', 'quick-chat']
  }
}

export interface PersonaData {
  id: string
  name: string
  description: string
  demographics: {
    age_range: string
    income: string
    location: string
    education: string
    occupation: string
  }
  pain_points: string[]
  goals: string[]
  behaviors: string[]
  preferences: string[]
  challenges: string[]
}

export interface MarketSizingData {
  total_addressable_market: string
  serviceable_addressable_market: string
  serviceable_obtainable_market: string
  market_growth_rate: string
  market_trends: string[]
  key_drivers: string[]
  barriers_to_entry: string[]
  competitive_landscape: string
}

export interface FeaturePrioritizationData {
  features: Array<{
    name: string
    description: string
    priority_score: number
    effort_score: number
    impact_score: number
    roi_estimate: string
    user_demand: string
    competitive_advantage: string
    technical_feasibility: string
  }>
  recommendations: {
    mvp_features: string[]
    phase_2_features: string[]
    nice_to_have_features: string[]
    avoid_features: string[]
  }
}

export class AdvancedGroqClient extends GroqClient {
  /**
   * Generate personas from research data
   */
  async generatePersonas(researchData: unknown[], query: string): Promise<PersonaData[]> {
    const PersonaSchema = z.array(z.object({
      id: z.string(),
      name: z.string(),
      description: z.string(),
      demographics: z.object({
        age_range: z.string(),
        income: z.string(),
        location: z.string(),
        education: z.string(),
        occupation: z.string()
      }),
      pain_points: z.array(z.string()),
      goals: z.array(z.string()),
      behaviors: z.array(z.string()),
      preferences: z.array(z.string()),
      challenges: z.array(z.string())
    }))

    const prompt = `Based on this research data, generate detailed user personas for the query: "${query}"

Research Data:
${JSON.stringify(researchData, null, 2)}

Create 3-5 distinct personas that represent different user segments. For each persona, include:
1. Demographics (age, income, location, education, occupation)
2. Pain points and challenges
3. Goals and motivations
4. Behaviors and preferences
5. How they would interact with a product

Make the personas realistic and based on the research data provided.`

    return await this.structuredOutputWithFallback(prompt, PersonaSchema, {
      temperature: 0.2
    })
  }

  /**
   * Perform market sizing analysis
   */
  async performMarketSizing(researchData: unknown[], query: string): Promise<MarketSizingData> {
    const MarketSizingSchema = z.object({
      total_addressable_market: z.string(),
      serviceable_addressable_market: z.string(),
      serviceable_obtainable_market: z.string(),
      market_growth_rate: z.string(),
      market_trends: z.array(z.string()),
      key_drivers: z.array(z.string()),
      barriers_to_entry: z.array(z.string()),
      competitive_landscape: z.string()
    })

    const prompt = `Based on this research data, perform a comprehensive market sizing analysis for: "${query}"

Research Data:
${JSON.stringify(researchData, null, 2)}

Provide:
1. TAM (Total Addressable Market) - the total market size
2. SAM (Serviceable Addressable Market) - the portion you can realistically serve
3. SOM (Serviceable Obtainable Market) - the portion you can actually capture
4. Market growth rate and trends
5. Key market drivers
6. Barriers to entry
7. Competitive landscape analysis

Use realistic estimates based on the research data and industry standards.`

    return await this.structuredOutputWithFallback(prompt, MarketSizingSchema, {
      temperature: 0.1
    })
  }

  /**
   * Prioritize features based on research
   */
  async prioritizeFeatures(
    researchData: unknown[],
    personas: PersonaData[]
  ): Promise<FeaturePrioritizationData> {
    const FeaturePrioritizationSchema = z.object({
      features: z.array(z.object({
        name: z.string(),
        description: z.string(),
        priority_score: z.number().min(1).max(10),
        effort_score: z.number().min(1).max(10),
        impact_score: z.number().min(1).max(10),
        roi_estimate: z.string(),
        user_demand: z.string(),
        competitive_advantage: z.string(),
        technical_feasibility: z.string()
      })),
      recommendations: z.object({
        mvp_features: z.array(z.string()),
        phase_2_features: z.array(z.string()),
        nice_to_have_features: z.array(z.string()),
        avoid_features: z.array(z.string())
      })
    })

    const prompt = `Based on this research data and user personas, prioritize features for product development:

Research Data:
${JSON.stringify(researchData, null, 2)}

User Personas:
${JSON.stringify(personas, null, 2)}

For each potential feature, provide:
1. Priority score (1-10)
2. Effort score (1-10, where 10 is highest effort)
3. Impact score (1-10)
4. ROI estimate
5. User demand assessment
6. Competitive advantage
7. Technical feasibility

Then categorize features into:
- MVP features (must-have for launch)
- Phase 2 features (important but not critical)
- Nice-to-have features (enhancement)
- Avoid features (low value or high risk)

Focus on features that address the pain points identified in the research and personas.`

    return await this.structuredOutputWithFallback(prompt, FeaturePrioritizationSchema, {
      temperature: 0.1
    })
  }

  /**
   * Validate structured output against schema
   */
  async validateStructuredOutput<T>(
    data: unknown,
    schema: z.ZodSchema<T>,
    _context?: string
  ): Promise<{ isValid: boolean; errors: string[]; validatedData?: T }> {
    try {
      const validatedData = schema.parse(data)
      return {
        isValid: true,
        errors: [],
        validatedData
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => 
          `${err.path.join('.')}: ${err.message}`
        )
        
        // Try to fix common issues
        const fixedData = await this.attemptDataFix(data, schema, errors)
        if (fixedData) {
          try {
            const validatedFixedData = schema.parse(fixedData)
            return {
              isValid: true,
              errors: [],
              validatedData: validatedFixedData
            }
          } catch {
            // If fixing failed, return original errors
          }
        }

        return {
          isValid: false,
          errors,
          validatedData: undefined
        }
      }
      
      return {
        isValid: false,
        errors: [error instanceof Error ? error.message : String(error)],
        validatedData: undefined
      }
    }
  }

  /**
   * Attempt to fix common data issues
   */
  private async attemptDataFix(
    data: unknown,
    schema: z.ZodSchema<unknown>,
    errors: string[]
  ): Promise<unknown> {
    const prompt = `Fix these data validation errors:

Data:
${JSON.stringify(data, null, 2)}

Errors:
${errors.join('\n')}

Schema requirements:
${schema.description || 'Follow the expected structure'}

Return the corrected data in the same format.`

    try {
      const fixedData = await this.chat([
        { role: 'user', content: prompt }
      ])

      // Try to parse the response as JSON
      const jsonMatch = typeof fixedData === 'string' ? fixedData.match(/\{[\s\S]*\}/) : null
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
    } catch (error) {
      logger.warn('Failed to fix data', error)
    }

    return null
  }

  /**
   * Get model recommendations for a task
   */
  getModelRecommendation(taskType: string): ModelConfig {
    const taskLower = taskType.toLowerCase()
    
    if (taskLower.includes('multimodal') || taskLower.includes('image') || taskLower.includes('visual')) {
      return AVAILABLE_MODELS['llama-4-maverick']
    }
    
    if (taskLower.includes('complex') || taskLower.includes('analysis') || taskLower.includes('research') || taskLower.includes('reasoning')) {
      return AVAILABLE_MODELS['gpt-oss-120b']
    }
    
    if (taskLower.includes('quick') || taskLower.includes('instant') || taskLower.includes('simple')) {
      return AVAILABLE_MODELS['llama-3.1-8b']
    }
    
    // Default to versatile model for general tasks
    return AVAILABLE_MODELS['llama-3.3-70b']
  }

  /**
   * Get all available models
   */
  getAvailableModels(): ModelConfig[] {
    return Object.values(AVAILABLE_MODELS)
  }

  /**
   * Estimate token usage for a prompt
   */
  estimateTokenUsage(prompt: string): number {
    // Rough estimation: 1 token ≈ 4 characters for English text
    return Math.ceil(prompt.length / 4)
  }

  /**
   * Check if prompt fits within model limits
   */
  validatePromptLength(prompt: string, modelName: string): { fits: boolean; estimatedTokens: number; maxTokens: number } {
    const model = AVAILABLE_MODELS[modelName]
    if (!model) {
      throw new Error(`Unknown model: ${modelName}`)
    }

    const estimatedTokens = this.estimateTokenUsage(prompt)
    const maxTokens = model.maxTokens

    return {
      fits: estimatedTokens < maxTokens,
      estimatedTokens,
      maxTokens
    }
  }
}
