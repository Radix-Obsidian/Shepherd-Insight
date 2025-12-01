/**
 * AI Orchestration Layer
 * Routes tasks to the best AI for the job:
 * - Perplexity: Real-time web research
 * - Claude: Strategic planning and synthesis
 * - Groq: Speed layer and fallback
 */

import { researchWithPerplexity, type PerplexityResearchOptions } from './perplexity-client'
import { claudeCompletion } from './anthropic-client'
import { chatCompletion as groqChat } from './groq-client'

export type AITask = 
  | 'research'           // → Perplexity (deep web research)
  | 'planning'           // → Claude (strategic planning)
  | 'synthesis'          // → Claude (combining data into insights)
  | 'quick-research'     // → Groq (fast, AI knowledge only)
  | 'validation'         // → Perplexity (validate with web data)
  | 'fallback'           // → Groq (when others fail)

export type AIProvider = 'perplexity' | 'claude' | 'groq'

export interface OrchestrationConfig {
  task: AITask
  primary: AIProvider
  fallback: AIProvider
  timeout: number
  retries: number
}

/**
 * Task routing configuration
 * Defines which AI handles which task
 */
const TASK_ROUTING: Record<AITask, OrchestrationConfig> = {
  'research': {
    task: 'research',
    primary: 'perplexity',
    fallback: 'groq',
    timeout: 120000,  // 120s for research (Perplexity can be slow)
    retries: 1  // Reduced retries since Perplexity is expensive
  },
  'planning': {
    task: 'planning',
    primary: 'claude',
    fallback: 'groq',
    timeout: 45000,  // 45s for strategic planning
    retries: 2
  },
  'synthesis': {
    task: 'synthesis',
    primary: 'claude',
    fallback: 'groq',
    timeout: 30000,  // 30s for synthesis
    retries: 2
  },
  'quick-research': {
    task: 'quick-research',
    primary: 'groq',
    fallback: 'claude',
    timeout: 15000,  // 15s for quick mode
    retries: 1
  },
  'validation': {
    task: 'validation',
    primary: 'perplexity',
    fallback: 'groq',
    timeout: 30000,
    retries: 2
  },
  'fallback': {
    task: 'fallback',
    primary: 'groq',
    fallback: 'claude',
    timeout: 15000,
    retries: 1
  }
}

export interface OrchestrationOptions {
  systemPrompt?: string
  temperature?: number
  maxTokens?: number
  perplexityOptions?: Partial<PerplexityResearchOptions>
}

interface AICallResult {
  content: string
  provider: AIProvider
  model: string
  citations?: string[]
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

/**
 * Call Perplexity for research
 */
async function callPerplexity(
  prompt: string,
  timeout: number,
  options?: OrchestrationOptions
): Promise<AICallResult> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await researchWithPerplexity({
      query: prompt,
      systemPrompt: options?.systemPrompt,
      temperature: options?.temperature,
      maxTokens: options?.maxTokens,
      ...options?.perplexityOptions
    })

    clearTimeout(timeoutId)

    return {
      content: response.choices[0].message.content,
      provider: 'perplexity',
      model: response.model,
      citations: response.citations,
      usage: {
        promptTokens: response.usage.prompt_tokens,
        completionTokens: response.usage.completion_tokens,
        totalTokens: response.usage.total_tokens
      }
    }
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

/**
 * Call Claude for planning/synthesis
 */
async function callClaude(
  prompt: string,
  timeout: number,
  options?: OrchestrationOptions
): Promise<AICallResult> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const messages = []
    
    if (options?.systemPrompt) {
      messages.push({
        role: 'user' as const,
        content: options.systemPrompt
      })
    }
    
    messages.push({
      role: 'user' as const,
      content: prompt
    })

    const content = await claudeCompletion(
      messages,
      {
        model: 'claude-sonnet-4-20250514',
        temperature: options?.temperature ?? 0.7,
        maxTokens: options?.maxTokens ?? 4096
      }
    )

    clearTimeout(timeoutId)

