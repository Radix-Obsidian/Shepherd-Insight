import { ChatGroq } from '@langchain/groq'
import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import { z } from 'zod'
import { getApiKey } from '@/lib/api-key-manager'
import { logger } from '@/lib/logger'

export interface GroqOptions {
  model?: string
  temperature?: number
  maxTokens?: number
}

export interface StructuredOutputOptions {
  model?: string
  temperature?: number
}

// Available Groq models with their configurations
export const AVAILABLE_MODELS = {
  'gpt-oss-120b': {
    name: 'openai/gpt-oss-120b',
    maxTokens: 8192,
    description: 'GPT-OSS 120B - Best for complex reasoning and structured outputs',
    contextWindow: 131072
  },
  'llama-4-maverick': {
    name: 'meta-llama/llama-4-maverick-17b-128e',
    maxTokens: 8192,
    description: 'Llama 4 Maverick 17B - State-of-the-art multimodal reasoning',
    contextWindow: 131072
  },
  'llama-3.3-70b': {
    name: 'llama-3.3-70b-versatile',
    maxTokens: 8192,
    description: 'Llama 3.3 70B - Versatile model for general tasks',
    contextWindow: 131072
  },
  'gpt-oss-20b': {
    name: 'openai/gpt-oss-20b',
    maxTokens: 4096,
    description: 'GPT-OSS 20B - Fast model for simpler tasks',
    contextWindow: 131072
  },
  'llama-4-scout': {
    name: 'meta-llama/llama-4-scout-17b-16e',
    maxTokens: 4096,
    description: 'Llama 4 Scout 17B - Efficient multimodal model',
    contextWindow: 131072
  },
  'llama-3.1-8b': {
    name: 'llama-3.1-8b-instant',
    maxTokens: 4096,
    description: 'Llama 3.1 8B - Instant responses for basic tasks',
    contextWindow: 131072
  }
}

export interface MindMapData {
  nodes: unknown[]
  edges: unknown[]
  rawResponse?: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isMindMapData(value: unknown): value is MindMapData {
  if (!isRecord(value)) return false
  return Array.isArray(value.nodes) && Array.isArray(value.edges)
}

export class GroqClient {
  private llm: ChatGroq
  private model: string

  constructor(options: GroqOptions = {}) {
    // API key will be fetched when needed
    const { 
      model = 'openai/gpt-oss-120b', // Default to GPT-OSS 120B
      temperature = 0.1,
      maxTokens = 4096 
    } = options

    this.model = model
    this.llm = new ChatGroq({
      apiKey: '', // Will be set when needed
      model: model,
      temperature,
      maxTokens,
    })
  }

  private async initializeLLM() {
    if (!this.llm.apiKey) {
      const apiKey = await getApiKey('GROQ_API_KEY')
      this.llm = new ChatGroq({
        apiKey,
        model: this.model,
        temperature: this.llm.temperature,
        maxTokens: this.llm.maxTokens,
      })
    }
  }

  /**
   * Generate a simple chat completion
   */
  async chat(messages: Array<{ role: 'system' | 'user' | 'assistant', content: string }>) {
    try {
      await this.initializeLLM()
      const langchainMessages = messages.map(msg => {
        switch (msg.role) {
          case 'system':
            return new SystemMessage(msg.content)
          case 'user':
            return new HumanMessage(msg.content)
          case 'assistant':
            return new HumanMessage(msg.content) // LangChain doesn't have AssistantMessage in this context
          default:
            return new HumanMessage(msg.content)
        }
      })

      const response = await this.llm.invoke(langchainMessages)
      return response.content
    } catch (error) {
      logger.error('Groq chat error', error)
      throw new Error(`Chat completion failed: ${error}`)
    }
  }

