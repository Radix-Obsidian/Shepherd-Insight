/**
 * Shepherd Engine - Groq Client
 * 
 * Official Groq SDK integration following https://github.com/groq/groq-typescript
 * Golden Sheep Methodology: Official docs only. No guessing.
 */

import Groq from 'groq-sdk'
import type { GroqModel } from './types'

// Singleton instance
let groqInstance: Groq | null = null

/**
 * Get or create Groq client instance
 * Uses GROQ_API_KEY from environment (official pattern)
 */
function getGroqClient(): Groq {
  if (!groqInstance) {
    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      throw new Error('GROQ_API_KEY environment variable is required')
    }
    groqInstance = new Groq({ apiKey })
  }
  return groqInstance
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface CompletionOptions {
  model?: GroqModel
  temperature?: number
  maxTokens?: number
  responseFormat?: { type: 'json_object' }
}

/**
 * Generate a chat completion using Groq
 * Official SDK pattern from https://console.groq.com/docs/text-chat
 */
export async function chatCompletion(
  messages: ChatMessage[],
  options: CompletionOptions = {}
): Promise<string> {
  const client = getGroqClient()
  
  const {
    model = 'llama-3.3-70b-versatile',
    temperature = 0.3,
    maxTokens = 4096,
    responseFormat,
  } = options

  const completion = await client.chat.completions.create({
    messages,
    model,
    temperature,
    max_tokens: maxTokens,
    ...(responseFormat && { response_format: responseFormat }),
  })

  const content = completion.choices[0]?.message?.content
  if (!content) {
    throw new Error('No content in Groq response')
  }

  return content
}

/**
 * Generate a structured JSON completion
 * Uses JSON mode per official docs
 */
export async function jsonCompletion<T>(
  messages: ChatMessage[],
  options: Omit<CompletionOptions, 'responseFormat'> = {}
): Promise<T> {
  const content = await chatCompletion(messages, {
    ...options,
    responseFormat: { type: 'json_object' },
  })

  try {
    return JSON.parse(content) as T
  } catch (error) {
    throw new Error(`Failed to parse JSON response: ${error}`)
  }
}

/**
 * Generate completion with automatic model fallback
 * Tries production models in order until one succeeds
 */
export async function completionWithFallback<T>(
  messages: ChatMessage[],
  options: Omit<CompletionOptions, 'model'> = {},
  parseAsJson = false
): Promise<T | string> {
  const models: GroqModel[] = [
    'llama-3.3-70b-versatile',
    'openai/gpt-oss-120b',
    'openai/gpt-oss-20b',
    'llama-3.1-8b-instant',
  ]

  let lastError: Error | null = null

  for (const model of models) {
    try {
      if (parseAsJson) {
        return await jsonCompletion<T>(messages, { ...options, model })
      } else {
        return await chatCompletion(messages, { ...options, model })
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      console.warn(`Model ${model} failed, trying next:`, lastError.message)
    }
  }

  throw lastError || new Error('All models failed')
}

/**
 * Health check - verify Groq connection
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const client = getGroqClient()
    await client.models.list()
    return true
  } catch {
    return false
  }
}

/**
 * List available models
 */
export async function listModels(): Promise<string[]> {
  const client = getGroqClient()
  const models = await client.models.list()
  return models.data.map(m => m.id)
}