    return {
      content,
      provider: 'claude',
      model: 'claude-sonnet-4-20250514',
      usage: undefined // claudeCompletion doesn't return usage info
    }
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

/**
 * Call Groq for fast inference
 */
async function callGroq(
  prompt: string,
  timeout: number,
  options?: OrchestrationOptions
): Promise<AICallResult> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const messages: { role: 'system' | 'user'; content: string }[] = []

    if (options?.systemPrompt) {
      messages.push({
        role: 'system',
        content: options.systemPrompt
      })
    }
    
    messages.push({
      role: 'user',
      content: prompt
    })

    const content = await groqChat(
      messages,
      {
        model: 'llama-3.3-70b-versatile',
        temperature: options?.temperature ?? 0.7,
        maxTokens: options?.maxTokens ?? 4096
      }
    )

    clearTimeout(timeoutId)

    return {
      content,
      provider: 'groq',
      model: 'llama-3.3-70b-versatile',
      usage: undefined // groq chatCompletion doesn't return usage
    }
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

/**
 * Call the specified AI provider
 */
async function callProvider(
  provider: AIProvider,
  prompt: string,
  timeout: number,
  options?: OrchestrationOptions
): Promise<AICallResult> {
  switch (provider) {
    case 'perplexity':
      return await callPerplexity(prompt, timeout, options)
    case 'claude':
      return await callClaude(prompt, timeout, options)
    case 'groq':
      return await callGroq(prompt, timeout, options)
  }
}

/**
 * Main orchestration function
 * Routes tasks to the best AI with automatic fallback
 */
export async function orchestrate(
  task: AITask,
  prompt: string,
  options?: OrchestrationOptions & Partial<OrchestrationConfig>
): Promise<AICallResult> {
  const config = { ...TASK_ROUTING[task], ...options }
  
  console.log(`[Orchestrator] Task: ${task} → Primary: ${config.primary}, Fallback: ${config.fallback}`)

  try {
    const result = await callProvider(config.primary, prompt, config.timeout, options)
    console.log(`[Orchestrator] Success with ${config.primary} (${result.usage?.totalTokens} tokens)`)
    return result
  } catch (primaryError) {
    console.warn(`[Orchestrator] Primary AI (${config.primary}) failed for ${task}:`, primaryError)
    
    // Try fallback
    try {
      const result = await callProvider(config.fallback, prompt, config.timeout, options)
      console.log(`[Orchestrator] Success with fallback ${config.fallback} (${result.usage?.totalTokens} tokens)`)
      return result
    } catch (fallbackError) {
      console.error(`[Orchestrator] Fallback AI (${config.fallback}) also failed:`, fallbackError)
      throw new Error(`All AI providers failed for task: ${task}`)
    }
  }
}

/**
 * Health check all AI providers
 */
export async function healthCheckAll(): Promise<Record<AIProvider, boolean>> {
  const checks = await Promise.allSettled([
    callPerplexity('What is 2+2?', 10000),
    callClaude('What is 2+2?', 10000),
    callGroq('What is 2+2?', 10000)
  ])

  return {
    perplexity: checks[0].status === 'fulfilled',
    claude: checks[1].status === 'fulfilled',
    groq: checks[2].status === 'fulfilled'
  }
}

/**
 * Get cost estimate for a task
 */
export function estimateCost(task: AITask, tokensEstimate: number): number {
  const pricing: Record<AIProvider, { input: number; output: number }> = {
    perplexity: { input: 2, output: 8 },      // per 1M tokens (Sonar Deep Research)
    claude: { input: 3, output: 15 },         // per 1M tokens (Sonnet 4)
    groq: { input: 0.05, output: 0.08 }       // per 1M tokens (Llama 3.3)
  }

  const config = TASK_ROUTING[task]
  const provider = config.primary
  const cost = pricing[provider]
  
  // Assume 50/50 input/output split
  const inputCost = (tokensEstimate * 0.5 / 1_000_000) * cost.input
  const outputCost = (tokensEstimate * 0.5 / 1_000_000) * cost.output
  
  return inputCost + outputCost
}
