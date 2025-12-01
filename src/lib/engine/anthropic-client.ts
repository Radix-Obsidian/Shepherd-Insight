/**
 * Shepherd Engine - Anthropic Client (PRIMARY AI Provider)
 * 
 * Steve Jobs Philosophy: "Start with the customer experience and work backwards to technology."
 * 
 * We chose Claude as PRIMARY because:
 * - Superior understanding of human intent and emotion
 * - Thinks in customer transformation terms, not features
 * - Delivers insights that feel human, not robotic
 * 
 * Official Anthropic SDK: https://github.com/anthropics/anthropic-sdk-typescript
 */

import Anthropic from '@anthropic-ai/sdk'

export type ClaudeModel = 
  | 'claude-sonnet-4-20250514'      // PRIMARY: Best customer understanding
  | 'claude-3-5-sonnet-20241022'    // FALLBACK 1: Strong reasoning
  | 'claude-3-haiku-20240307'       // FALLBACK 2: Fast but empathetic

// Cache for current API key to detect changes
let cachedAnthropicKey: string | null = null
let anthropicInstance: Anthropic | null = null

/**
 * Get or create Anthropic client
 * Re-creates client if API key changes (handles env var updates in serverless)
 */
function getAnthropicClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY
  
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not configured in environment')
  }
  
  // Validate key format (Anthropic keys start with 'sk-ant-')
  if (!apiKey.startsWith('sk-ant-')) {
    throw new Error('Invalid ANTHROPIC_API_KEY format - should start with sk-ant-')
  }
  
  // Re-create client if key changed or doesn't exist
  if (!anthropicInstance || cachedAnthropicKey !== apiKey) {
    cachedAnthropicKey = apiKey
    anthropicInstance = new Anthropic({ apiKey })
  }
  
  return anthropicInstance
}

/**
 * Check if Anthropic is available
 */
export function isAnthropicAvailable(): boolean {
  return !!process.env.ANTHROPIC_API_KEY
}

interface ClaudeMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ClaudeOptions {
  model?: ClaudeModel
  temperature?: number
  maxTokens?: number
  systemPrompt?: string
}

/**
 * Chat completion with Claude
 */
export async function claudeCompletion(
  messages: ClaudeMessage[],
  options: ClaudeOptions = {}
): Promise<string> {
  const client = getAnthropicClient()
  const { 
    model = 'claude-sonnet-4-20250514',
    temperature = 0.7,
    maxTokens = 4096,
    systemPrompt 
  } = options

  try {
    const response = await client.messages.create({
      model,
      max_tokens: maxTokens,
      temperature,
      system: systemPrompt,
      messages,
    })

    const content = response.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude')
    }

    return content.text
  } catch (error: any) {
    if (error.status === 401) {
      throw new Error('Invalid Anthropic API key')
    }
    if (error.status === 429) {
      throw new Error('Claude rate limit exceeded. Please try again in a moment.')
    }
    throw new Error(`Claude API error: ${error.message}`)
  }
}

/**
 * JSON completion with Claude
 */
export async function claudeJsonCompletion<T>(
  messages: ClaudeMessage[],
  options: ClaudeOptions = {}
): Promise<T> {
  const response = await claudeCompletion(messages, options)
  
  try {
    return JSON.parse(response) as T
  } catch (error) {
    throw new Error(`Failed to parse Claude JSON response: ${error}`)
  }
}

/**
 * Claude completion with fallback across models
 */
export async function claudeCompletionWithFallback<T>(
  messages: ClaudeMessage[],
  options: ClaudeOptions = {},
  parseAsJson = false
): Promise<T | string> {
  const models: ClaudeModel[] = [
    'claude-sonnet-4-20250514',
    'claude-3-5-sonnet-20241022',
    'claude-3-haiku-20240307',
  ]

  let lastError: Error | null = null

  for (const model of models) {
    try {
      console.log(`🎯 Trying Claude model: ${model}`)
      if (parseAsJson) {
        return await claudeJsonCompletion<T>(messages, { ...options, model })
      } else {
        return await claudeCompletion(messages, { ...options, model })
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      console.warn(`Claude model ${model} failed:`, lastError.message)
    }
  }

  throw lastError || new Error('All Claude models failed')
}