  /**
   * Generate structured output using Zod schema
   */
  async structuredOutput<T>(
    prompt: string, 
    schema: z.ZodSchema<T>,
    options: StructuredOutputOptions = {}
  ): Promise<T> {
    try {
      await this.initializeLLM()
      const { 
        model = this.model,
        temperature = 0.1 
      } = options

      // Create a new LLM instance with the specified model if different
      const llm = model !== this.model 
        ? new ChatGroq({
            apiKey: await getApiKey('GROQ_API_KEY'),
            model: model,
            temperature,
          })
        : this.llm

      // Use structured output with Zod schema
      const structuredLlm = llm.withStructuredOutput(schema)
      
      const response = await structuredLlm.invoke([
        new HumanMessage(prompt)
      ])

      return response as T
    } catch (error) {
      logger.error('Groq structured output error', error)
      throw new Error(`Structured output failed: ${error}`)
    }
  }

  /**
   * Generate structured output with automatic model fallback
   */
  async structuredOutputWithFallback<T>(
    prompt: string,
    schema: z.ZodSchema<T>,
    options: StructuredOutputOptions = {}
  ): Promise<T> {
    const models = [
      'openai/gpt-oss-120b',
      'llama-3.3-70b-versatile',
      'meta-llama/llama-4-maverick-17b-128e',
      'openai/gpt-oss-20b'
    ]
    
    for (const model of models) {
      try {
        logger.debug(`Attempting structured output with model: ${model}`)
        return await this.structuredOutput(prompt, schema, { ...options, model })
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        logger.warn(`Model ${model} failed, trying next model`, message)
        if (model === models[models.length - 1]) {
          throw error // Rethrow on last attempt
        }
      }
    }
    
    throw new Error('All models failed to generate structured output')
  }

  /**
   * Analyze research data and generate insights
   */
  async analyzeResearch(data: unknown[], query: string) {
    try {
      const prompt = `
        Analyze the following research data and generate comprehensive insights for the query: "${query}"
        
        Research Data:
        ${JSON.stringify(data, null, 2)}
        
        Please provide:
        1. Key findings and patterns
        2. Competitive landscape analysis
        3. Market opportunities
        4. Potential risks or challenges
        5. Recommended next steps
        
        Format your response as structured insights that can be used for product development.
      `

      const response = await this.chat([
        { role: 'user', content: prompt }
      ])

      return response
    } catch (error) {
      logger.error('Groq research analysis error', error)
      throw new Error(`Research analysis failed: ${error}`)
    }
  }

  /**
   * Generate structured insights using Zod schema
   */
  async generateStructuredInsights<T>(
    data: unknown[],
    query: string, 
    schema: z.ZodSchema<T>
  ): Promise<T> {
    try {
      const prompt = `
        Analyze the following research data and generate structured insights for the query: "${query}"
        
        Research Data:
        ${JSON.stringify(data, null, 2)}
        
        Extract key insights, patterns, and recommendations in a structured format.
      `

      return await this.structuredOutput(prompt, schema)
    } catch (error) {
      logger.error('Groq structured insights error', error)
      throw new Error(`Structured insights generation failed: ${error}`)
    }
  }

  /**
   * Convert insights to mind map data
   */
  async insightsToMindMap(insights: unknown): Promise<MindMapData> {
    try {
      const prompt = `
        Convert the following product insights into a mind map structure:
        
        ${JSON.stringify(insights, null, 2)}
        
        Generate nodes and edges for:
        - Personas (target users)
        - Pain points (problems to solve)
        - Features (solutions)
        - Ideas (opportunities)
        - Notes (constraints/risks)
        
        Return a JSON structure with nodes and edges arrays.
      `

      const response = await this.chat([
        { role: 'user', content: prompt }
      ])

      // Try to parse JSON from response
      try {
        const responseText = typeof response === 'string' ? response : String(response)
        const jsonMatch = responseText.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          if (isMindMapData(parsed)) {
            return parsed
          }
        }
      } catch (parseError) {
        logger.warn('Failed to parse JSON from response', parseError)
      }

      // Fallback: return the raw response
      return { nodes: [], edges: [], rawResponse: String(response) }
    } catch (error) {
      logger.error('Groq mind map conversion error', error)
      throw new Error(`Mind map conversion failed: ${error}`)
    }
  }
}
